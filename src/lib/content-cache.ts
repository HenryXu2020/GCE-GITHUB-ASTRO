// src/lib/content-cache.ts
import fs from 'fs';
import path from 'path';
import type { Locale } from '@/generated/i18n-config';
import type { ContentCache } from '@/generated/content-cache';

const CACHE_DIR = path.join(process.cwd(), 'src/generated/cache');

// 导出常量，用于 Single Type 缓存键
export const SINGLE_TYPE_CACHE_KEY = 'single' as const;

export interface CachedItem<T = any> {
  data: T | null;
  __meta: {
    status: 'ok' | 'empty' | 'error';
    fetchedAt: number;
  };
}

interface CacheEntry<T = any> {
  dataMap: Record<string, T | CachedItem<T>>;
  slugIndex: Map<string, string>;
  mtime: number;
}

const memoryCache: Partial<Record<string, CacheEntry>> = {};

function loadTypeLocale<K extends keyof ContentCache>(type: K, locale: Locale): CacheEntry<ContentCache[K][string]> {
  const cacheKey = `${String(type)}-${locale}`;
  const filePath = path.join(CACHE_DIR, String(type), `${locale}.json`);

  if (!fs.existsSync(filePath)) {
    console.warn(`[cache] Cache file not found: ${filePath}, returning empty map.`);
    const empty: CacheEntry = { dataMap: {}, slugIndex: new Map(), mtime: 0 };
    memoryCache[cacheKey] = empty;
    return empty;
  }

  const stats = fs.statSync(filePath);
  const currentMtime = stats.mtimeMs;

  if (memoryCache[cacheKey] && memoryCache[cacheKey]!.mtime === currentMtime) {
    return memoryCache[cacheKey]!;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const dataMap = JSON.parse(raw) as Record<string, any>;

  const slugIndex = new Map<string, string>();
  for (const [docId, item] of Object.entries(dataMap)) {
    const actualItem = (item as CachedItem).data ?? item;
    const slug = actualItem?.slug;
    if (slug && typeof slug === 'string') {
      slugIndex.set(slug, docId);
    }
  }

  const entry: CacheEntry = { dataMap, slugIndex, mtime: currentMtime };
  memoryCache[cacheKey] = entry;
  return entry;
}

export function getContentList<T = unknown, K extends keyof ContentCache = keyof ContentCache>(
  contentType: K,
  locale: Locale
): T[] {
  const entry = loadTypeLocale(contentType, locale);
  const items: T[] = [];
  for (const value of Object.values(entry.dataMap)) {
    const actual = (value as CachedItem).data ?? value;
    if (actual !== null && actual !== undefined) {
      items.push(actual as T);
    }
  }
  return items;
}

export function getContentBySlug<T extends { slug?: string }, K extends keyof ContentCache = keyof ContentCache>(
  contentType: K,
  slug: string,
  locale: Locale
): T | null {
  const entry = loadTypeLocale(contentType, locale);
  const docId = entry.slugIndex.get(slug);
  if (!docId) {
    for (const value of Object.values(entry.dataMap)) {
      const actual = (value as CachedItem).data ?? value;
      if (actual?.slug === slug) return actual as T;
    }
    return null;
  }
  const value = entry.dataMap[docId];
  const actual = (value as CachedItem).data ?? value;
  return (actual as T) || null;
}

export function getContentById<T = unknown, K extends keyof ContentCache = keyof ContentCache>(
  contentType: K,
  documentId: string,
  locale: Locale
): T | null {
  const entry = loadTypeLocale(contentType, locale);
  const value = entry.dataMap[documentId];
  if (!value) return null;
  const actual = (value as CachedItem).data ?? value;
  return actual as T;
}

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
      const dataMap = JSON.parse(raw) as Record<string, any>;
      const items: T[] = [];
      for (const value of Object.values(dataMap)) {
        const actual = (value as CachedItem).data ?? value;
        if (actual !== null && actual !== undefined) items.push(actual as T);
      }
      result[locale] = items;
    } catch (err) {
      console.warn(`[cache] Failed to read ${filePath}:`, err);
    }
  }

  return result as Record<Locale, T[]>;
}

export function getSingleContent<T = unknown, K extends keyof ContentCache = keyof ContentCache>(
  contentType: K,
  locale: Locale
): CachedItem<T> | null {
  const filePath = path.join(CACHE_DIR, String(contentType), `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`[cache] Single type cache file not found: ${filePath}`);
    return null;
  }

  const entry = loadTypeLocale(contentType, locale);
  const cached = entry.dataMap[SINGLE_TYPE_CACHE_KEY] as CachedItem<T> | undefined;
  if (!cached) {
    // 兼容旧格式
    const raw = fs.readFileSync(filePath, 'utf-8');
    const dataMap = JSON.parse(raw) as Record<string, any>;
    if (dataMap[SINGLE_TYPE_CACHE_KEY] === undefined) {
      return { data: dataMap as T, __meta: { status: 'ok', fetchedAt: Date.now() } };
    }
    return null;
  }
  return cached;
}
