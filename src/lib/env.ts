// src/lib/env.ts
/**
 * 环境变量统一管理模块
 * 提供类型安全的环境变量访问和工具函数
 */

// 基础环境变量（确保导出时去除尾部斜杠）
export const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_API_URL?.replace(/\/+$/, '') || '';
export const STRAPI_TOKEN = import.meta.env.PUBLIC_STRAPI_API_TOKEN || '';
export const SITE_URL = import.meta.env.SITE_URL || 'https://astro.lactisoles.com';
export const IS_PRODUCTION = import.meta.env.PROD;

/**
 * 根据相对路径或绝对路径获取完整的图片 URL
 * @param url 图片路径（可能为相对路径或绝对URL）
 * @returns 完整 URL，如果无法拼接则返回 undefined
 */
export function getFullImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  // 已经是绝对 URL（以 http:// 或 https:// 开头）
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // 相对路径，拼接 Strapi 基础 URL
  if (STRAPI_URL) {
    // 确保 url 以 / 开头，避免双斜杠
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    return `${STRAPI_URL}${normalizedUrl}`;
  }
  // 无法拼接时，返回 undefined 以明确表示无效
  return undefined;
}

/**
 * 获取 Strapi 请求头（用于需要认证的请求）
 */
export function getStrapiHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }
  return headers;
}

/**
 * 构建 Strapi GraphQL 端点 URL
 */
export function getStrapiGraphQLEndpoint(): string {
  return `${STRAPI_URL}/graphql`;
}
