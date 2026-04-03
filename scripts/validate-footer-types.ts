#!/usr/bin/env tsx
// scripts/validate-footer-types.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const typesFile = join(__dirname, '../src/generated/graphql-types.ts');

try {
  const content = readFileSync(typesFile, 'utf-8');
  const requiredTypes = ['Footer', 'ComponentFooterLinkItem', 'ComponentFooterFooterLinkGroup', 'ComponentFooterIconLink'];
  const missing: string[] = [];
  for (const type of requiredTypes) {
    const pattern = new RegExp(`export\\s+(type|interface)\\s+${type}\\b`);
    if (!pattern.test(content)) missing.push(type);
  }
  if (missing.length > 0) {
    console.error(`❌ Missing GraphQL types: ${missing.join(', ')}`);
    console.error('   Please ensure Strapi components and Footer Single Type are properly configured.');
    process.exit(1);
  }
  console.log('✅ Footer GraphQL types validated successfully.');
} catch (err) {
  console.error(`❌ Failed to read graphql-types.ts: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
