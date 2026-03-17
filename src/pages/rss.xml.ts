import rss from '@astrojs/rss';
import siteConfig from '@/site-config';
import { defaultLocale, locales, type Locale } from '@/generated/i18n-config';
import { getContentList } from '@/lib/content-cache';
import type { Blog } from '@/generated/graphql-types';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const url = new URL(context.request.url);
  const localeParam = url.searchParams.get('locale');
  const locale = (localeParam && locales.includes(localeParam as Locale)) ? localeParam : defaultLocale;

  const blogs = getContentList<Blog>('blog', locale as Locale);
  const publishedBlogs = blogs.filter((blog) => blog.publishedAt);

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site?.toString() || 'https://example.com',
    items: publishedBlogs.map((blog) => ({
      title: blog.title,
      pubDate: new Date(blog.publishedAt),
      link: `/${locale}/blog/${blog.slug}/`,
      description: blog.excerpt || blog.title,
    })),
    customData: `<language>${locale}</language>`,
  });
}
