import rss from '@astrojs/rss';
import { defaultLocale, locales, type Locale } from '@/generated/i18n-config';
import { getContentList } from '@/lib/content-cache';
import type { Blog } from '@/generated/graphql-types';
import type { APIContext } from 'astro';
import { getLocalizedPath } from '@/lib/env';
import { getSiteConfig } from '@/site-config';

export async function GET(context: APIContext) {
  const url = new URL(context.request.url);
  const localeParam = url.searchParams.get('locale');
  const locale = (localeParam && locales.includes(localeParam as Locale)) ? localeParam : defaultLocale;
  const config = getSiteConfig(locale as Locale);
  const blogs = getContentList<Blog>('blog', locale as Locale);
  const publishedBlogs = blogs.filter((blog) => blog.publishedAt);

  return rss({
    title: config.title,
    description: config.description,
    site: context.site?.toString() || 'https://example.com',
    items: publishedBlogs.map((blog) => ({
      title: blog.title,
      pubDate: new Date(blog.publishedAt),
      link: getLocalizedPath(locale, `/blog/${blog.slug}/`),
      description: blog.excerpt || blog.title,
    })),
    customData: `<language>${locale}</language>`,
  });
}
