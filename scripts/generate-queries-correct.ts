// scripts/generate-queries-correct.ts
/**
 * Generate dynamic GraphQL list queries from field-config.json
 * - Uses root field return type to determine if 'data' wrapper is needed
 * - Only includes arguments that the field actually supports
 * - Includes localizations with basic fields (documentId, slug, locale, and title if available)
 * - **改进**：自引用关系（如 Menu 的父子字段）使用全新 visited 集合，允许递归构建多层菜单
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

type RelationConfig = {
  type: string;
  fields: string[];
};

type ContentTypeConfig = {
  rootField: string;
  rootReturnType: string;
  args: string[];
  scalars: string[];
  relations: Record<string, RelationConfig>;
};

type ConfigMap = Record<string, ContentTypeConfig>;

const CONFIG_PATH = join(process.cwd(), 'src/generated/field-config.json');
const OUTPUT_PATH = join(process.cwd(), 'src/generated/all-queries.graphql');

const MAX_DEPTH = 3; // 最大递归深度，根据菜单层级可调整

/**
 * Determine if the root field returns a collection wrapper (has 'data' field)
 * Based on type name containing 'EntityResponseCollection'
 */
function hasDataWrapper(returnType: string): boolean {
  return returnType.includes('EntityResponseCollection');
}

/**
 * Recursively build selection set for a given type.
 * Special handling for 'localizations' and **self-referential relations**.
 */
function buildSelection(
  typeName: string,
  config: ConfigMap,
  depth = 0,
  visited = new Set<string>()
): string {
  if (!config[typeName]) return '';
  if (depth > MAX_DEPTH) return '';
  if (visited.has(typeName)) return '';

  visited.add(typeName);

  const { scalars, relations } = config[typeName];

  const scalarLines = scalars.map(f => `        ${f}`);

  const relationLines = Object.entries(relations).map(([fieldName, rel]) => {
    // 特殊处理 localizations：只取基础字段，避免过度递归
    if (fieldName === 'localizations') {
      const locConfig = config[rel.type];
      if (!locConfig) return '';

      // 始终包含的基础字段
      const baseFields = ['documentId', 'locale'];
      // 动态添加可能存在的字段
      const extraFields: string[] = [];
      if (locConfig.scalars.includes('slug')) extraFields.push('slug');
      if (locConfig.scalars.includes('title')) extraFields.push('title');

      const subFields = [...baseFields, ...extraFields];
      const subFieldLines = subFields.map(f => `          ${f}`).join('\n');

      return `
        localizations {
${subFieldLines}
        }`;
    }

    // **关键改进：处理自引用关系（如 Menu 的父子字段）**
    if (rel.type === typeName) {
      // 使用全新的 visited 集合，允许递归但受深度限制
      const nested = buildSelection(rel.type, config, depth + 1, new Set());
      if (!nested.trim()) return '';
      return `
        ${fieldName} {
${nested}
        }`;
    }

    // 普通关系：继续使用当前 visited 集合（避免重复展开同一类型）
    const nested = buildSelection(rel.type, config, depth + 1, new Set(visited));
    if (!nested.trim()) return '';
    return `
        ${fieldName} {
${nested}
        }`;
  });

  return [...scalarLines, ...relationLines].join('\n');
}

function generateQueries(config: ConfigMap): string {
  let output = '';

  for (const [typeName, conf] of Object.entries(config)) {
    const { rootField, rootReturnType, args } = conf;

    // 根据支持的参数构建变量定义和参数赋值
    const varDefs: string[] = [];
    const argAssignments: string[] = [];

    if (args.includes('locale')) {
      varDefs.push('$locale: I18NLocaleCode');
      argAssignments.push('locale: $locale');
    }
    if (args.includes('pagination')) {
      varDefs.push('$pagination: PaginationArg');
      argAssignments.push('pagination: $pagination');
    }
    if (args.includes('sort')) {
      varDefs.push('$sort: [String]');
      argAssignments.push('sort: $sort');
    }

    const varSection = varDefs.length > 0 ? `(\n  ${varDefs.join(',\n  ')}\n)` : '';
    const argSection = argAssignments.length > 0 ? `(\n    ${argAssignments.join(',\n    ')}\n  )` : '';

    // 构建选择集
    const innerSelection = buildSelection(typeName, config);
    if (!innerSelection.trim()) continue;

    let selectionSet: string;
    if (hasDataWrapper(rootReturnType)) {
      // 带 data 包装的格式
      selectionSet = `    data {\n${innerSelection}\n    }`;
      // 可根据需要添加 meta 分页信息
    } else {
      // 直接数组格式
      selectionSet = innerSelection;
    }

    output += `
query Get${typeName}List${varSection} {
  ${rootField}${argSection} {
${selectionSet}
  }
}
`;
  }

  return output;
}

function main() {
  const config: ConfigMap = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  const queries = generateQueries(config);
  writeFileSync(OUTPUT_PATH, queries);
  console.log('✅ all-queries.graphql generated');
}

main();
