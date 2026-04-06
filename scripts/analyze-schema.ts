// scripts/analyze-schema.ts
/**
 * Strapi v5 schema analyzer with root field metadata
 * - Records root field return type and accepted arguments
 * - Prefers plural list fields for collections
 * - Adds system fields that actually exist in the type
 * - Identifies Single Types (isSingle flag)
 * - 识别以 Component 开头的类型作为组件，包含其所有标量字段
 * - **新增**: 处理 UploadFile 媒体类型，使其作为关系字段被正确缓存
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
  isInterfaceType,
  isUnionType,
} from 'graphql';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config();

const STRAPI_URL = process.env.PUBLIC_STRAPI_API_URL!;
const STRAPI_TOKEN = process.env.PUBLIC_STRAPI_API_TOKEN;
const CI_INTROSPECTION_TOKEN = process.env.CI_STRAPI_INTROSPECTION_TOKEN || '';

if (!STRAPI_URL) throw new Error('PUBLIC_STRAPI_API_URL not set');

const CACHE_DIR = join(__dirname, '../src/generated');
const SCHEMA_CACHE_PATH = join(CACHE_DIR, 'schema-introspection.json');
const FORCE_REFRESH = process.env.FORCE_REFRESH_SCHEMA === 'true';

const SYSTEM_FIELDS = ['id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt'];

// 需要跳过的系统类型（不记录为内容类型或组件）
// 注意：移除了 'UploadFile'，使其能够作为关系字段被处理
const SKIP_SYSTEM_TYPES = [
  'I18NLocale',
  'ReviewWorkflowsWorkflow',
  'ReviewWorkflowsWorkflowStage',
  'UsersPermissionsRole',
  'UsersPermissionsUser',
  'UsersPermissionsMe',
  'UsersPermissionsPermission',
  'Query',
  'Mutation',
  'Boolean',
  'String',
  'Int',
  'Float',
  'ID',
  'DateTime',
  'JSON',
  'Upload',
  'PaginationArg',
  'Pagination',
];

type RelationConfig = {
  type: string;
  fields: string[];
};

type ContentTypeConfig = {
  rootField?: string;
  rootReturnType?: string;
  args?: string[];
  scalars: string[];
  relations: Record<string, RelationConfig | RelationConfig[]>;
  isSingle?: boolean;
  isComponent?: boolean;
  isMedia?: boolean;  // 新增：标记媒体类型
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
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return response;
    } catch (error) {
      clearTimeout(timeout);
      if (i === retries - 1) throw error;
      const waitMs = 2000 * Math.pow(2, i);
      console.warn(`⚠️ 请求失败，${waitMs}ms 后重试 (${i + 1}/${retries}):`, error instanceof Error ? error.message : String(error));
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }
  throw new Error('Unreachable');
}

async function fetchIntrospection(): Promise<IntrospectionQuery> {
  console.log('📡 Fetching introspection data from Strapi...');
  const url = `${STRAPI_URL}/graphql`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-ci-introspection-token': CI_INTROSPECTION_TOKEN,
    'apollo-require-preflight': 'true',
    'x-apollo-operation-name': 'IntrospectionQuery',
  };
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: getIntrospectionQuery() }),
  }, 3, 30000);

  const { data, errors } = await response.json() as { data?: IntrospectionQuery; errors?: any[] };
  if (errors) throw new Error(`GraphQL 错误: ${JSON.stringify(errors)}`);
  if (!data) throw new Error('Introspection 返回数据为空');
  return data;
}

async function getIntrospectionData(): Promise<IntrospectionQuery> {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });

  if (FORCE_REFRESH || !existsSync(SCHEMA_CACHE_PATH)) {
    const data = await fetchIntrospection();
    writeFileSync(SCHEMA_CACHE_PATH, JSON.stringify(data, null, 2));
    console.log(`✅ Introspection cached to ${SCHEMA_CACHE_PATH}`);
    return data;
  }

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
  console.log('🚀 Starting schema analysis (with root field metadata & component detection)...');
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

  // ========== 1. 分析根查询字段，识别内容类型 ==========
  for (const [fieldName, field] of Object.entries(queryFields)) {
    console.log(`\n📦 Inspecting root field: ${fieldName}`);
    const innerType = unwrapToInner(field.type);
    if (!isObjectType(innerType)) {
      console.log(`  ⏭️  Not an object type: ${innerType}`);
      continue;
    }

    const typeName = innerType.name;

    // 跳过系统类型
    if (SKIP_SYSTEM_TYPES.includes(typeName)) {
      console.log(`  ⏭️  Skipping system type: ${typeName}`);
      continue;
    }

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
    const relations: Record<string, RelationConfig | RelationConfig[]> = {};

    for (const [fname, f] of Object.entries(fields)) {
      const unwrapped = unwrap(f.type);
      if (isScalarType(unwrapped)) scalars.push(fname);
      else if (isObjectType(unwrapped)) {
        // 如果关系目标是系统类型，但 UploadFile 需要保留（作为媒体）
        if (SKIP_SYSTEM_TYPES.includes(unwrapped.name) && unwrapped.name !== 'UploadFile') continue;
        relations[fname] = { type: unwrapped.name, fields: [] };
      } else if (isInterfaceType(unwrapped) || isUnionType(unwrapped)) {
        const possibleTypes = schema.getPossibleTypes(unwrapped);
        const componentTypes = possibleTypes.map(t => t.name).filter(name => !SKIP_SYSTEM_TYPES.includes(name) || name === 'UploadFile');
        if (componentTypes.length > 0) {
          relations[fname] = componentTypes.map(compType => ({ type: compType, fields: [] }));
          console.log(`    ⚡ Dynamic zone field: ${fname} -> possible types: ${componentTypes.join(', ')}`);
        }
      }
    }

    const actualFieldNames = new Set(Object.keys(fields));
    for (const sys of SYSTEM_FIELDS) {
      if (actualFieldNames.has(sys) && !scalars.includes(sys)) scalars.push(sys);
    }

    const rootReturnType = field.type.toString();
    const args = field.args.map(arg => arg.name);

    // 判断是否为 Single Type
    const isSingle = !rootReturnType.includes('EntityResponseCollection') && !fieldName.endsWith('s');

    if (!config[typeName]) {
      config[typeName] = { rootField: fieldName, rootReturnType, args, scalars, relations, isSingle };
      console.log(`    → Set rootField to '${fieldName}' (first encounter, isSingle=${isSingle})`);
    } else {
      const existing = config[typeName].rootField!;
      if (!isSingle && shouldReplaceRootField(fieldName, existing)) {
        config[typeName].rootField = fieldName;
        config[typeName].rootReturnType = rootReturnType;
        config[typeName].args = args;
        config[typeName].isSingle = false;
        console.log(`    → Updated rootField from '${existing}' to '${fieldName}' (higher priority)`);
      } else if (isSingle && !config[typeName].isSingle) {
        console.log(`    → Kept existing rootField '${existing}' (Collection over Single)`);
      } else {
        console.log(`    → Kept existing rootField '${existing}'`);
      }
    }
  }

  console.log('\n📋 Selected root fields per content type:');
  for (const [type, conf] of Object.entries(config)) {
    console.log(`  - ${type}: ${conf.rootField} (args: ${conf.args?.join(', ')}, isSingle=${conf.isSingle})`);
  }

  // ========== 2. 收集所有被引用的类型（包括组件） ==========
  const referencedTypeNames = new Set<string>();
  for (const contentTypeConfig of Object.values(config)) {
    for (const rel of Object.values(contentTypeConfig.relations)) {
      if (Array.isArray(rel)) {
        for (const r of rel) {
          referencedTypeNames.add(r.type);
        }
      } else {
        referencedTypeNames.add(rel.type);
      }
    }
  }

  console.log(`\n📌 Referenced types from relations: ${Array.from(referencedTypeNames).join(', ')}`);

  // ========== 3. 生成组件配置（仅处理以 Component 开头的类型） ==========
  const allTypes = schema.getTypeMap();
  const componentConfig: ConfigMap = {};

  for (const typeName of referencedTypeNames) {
    // 跳过已经是内容类型的
    if (config[typeName]) continue;
    // 跳过系统类型（但 UploadFile 单独处理，不在此处）
    if (SKIP_SYSTEM_TYPES.includes(typeName)) continue;
    // 只处理名称以 'Component' 开头的类型（Strapi 组件命名约定）
    if (!typeName.startsWith('Component')) continue;

    const gqlType = allTypes[typeName];
    if (!gqlType || !isObjectType(gqlType)) {
      console.warn(`⚠️ Type ${typeName} not found or not an object type`);
      continue;
    }

    const fields = gqlType.getFields();
    if (Object.keys(fields).length === 0) continue;

    console.log(`\n🧩 Detected component type: ${typeName}`);

    // 提取所有标量字段（包括 documentId 等，不需要过滤）
    const scalars: string[] = [];
    const relations: Record<string, RelationConfig | RelationConfig[]> = {};

    for (const [fname, f] of Object.entries(fields)) {
      const unwrapped = unwrap(f.type);
      if (isScalarType(unwrapped)) {
        scalars.push(fname);
      } else if (isObjectType(unwrapped)) {
        if (SKIP_SYSTEM_TYPES.includes(unwrapped.name) && unwrapped.name !== 'UploadFile') continue;
        relations[fname] = { type: unwrapped.name, fields: [] };
      } else if (isInterfaceType(unwrapped) || isUnionType(unwrapped)) {
        const possibleTypes = schema.getPossibleTypes(unwrapped);
        const componentTypes = possibleTypes.map(t => t.name).filter(name => !SKIP_SYSTEM_TYPES.includes(name) || name === 'UploadFile');
        if (componentTypes.length > 0) {
          relations[fname] = componentTypes.map(compType => ({ type: compType, fields: [] }));
        }
      }
    }

    componentConfig[typeName] = {
      scalars,
      relations,
      isComponent: true,
    };
  }

  // ========== 4. 为 UploadFile 媒体类型生成基础配置 ==========
  const mediaConfig: ConfigMap = {};
  if (referencedTypeNames.has('UploadFile') || config['UploadFile'] || componentConfig['UploadFile']) {
    // 定义常用的媒体字段
    const mediaScalars = ['url', 'alternativeText', 'name', 'width', 'height', 'mime', 'size', 'caption', 'formats'];
    mediaConfig['UploadFile'] = {
      scalars: mediaScalars,
      relations: {},
      isMedia: true,      // 自定义标记
      isComponent: false,
    };
    console.log(`\n📸 Added media type configuration for UploadFile`);
  }

  // 合并内容类型、组件和媒体配置
  const finalConfig = { ...config, ...componentConfig, ...mediaConfig };
  console.log(`\n📊 Total types recorded: ${Object.keys(finalConfig).length} (${Object.keys(config).length} content types + ${Object.keys(componentConfig).length} components + ${Object.keys(mediaConfig).length} media types)`);

  const outDir = join(process.cwd(), 'src/generated');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const configPath = join(outDir, 'field-config.json');
  writeFileSync(configPath, JSON.stringify(finalConfig, null, 2));
  console.log(`\n✅ field-config.json generated with ${Object.keys(finalConfig).length} entries`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
