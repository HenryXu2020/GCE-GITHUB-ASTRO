// src/i18n/utils.ts
import type { Locale } from '@/generated/i18n-config';
import { strapiLocaleMap, getLanguageName, getHtmlLang, getLocaleForFormatting, locales, defaultLocale } from '@/generated/i18n-config';
import { BASE_URL } from '@/lib/env';

export const LOCALE_MAP = strapiLocaleMap;

export type StrapiLocale = string;

// Astro → Strapi 语言代码转换
export function toStrapiLocale(locale: Locale): string {
  const strapiLocale = strapiLocaleMap[locale];
  return strapiLocale || defaultLocale;
}

// Strapi → Astro 语言代码转换
export function fromStrapiLocale(strapiLocale: string): Locale {
  for (const [key, value] of Object.entries(strapiLocaleMap)) {
    if (value === strapiLocale) return key as Locale;
  }
  if (strapiLocale.startsWith('es')) return 'es' as Locale;
  return 'en' as Locale;
}

/**
 * 获取本地化URL（自动包含 base 路径）
 * @param currentUrl 当前页面的 URL 对象
 * @param targetLocale 目标语言
 * @returns 完整的本地化 URL（包含 base 和语言前缀）
 */
export function getLocalizedUrl(currentUrl: URL, targetLocale: Locale): string {
  const pathname = currentUrl.pathname;
  const base = BASE_URL.replace(/\/$/, '');

  // 移除现有语言前缀和 base 前缀，得到纯净路径
  let cleanPath = pathname;
  // 先移除 base 前缀（如果存在）
  if (base !== '/' && cleanPath.startsWith(base)) {
    cleanPath = cleanPath.slice(base.length);
  }
  // 再移除语言前缀
  for (const locale of locales) {
    const prefix = `/${locale}`;
    if (cleanPath === prefix) {
      cleanPath = '/';
      break;
    } else if (cleanPath.startsWith(`${prefix}/`)) {
      cleanPath = cleanPath.slice(prefix.length);
      break;
    }
  }

  // 为目标语言添加前缀（包括默认语言），并加上 base
  return `${base}/${targetLocale}${cleanPath}`;
}

// 导出配置中的工具函数
export { getLanguageName, getHtmlLang, getLocaleForFormatting };
