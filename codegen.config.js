// codegen.config.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(__dirname, '.env') });

const STRAPI_URL = process.env.PUBLIC_STRAPI_API_URL;
const STRAPI_TOKEN = process.env.PUBLIC_STRAPI_API_TOKEN;

if (!STRAPI_URL) {
  throw new Error('PUBLIC_STRAPI_API_URL environment variable is not set');
}

if (!STRAPI_TOKEN) {
  console.warn('⚠️ PUBLIC_STRAPI_API_TOKEN is not set – using public access only.');
}

export default {
  schema: [
    {
      [`${STRAPI_URL}/graphql`]: {
        headers: STRAPI_TOKEN ? {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        } : {},
        method: 'POST',
      },
    },
  ],
  documents: 'scripts/graphql/**/*.graphql',
  generates: {
    // 修改输出路径，避免与动态生成的类型冲突（D1）
    'src/generated/graphql-base-types.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-graphql-request',
      ],
      config: {
        skipTypename: false,
        withHooks: false,
        withHOC: false,
        withComponent: false,
        avoidOptionals: false,
        useTypeImports: true,
        dedupeFragments: true,
        preResolveTypes: true,
        enumsAsTypes: true,
        exportFragmentSpreadSubTypes: true,
        maybeValue: 'T | undefined',
        defaultScalarType: 'unknown',
        importOperationTypesFrom: 'Operations',
        importDocumentNodeExternallyFrom: './index.ts',
        scalars: {
          DateTime: 'string',
          Date: 'string',
          Time: 'string',
          I18NLocaleCode: 'string',
          JSON: 'unknown',
          Upload: 'unknown',
        },
      },
    },
  },
};
