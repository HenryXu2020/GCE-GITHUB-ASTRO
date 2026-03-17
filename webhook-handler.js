import http from 'node:http';
import { spawn } from 'node:child_process';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const DEBOUNCE_MS    = parseInt(process.env.WEBHOOK_DEBOUNCE_MS      || '5000',    10);
const MAX_WAIT_MS    = parseInt(process.env.WEBHOOK_MAX_WAIT_MS       || '60000',   10);
const MAX_BODY_SIZE  = parseInt(process.env.WEBHOOK_MAX_BODY_SIZE     || '10485760', 10); // 10 MB
const REQ_TIMEOUT_MS = parseInt(process.env.WEBHOOK_REQUEST_TIMEOUT_MS || '30000',  10); // 30 s
const PROJECT_ROOT   = '/home/astro-vitesse-site';

// 事件优先级：数字越大优先级越高
const ACTION_PRIORITY = {
  delete:    5,
  unpublish: 4,
  publish:   3,
  update:    2,
  create:    1,
};

// 存储去重后的事件，键为 `${model}:${id}`
const eventMap = new Map();

// ─────────────────────────────────────────────────────────────
// 全局调度状态（集中管理，避免散落变量）
// ─────────────────────────────────────────────────────────────
const state = {
  debounceTimer:  null,   // 防抖定时器句柄
  maxWaitTimer:   null,   // 最大等待定时器句柄
  firstEventTime: null,   // 当前批次首个事件的入队时间戳（null = 无待处理批次）
  maxWaitExpired: false,  // maxWaitTimer 是否已到期但因 processing 被推迟
  processing:     false,  // 是否有批次正在执行（更新缓存 + 构建）
  currentBatch:   null,   // 正在处理的批次快照（用于优雅关闭日志）
  shuttingDown:   false,  // 是否正在优雅关闭
};

// ─────────────────────────────────────────────────────────────
// 调度层
// ─────────────────────────────────────────────────────────────

/**
 * 清除所有调度定时器并重置批次起始状态。
 * 仅在 processQueue() 真正开始处理一批事件时调用。
 */
function clearScheduleTimers() {
  if (state.debounceTimer) {
    clearTimeout(state.debounceTimer);
    state.debounceTimer = null;
  }
  if (state.maxWaitTimer) {
    clearTimeout(state.maxWaitTimer);
    state.maxWaitTimer = null;
  }
  state.firstEventTime = null;
  state.maxWaitExpired = false;
}

/**
 * 统一调度入口。
 *
 * 两层保护机制：
 *   1. debounceTimer  — 每次入队事件都重置，平静 DEBOUNCE_MS 后触发处理
 *   2. maxWaitTimer   — 首个事件入队后启动，MAX_WAIT_MS 后强制触发（兜底）
 *
 * @param {boolean} immediate
 *   true  = 跳过防抖，立即（setImmediate）触发处理；用于构建结束后处理积压事件
 *   false = 正常防抖模式；用于 enqueue() 入队新事件后
 */
