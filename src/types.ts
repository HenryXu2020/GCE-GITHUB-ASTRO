// src/types.ts
import type { Locale } from '@/generated/i18n-config';

export type { Locale };
export type I18NLocaleCode = 'en' | 'es' | 'fr' | string;

export interface StrapiResponse<T> {
  data: Array<{ id: string; attributes: T }>;
  meta?: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } };
}

// ========== Strapi Blocks 类型定义 ==========
export interface StrapiTextNode {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

export interface StrapiLinkNode {
  type: 'link';
  url: string;
  children: Array<StrapiTextNode | StrapiLinkNode>;
}

export interface StrapiParagraphBlock {
  type: 'paragraph';
  children: Array<StrapiTextNode | StrapiLinkNode>;
}

export interface StrapiHeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: Array<StrapiTextNode | StrapiLinkNode>;
}

export interface StrapiListBlock {
  type: 'list';
  format: 'unordered' | 'ordered';
  children: Array<StrapiListItemBlock>;
}

export interface StrapiListItemBlock {
  type: 'list-item';
  children: Array<StrapiParagraphBlock | StrapiTextNode | StrapiLinkNode>;
}

export interface StrapiQuoteBlock {
  type: 'quote';
  children: Array<StrapiParagraphBlock>;
}

export interface StrapiCodeBlock {
  type: 'code';
  language?: string;
  children: Array<{ type: 'text'; text: string }>;
}

export interface StrapiImageBlock {
  type: 'image';
  image: { url: string; alternativeText?: string; caption?: string; width?: number; height?: number };
}

export interface StrapiUnknownBlock {
  type: string;
  [key: string]: unknown;
}

export type StrapiBlock =
  | StrapiParagraphBlock
  | StrapiHeadingBlock
  | StrapiListBlock
  | StrapiListItemBlock
  | StrapiQuoteBlock
  | StrapiCodeBlock
  | StrapiImageBlock
  | StrapiUnknownBlock;

// ========== 内容类型定义 ==========
export interface StrapiBlog {
  documentId: string;
  slug: string;
  title: string;
  author: string;
  content: StrapiBlock[];
  locale: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  cover?: { url: string; alternativeText?: string };
  excerpt?: string;
  localizations?: Array<{ documentId: string; slug: string; locale: string; title: string }>;
}

export interface SiteConfig {
  author: string;
  title: string;
  subtitle: string;
  description: string;
  image: { src: string; alt: string };
  email: string;
  socialLinks: Array<{ text: string; href: string; icon: string; header?: string | boolean }>;
  header: { logo: { src: string; alt: string }; navLinks: Array<{ text: string; href: string }> };
  page: { blogLinks: Array<{ text: string; href: string }> };
  footer: { navLinks: Array<{ text: string; href: string }> };
}

export interface PageProps {
  locale?: Locale;
  title?: string;
  description?: string;
}

export interface BlogListProps {
  blogs: StrapiBlog[];
  currentPage?: number;
  totalPages?: number;
}

export type ExtendedStrapiBlog = StrapiBlog;
export interface DynamicQueryResult<T = Record<string, any>> {
  data: T;
  meta?: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } };
}

// ========== Footer 相关类型 ==========
export interface FooterLinkItem {
  label: string;
  url: string;
  target?: string | null;
}

export interface FooterLinkGroup {
  group_title: string;
  links: FooterLinkItem[];
}

export interface FooterIconLink {
  icon: Array<{ url: string; alternativeText?: string | null }>;
  label: string;
  url: string;
}

export interface FooterData {
  product_categories: FooterLinkItem[];
  right_groups: FooterLinkGroup[];
  certifications: FooterIconLink[];
  footer_links: FooterLinkItem[];
  copyright?: StrapiBlock[] | string | null;
}
