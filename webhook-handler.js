import http from 'node:http';
import { spawn } from 'node:child_process';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { updateCacheEntry } from './scripts/update-cache-entry.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const DEBOUNCE_MS = parseInt(process.env.WEBHOOK_DEBOUNCE_MS || '5000', 10);
const MAX_WAIT_MS = parseInt(process.env.WEBHOOK_MAX_WAIT_MS || '60000', 10);
const MAX_BODY_SIZE = parseInt(process.env.WEBHOOK_MAX_BODY_SIZE || '10485760', 10);
const REQ_TIMEOUT_MS = parseInt(process.env.WEBHOOK_REQUEST_TIMEOUT_MS || '30000', 10);
const PROJECT_ROOT = '/home/astro-vitesse-site';

const ACTION_PRIORITY = { delete: 5, unpublish: 4, publish: 3, update: 2, create: 1 };
const eventMap = new Map();
const state = { debounceTimer: null, maxWaitTimer: null, firstEventTime: null, maxWaitExpired: false, processing: false, currentBatch: null, shuttingDown: false };

let cachedLocales = null, lastLoadedAt = 0;
const LOCALES_TTL = 60000;
async function loadLocales() {
  try {
    const configPath = path.join(PROJECT_ROOT, 'src/generated/i18n-config.js');
    const module = await import(`file://${configPath}`);
    const locales = module.locales;
    if (Array.isArray(locales) && locales.length) return locales;
    throw new Error('locales not found');
  } catch (err) {
    console.warn('[webhook] Failed to load i18n-config, using fallback locales:', err.message);
    return ['en', 'es', 'fr'];
  }
}
async function ensureLocales() {
  const now = Date.now();
  if (!cachedLocales || now - lastLoadedAt > LOCALES_TTL) {
    cachedLocales = await loadLocales();
    lastLoadedAt = now;
  }
  return cachedLocales;
}
ensureLocales().catch(console.error);

let footerDebounceTimer = null;
const FOOTER_DEBOUNCE_MS = 1000;
function triggerFooterBuild() {
  if (footerDebounceTimer) clearTimeout(footerDebounceTimer);
  footerDebounceTimer = setTimeout(() => {
    console.log('[webhook] Footer debounce completed, triggering build');
    scheduleProcess(true);
    footerDebounceTimer = null;
  }, FOOTER_DEBOUNCE_MS);
}

function clearScheduleTimers() {
  if (state.debounceTimer) clearTimeout(state.debounceTimer);
  if (state.maxWaitTimer) clearTimeout(state.maxWaitTimer);
  state.debounceTimer = state.maxWaitTimer = null;
  state.firstEventTime = null;
  state.maxWaitExpired = false;
}

function scheduleProcess(immediate = false) {
  if (state.shuttingDown) return;
  if (eventMap.size === 0) return;
  if (eventMap.size > 1000) {
    console.warn('[webhook] Event map size > 1000, forcing immediate flush');
    immediate = true;
  }
  if (state.debounceTimer) clearTimeout(state.debounceTimer);
  state.debounceTimer = null;
  if (immediate) { setImmediate(() => processQueue()); return; }
  if (state.maxWaitExpired) { setImmediate(() => processQueue()); return; }
  if (state.firstEventTime === null) {
    state.firstEventTime = Date.now();
    state.maxWaitTimer = setTimeout(() => {
      state.maxWaitTimer = null;
      if (!state.processing) processQueue();
      else state.maxWaitExpired = true;
    }, MAX_WAIT_MS);
  }
  const elapsed = Date.now() - state.firstEventTime;
  const remainingMax = MAX_WAIT_MS - elapsed;
  if (remainingMax <= 0) { setImmediate(() => processQueue()); return; }
  const actualDelay = Math.min(DEBOUNCE_MS, remainingMax);
  state.debounceTimer = setTimeout(() => processQueue(), actualDelay);
}

function invalidateSingleTypeCache(model, locale) {
  const type = model.toLowerCase();
  const filePath = path.join(PROJECT_ROOT, 'src/generated/cache', type, `${locale}.json`);
  if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); console.log(`[webhook] Removed Single Type cache: ${filePath}`); return true; }
  console.warn(`[webhook] Single Type cache not found: ${filePath}`);
  return false;
}

async function enqueue(event) {
  if (eventMap.size > 1000) scheduleProcess(true);
  if (event.model === 'footer') {
    console.log(`[webhook] Single Type "${event.model}" changed, invalidating cache`);
    const locales = await ensureLocales();
    locales.forEach(locale => invalidateSingleTypeCache(event.model, locale));
    triggerFooterBuild();
    return;
  }
  const key = `${event.model}:${event.id}`;
  const existing = eventMap.get(key);
  if (existing) {
    if (event.locale != null) existing.locales.add(event.locale);
    const existingPriority = ACTION_PRIORITY[existing.action] ?? 0;
    const newPriority = ACTION_PRIORITY[event.action] ?? 0;
    if (newPriority > existingPriority) existing.action = event.action;
  } else {
    const locales = new Set();
    if (event.locale != null) locales.add(event.locale);
    eventMap.set(key, { model: event.model, id: event.id, locales, action: event.action });
  }
  scheduleProcess(false);
}

