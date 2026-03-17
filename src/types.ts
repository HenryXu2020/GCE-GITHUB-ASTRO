// src/types.ts - 优化版本：为 Strapi Blocks 定义具体类型

import type { Locale } from '@/generated/i18n-config';

// 重新导出Locale
export type { Locale };

// 定义语言代码类型
export type I18NLocaleCode = 'en' | 'es' | 'fr' | string;

// Strapi v5 响应格式
export interface StrapiResponse<T> {
  data: Array<{
    id: string;
    attributes: T;
  }>;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// ========== Strapi Blocks 类型定义 ==========

// 基础文本节点（用于 children 数组）
export interface StrapiTextNode {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

// 链接节点（也可以作为 children 出现）
export interface StrapiLinkNode {
  type: 'link';
  url: string;
  children: Array<StrapiTextNode | StrapiLinkNode>; // 链接内可能还有文本或其他
}

// 段落 Block
export interface StrapiParagraphBlock {
  type: 'paragraph';
  children: Array<StrapiTextNode | StrapiLinkNode>;
}

// 标题 Block
export interface StrapiHeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: Array<StrapiTextNode | StrapiLinkNode>;
}

// 列表 Block（无序或有序）
export interface StrapiListBlock {
  type: 'list';
  format: 'unordered' | 'ordered';
  children: Array<StrapiListItemBlock>; // 列表项
}

// 列表项 Block（通常内部包含段落或其他）
export interface StrapiListItemBlock {
  type: 'list-item';
  children: Array<StrapiParagraphBlock | StrapiTextNode | StrapiLinkNode>;
}

// 引用 Block
export interface StrapiQuoteBlock {
  type: 'quote';
  children: Array<StrapiParagraphBlock>;
}

// 代码 Block
export interface StrapiCodeBlock {
  type: 'code';
  language?: string; // 可能包含语言标识
  children: Array<{ type: 'text'; text: string }>;
}

// 图片 Block
export interface StrapiImageBlock {
  type: 'image';
  image: {
    url: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
  };
}

// 未知 Block（用于扩展性）
export interface StrapiUnknownBlock {
  type: string;
  [key: string]: unknown;
}

// 所有可能 Block 的联合类型
export type StrapiBlock =
  | StrapiParagraphBlock
  | StrapiHeadingBlock
  | StrapiListBlock
  | StrapiListItemBlock
  | StrapiQuoteBlock
  | StrapiCodeBlock
  | StrapiImageBlock
  | StrapiUnknownBlock; // 兜底

// ========== 内容类型定义 ==========

// Strapi 博客类型 (扁平化格式，与 graphql-types 生成的类型保持一致)
export interface StrapiBlog {
  documentId: string;
  slug: string;
  title: string;
  author: string;
  content: StrapiBlock[];      // 替换 any[] 为具体类型
  locale: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  cover?: {
    url: string;
    alternativeText?: string;
  };
  // 其他可能字段
  excerpt?: string;            // 可选摘要
  localizations?: Array<{
    documentId: string;
    slug: string;
    locale: string;
    title: string;
  }>;
}

// 站点配置类型（保持不变）
export interface SiteConfig {
  author: string;
  title: string;
  subtitle: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
  email: string;
  socialLinks: Array<{
    text: string;
    href: string;
    icon: string;
    header?: string | boolean;
  }>;
  header: {
    logo: {
      src: string;
      alt: string;
    };
    navLinks: Array<{
      text: string;
      href: string;
    }>;
  };
  page: {
    blogLinks: Array<{
      text: string;
      href: string;
    }>;
  };
  footer: {
    navLinks: Array<{
      text: string;
      href: string;
    }>;
  };
}

// 页面Props类型
export interface PageProps {
  locale?: Locale;
  title?: string;
  description?: string;
}

// 博客列表Props
export interface BlogListProps {
  blogs: StrapiBlog[];
  currentPage?: number;
  totalPages?: number;
}

// 扩展的博客类型（已包含 excerpt，故无需额外扩展）
export type ExtendedStrapiBlog = StrapiBlog;

// 通用的动态查询结果类型
export interface DynamicQueryResult<T = Record<string, any>> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
