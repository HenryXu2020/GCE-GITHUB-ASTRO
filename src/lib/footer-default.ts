// src/lib/footer-default.ts
import type { FooterData } from '@/types';

// 完全移除降级：当 Strapi 无 footer 数据时，不显示任何内容
export const defaultFooter = null as unknown as FooterData;
