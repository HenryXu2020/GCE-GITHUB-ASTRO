#!/usr/bin/env tsx
// scripts/update-cache-entry.ts
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, renameSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GraphQLClient, gql } from 'graphql-request';
import dotenv from 'dotenv';
import { parseArgs } from 'node:util';
import { defaultLocale } from '../src/generated/i18n-config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const STRAPI_URL = process.env.PUBLIC_STRAPI_API_URL;
const STRAPI_TOKEN = process.env.PUBLIC_STRAPI_API_TOKEN;
if (!STRAPI_URL) throw new Error('PUBLIC_STRAPI_API_URL not set');

const CACHE_DIR = join(__dirname, '../src/generated/cache');
const MAX_DEPTH = 3;

const client = new GraphQLClient(`${STRAPI_URL}/graphql`, {
  headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {},
});

const options = {
  model: { type: 'string' as const, required: true },
  id: { type: 'string' as const, required: true },
  locale: { type: 'string' as const, required: false },
  event: { type: 'string' as const, required: true },
};
const { values } = parseArgs({ args: process.argv.slice(2), options });
const { model, id, locale, event } = values;

const effectiveLocale = locale && locale !== 'undefined' ? locale : defaultLocale;

const fieldConfigPath = join(__dirname, '../src/generated/field-config.json');
if (!existsSync(fieldConfigPath)) {
  console.error('field-config.json not found. Run full build first.');
  process.exit(1);
}
const fieldConfig = JSON.parse(readFileSync(fieldConfigPath, 'utf-8'));

function normalizeModel(model: string): string {
  return model
    .replace(/^api::/, '')
    .split('.')
    .pop()
    ?.toLowerCase() ?? '';
}

const normalizedModel = normalizeModel(model);

const typeKey = Object.keys(fieldConfig).find(
  key => key.toLowerCase() === normalizedModel
);
if (!typeKey) {
  console.error(`Content type "${model}" (normalized: "${normalizedModel}") not found in field-config.json`);
  process.exit(1);
}
const typeConfig = fieldConfig[typeKey];

function indent(block: string, spaces = 8): string {
  const pad = ' '.repeat(spaces);
  return block
    .split('\n')
    .map(line => (line ? pad + line : line))
    .join('\n');
}

/**
 * 递归构建查询选择集（强制包含 documentId）
 */
function buildSelection(
  typeName: string,
  visited = new Set<string>(),
  depth = 0
): string {
  if (depth > MAX_DEPTH) return '';
  if (visited.has(typeName)) return '';
  visited.add(typeName);

  const config = fieldConfig[typeName];
  if (!config) return '';

  const { scalars = [], relations = {} as Record<string, any> } = config;

  const scalarLines = [
    'documentId',
    ...scalars.filter((f: string) => f !== 'documentId'),
  ];

  const relationLines = Object.entries(relations)
    .map(([fieldName, rel]: [string, any]) => {
      // 特殊处理 localizations：只取基础字段，避免过度递归
      if (fieldName === 'localizations') {
        const locConfig = fieldConfig[rel.type];
        if (!locConfig) return '';

        const locScalars = locConfig.scalars ?? [];

        const baseFields = ['documentId', 'locale'];
        const extraFields: string[] = [];

        if (locScalars.includes('slug')) extraFields.push('slug');
        if (locScalars.includes('title')) extraFields.push('title');

        const subFields = [...baseFields, ...extraFields];
        const subFieldLines = subFields.map(f => `          ${f}`).join('\n');
        return `
        localizations {
${subFieldLines}
        }`;
      }

      // 处理自引用关系：使用全新的 visited 集合，允许递归，仅受深度限制
      if (rel.type === typeName) {
        const nested = buildSelection(rel.type, new Set(), depth + 1);
        if (!nested.trim()) return '';
        return `
        ${fieldName} {
${indent(nested)}
        }`;
      }

      // 普通关系：继续传递当前 visited 集合（已包含当前路径）
      const nested = buildSelection(rel.type, new Set(visited), depth + 1);
      if (!nested.trim()) return '';
      return `
        ${fieldName} {
${indent(nested)}
        }`;
    })
    .filter(Boolean);

  return [...scalarLines, ...relationLines].join('\n').trim();
}

function buildQueryVariables() {
  const args = typeConfig.args || [];
  const varDefs: string[] = [];
  const argAssignments: string[] = [];

  if (args.includes('filters')) {
    varDefs.push('$id: ID!');
    argAssignments.push('filters: { documentId: { eq: $id } }');
  }
  if (args.includes('locale')) {
    varDefs.push('$locale: I18NLocaleCode');
    argAssignments.push('locale: $locale');
  }
  if (args.includes('pagination')) {
    varDefs.push('$pagination: PaginationArg');
    argAssignments.push('pagination: $pagination');
  }

  return { varDefs, argAssignments };
}

