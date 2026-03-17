/**
 * scripts/build-content-cache.ts
 *
 * 改进版本：
 * - 按语言拆分缓存文件
 * - 将存储结构从数组改为对象（以 documentId 为键）
 * - 生成类型定义文件 content-cache.d.ts，反映新结构
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GraphQLClient } from 'graphql-request';
import dotenv from 'dotenv';
import { getSdk } from '../src/generated/graphql-types';
import { locales } from '../src/generated/i18n-config';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const STRAPI_URL = process.env.PUBLIC_STRAPI_API_URL;
const STRAPI_TOKEN = process.env.PUBLIC_STRAPI_API_TOKEN;

if (!STRAPI_URL) {
  throw new Error('PUBLIC_STRAPI_API_URL not set');
}

// 读取 field-config.json
const fieldConfigPath = join(__dirname, '../src/generated/field-config.json');
const fieldConfigRaw = readFileSync(fieldConfigPath, 'utf-8');
const fieldConfig: Record<string, any> = JSON.parse(fieldConfigRaw);

// 需要跳过的系统类型
const SKIP_TYPES = [
  'UploadFile',
  'I18NLocale',
  'ReviewWorkflowsWorkflow',
  'ReviewWorkflowsWorkflowStage',
  'UsersPermissionsRole',
  'UsersPermissionsUser',
];

const MAX_PAGES = 25;

function createClient() {
  return new GraphQLClient(`${STRAPI_URL}/graphql`, {
    headers: STRAPI_TOKEN ? { authorization: `Bearer ${STRAPI_TOKEN}` } : {},
  });
}

function discoverListOperations(sdk: any): string[] {
  return Object.keys(sdk).filter((key) => {
    return key.endsWith('List') && typeof sdk[key] === 'function';
  });
}

function extractContentType(operationName: string): string {
  return operationName.replace(/^Get/, '').replace(/List$/, '');
}

function findMatchingTypeKey(candidate: string): string | null {
  if (fieldConfig[candidate]) return candidate;
  const lowerCandidate = candidate.toLowerCase();
  const matchedKey = Object.keys(fieldConfig).find(
    key => key.toLowerCase() === lowerCandidate
  );
  if (matchedKey) {
    console.warn(
      `⚠️ 类型名 "${candidate}" 与 field-config 中的 "${matchedKey}" 仅大小写不同，将使用 "${matchedKey}"。`
    );
    return matchedKey;
  }
  return null;
}

function isForbiddenError(err: any): boolean {
  if (!err) return false;
  if (typeof err.message === 'string' && err.message.includes('Forbidden')) {
    return true;
  }
  const graphQLErrors = err.response?.errors ?? [];
  return graphQLErrors.some((e: any) =>
    typeof e.message === 'string' && e.message.includes('Forbidden')
  );
}

async function fetchAllPages(
  sdk: any,
  operation: string,
  contentType: string,
  locale?: string
) {
  const config = fieldConfig[contentType];
  if (!config) {
    throw new Error(`配置缺失: ${contentType}`);
  }

  const pageSize = 100;
  let page = 1;
  let allItems: any[] = [];

  const baseVariables: any = {
    pagination: { page, pageSize },
  };

  if (locale && config.args?.includes('locale')) {
    baseVariables.locale = locale;
  }

  const supportsSort = config.args?.includes('sort');

  while (page <= MAX_PAGES) {
    try {
      const variables = { ...baseVariables };
      if (supportsSort) {
        variables.sort = ['publishedAt:desc'];
      }

      const result = await sdk[operation](variables);
      const key = config.rootField;
      const rawData = result[key];

      let items: any[] = [];
      if (config.rootReturnType?.includes('EntityResponseCollection')) {
        const collection = rawData as { data?: any[] };
        if (!collection || !Array.isArray(collection.data)) {
          throw new Error(
            `预期返回格式 { data: array }，但收到: ${JSON.stringify(collection).slice(0, 200)}`
          );
        }
        items = collection.data;
      } else {
        if (!Array.isArray(rawData)) {
          throw new Error(
            `预期返回数组，但收到: ${JSON.stringify(rawData).slice(0, 200)}`
          );
        }
        items = rawData;
      }

      if (!items.length) break;

      allItems = allItems.concat(items);
      console.log(`   Page ${page}: fetched ${items.length} items`);

      if (items.length < pageSize) break;

      page++;
      baseVariables.pagination.page = page;
    } catch (err: any) {
      if (isForbiddenError(err)) {
        console.warn(`⚠️ 跳过 ${operation} (${locale}) 权限不足。`);
        return [];
      }

      if (err.message?.includes('publishedAt') || err.message?.includes('sort')) {
        console.warn(`   排序字段可能不存在，尝试不带排序...`);
        try {
          const variables = { ...baseVariables };
          const result = await sdk[operation](variables);
          const key = config.rootField;
          const rawData = result[key];

          let items: any[] = [];
          if (config.rootReturnType?.includes('EntityResponseCollection')) {
            const collection = rawData as { data?: any[] };
            if (!collection || !Array.isArray(collection.data)) {
              throw new Error(`预期返回格式 { data: array }，但收到: ${JSON.stringify(collection).slice(0, 200)}`);
            }
            items = collection.data;
          } else {
            if (!Array.isArray(rawData)) {
              throw new Error(`预期返回数组，但收到: ${JSON.stringify(rawData).slice(0, 200)}`);
            }
            items = rawData;
          }

          if (!items.length) break;

          allItems = allItems.concat(items);
          console.log(`   Page ${page}: fetched ${items.length} items (no sort)`);

          if (items.length < pageSize) break;

          page++;
          baseVariables.pagination.page = page;
        } catch (fallbackErr: any) {
          if (isForbiddenError(fallbackErr)) {
            console.warn(`⚠️ 跳过 ${operation} (${locale}) 权限不足。`);
            return [];
          }
          console.error(`❌ 获取 ${operation} (${locale}) 失败:`, fallbackErr.message);
          throw fallbackErr;
        }
      } else {
        console.error(`❌ 获取 ${operation} (${locale}) 失败:`, err.message);
        throw err;
      }
    }
  }

  if (page > MAX_PAGES) {
    console.warn(`⚠️ 达到最大页数限制 ${MAX_PAGES}，可能数据未完全获取。`);
  }

  return allItems;
}

/**
 * 生成内容缓存类型定义文件（适配对象结构）
 */
