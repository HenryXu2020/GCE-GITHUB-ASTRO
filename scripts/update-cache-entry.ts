#!/usr/bin/env tsx
// scripts/update-cache-entry.ts
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'fs';
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
const SINGLE_TYPE_CACHE_KEY = 'single';

const client = new GraphQLClient(`${STRAPI_URL}/graphql`, {
  headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {},
});

const fieldConfigPath = join(__dirname, '../src/generated/field-config.json');
if (!existsSync(fieldConfigPath)) { console.error('field-config.json not found. Run full build first.'); process.exit(1); }
const fieldConfig = JSON.parse(readFileSync(fieldConfigPath, 'utf-8'));

function normalizeModel(model: string): string {
  return model.replace(/^api::/, '').split('.').pop()?.toLowerCase() ?? '';
}

function indent(block: string, spaces = 8): string {
  const pad = ' '.repeat(spaces);
  return block.split('\n').map(line => line ? pad + line : line).join('\n');
}

function buildSelection(typeName: string, visited = new Set<string>(), depth = 0): string {
  if (depth > MAX_DEPTH) return '';
  if (visited.has(typeName)) return '';
  visited.add(typeName);
  const config = fieldConfig[typeName];
  if (!config) return '';
  const { scalars = [], relations = {} as Record<string, any>, isComponent = false } = config;
  
  // 组件类型不请求 documentId
  let scalarLines: string[];
  if (isComponent) {
    scalarLines = scalars.filter(f => f !== 'documentId');
  } else {
    scalarLines = ['documentId', ...scalars.filter(f => f !== 'documentId')];
  }
  
  const relationLines = Object.entries(relations).map(([fieldName, rel]: [string, any]) => {
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
      return `\n        localizations {\n${subFieldLines}\n        }`;
    }
    if (rel.type === typeName) {
      const nested = buildSelection(rel.type, new Set(), depth + 1);
      if (!nested.trim()) return '';
      return `\n        ${fieldName} {\n${indent(nested)}\n        }`;
    }
    const nested = buildSelection(rel.type, new Set(visited), depth + 1);
    if (!nested.trim()) return '';
    return `\n        ${fieldName} {\n${indent(nested)}\n        }`;
  }).filter(Boolean);
  
  return [...scalarLines, ...relationLines].join('\n').trim();
}

function buildQueryVariables(typeConfig: any) {
  const args = typeConfig.args || [];
  const varDefs: string[] = [], argAssignments: string[] = [];
  if (args.includes('filters')) { varDefs.push('$id: ID!'); argAssignments.push('filters: { documentId: { eq: $id } }'); }
  if (args.includes('locale')) { varDefs.push('$locale: I18NLocaleCode'); argAssignments.push('locale: $locale'); }
  if (args.includes('pagination')) { varDefs.push('$pagination: PaginationArg'); argAssignments.push('pagination: $pagination'); }
  return { varDefs, argAssignments };
}

async function fetchEntry(id: string, locale: string, typeKey: string) {
  const typeConfig = fieldConfig[typeKey];
  const selection = buildSelection(typeKey);
  if (!selection) throw new Error(`GraphQL selection for ${typeKey} is empty`);
  const { varDefs, argAssignments } = buildQueryVariables(typeConfig);
  const varSection = varDefs.length > 0 ? `(\n  ${varDefs.join(',\n  ')}\n)` : '';
  const argSection = argAssignments.length > 0 ? `(\n    ${argAssignments.join(',\n    ')}\n  )` : '';
  const safeOpName = typeConfig.rootField.replace(/[^A-Za-z0-9_]/g, '') || 'Content';
  const query = gql`
    query Get${safeOpName}Entry${varSection} {
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
  if (Array.isArray(root)) return root[0] ?? null;
  if (root.data) { if (Array.isArray(root.data)) return root.data[0] ?? null; return root.data; }
  if (root.nodes && Array.isArray(root.nodes)) return root.nodes[0] ?? null;
  return null;
}

function writeJsonAtomic(path: string, data: any) { const tmp = path + '.tmp'; writeFileSync(tmp, JSON.stringify(data, null, 2)); renameSync(tmp, path); }

export async function updateCacheEntry(params: { model: string; id: string; locale?: string | null; action: string }) {
  const { model, id, locale, action } = params;
  const normalizedModel = normalizeModel(model);
  const typeKey = Object.keys(fieldConfig).find(key => key.toLowerCase() === normalizedModel);
  if (!typeKey) { console.error(`Content type "${model}" (normalized: "${normalizedModel}") not found in field-config.json`); return; }
  const effectiveLocale = locale && locale !== 'undefined' ? locale : defaultLocale;
  const cacheTypeDir = join(CACHE_DIR, typeKey.toLowerCase());
  if (!existsSync(cacheTypeDir)) mkdirSync(cacheTypeDir, { recursive: true });
  const cacheFile = join(cacheTypeDir, `${effectiveLocale}.json`);
  let entriesObj: Record<string, any> = {};
  if (existsSync(cacheFile)) {
    const raw = JSON.parse(readFileSync(cacheFile, 'utf-8'));
    if (typeof raw !== 'object' || Array.isArray(raw)) console.warn(`[cache] Cache file ${cacheFile} is corrupted. Will overwrite.`);
    else entriesObj = raw;
  }
  if (action === 'delete' || action === 'unpublish') {
    if (entriesObj[id]) { delete entriesObj[id]; writeJsonAtomic(cacheFile, entriesObj); console.log(`[cache] Removed ${typeKey.toLowerCase()}/${effectiveLocale} → ${id} (${action})`); }
    else console.log(`[cache] Entry ${id} not found in ${cacheFile}, nothing to remove.`);
    return;
  }
  const newEntry = await fetchEntry(id, effectiveLocale, typeKey);
  if (!newEntry) {
    if (entriesObj[id]) { delete entriesObj[id]; writeJsonAtomic(cacheFile, entriesObj); console.log(`[cache] Removed unpublished ${typeKey.toLowerCase()}/${effectiveLocale} → ${id}`); }
    else console.log(`[cache] Entry ${id} not found in Strapi, nothing to remove`);
    return;
  }
  const isSingle = fieldConfig[typeKey]?.isSingle;
  let wrapped: any;
  if (isSingle) {
    wrapped = { data: newEntry, __meta: { status: 'ok', fetchedAt: Date.now() } };
    entriesObj[SINGLE_TYPE_CACHE_KEY] = wrapped;
  } else {
    wrapped = { data: newEntry, __meta: { status: 'ok', fetchedAt: Date.now() } };
    entriesObj[id] = wrapped;
  }
  writeJsonAtomic(cacheFile, entriesObj);
  console.log(`[cache] ${entriesObj[id] ? 'Updated' : 'Added'} ${typeKey.toLowerCase()}/${effectiveLocale} → ${id} (wrapped with meta)`);
}

async function main() {
  const options = { model: { type: 'string' as const, required: true }, id: { type: 'string' as const, required: true }, locale: { type: 'string' as const, required: false }, event: { type: 'string' as const, required: true } };
  const { values } = parseArgs({ args: process.argv.slice(2), options });
  const { model, id, locale, event } = values;
  await updateCacheEntry({ model, id, locale, action: event });
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch(err => { console.error('[cache] Error:', err); process.exit(1); });
