// src/i18n/dict.ts
import type { Locale } from '@/generated/i18n-config';
import { locales, defaultLocale } from '@/generated/i18n-config';
import { translations } from '@/generated/translations';

export interface I18nDict {
  common: {
    blog: string;
    projects: string;
    notes: string;
    talks: string;
    readMore: string;
    backToBlog: string;
    availableIn: string;
    recentPosts: string;
    language: string;
    noPosts: string;
    lastUpdated: string;
    by: string;
    on: string;
    minRead: string;
    categories: string;
  };
  home: {
    welcome: string;
    subtitle: string;
    description: string;
    findMeOn: string;
  };
  blog: {
    title: string;
    allPosts: string;
  };
  notFound: {
    title: string;
    description: string;
    returnHome: string;
  };
}

// 直接使用生成的翻译数据
export const dict: Record<Locale, I18nDict> = translations as Record<Locale, I18nDict>;

// 可选：对缺失的语言或 key 进行降级处理
function getValue(locale: Locale, keys: string[]): any {
  let current: any = dict[locale];
  if (!current) {
    if (locale !== defaultLocale) return getValue(defaultLocale, keys);
    return undefined;
  }
  for (const k of keys) {
    if (current === undefined) break;
    current = current[k];
  }
  return current;
}

/**
 * 类型安全的翻译函数
 */
export function t(locale: Locale, key: string, vars?: Record<string, string>): string {
  const keys = key.split('.');
  let value = getValue(locale, keys);

  if (value === undefined) {
    // 如果当前语言缺失，回退到默认语言
    if (locale !== defaultLocale) {
      return t(defaultLocale, key, vars);
    }
    console.warn(`[i18n] Missing key: ${key} in default locale`);
    return key;
  }

  if (typeof value === 'string' && vars) {
    return Object.entries(vars).reduce(
      (str, [varKey, varValue]) => str.replace(new RegExp(`{{${varKey}}}`, 'g'), varValue),
      value
    );
  }

  return value || key;
}

export function getSupportedLocales(): Locale[] {
  return [...locales];
}
