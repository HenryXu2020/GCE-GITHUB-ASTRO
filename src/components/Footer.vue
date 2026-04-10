<!-- src/components/Footer.vue -->
<script lang="ts" setup>
import { computed } from 'vue'
import type { FooterData, StrapiBlock } from '@/types'
import RichTextRenderer from './RichTextRenderer.vue'
import { getLocalizedPath } from '@/lib/env'  // 新增导入
import type { Locale } from '@/generated/i18n-config'  // 新增导入

// 接收当前语言作为 prop
const props = defineProps<{ 
  footer?: FooterData | null
  currentLocale: Locale  // 新增 prop
}>()

const getIconUrl = (icon: FooterData['certifications'][0]['icon']) => {
  if (Array.isArray(icon) && icon.length > 0) return icon[0].url
  return undefined
}

const getTarget = (target: string | null | undefined): string => {
  return target === '_blank' ? '_blank' : '_self'
}

// 新增：处理链接 URL，如果是相对路径则添加 base 和 locale
const getProcessedUrl = (url: string): string => {
  if (!url) return '#'
  // 绝对 URL（http/https）保持不变
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // 相对路径：使用 getLocalizedPath 添加 base 和当前语言前缀
  return getLocalizedPath(props.currentLocale, url)
}

const isRichText = (val: any): val is StrapiBlock[] => {
  return Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && 'type' in val[0]
}

// 递归替换文本节点中的 {{year}}
function replaceYearPlaceholder(nodes: StrapiBlock[]): StrapiBlock[] {
  const currentYear = new Date().getFullYear().toString()
  const processNode = (node: any): any => {
    if (node.type === 'text' && node.text) {
      return { ...node, text: node.text.replace(/\{\{year\}\}/g, currentYear) }
    }
    if (node.children && Array.isArray(node.children)) {
      return { ...node, children: node.children.map(processNode) }
    }
    return node
  }
  return nodes.map(processNode)
}

const processedCopyright = computed(() => {
  if (!props.footer?.copyright) return null
  if (isRichText(props.footer.copyright)) {
    return replaceYearPlaceholder(props.footer.copyright)
  }
  const year = new Date().getFullYear().toString()
  return (props.footer.copyright as string).replace(/\{\{year\}\}/g, year)
})
</script>

<template>
  <footer class="w-full mt-18 pt-6 pb-8 max-w-2xl mx-auto text-sm flex flex-col gap-4 border-main border-t !border-op-50 text-dark dark:text-white">
    <!-- 产品分类 -->
    <div v-if="footer?.product_categories?.length" class="flex flex-wrap gap-4">
      <template v-for="(link, index) in footer.product_categories" :key="link.url">
        <a :aria-label="link.label" :target="getTarget(link.target)" class="nav-link flex items-center" :href="getProcessedUrl(link.url)">
          {{ link.label }}
        </a>
        <span v-if="index < footer.product_categories.length - 1" op-70> / </span>
      </template>
    </div>

    <!-- 右侧分组 -->
    <div v-if="footer?.right_groups?.length" class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
      <div v-for="group in footer.right_groups" :key="group.group_title">
        <h3 class="font-semibold mb-2 text-gray-800 dark:text-gray-200">{{ group.group_title }}</h3>
        <ul class="space-y-1">
          <li v-for="link in group.links" :key="link.url">
            <a :href="getProcessedUrl(link.url)" :target="getTarget(link.target)" class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {{ link.label }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- 认证图标 -->
    <div v-if="footer?.certifications?.length" class="flex flex-wrap gap-6 justify-center my-2">
      <a v-for="cert in footer.certifications" :key="cert.url" :href="getProcessedUrl(cert.url)" target="_blank" rel="noopener noreferrer" class="inline-flex flex-col items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" :title="cert.label">
        <img v-if="getIconUrl(cert.icon)" :src="getIconUrl(cert.icon)" :alt="cert.label" class="h-8 w-auto object-contain" loading="lazy" />
        <span class="text-xs mt-1">{{ cert.label }}</span>
      </a>
    </div>

    <!-- 底部链接（居中） -->
    <div v-if="footer?.footer_links?.length" class="flex flex-wrap gap-4 justify-center">
      <template v-for="(link, index) in footer.footer_links" :key="link.url">
        <a :aria-label="link.label" :target="getTarget(link.target)" class="nav-link flex items-center" :href="getProcessedUrl(link.url)">
          {{ link.label }}
        </a>
        <span v-if="index < footer.footer_links.length - 1" op-70> / </span>
      </template>
    </div>

    <!-- 版权信息（居中，支持动态年份） -->
    <div v-if="footer?.copyright" class="text-center mt-4" op-70>
      <RichTextRenderer v-if="isRichText(footer.copyright)" :content="processedCopyright" />
      <span v-else>{{ processedCopyright }}</span>
    </div>
  </footer>
</template>
