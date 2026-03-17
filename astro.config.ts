// astro.config.ts
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro';
import { getConfig } from './src/generated/i18n-config';
import fs from 'fs';
import path from 'path';

const { locales, defaultLocale } = getConfig();

// 站点基础 URL，优先使用环境变量，否则使用实际部署域名
const SITE_URL = process.env.SITE_URL || 'https://astro.lactisoles.com';

// 读取内容缓存，获取所有博客的 slug 用于生成 customPages
let blogPaths: string[] = [];
try {
  const cacheDir = path.join(process.cwd(), 'src/generated/cache/blog');
  if (fs.existsSync(cacheDir)) {
    const files = fs.readdirSync(cacheDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const locale = file.replace(/\.json$/, '');
      if (!locales.includes(locale)) continue; // 确保是有效语言

      const filePath = path.join(cacheDir, file);
      // [修复] 缓存文件现在是对象格式（以 documentId 为键），需要转换为数组
      const dataMap = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const blogs = Object.values(dataMap); // 对象 → 数组
      for (const blog of blogs) {
        // 增加空值判断，确保 blog 对象存在且包含 slug
        if (blog && typeof blog === 'object' && blog.slug) {
          const relativePath = `/${locale}/blog/${blog.slug}/`;
          const fullUrl = new URL(relativePath, SITE_URL).toString();
          blogPaths.push(fullUrl);
        }
      }
    }
  } else {
    console.warn('⚠️ Cache directory "blog" not found, custom pages for sitemap may be incomplete.');
  }
} catch (error) {
  console.warn('⚠️ Failed to read blog cache for sitemap custom pages:', error);
}

// 过滤无效的 URL，避免破坏 sitemap
const validBlogPaths = blogPaths.filter(path => {
  try {
    new URL(path); // 验证是否为有效 URL
    return true;
  } catch {
    console.warn(`⚠️ Invalid sitemap path: ${path}`);
    return false;
  }
});

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,

  server: {
    port: 1977,
  },

  output: 'static',

  i18n: {
    defaultLocale,
    locales: locales as string[],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
  },

  build: {
    inlineStylesheets: 'auto',
    format: 'directory',
    assets: '_astro',
  },

  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    domains: ['strabi.lactisoles.com']
  },

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('vue') || id.includes('@vue')) return 'vendor-vue';
              if (id.includes('@unocss') || id.includes('unocss')) return 'vendor-unocss';
              if (id.includes('graphql') || id.includes('graphql-request')) return 'vendor-graphql';
              return 'vendor-other';
            }
          }
        }
      }
    }
  },

  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale,
        locales: locales.reduce((acc, locale) => {
          acc[locale] = locale;
          return acc;
        }, {} as Record<string, string>),
      },
      filter: (page) => {
        return !page.includes('/draft/') && !page.includes('/not-found/');
      },
      customPages: validBlogPaths,
    }),
    UnoCSS({ injectReset: true }),
    vue(),
  ],

  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light-default',
        dark: 'github-dark-default',
      },
      wrap: true,
    },
  },
});
