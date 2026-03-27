// codegen-dynamic.config.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(__dirname, '.env') });

const STRAPI_URL = process.env.PUBLIC_STRAPI_API_URL;
const STRAPI_TOKEN = process.env.PUBLIC_STRAPI_API_TOKEN;
const CI_INTROSPECTION_TOKEN = process.env.CI_STRAPI_INTROSPECTION_TOKEN || '';

if (!STRAPI_URL) {
  throw new Error('PUBLIC_STRAPI_API_URL environment variable is not set');
}

const isProduction = process.env.NODE_ENV === 'production';
if (!STRAPI_TOKEN && isProduction) {
  throw new Error('PUBLIC_STRAPI_API_TOKEN is required in production');
}

export default {
  schema: [
    {
      [`${STRAPI_URL}/graphql`]: {
        headers: {
          ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
          'x-ci-introspection-token': CI_INTROSPECTION_TOKEN,
          'apollo-require-preflight': 'true',
          'x-apollo-operation-name': 'IntrospectionQuery',
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
      // 临时移除钩子，避免格式化中断构建
      // hooks: {
      //   afterOneFileWrite: ['prettier --write'],
      // },
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