async function processQueue() {
  if (state.processing) return;
  if (eventMap.size === 0) return;
  state.processing = true;
  clearScheduleTimers();
  const entries = Array.from(eventMap.values());
  state.currentBatch = entries;
  eventMap.clear();
  console.log(`[webhook] Processing batch: ${entries.length} document(s)`);
  try {
    for (const entry of entries) {
      const locales = entry.locales.size > 0 ? Array.from(entry.locales) : [null];
      for (const locale of locales) {
        await updateCacheEntry({ model: entry.model, id: entry.id, locale, action: entry.action });
      }
    }
    console.log('[webhook] All cache updates completed, starting build...');
    const build = spawn('bash', ['build.sh', '--incremental'], { cwd: PROJECT_ROOT, stdio: 'inherit' });
    build.on('close', (code) => { if (code === 0) console.log('[webhook] Build succeeded'); else console.error(`[webhook] Build failed with exit code ${code}`); onBatchFinished(); });
    build.on('error', (err) => { console.error('[webhook] Build spawn error:', err); onBatchFinished(); });
  } catch (err) { console.error('[webhook] Cache update error:', err); onBatchFinished(); }
}

function onBatchFinished() { state.currentBatch = null; state.processing = false; if (!state.shuttingDown && eventMap.size > 0) scheduleProcess(true); }

function normalizeModel(model, uid) {
  if (uid) { const parts = uid.split('.'); return parts[parts.length - 1].toLowerCase(); }
  return model?.toLowerCase() ?? '';
}

async function handleWebhook(req, res) {
  if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST' }); return res.end('Method Not Allowed'); }
  req.setTimeout(REQ_TIMEOUT_MS, () => { console.error('[webhook] Request timeout'); if (!res.headersSent) { res.writeHead(408); res.end('Request Timeout'); } req.destroy(); });
  const bodyChunks = []; let totalLength = 0, reqDestroyed = false;
  req.on('data', (chunk) => { if (reqDestroyed) return; totalLength += chunk.length; if (totalLength > MAX_BODY_SIZE) { reqDestroyed = true; console.error(`[webhook] Request body too large: ${totalLength} bytes`); if (!res.headersSent) { res.writeHead(413, { 'Content-Type': 'text/plain' }); res.end('Request Entity Too Large'); } req.destroy(); return; } bodyChunks.push(chunk); });
  req.on('end', async () => {
    if (reqDestroyed) return;
    const rawBody = Buffer.concat(bodyChunks).toString();
    let payload = {};
    try { payload = rawBody ? JSON.parse(rawBody) : {}; } catch (err) { console.error('[webhook] Invalid JSON:', err.message); res.writeHead(400, { 'Content-Type': 'text/plain' }); res.end('Invalid JSON'); return; }
    const { event, uid, model: modelRaw } = payload;
    const entry = (payload.entry && typeof payload.entry === 'object') ? payload.entry : {};
    if (!event || typeof event !== 'string') { res.writeHead(200); return res.end('ignored'); }
    const dotIndex = event.indexOf('.'); if (dotIndex === -1) { res.writeHead(200); return res.end('ignored'); }
    const scope = event.slice(0, dotIndex), action = event.slice(dotIndex + 1);
    if (scope !== 'entry') { res.writeHead(200); return res.end('ignored'); }
    if (!['create', 'update', 'publish', 'delete', 'unpublish'].includes(action)) { res.writeHead(200); return res.end('ignored'); }
    const model = normalizeModel(modelRaw, uid);
    const id = entry.documentId, locale = entry.locale;
    if (!model || !id) { console.log('[webhook] Missing model or documentId, ignoring'); res.writeHead(200); return res.end('ignored'); }
    await enqueue({ model, id, locale, action });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'queued', queueSize: eventMap.size }));
  });
  req.on('error', (err) => { if (err.code !== 'ECONNRESET') console.error('[webhook] Request error:', err.message); if (!res.headersSent) { res.writeHead(500); res.end('Internal Server Error'); } });
}

const server = http.createServer(handleWebhook);
server.on('error', (err) => console.error('[webhook] Server error:', err));
const PORT = parseInt(process.env.WEBHOOK_PORT || '3000', 10);
server.listen(PORT, '0.0.0.0', () => { console.log(`[webhook] Listening on port ${PORT}`); console.log(`[webhook] Debounce: ${DEBOUNCE_MS}ms | Max wait: ${MAX_WAIT_MS}ms`); console.log(`[webhook] Max body: ${MAX_BODY_SIZE}B | Request timeout: ${REQ_TIMEOUT_MS}ms`); });

function gracefulShutdown(signal) {
  console.log(`[webhook] Received ${signal}, initiating graceful shutdown...`);
  state.shuttingDown = true;
  server.close(() => console.log('[webhook] HTTP server closed'));
  if (state.debounceTimer) clearTimeout(state.debounceTimer);
  if (state.maxWaitTimer) clearTimeout(state.maxWaitTimer);
  if (footerDebounceTimer) clearTimeout(footerDebounceTimer);
  const doExit = () => { if (eventMap.size > 0) console.warn(`[webhook] ${eventMap.size} pending event(s) discarded`); console.log('[webhook] Graceful shutdown completed'); process.exit(0); };
  if (state.processing && state.currentBatch) {
    console.log(`[webhook] Waiting for current batch (${state.currentBatch.length} document(s)) to complete...`);
    const SHUTDOWN_TIMEOUT_MS = 30000;
    const shutdownTimeout = setTimeout(() => { console.error('[webhook] Shutdown timeout exceeded, forcing exit'); process.exit(1); }, SHUTDOWN_TIMEOUT_MS);
    const checkInterval = setInterval(() => { if (!state.processing) { clearInterval(checkInterval); clearTimeout(shutdownTimeout); doExit(); } }, 500);
  } else doExit();
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
