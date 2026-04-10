// src/site-config.ts
import type { Locale } from '@/generated/i18n-config';
import { defaultLocale } from '@/generated/i18n-config';
import { getSingleContent } from '@/lib/content-cache';
import type { Global } from '@/generated/graphql-types';
import { getFullImageUrl } from '@/lib/env';

function normalizeSocialLink(link: NonNullable<Global['social_links']>[0]) {
  return {
    text: link.platform || '',
    href: link.url,
    icon: link.icon_class,
    header: link.show_in_header ? link.icon_class?.replace('i-simple-icons', 'i-ri') : false,
  };
}

export function getSiteConfig(locale: Locale) {
  // 尝试获取当前语言的配置
  let globalData = getSingleContent<Global>('global', locale);

  // 如果当前语言没有数据，回退到默认语言
  if (!globalData?.data) {
    console.warn(`[site-config] Global data missing for locale "${locale}", falling back to "${defaultLocale}"`);
    globalData = getSingleContent<Global>('global', defaultLocale);
  }

  // 若默认语言也没有数据，则无法继续（此时抛出错误是合理的）
  if (!globalData?.data) {
    throw new Error(
      `[site-config] No global data available for locale "${locale}" or default locale "${defaultLocale}".`
    );
  }

  const data = globalData.data;

  return {
    author: data.author || '',
    title: data.title,
    subtitle: data.subtitle || '',
    description: data.description || '',
    email: data.email || '',
    image: {
      src: data.image?.url ? getFullImageUrl(data.image.url) : '',
      alt: data.image?.alternativeText || '',
    },
    header: {
      logo: {
        src: data.header_logo?.url ? getFullImageUrl(data.header_logo.url) : '',
        alt: data.header_logo?.alternativeText || '',
      },
      // navLinks 已弃用，统一使用 Strapi Menu
    },
    socialLinks: (data.social_links || []).map(normalizeSocialLink),
    // 扩展字段
    theme_color_light: data.theme_color_light,
    theme_color_dark: data.theme_color_dark,
    primary_color: data.primary_color,
    twitter_card_type: data.twitter_card_type,
    fb_app_id: data.fb_app_id,
    google_analytics_id: data.google_analytics_id,
    umami_website_id: data.umami_website_id,
    rss_enabled: data.rss_enabled,
    maintenance_mode: data.maintenance_mode,
  };
}