function scheduleProcess(immediate = false) {
  if (state.shuttingDown)    return;
  if (eventMap.size === 0)   return;

  // ── 清除旧的防抖定时器（每次调用都需要） ──────────────────
  if (state.debounceTimer) {
    clearTimeout(state.debounceTimer);
    state.debounceTimer = null;
  }

  // ── 立即调度（积压事件处理，跳过防抖和 maxWait 重建） ──────
  if (immediate) {
    // 重置 maxWait 状态，为下一个新批次做准备
    // （积压事件将在 processQueue 中消费，clearScheduleTimers 会完整重置）
    setImmediate(() => processQueue());
    return;
  }

  // ── maxWait 已到期（被 processing 推迟）：立即处理 ─────────
  if (state.maxWaitExpired) {
    setImmediate(() => processQueue());
    return;
  }

  // ── 首个事件：启动 maxWait 兜底定时器 ─────────────────────
  if (state.firstEventTime === null) {
    state.firstEventTime = Date.now();

    state.maxWaitTimer = setTimeout(() => {
      state.maxWaitTimer = null;

      if (!state.processing) {
        // 当前无批次处理，直接强制触发
        console.log('[webhook] Max wait time reached, forcing batch processing');
        processQueue();
      } else {
        // 正在处理中，标记到期；构建完成后由 onBatchFinished 立即处理积压
        console.log('[webhook] Max wait time reached but processing in progress, will process after current batch');
        state.maxWaitExpired = true;
      }
    }, MAX_WAIT_MS);
  }

  // ── 计算实际防抖延迟（不超过剩余 maxWait 时间） ───────────
  const elapsed      = Date.now() - state.firstEventTime;
  const remainingMax = MAX_WAIT_MS - elapsed;

  if (remainingMax <= 0) {
    // 已超过 maxWait，立即触发
    setImmediate(() => processQueue());
    return;
  }

  const actualDelay = Math.min(DEBOUNCE_MS, remainingMax);
  state.debounceTimer = setTimeout(() => {
    state.debounceTimer = null;
    processQueue();
  }, actualDelay);
}

// ─────────────────────────────────────────────────────────────
// 队列层
// ─────────────────────────────────────────────────────────────

/**
 * 将事件入队，按 (model, id) 去重合并：
 *   - locale  : 追加到 Set（delete 事件无 locale，跳过）
 *   - action  : 保留优先级最高的（delete > unpublish > publish > update > create）
 *
 * @param {{ model: string, id: string, locale?: string, action: string }} event
 */
function enqueue(event) {
  const key      = `${event.model}:${event.id}`;
  const existing = eventMap.get(key);

  if (existing) {
    // 合并有效 locale
    if (event.locale != null) {
      existing.locales.add(event.locale);
    }

    // 保留优先级更高的 action
    const existingPriority = ACTION_PRIORITY[existing.action] ?? 0;
    const newPriority      = ACTION_PRIORITY[event.action]    ?? 0;

    if (newPriority > existingPriority) {
      console.log(`[webhook] Priority upgrade: ${key} [${existing.action}] -> [${event.action}]`);
      existing.action = event.action;
    }
  } else {
    const locales = new Set();
    if (event.locale != null) {
      locales.add(event.locale);
    }

    eventMap.set(key, {
      model:   event.model,
      id:      event.id,
      locales,
      action:  event.action,
    });
  }

  scheduleProcess(false);
}

// ─────────────────────────────────────────────────────────────
// 执行层
// ─────────────────────────────────────────────────────────────

/**
 * 调用外部脚本更新单个条目的缓存（针对一个 locale）。
 *
 * @param {{ model: string, id: string, locale: string|null, action: string }} event
 * @returns {Promise<void>}
 */
