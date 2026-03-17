// src/i18n/utils.ts
import type { Locale } from '@/generated/i18n-config';
import { strapiLocaleMap, getLanguageName, getHtmlLang, getLocaleForFormatting, locales, defaultLocale } from '@/generated/i18n-config';

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
  // 后备处理
  if (strapiLocale.startsWith('es')) return 'es' as Locale;
  return 'en' as Locale;
}

/**
 * 获取本地化URL（所有语言均添加前缀）
 */
export function getLocalizedUrl(currentUrl: URL, targetLocale: Locale): string {
  const pathname = currentUrl.pathname;

  // 移除现有语言前缀
  let cleanPath = pathname;
  for (const locale of locales) {
    const prefix = `/${locale}`;
    if (pathname === prefix) {
      cleanPath = '/';
      break;
    } else if (pathname.startsWith(`${prefix}/`)) {
      cleanPath = pathname.slice(prefix.length);
      break;
    }
  }

  // 为目标语言添加前缀（包括默认语言）
  return `/${targetLocale}${cleanPath}`;
}

// 导出配置中的工具函数
export { getLanguageName, getHtmlLang, getLocaleForFormatting };
