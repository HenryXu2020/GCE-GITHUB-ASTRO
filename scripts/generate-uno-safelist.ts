import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const CACHE_DIR = join(process.cwd(), 'src/generated/cache');
const GLOBAL_DIR = join(CACHE_DIR, 'global');
const OUTPUT_FILE = join(process.cwd(), 'src/generated/uno-safelist.json');

// 固定图标：这些图标不依赖于 Strapi，始终保留
const FIXED_ICONS = [
  'i-ri-rss-line',           // RSS
  'i-ri-menu-2-line',        // 移动端菜单
  'i-ri-close-line',         // 关闭按钮
  'i-ri-file-list-2-line',
  'i-carbon-campsite',
  // 可根据项目实际需要添加
];

function generateSafelist() {
  if (!existsSync(GLOBAL_DIR)) {
    console.warn('⚠️ Global cache directory not found, using only fixed icons.');
    writeFileSync(OUTPUT_FILE, JSON.stringify(FIXED_ICONS, null, 2));
    return;
  }

  try {
    const allIcons = new Set<string>(FIXED_ICONS);
    const files = readdirSync(GLOBAL_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const filePath = join(GLOBAL_DIR, file);
      const data = JSON.parse(readFileSync(filePath, 'utf-8'));
      const socialLinks = data.single?.data?.social_links || [];
      socialLinks.forEach((link: any) => {
        if (link.icon_class && typeof link.icon_class === 'string' && link.icon_class.startsWith('i-')) {
          allIcons.add(link.icon_class);
        }
      });
    }

    const safelist = Array.from(allIcons);
    writeFileSync(OUTPUT_FILE, JSON.stringify(safelist, null, 2));
    console.log(`✅ Generated UnoCSS safelist: ${safelist.length} total (from all locales)`);
  } catch (error) {
    console.error('❌ Failed to generate safelist:', error);
    process.exit(1);
  }
}

generateSafelist();
