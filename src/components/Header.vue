<!-- src/components/Header.vue -->
<script lang="ts" setup>
import { computed } from 'vue'
import ThemeToggle from './ThemeToggle.vue'
import type { Locale } from '@/generated/i18n-config'
import { getLocalizedUrl, getLanguageName } from '@/i18n/utils'
import { locales } from '@/generated/i18n-config'
import { getAssetPath, getLocalizedPath, BASE_URL } from '@/lib/env'
import { getSiteConfig } from '@/site-config'

const props = defineProps<{
  currentLocale: Locale
}>()

const currentLocale = props.currentLocale
const config = getSiteConfig(currentLocale)

const logoUrl = computed(() => getAssetPath(config.header.logo.src))
const isHomePage = computed(() => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname
    const base = BASE_URL.replace(/\/$/, '')
    return path === base || path === `${base}/${currentLocale}`
  }
  return false
})

const getHref = (url: string) => {
  if (url.startsWith('http')) return url
  return getLocalizedPath(currentLocale, url)
}
</script>

<template>
  <header
    id="header"
    class="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50 border-b border-gray-200 dark:border-gray-800"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <a
            :href="getLocalizedUrl(new URL('/', window.location.origin), currentLocale)"
            class="flex items-center space-x-3 group"
            :aria-label="config.title"
          >
            <img
              width="32"
              height="32"
              :src="logoUrl"
              :alt="config.header.logo.alt"
              class="w-8 h-8 transition-transform group-hover:scale-110"
            />
            <span v-if="isHomePage" class="font-semibold text-lg hidden md:inline">
              {{ config.title }}
            </span>
            <span v-else class="font-semibold text-lg hidden md:inline text-gray-600 dark:text-gray-400">
              {{ config.title }}
            </span>
          </a>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-2">
          <!-- 动态菜单将由 Menu 组件处理，这里仅作为占位，实际菜单逻辑可通过 props 传递或自行实现 -->
          <!-- 为简化，直接使用后备链接（从 config.header.navLinks 读取） -->
          <template v-if="config.header.navLinks.length">
            <a
              v-for="link in config.header.navLinks"
              :key="link.href"
              :href="getHref(link.href)"
              class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium px-3 py-2"
              :aria-label="link.text"
            >
              {{ link.text }}
            </a>
          </template>

          <!-- 按钮菜单（如果有）可单独处理，此处省略，因为动态菜单需从 Strapi Menu 获取 -->

          <!-- 语言切换器 + 社交链接 + 主题切换器 -->
          <div class="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
            <a
              v-for="locale in locales"
              :key="locale"
              :href="getLocalizedUrl(new URL(window.location.pathname, window.location.origin), locale as Locale)"
              :class="[
                'px-2.5 py-1.5 rounded text-xs font-semibold transition-all',
                currentLocale === locale
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              ]"
              :aria-label="`Switch to ${getLanguageName(locale as Locale)}`"
              :title="getLanguageName(locale as Locale)"
            >
              {{ (locale as string).toUpperCase() }}
            </a>

            <a
              v-for="link in config.socialLinks.filter(l => l.header && l.href)"
              :key="link.text"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              :aria-label="link.text"
              :title="link.text"
            >
              <i :class="`${link.icon} text-lg`"></i>
            </a>

            <a
              :href="getAssetPath('/rss.xml')"
              target="_blank"
              class="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              aria-label="RSS Feed"
              title="RSS Feed"
            >
              <i class="i-ri-rss-line text-lg"></i>
            </a>

            <ThemeToggle />
          </div>
        </nav>

        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button
            id="mobile-menu-button"
            class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2"
            aria-label="Open menu"
            aria-controls="mobile-menu"
            aria-expanded="false"
          >
            <i class="i-ri-menu-2-line text-xl"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu (简化实现，实际应使用完整结构) -->
    <div
      id="mobile-menu"
      class="md:hidden hidden fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto"
    >
      <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <a
          :href="getLocalizedUrl(new URL('/', window.location.origin), currentLocale)"
          class="flex items-center space-x-3"
          data-close-mobile-menu
        >
          <img :src="logoUrl" :alt="config.header.logo.alt" class="w-8 h-8" />
          <span class="font-semibold text-lg">{{ config.title }}</span>
        </a>
        <button
          class="text-gray-700 dark:text-gray-300 p-2"
          aria-label="Close menu"
          data-close-mobile-menu
        >
          <i class="i-ri-close-line text-2xl"></i>
        </button>
      </div>

      <div class="p-4">
        <nav class="space-y-2 mb-6">
          <a
            v-for="link in config.header.navLinks"
            :key="link.href"
            :href="getHref(link.href)"
            class="block text-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            data-close-mobile-menu
          >
            {{ link.text }}
          </a>
        </nav>

        <!-- 语言切换器（移动端） -->
        <div class="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-4">
            {{ currentLocale === 'en' ? 'Language' : currentLocale === 'es' ? 'Idioma' : 'Langue' }}
          </h3>
          <div class="space-y-2">
            <a
              v-for="locale in locales"
              :key="locale"
              :href="getLocalizedUrl(new URL(window.location.pathname, window.location.origin), locale as Locale)"
              :class="[
                'flex items-center justify-between px-4 py-3 rounded-lg transition-colors',
                currentLocale === locale
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              ]"
              data-close-mobile-menu
            >
              <span class="font-medium">{{ getLanguageName(locale as Locale) }}</span>
              <span class="text-sm opacity-75">{{ (locale as string).toUpperCase() }}</span>
            </a>
          </div>
        </div>

        <!-- 社交链接（移动端） -->
        <div class="flex flex-wrap gap-4 px-4">
          <a
            v-for="link in config.socialLinks.filter(l => l.header && l.href)"
            :key="link.text"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            :aria-label="link.text"
            :title="link.text"
            data-close-mobile-menu
          >
            <i :class="`${link.icon} text-xl`"></i>
          </a>
          <a
            :href="getAssetPath('/rss.xml')"
            target="_blank"
            class="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400"
            aria-label="RSS Feed"
            title="RSS Feed"
            data-close-mobile-menu
          >
            <i class="i-ri-rss-line text-xl"></i>
          </a>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* 移动端菜单交互脚本已在 Header.astro 中实现，此处如需可添加，但建议在父组件中处理 */
</style>

<script lang="ts">
// 移动端菜单交互逻辑
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.getElementById('mobile-menu-button')
    const mobileMenu = document.getElementById('mobile-menu')
    const closeElements = document.querySelectorAll('[data-close-mobile-menu]')

    const toggleMenu = () => {
      if (!mobileMenu) return
      const isHidden = mobileMenu.classList.contains('hidden')
      mobileMenu.classList.toggle('hidden', !isHidden)
      menuButton?.setAttribute('aria-expanded', String(isHidden))
    }

    const closeMenu = () => {
      mobileMenu?.classList.add('hidden')
      menuButton?.setAttribute('aria-expanded', 'false')
    }

    menuButton?.addEventListener('click', toggleMenu)
    closeElements.forEach(el => el.addEventListener('click', closeMenu))

    document.addEventListener('click', (event) => {
      if (!mobileMenu || mobileMenu.classList.contains('hidden')) return
      if (!mobileMenu.contains(event.target as Node) && !menuButton?.contains(event.target as Node)) {
        closeMenu()
      }
    })

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('hidden')) {
        closeMenu()
        menuButton?.focus()
      }
    })
  })
}
</script>
