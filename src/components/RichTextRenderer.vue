<!-- src/components/RichTextRenderer.vue -->
<script lang="ts" setup>
import type { StrapiBlock, StrapiTextNode, StrapiLinkNode } from '@/types'
import { computed } from 'vue'

interface Props {
  content: StrapiBlock[]
  className?: string
}

const props = withDefaults(defineProps<Props>(), { className: '' })

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderTextNode(node: StrapiTextNode): string {
  let text = escapeHtml(node.text)
  if (node.bold) text = `<strong>${text}</strong>`
  if (node.italic) text = `<em>${text}</em>`
  if (node.underline) text = `<u>${text}</u>`
  if (node.strikethrough) text = `<s>${text}</s>`
  if (node.code) text = `<code>${text}</code>`
  return text
}

function renderLinkNode(node: StrapiLinkNode): string {
  const target = node.url?.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''
  const childrenHtml = renderChildren(node.children)
  return `<a href="${escapeHtml(node.url)}" ${target}>${childrenHtml}</a>`
}

function renderChildren(children: Array<StrapiTextNode | StrapiLinkNode>): string {
  return children.map(child => {
    if (child.type === 'text') return renderTextNode(child)
    if (child.type === 'link') return renderLinkNode(child)
    return ''
  }).join('')
}

function renderBlock(block: StrapiBlock): string {
  switch (block.type) {
    case 'paragraph':
      return `<p>${renderChildren(block.children)}</p>`
    case 'heading':
      return `<h${block.level} class="heading-${block.level}">${renderChildren(block.children)}</h${block.level}>`
    case 'list':
      const tag = block.format === 'ordered' ? 'ol' : 'ul'
      const listClass = block.format === 'ordered' ? 'list-decimal' : 'list-disc'
      const itemsHtml = block.children.map(item => renderBlock(item)).join('')
      return `<${tag} class="${listClass}">${itemsHtml}</${tag}>`
    case 'list-item':
      return `<li>${renderChildren(block.children)}</li>`
    case 'quote':
      return `<blockquote>${block.children.map(p => renderBlock(p)).join('')}</blockquote>`
    case 'code':
      const codeContent = block.children.map(child => child.text).join('')
      const language = block.language ? ` class="language-${block.language}"` : ''
      return `<pre><code${language}>${escapeHtml(codeContent)}</code></pre>`
    case 'image':
      const img = block.image
      if (!img?.url) return ''
      return `<img src="${img.url}" alt="${escapeHtml(img.alternativeText || '')}" loading="lazy" width="${img.width || ''}" height="${img.height || ''}" />`
    default:
      if ('children' in block && Array.isArray((block as any).children)) {
        return renderChildren((block as any).children)
      }
      return ''
  }
}

const htmlContent = computed(() => {
  if (!props.content?.length) return ''
  return props.content.map(block => renderBlock(block)).join('')
})
</script>

<template>
  <div v-if="content?.length" :class="['rich-text-content', className]" v-html="htmlContent" />
  <div v-else :class="['rich-text-empty', className]">No content available</div>
</template>
