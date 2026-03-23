// codegen-dynamic.config.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 加载环境变量
dotenv.config({ path: join(__dirname, '.env') });

const STRAPI_URL = process.env.PUBLIC_STRAPI_API_URL;
const STRAPI_TOKEN = process.env.PUBLIC_STRAPI_API_TOKEN;

if (!STRAPI_URL) {
  throw new Error('PUBLIC_STRAPI_API_URL environment variable is not set');
}

// 增强 Token 验证：生产环境必须提供 Token，否则抛出错误
const isProduction = process.env.NODE_ENV === 'production';
if (!STRAPI_TOKEN) {
  if (isProduction) {
    throw new Error('PUBLIC_STRAPI_API_TOKEN is required in production');
  }
  console.warn(
    '⚠️ PUBLIC_STRAPI_API_TOKEN is not set – using public access only. ' +
    'Some protected content may not be accessible.'
  );
}

export default {
  schema: [
    {
      [`${STRAPI_URL}/graphql`]: {
        headers: {
          'Content-Type': 'application/json',
          ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
          // 关键：绕过 Apollo Server CSRF 保护（针对非浏览器请求）
          'apollo-require-preflight': 'true',
        },
        method: 'POST',
      },
    },
  ],
  documents: 'src/generated/all-queries.graphql',
  generates: {
    'src/generated/graphql-types.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-graphql-request',
      ],
      config: {
        skipTypename: true,
        withHooks: false,
        withHOC: false,
        withComponent: false,
        dedupeFragments: true,
        exportFragmentSpreadSubTypes: true,
        inlineFragmentTypes: 'combine',
        preResolveTypes: true,
        avoidOptionals: false,
        useTypeImports: true,
        onlyOperationTypes: false,
        omitOperationSuffix: false,
        declarationKind: 'interface',
        maybeValue: 'T | undefined',
        defaultScalarType: 'unknown',
        scalars: {
          DateTime: 'string',
          Date: 'string',
          Time: 'string',
          I18NLocaleCode: 'string',
          JSON: 'unknown',
          Upload: 'unknown',
        },
        namingConvention: {
          typeNames: 'keep',
          enumValues: 'keep',
          transformUnderscore: false,
        },
        fragmentImports: [],
        globalNamespace: false,
        addDocBlocks: true,
        emitLegacyCommonJSImports: false,
      },
      hooks: {
        afterOneFileWrite: ['prettier --write'],
      },
    },
  },
  hooks: {
    afterStart: () => {
      console.log('🔧 Generating TypeScript types from optimized queries...');
      console.log('   - Source: src/generated/all-queries.graphql');
      console.log('   - Target: src/generated/graphql-types.ts');
    },
    afterAllFileWrite: (files) => {
      console.log('✅ TypeScript types generated successfully!');
      console.log(`📁 Generated ${files.length} file(s):`);
      files.forEach(file => {
        console.log(`   - ${file}`);
      });
    },
  },
  errorsOnly: false,
  silent: false,
  verbose: false,
  debug: false,
};