async function fetchEntry(id: string, locale: string): Promise<any> {
  const selection = buildSelection(typeKey);

  if (!selection) {
    throw new Error(`GraphQL selection for ${typeKey} is empty`);
  }

  const { varDefs, argAssignments } = buildQueryVariables();

  const varSection = varDefs.length > 0 ? `(\n  ${varDefs.join(',\n  ')}\n)` : '';
  const argSection = argAssignments.length > 0 ? `(\n    ${argAssignments.join(',\n    ')}\n  )` : '';

  const safeOpName = typeConfig.rootField.replace(/[^A-Za-z0-9_]/g, '') || 'Content';
  const query = gql`
    query Get${safeOpName}Entry${varSection ? ` ${varSection}` : ''} {
      ${typeConfig.rootField}${argSection} {
        ${selection}
      }
    }
  `;

  const variables: any = { id };
  if (argAssignments.some(a => a.includes('locale'))) variables.locale = locale;
  if (argAssignments.some(a => a.includes('pagination'))) variables.pagination = { limit: 1 };

  const result = await client.request(query, variables);
  const root = result[typeConfig.rootField];

  if (!root) return null;

  if (Array.isArray(root)) {
    return root[0] ?? null;
  }

  if (root.data) {
    if (Array.isArray(root.data)) {
      return root.data[0] ?? null;
    }
    return root.data;
  }

  if (root.nodes && Array.isArray(root.nodes)) {
    return root.nodes[0] ?? null;
  }

  return null;
}

function writeJsonAtomic(path: string, data: any) {
  const tmp = path + '.tmp';
  writeFileSync(tmp, JSON.stringify(data, null, 2));
  renameSync(tmp, path);
}

async function updateCache() {
  const cacheTypeDir = join(CACHE_DIR, typeKey.toLowerCase());

  if (!existsSync(cacheTypeDir)) {
    mkdirSync(cacheTypeDir, { recursive: true });
  }

  // 修正：删除事件只影响指定语言的缓存文件，而不是遍历所有语言
  if (event === 'delete' || event === 'unpublish') {
    const cacheFile = join(cacheTypeDir, `${effectiveLocale}.json`);
    if (!existsSync(cacheFile)) {
      console.log(`[cache] Cache file ${cacheFile} not found, nothing to delete.`);
      return;
    }

    const raw = JSON.parse(readFileSync(cacheFile, 'utf-8'));
    if (typeof raw !== 'object' || Array.isArray(raw)) {
      console.warn(`[cache] Invalid cache file format in ${cacheFile}, skipping.`);
      return;
    }

    if (raw[id]) {
      delete raw[id];
      writeJsonAtomic(cacheFile, raw);
      console.log(`[cache] Removed ${id} from ${effectiveLocale}.json (event: ${event})`);
    } else {
      console.log(`[cache] Entry ${id} not found in ${effectiveLocale}.json, nothing to remove.`);
    }
    return;
  }

  // 对于更新/发布/创建，只更新指定语言的缓存文件
  const cacheFile = join(cacheTypeDir, `${effectiveLocale}.json`);

  let entriesObj: Record<string, any> = {};

  if (existsSync(cacheFile)) {
    const raw = JSON.parse(readFileSync(cacheFile, 'utf-8'));
    if (typeof raw !== 'object' || Array.isArray(raw)) {
      console.warn(`[cache] Cache file ${cacheFile} is corrupted (expected object). Will overwrite with new data.`);
      entriesObj = {};
    } else {
      entriesObj = raw;
    }
  } else {
    console.warn(`[cache] Cache file ${cacheFile} not found, will create new one.`);
  }

  const newEntry = await fetchEntry(id, effectiveLocale);

  if (!newEntry) {
    if (entriesObj[id]) {
      delete entriesObj[id];
      writeJsonAtomic(cacheFile, entriesObj);
      console.log(`[cache] Removed unpublished ${typeKey.toLowerCase()}/${effectiveLocale} → ${id}`);
    } else {
      console.log(`[cache] Entry ${id} not found in cache, nothing to remove`);
    }
    return;
  }

  const wasPresent = id in entriesObj;
  entriesObj[id] = newEntry;

  if (wasPresent) {
    console.log(`[cache] Updated ${typeKey.toLowerCase()}/${effectiveLocale} → ${id}`);
  } else {
    console.log(`[cache] Added ${typeKey.toLowerCase()}/${effectiveLocale} → ${id}`);
  }

  writeJsonAtomic(cacheFile, entriesObj);
  console.log(`[cache] File updated: ${cacheFile}`);
}

updateCache().catch(err => {
  console.error('[cache] Error:', err);
  process.exit(1);
});
