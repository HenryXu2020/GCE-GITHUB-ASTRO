// src/site-config.ts
import type { Locale } from '@/generated/i18n-config';
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

function normalizeNavLink(link: { label: string; url: string; is_button?: boolean }) {
  return { text: link.label, href: link.url };
}

export function getSiteConfig(locale: Locale) {
  const globalData = getSingleContent<Global>('global', locale);
  if (!globalData?.data) {
    throw new Error(`[site-config] No global data for locale "${locale}".`);
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
      navLinks: (data as any).nav_links?.map(normalizeNavLink) || [],
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
