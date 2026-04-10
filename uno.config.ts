import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';

// 固定图标（始终需要的硬编码类名）
const FIXED_SAFELIST = [
  'i-ri-rss-line',
  'i-ri-menu-2-line',
  'i-ri-close-line',
  'i-ri-file-list-2-line',
  'i-carbon-campsite',
  // 可根据项目需要继续添加
];

// 动态读取 Strapi 生成的图标 safelist
function loadDynamicSafelist(): string[] {
  const safelistPath = join(process.cwd(), 'src/generated/uno-safelist.json');
  if (!existsSync(safelistPath)) {
    console.warn('⚠️  UnoCSS safelist file not found, using only fixed icons.');
    return [];
  }
  try {
    const content = readFileSync(safelistPath, 'utf-8');
    return JSON.parse(content) as string[];
  } catch (error) {
    console.error('❌ Failed to parse UnoCSS safelist JSON:', error);
    return [];
  }
}

const dynamicSafelist = loadDynamicSafelist();
const safelist = [...new Set([...FIXED_SAFELIST, ...dynamicSafelist])];

console.log(`🎨 UnoCSS safelist: ${safelist.length} icons loaded (${dynamicSafelist.length} from Strapi)`);

export default defineConfig({
  shortcuts: [
    {
      'bg-main': 'bg-hex-eef5fc dark:bg-hex-0d1117',
      'text-main': 'text-hex-555555 dark:text-hex-bbbbbb',
      'text-link': 'text-dark dark:text-white ',
      'border-main': 'border-truegray-300 dark:border-truegray-600',
      'op-70': 'opacity-70',
    },
    {
      'text-title': 'text-link text-4xl font-800',
      'nav-link': 'text-link opacity-70 hover:opacity-100 transition-opacity duration-200 cursor-pointer',
      'prose-link': 'text-link text-nowrap cursor-pointer border-b-1 !border-opacity-30 hover:!border-opacity-100 border-neutral-500 hover:border-truegray-600 dark:border-neutral-500 hover:dark:border-truegray-400 transition-border-color duration-200 decoration-none',
      'container-link': 'p-2 opacity-60 hover:opacity-100 cursor-pointer hover:bg-truegray-500 !bg-opacity-10 transition-colors transition-opacity duration-200',
    },
    {
      'hr-line': 'w-14 mx-auto my-8 border-solid border-1px !border-truegray-200 !dark:border-truegray-800',
    },
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      prefix: 'i-',
      extraProperties: {
        display: 'inline-block',
      },
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Inter:400,600,800',
        mono: 'DM Mono:400,600',
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  safelist,
});
