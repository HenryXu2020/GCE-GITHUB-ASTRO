// scripts/generate-queries-correct.ts
/**
 * Generate dynamic GraphQL queries from field-config.json
 * - Supports both Collection Types (with pagination) and Single Types
 * - Handles component list fields (simple object, no inline fragments needed)
 * - **新增：支持组件类型，仅为组件生成标量字段，避免递归**
 * - 注：由于环境启用了 GraphQL 扁平化模式，Single Type 直接返回字段，无需 data 包装
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

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
};

type ConfigMap = Record<string, ContentTypeConfig>;

const CONFIG_PATH = join(process.cwd(), 'src/generated/field-config.json');
const OUTPUT_PATH = join(process.cwd(), 'src/generated/all-queries.graphql');

const MAX_DEPTH = 3;

function hasDataWrapper(returnType: string): boolean {
  return returnType.includes('EntityResponseCollection');
}

/**
 * 递归构建选择集。
 * - 对于组件类型（isComponent = true），只返回标量字段，不处理 relations。
 * - 对于内容类型，正常处理标量字段和关系字段，并限制递归深度。
 */
function buildSelection(
  typeName: string,
  config: ConfigMap,
  depth = 0,
  visited = new Set<string>()
): string {
  const typeConfig = config[typeName];
  if (!typeConfig) return '';
  if (depth > MAX_DEPTH) return '';
  if (visited.has(typeName)) return '';

  visited.add(typeName);

  const { scalars, relations, isComponent } = typeConfig;

  // 组件类型：只输出标量字段，忽略关系（避免无限循环，且组件通常不包含深层嵌套关系）
  if (isComponent) {
    return scalars.map(f => `        ${f}`).join('\n');
  }

  // 内容类型：处理标量和关系
  const scalarLines = scalars.map(f => `        ${f}`);

  const relationLines = Object.entries(relations).map(([fieldName, rel]) => {
    if (fieldName === 'localizations') {
      if (Array.isArray(rel)) return '';
      const locConfig = config[rel.type];
      if (!locConfig) return '';

      const baseFields = ['documentId', 'locale'];
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

    if (!Array.isArray(rel) && rel.type === typeName) {
      const nested = buildSelection(rel.type, config, depth + 1, new Set());
      if (!nested.trim()) return '';
      return `
        ${fieldName} {
${nested}
        }`;
    }

    if (!Array.isArray(rel)) {
      const nested = buildSelection(rel.type, config, depth + 1, new Set(visited));
      if (!nested.trim()) return '';
      return `
        ${fieldName} {
${nested}
        }`;
    }

    // 动态区域（Dynamic Zone）：为每个可能的组件类型生成 inline fragment
    const fragments = rel.map(compRel => {
      const compType = compRel.type;
      const compConfig = config[compType];
      if (!compConfig) return '';

      const compSelection = buildSelection(compType, config, depth + 1, new Set(visited));
      if (!compSelection.trim()) return '';

      return `        ... on ${compType} {
${compSelection}
        }`;
    }).filter(Boolean).join('\n');

    if (!fragments) return '';
    return `
        ${fieldName} {
${fragments}
        }`;
  });

  return [...scalarLines, ...relationLines].join('\n');
}

function generateQueries(config: ConfigMap): string {
  let output = '';

  for (const [typeName, conf] of Object.entries(config)) {
    // 跳过组件类型，只为内容类型（有 rootField）生成查询
    if (conf.isComponent) continue;
    if (!conf.rootField) continue;

    const { rootField, rootReturnType, args, isSingle } = conf;

    const varDefs: string[] = [];
    const argAssignments: string[] = [];

    if (args?.includes('locale')) {
      varDefs.push('$locale: I18NLocaleCode');
      argAssignments.push('locale: $locale');
    }
    if (!isSingle && args?.includes('pagination')) {
      varDefs.push('$pagination: PaginationArg');
      argAssignments.push('pagination: $pagination');
    }
    if (!isSingle && args?.includes('sort')) {
      varDefs.push('$sort: [String]');
      argAssignments.push('sort: $sort');
    }

    const varSection = varDefs.length > 0 ? `(\n  ${varDefs.join(',\n  ')}\n)` : '';
    const argSection = argAssignments.length > 0 ? `(\n    ${argAssignments.join(',\n    ')}\n  )` : '';

    const innerSelection = buildSelection(typeName, config);
    if (!innerSelection.trim()) continue;

    let selectionSet: string;
    if (!isSingle && hasDataWrapper(rootReturnType!)) {
      selectionSet = `    data {\n${innerSelection}\n    }`;
    } else {
      // Single Type 直接展开（扁平化模式）
      selectionSet = innerSelection;
    }

    const opName = isSingle ? `Get${typeName}` : `Get${typeName}List`;

    output += `
query ${opName}${varSection} {
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
