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

// 获取 base 路径（用于 GitHub Pages 子目录部署）
export const BASE_URL = import.meta.env.BASE_URL || '/';

/**
 * 根据相对路径或绝对路径获取完整的图片 URL（Strapi 图片）
 * @param url 图片路径（可能为相对路径或绝对URL）
 * @returns 完整 URL，如果无法拼接则返回 undefined
 */
export function getFullImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (STRAPI_URL) {
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    return `${STRAPI_URL}${normalizedUrl}`;
  }
  return undefined;
}

/**
 * 获取本地化路径（自动包含 base 和 locale）
 * @param locale 当前语言
 * @param path 相对路径（例如 '/blog/my-post' 或 'blog/my-post'）
 * @returns 完整路径，例如 '/GCE-GITHUB-ASTRO/en/blog/my-post'
 */
export function getLocalizedPath(locale: string, path: string = ''): string {
  const base = BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}/${locale}${normalizedPath}`;
}

/**
 * 获取静态资源路径（自动包含 base）
 * @param relativePath 相对路径，例如 '/hero.jpg' 或 'hero.jpg'
 * @returns 完整路径，例如 '/GCE-GITHUB-ASTRO/hero.jpg'
 */
export function getAssetPath(relativePath: string): string {
  const base = BASE_URL.replace(/\/$/, '');
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${base}${path}`;
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
