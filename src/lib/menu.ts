// src/lib/menu.ts
import { getContentList } from '@/lib/content-cache';
import type { Locale } from '@/generated/i18n-config';
import type { Menu } from '@/generated/graphql-types';

export interface MenuNode {
  documentId: string;
  title: string;
  url: string | null | undefined;
  order: number;
  isButton: boolean;
  targetBlank: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  publishedAt?: string | null;
  locale?: string | null;
  children: MenuNode[];
  [key: string]: unknown;
}

export function getMenuTree(locale: Locale): MenuNode[] {
  const menuList = getContentList<Menu>('menu', locale);
  if (!menuList?.length) return [];

  // 创建 Map 存储所有节点
  const nodeMap = new Map<string, MenuNode>();
  const roots: MenuNode[] = [];

  // 第一步：将每个菜单项转换为节点（不包含 children）
  for (const item of menuList) {
    if (!item?.documentId) continue;
    const node: MenuNode = {
      documentId: item.documentId,
      title: item.title ?? '',
      url: item.url,
      order: item.order ?? 0,
      isButton: item.isButton ?? false,
      targetBlank: item.targetBlank ?? false,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      publishedAt: item.publishedAt,
      locale: item.locale,
      children: [],
      ...item, // 保留其他字段
    };
    nodeMap.set(item.documentId, node);
  }

  // 第二步：建立父子关系
  for (const item of menuList) {
    if (!item?.documentId) continue;
    const node = nodeMap.get(item.documentId)!;
    // 检查是否有父级
    if (item.menu && typeof item.menu === 'object' && item.menu.documentId) {
      const parent = nodeMap.get(item.menu.documentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // 父节点不存在（可能不在当前语言），作为根节点
        roots.push(node);
      }
    } else {
      // 没有父级，是根节点
      roots.push(node);
    }
  }

  // 第三步：按 order 排序
  roots.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const node of nodeMap.values()) {
    node.children.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  return roots;
}
