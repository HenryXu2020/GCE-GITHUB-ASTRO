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

// 站点根域名（不含子路径）
const SITE = process.env.SITE_URL || 'https://henryxu2020.github.io';
// 部署子路径（例如仓库名）
const BASE = process.env.BASE_URL || '/GCE-GITHUB-ASTRO/';

// 读取内容缓存，获取所有博客的 slug 用于生成 customPages
let blogPaths: string[] = [];
try {
  const cacheDir = path.join(process.cwd(), 'src/generated/cache/blog');
  if (fs.existsSync(cacheDir)) {
    const files = fs.readdirSync(cacheDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const locale = file.replace(/\.json$/, '');
      if (!locales.includes(locale)) continue;

      const filePath = path.join(cacheDir, file);
      const dataMap = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const blogs = Object.values(dataMap);
      for (const blog of blogs) {
        if (blog && typeof blog === 'object' && blog.slug) {
          // 生成相对路径（含语言前缀）
          const relativePath = `/${locale}/blog/${blog.slug}/`;
          // 拼接完整 URL：site + base + relativePath
          const fullUrl = new URL(BASE + relativePath, SITE).toString();
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

const validBlogPaths = blogPaths.filter(path => {
  try {
    new URL(path);
    return true;
  } catch {
    console.warn(`⚠️ Invalid sitemap path: ${path}`);
    return false;
  }
});

// https://astro.build/config
export default defineConfig({
  site: SITE,          // 仅根域名
  base: BASE,          // 子路径

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