function runUpdate(event) {
  return new Promise((resolve, reject) => {
    const { model, id, locale, action } = event;

    const args = [
      'tsx',
      'scripts/update-cache-entry.ts',
      '--model', model,
      '--id',    id,
      '--event', action,
    ];
    if (locale) args.push('--locale', locale);

    console.log(`[webhook] Updating ${model}/${id} (${action}) locale=${locale ?? 'default'}`);

    const child = spawn('npx', args, {
      cwd:   PROJECT_ROOT,
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Update failed with exit code ${code} for ${model}/${id}`));
      }
    });

    child.on('error', reject);
  });
}

/**
 * 批次结束后的统一收尾：重置处理状态，并处理积压事件。
 */
function onBatchFinished() {
  state.currentBatch = null;
  state.processing   = false;

  if (!state.shuttingDown && eventMap.size > 0) {
    console.log(`[webhook] ${eventMap.size} event(s) accumulated during build, processing immediately`);
    scheduleProcess(true);
  }
}

/**
 * 核心处理函数：从 eventMap 取出所有事件 → 串行更新缓存 → 触发增量构建。
 */
async function processQueue() {
  if (state.processing)   return;
  if (eventMap.size === 0) return;

  state.processing = true;

  // 清除调度定时器并重置批次起始状态
  clearScheduleTimers();

  // 快照并清空当前批次
  const entries      = Array.from(eventMap.values());
  state.currentBatch = entries;
  eventMap.clear();

  console.log(`[webhook] Processing batch: ${entries.length} document(s)`);

  try {
    for (const entry of entries) {
      // locales 为空时（如 delete 无 locale），传 null；
      // update-cache-entry.ts 内部应使用 defaultLocale 处理
      const locales = entry.locales.size > 0
        ? Array.from(entry.locales)
        : [null];

      for (const locale of locales) {
        await runUpdate({
          model:  entry.model,
          id:     entry.id,
          locale,
          action: entry.action,
        });
      }
    }

    console.log('[webhook] All cache updates completed, starting build...');

    const build = spawn('bash', ['build.sh', '--incremental'], {
      cwd:   PROJECT_ROOT,
      stdio: 'inherit',
    });

    build.on('close', (code) => {
      if (code === 0) {
        console.log('[webhook] Build succeeded');
      } else {
        console.error(`[webhook] Build failed with exit code ${code}`);
      }
      onBatchFinished();
    });

    build.on('error', (err) => {
      console.error('[webhook] Build spawn error:', err);
      onBatchFinished();
    });

  } catch (err) {
    console.error('[webhook] Cache update error:', err);
    onBatchFinished();
  }
}

// ─────────────────────────────────────────────────────────────
// HTTP 层
// ─────────────────────────────────────────────────────────────

/**
 * 规范化模型名称：优先从 uid 末段提取，否则使用 model 字段。
 * 例：uid = "api::article.article" → "article"
 *
 * @param {string|undefined} model
 * @param {string|undefined} uid
 * @returns {string}
 */
function normalizeModel(model, uid) {
  if (uid) {
    const parts = uid.split('.');
    return parts[parts.length - 1].toLowerCase();
  }
  return model?.toLowerCase() ?? '';
}

/**
 * 处理单个 webhook HTTP 请求。
 *
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse}  res
 */
function handleWebhook(req, res) {
  // ── 1. 仅允许 POST ──────────────────────────────────────────
  if (req.method !== 'POST') {
    res.writeHead(405, { Allow: 'POST' });
    return res.end('Method Not Allowed');
  }

  // ── 2. 请求超时保护 ─────────────────────────────────────────
  req.setTimeout(REQ_TIMEOUT_MS, () => {
    console.error('[webhook] Request timeout');
    if (!res.headersSent) {
      res.writeHead(408);
      res.end('Request Timeout');
    }
    req.destroy();
  });

  const bodyChunks = [];
  let totalLength  = 0;
  let reqDestroyed = false;  // 标记：req 是否已被主动销毁

  // ── 3. 流式读取，并限制请求体大小 ────────────────────────────
  req.on('data', (chunk) => {
    if (reqDestroyed) return;

    totalLength += chunk.length;

    if (totalLength > MAX_BODY_SIZE) {
      reqDestroyed = true;
      console.error(`[webhook] Request body too large: ${totalLength} bytes`);
      if (!res.headersSent) {
        res.writeHead(413, { 'Content-Type': 'text/plain' });
        res.end('Request Entity Too Large');
      }
      req.destroy();
      return;
    }

    bodyChunks.push(chunk);
  });

  // ── 4. 请求读取完毕：解析并入队 ─────────────────────────────
  req.on('end', () => {
    // 若请求已因超限被销毁，end 事件仍可能触发，直接忽略
    if (reqDestroyed) return;

    const rawBody = Buffer.concat(bodyChunks).toString();

    // 4-a. 解析 JSON
    let payload = {};
    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
    } catch (err) {
      console.error('[webhook] Invalid JSON:', err.message);
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid JSON');
      return;
    }

    const { event, uid, model: modelRaw } = payload;
    // entry 不存在时默认空对象，后续由 !id 兜底
    const entry = (payload.entry && typeof payload.entry === 'object')
      ? payload.entry
      : {};

    // 4-b. 事件合法性校验
    if (!event || typeof event !== 'string') {
      res.writeHead(200);
      return res.end('ignored');
    }

    const dotIndex = event.indexOf('.');
    if (dotIndex === -1) {
      res.writeHead(200);
      return res.end('ignored');
    }

    const scope  = event.slice(0, dotIndex);
    const action = event.slice(dotIndex + 1);

    if (scope !== 'entry') {
      res.writeHead(200);
      return res.end('ignored');
    }

    if (!['create', 'update', 'publish', 'delete', 'unpublish'].includes(action)) {
      res.writeHead(200);
      return res.end('ignored');
    }

    // 4-c. 提取业务字段
    const model  = normalizeModel(modelRaw, uid);
    const id     = entry.documentId;
    const locale = entry.locale;  // delete 事件可能无 locale，属正常情况

    if (!model || !id) {
      console.log('[webhook] Missing model or documentId, ignoring');
      res.writeHead(200);
      return res.end('ignored');
    }

    // 4-d. 入队
    enqueue({ model, id, locale, action });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status:    'queued',
      queueSize: eventMap.size,
    }));
  });

  // ── 5. 请求流错误处理 ──────────────────────────────────────
  req.on('error', (err) => {
    // ECONNRESET 是客户端主动断开的常见错误，不必打印完整堆栈
    if (err.code !== 'ECONNRESET') {
      console.error('[webhook] Request error:', err.message);
    }
    if (!res.headersSent) {
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  });
}

// ─────────────────────────────────────────────────────────────
// 服务启动
// ─────────────────────────────────────────────────────────────

const server = http.createServer(handleWebhook);

server.on('error', (err) => {
  console.error('[webhook] Server error:', err);
});

const PORT = parseInt(process.env.WEBHOOK_PORT || '3000', 10);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[webhook] Listening on port ${PORT}`);
  console.log(`[webhook] Debounce: ${DEBOUNCE_MS}ms | Max wait: ${MAX_WAIT_MS}ms`);
  console.log(`[webhook] Max body: ${MAX_BODY_SIZE}B | Request timeout: ${REQ_TIMEOUT_MS}ms`);
});

// ─────────────────────────────────────────────────────────────
// 优雅关闭
// ─────────────────────────────────────────────────────────────

/**
 * 优雅关闭：
 *   1. 停止接受新连接
 *   2. 清除所有调度定时器
 *   3. 若有批次正在处理，等待其完成（最多 30 秒）后退出
 *
 * @param {string} signal - 触发关闭的信号名称
 */
function gracefulShutdown(signal) {
  console.log(`[webhook] Received ${signal}, initiating graceful shutdown...`);

  state.shuttingDown = true;

  server.close(() => {
    console.log('[webhook] HTTP server closed');
  });

  // 清除所有调度定时器（无需再触发新批次）
  if (state.debounceTimer) clearTimeout(state.debounceTimer);
  if (state.maxWaitTimer)  clearTimeout(state.maxWaitTimer);

  const doExit = () => {
    if (eventMap.size > 0) {
      console.warn(`[webhook] ${eventMap.size} pending event(s) discarded`);
    }
    console.log('[webhook] Graceful shutdown completed');
    process.exit(0);
  };

  if (state.processing && state.currentBatch) {
    console.log(
      `[webhook] Waiting for current batch (${state.currentBatch.length} document(s)) to complete...`
    );

    const SHUTDOWN_TIMEOUT_MS = 30_000;
    const shutdownTimeout = setTimeout(() => {
      console.error('[webhook] Shutdown timeout exceeded, forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    // 每 500 ms 轮询一次，等待批次结束
    const checkInterval = setInterval(() => {
      if (!state.processing) {
        clearInterval(checkInterval);
        clearTimeout(shutdownTimeout);
        doExit();
      }
    }, 500);
  } else {
    doExit();
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