async function generateTypeDefinition(cache: Record<string, any>) {
  const typeLines: string[] = [];

  typeLines.push('// Auto-generated. DO NOT EDIT.\n');
  typeLines.push(`import type * as Types from './graphql-types';\n`);
  typeLines.push(`export interface ContentCache {`);

  for (const contentType of Object.keys(cache)) {
    // 确保类型名称首字母大写（与 graphql-types 导出一致）
    const typeName = contentType.charAt(0).toUpperCase() + contentType.slice(1);
    typeLines.push(`  ${contentType}: Record<string, Types.${typeName}>;`);
  }

  typeLines.push(`}\n`);

  const outputPath = join(__dirname, '../src/generated/content-cache.d.ts');
  writeFileSync(outputPath, typeLines.join('\n'));
  console.log(`✅ 类型定义生成: ${outputPath}`);
}

async function buildCache() {
  console.log('🚀 开始构建内容缓存（对象存储）...');

  const client = createClient();
  const sdk = getSdk(client);

  const operations = discoverListOperations(sdk);
  console.log(`🔍 发现 ${operations.length} 个列表操作:`, operations);

  const cache: Record<string, any> = {};

  for (const op of operations) {
    const rawType = extractContentType(op);
    const contentType = findMatchingTypeKey(rawType);

    if (!contentType) {
      console.warn(`⚠️ 跳过 ${op}: 在 field-config.json 中未找到匹配的类型 "${rawType}"`);
      continue;
    }

    if (SKIP_TYPES.includes(contentType)) {
      console.log(`⏭️ 跳过系统类型 ${contentType} (操作 ${op})`);
      continue;
    }

    console.log(`\n📦 处理操作: ${op} -> 内容类型: "${contentType}"`);

    const localeResults: Record<string, any[]> = {};

    for (const locale of locales) {
      console.log(`   获取 ${contentType} (${locale})`);
      const items = await fetchAllPages(sdk, op, contentType, locale);
      localeResults[locale] = items;
      console.log(`   ${locale}: ${items.length} 项`);
    }

    const hasAnyData = Object.values(localeResults).some(items => items.length > 0);
    const cacheKey = contentType.toLowerCase(); // 缓存键统一小写，便于前端使用

    if (hasAnyData) {
      cache[cacheKey] = localeResults;
      console.log(`✅ ${contentType} 已缓存为 "${cacheKey}"`);
    } else {
      console.warn(`⚠️ 完全跳过 ${contentType}（所有语言均无数据或无权限）`);
    }
  }

  // 确保输出目录存在
  const outputDir = join(__dirname, '../src/generated');
  const cacheDir = join(outputDir, 'cache');
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }

  // 生成类型定义文件（基于新结构）
  await generateTypeDefinition(cache);

  // 按类型和语言写入独立文件，格式为对象（以 documentId 为键）
  for (const [type, localeResults] of Object.entries(cache)) {
    const typeDir = join(cacheDir, type);
    if (!existsSync(typeDir)) {
      mkdirSync(typeDir, { recursive: true });
    }

    for (const [locale, items] of Object.entries(localeResults as Record<string, any[]>)) {
      // 将数组转换为以 documentId 为键的对象
      const obj = Object.fromEntries(
        items.map(item => [item.documentId, item])
      );
      const filePath = join(typeDir, `${locale}.json`);
      writeFileSync(filePath, JSON.stringify(obj, null, 2));
      console.log(`✅ ${type}/${locale}.json 已生成 (${items.length} 项)`);
    }
  }
}

buildCache().catch((err) => {
  console.error('❌ 构建失败:', err);
  process.exit(1);
});
