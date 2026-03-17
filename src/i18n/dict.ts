// src/i18n/dict.ts
import type { Locale } from '@/generated/i18n-config';
import { locales, defaultLocale } from '@/generated/i18n-config';
import fs from 'fs';
import path from 'path';

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
  navigation: {
    home: string;
    blog: string;
    projects: string;
    notes: string;
    talks: string;
  };
}

/**
 * 加载指定语言的翻译 JSON 文件
 * 使用 process.cwd() 定位项目根目录，确保构建时能正确读取源码中的 JSON
 */
function loadTranslations(locale: string): I18nDict {
  // 构建翻译文件所在目录的绝对路径
  const translationsDir = path.join(process.cwd(), 'src/i18n/translations');
  const filePath = path.join(translationsDir, `${locale}.json`);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as I18nDict;
  } catch (error) {
    console.warn(`[i18n] Translation file not found for locale '${locale}' at ${filePath}, falling back to '${defaultLocale}'.`);
    if (locale !== defaultLocale) {
      return loadTranslations(defaultLocale);
    }
    throw new Error(`Missing translation file for default locale '${defaultLocale}'. Expected at: ${path.join(translationsDir, `${defaultLocale}.json`)}`);
  }
}

// 动态构建完整的翻译字典
export const dict: Record<Locale, I18nDict> = {} as Record<Locale, I18nDict>;

// 为每个支持的语言填充字典
locales.forEach((locale) => {
  dict[locale] = loadTranslations(locale);
});

/**
 * 类型安全的翻译函数
 * @param locale 当前语言
 * @param key 点分隔的键路径，例如 "common.readMore"
 * @param vars 可选变量替换对象，如 { name: 'World' } 会替换 {{name}}
 */
export function t(locale: Locale, key: string, vars?: Record<string, string>): string {
  const keys = key.split('.');
  let value: any = dict[locale];

  for (const k of keys) {
    if (value === undefined) {
      console.warn(`[i18n] Missing key: ${key} in locale: ${locale}`);
      // 尝试回退到默认语言
      if (locale !== defaultLocale) {
        return t(defaultLocale, key, vars);
      }
      return key;
    }
    value = value[k];
  }

  if (typeof value === 'string' && vars) {
    return Object.entries(vars).reduce(
      (str, [varKey, varValue]) => str.replace(new RegExp(`{{${varKey}}}`, 'g'), varValue),
      value
    );
  }

  return value || key;
}

/**
 * 获取所有支持的语言列表
 */
export function getSupportedLocales(): Locale[] {
  return [...locales];
}
