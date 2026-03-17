// scripts/analyze-schema.ts
/**
 * Strapi v5 schema analyzer with root field metadata
 * - Records root field return type and accepted arguments
 * - Prefers plural list fields
 * - Only adds system fields that actually exist in the type
 * - Caches introspection result to avoid repeated network requests (C6)
 * - Enhanced error handling: timeout, retry, detailed logging
 */

import {
  getIntrospectionQuery,
  buildClientSchema,
  GraphQLObjectType,
  isObjectType,
  isScalarType,
  isNonNullType,
  isListType,
  GraphQLType,
  IntrospectionQuery,
} from 'graphql';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config();

const STRAPI_URL = process.env.PUBLIC_STRAPI_API_URL!;
const STRAPI_TOKEN = process.env.PUBLIC_STRAPI_API_TOKEN;

if (!STRAPI_URL) throw new Error('PUBLIC_STRAPI_API_URL not set');

// 缓存文件路径
const CACHE_DIR = join(__dirname, '../src/generated');
const SCHEMA_CACHE_PATH = join(CACHE_DIR, 'schema-introspection.json');

// 可选：通过环境变量控制是否强制刷新缓存
const FORCE_REFRESH = process.env.FORCE_REFRESH_SCHEMA === 'true';

const SYSTEM_FIELDS = [
  'id',
  'documentId',
  'createdAt',
  'updatedAt',
  'publishedAt'
];

type RelationConfig = {
  type: string;
  fields: string[];
};

type ContentTypeConfig = {
  rootField: string;
  rootReturnType: string;        // 根字段返回的类型名（字符串表示）
  args: string[];                 // 根字段支持的参数名
  scalars: string[];
  relations: Record<string, RelationConfig>;
};

type ConfigMap = Record<string, ContentTypeConfig>;

function unwrapToInner(type: GraphQLType): GraphQLType {
  let current = type;
  while (isNonNullType(current) || isListType(current)) {
    if (isListType(current)) {
      current = current.ofType;
    } else {
      current = current.ofType;
    }
  }
  return current;
}

function unwrap(type: GraphQLType): GraphQLType {
  if (isNonNullType(type) || isListType(type)) {
    return unwrap(type.ofType);
  }
  return type;
}

function shouldReplaceRootField(current: string, existing: string): boolean {
  const currentIsConnection = current.endsWith('_connection');
  const existingIsConnection = existing.endsWith('_connection');
  if (currentIsConnection !== existingIsConnection) {
    return !currentIsConnection;
  }
  const currentIsPlural = current.endsWith('s') && !currentIsConnection;
  const existingIsPlural = existing.endsWith('s') && !existingIsConnection;
  if (currentIsPlural !== existingIsPlural) {
    return currentIsPlural;
  }
  return false;
}

/**
 * 带超时和重试的 fetch 函数
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  timeoutMs = 30000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeout);

      // 如果是最后一次重试，抛出错误
      if (i === retries - 1) {
        throw error;
      }

      // 计算等待时间（指数退避）
      const waitMs = 2000 * Math.pow(2, i);
      console.warn(`⚠️ 请求失败，${waitMs}ms 后重试 (${i + 1}/${retries}):`, error instanceof Error ? error.message : String(error));
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }
  throw new Error('Unreachable');
}

/**
 * 获取 introspection 数据（使用 fetch + 重试）
 */
async function fetchIntrospection(): Promise<IntrospectionQuery> {
  console.log('📡 Fetching introspection data from Strapi...');
  const url = `${STRAPI_URL}/graphql`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  const response = await fetchWithRetry(
    url,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: getIntrospectionQuery() }),
    },
    3,  // 重试次数
    30000 // 30秒超时
  );

  const { data, errors } = await response.json() as { data?: IntrospectionQuery; errors?: any[] };
  if (errors) {
    throw new Error(`GraphQL 错误: ${JSON.stringify(errors)}`);
  }
  if (!data) {
    throw new Error('Introspection 返回数据为空');
  }

  return data;
}

