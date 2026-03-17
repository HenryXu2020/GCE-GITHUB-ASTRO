// src/lib/content-cache.ts
import fs from 'fs';
import path from 'path';
import type { Locale } from '@/generated/i18n-config';
import type { ContentCache } from '@/generated/content-cache';

const CACHE_DIR = path.join(process.cwd(), 'src/generated/cache');

/**
 * 内存缓存结构：
 * - dataMap: 存储原始对象（以 documentId 为键）
 * - slugIndex: 按语言存储 slug 到 documentId 的映射（用于快速按 slug 查找）
 */
interface CacheEntry<T = any> {
  dataMap: Record<string, T>;
  slugIndex: Map<string, string>; // slug -> documentId
}

// 内存缓存，避免重复读盘
const memoryCache: Partial<Record<string, CacheEntry>> = {};

/**
 * 加载指定类型和语言的数据，并构建索引
 */
function loadTypeLocale<K extends keyof ContentCache>(type: K, locale: Locale): CacheEntry<ContentCache[K][string]> {
  const cacheKey = `${String(type)}-${locale}`;
  if (memoryCache[cacheKey]) {
    return memoryCache[cacheKey]!;
  }

  const filePath = path.join(CACHE_DIR, String(type), `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`[cache] Cache file not found: ${filePath}, returning empty map.`);
    const empty: CacheEntry = { dataMap: {}, slugIndex: new Map() };
    memoryCache[cacheKey] = empty;
    return empty;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  // 缓存文件为对象格式（以 documentId 为键）
  const dataMap = JSON.parse(raw) as Record<string, ContentCache[K][string]>;

  // 构建 slug 索引（仅当条目包含 slug 字段时）
  const slugIndex = new Map<string, string>();
  for (const [docId, item] of Object.entries(dataMap)) {
    const slug = (item as any).slug;
    if (slug && typeof slug === 'string') {
      slugIndex.set(slug, docId);
    }
  }

  const entry: CacheEntry = { dataMap, slugIndex };
  memoryCache[cacheKey] = entry;
  return entry;
}

/**
 * 获取指定类型和语言的内容列表（数组形式，保持原有接口）
 */
export function getContentList<T = unknown, K extends keyof ContentCache = keyof ContentCache>(
  contentType: K,
  locale: Locale
): T[] {
  const entry = loadTypeLocale(contentType, locale);
  return Object.values(entry.dataMap) as T[];
}

/**
 * 根据 slug 获取单个内容（O(1) 查找）
 */
export function getContentBySlug<T extends { slug?: string }, K extends keyof ContentCache = keyof ContentCache>(
  contentType: K,
  slug: string,
  locale: Locale
): T | null {
  const entry = loadTypeLocale(contentType, locale);
  const docId = entry.slugIndex.get(slug);
  if (!docId) {
    // 降级遍历（以防索引未命中或 slug 不存在）
    const found = Object.values(entry.dataMap).find(item => (item as any).slug === slug);
    return (found as T) || null;
  }
  return entry.dataMap[docId] as T;
}

/**
 * 根据 documentId 直接获取内容（新增方法，方便增量更新使用）
 */
export function getContentById<T = unknown, K extends keyof ContentCache = keyof ContentCache>(
  contentType: K,
  documentId: string,
  locale: Locale
): T | null {
  const entry = loadTypeLocale(contentType, locale);
  return entry.dataMap[documentId] as T || null;
}

/**
 * 获取指定类型的所有语言内容（保持原有接口，返回 Record<Locale, T[]>）
 */
export function getAllContent<T = unknown, K extends keyof ContentCache = keyof ContentCache>(
  contentType: K
): Record<Locale, T[]> {
  const typeDir = path.join(CACHE_DIR, String(contentType));
  if (!fs.existsSync(typeDir)) {
    console.warn(`[cache] Cache directory not found: ${typeDir}, returning empty object.`);
    return {} as Record<Locale, T[]>;
  }

  const files = fs.readdirSync(typeDir);
  const result: Record<string, T[]> = {};

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const locale = file.replace(/\.json$/, '') as Locale;
    const filePath = path.join(typeDir, file);
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const dataMap = JSON.parse(raw) as Record<string, T>;
      result[locale] = Object.values(dataMap);
    } catch (err) {
      console.warn(`[cache] Failed to read ${filePath}:`, err);
    }
  }

  return result as Record<Locale, T[]>;
}