async function getIntrospectionData(): Promise<IntrospectionQuery> {
  // 确保缓存目录存在
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }

  // 如果强制刷新或缓存文件不存在，则重新获取
  if (FORCE_REFRESH || !existsSync(SCHEMA_CACHE_PATH)) {
    const data = await fetchIntrospection();
    writeFileSync(SCHEMA_CACHE_PATH, JSON.stringify(data, null, 2));
    console.log(`✅ Introspection cached to ${SCHEMA_CACHE_PATH}`);
    return data;
  }

  // 读取缓存
  console.log(`📁 Loading introspection from cache: ${SCHEMA_CACHE_PATH}`);
  try {
    const raw = readFileSync(SCHEMA_CACHE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn('⚠️ 缓存文件损坏，重新获取...', error);
    const data = await fetchIntrospection();
    writeFileSync(SCHEMA_CACHE_PATH, JSON.stringify(data, null, 2));
    return data;
  }
}

async function main() {
  console.log('🚀 Starting schema analysis (with root field metadata)...');

  // 获取 introspection 数据（可能来自缓存，支持重试）
  const introspection = await getIntrospectionData();
  const schema = buildClientSchema(introspection);

  const queryType = schema.getQueryType();
  if (!queryType) {
    console.error('❌ No Query type found');
    process.exit(1);
  }

  const queryFields = queryType.getFields();
  console.log(`\n🔍 Found ${Object.keys(queryFields).length} root query fields`);

  const config: ConfigMap = {};

  for (const [fieldName, field] of Object.entries(queryFields)) {
    console.log(`\n📦 Inspecting root field: ${fieldName}`);

    const innerType = unwrapToInner(field.type);
    if (!isObjectType(innerType)) {
      console.log(`  ⏭️  Not an object type: ${innerType}`);
      continue;
    }

    const typeName = innerType.name;
    const fields = innerType.getFields();

    const scalarFieldNames = Object.keys(fields).filter(fname => {
      const fieldType = unwrap(fields[fname].type);
      return isScalarType(fieldType);
    });

    const hasSystemField = scalarFieldNames.some(f => SYSTEM_FIELDS.includes(f));
    const hasNonSystemField = scalarFieldNames.some(f => !SYSTEM_FIELDS.includes(f));

    if (!hasSystemField || !hasNonSystemField) {
      console.log(`  ⏭️  Not a content type (system:${hasSystemField}, non-system:${hasNonSystemField})`);
      continue;
    }

    if (typeName === 'UsersPermissionsMe') {
      console.log(`  ⏭️  Skipping '${typeName}' (not a collection type)`);
      continue;
    }

    console.log(`  ✅ Identified content type: ${typeName}`);

    const scalars: string[] = [];
    const relations: Record<string, RelationConfig> = {};

    for (const [fname, f] of Object.entries(fields)) {
      const unwrapped = unwrap(f.type);
      if (isScalarType(unwrapped)) {
        scalars.push(fname);
      } else if (isObjectType(unwrapped)) {
        relations[fname] = { type: unwrapped.name, fields: [] };
      }
    }

    const actualFieldNames = new Set(Object.keys(fields));

    for (const sys of SYSTEM_FIELDS) {
      if (actualFieldNames.has(sys) && !scalars.includes(sys)) {
        scalars.push(sys);
      }
    }

    const rootReturnType = field.type.toString();
    const args = field.args.map(arg => arg.name);

    if (!config[typeName]) {
      config[typeName] = {
        rootField: fieldName,
        rootReturnType,
        args,
        scalars,
        relations
      };
      console.log(`    → Set rootField to '${fieldName}' (first encounter)`);
    } else {
      const existing = config[typeName].rootField;
      if (shouldReplaceRootField(fieldName, existing)) {
        config[typeName].rootField = fieldName;
        config[typeName].rootReturnType = rootReturnType;
        config[typeName].args = args;
        console.log(`    → Updated rootField from '${existing}' to '${fieldName}' (higher priority)`);
      } else {
        console.log(`    → Kept existing rootField '${existing}'`);
      }
    }
  }

  console.log('\n📋 Selected root fields per content type:');
  for (const [type, conf] of Object.entries(config)) {
    console.log(`  - ${type}: ${conf.rootField} (args: ${conf.args.join(', ')})`);
  }

  const outDir = join(process.cwd(), 'src/generated');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const configPath = join(outDir, 'field-config.json');
  writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`\n✅ field-config.json generated with ${Object.keys(config).length} content types`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
