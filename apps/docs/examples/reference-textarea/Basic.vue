<script setup lang="ts">
import { ref } from 'vue'
import { OReferenceTextarea, type OReferenceTextareaReference } from '@puzzle-fuzzy/ui'

const imageUrl =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 96">
  <rect width="160" height="96" rx="12" fill="#1d4ed8"/>
  <circle cx="122" cy="26" r="13" fill="#fec84b"/>
  <path d="M0 76 42 40l30 24 34-38 54 48v22H0Z" fill="#121316"/>
</svg>
`)

const message = ref('请检查下面的需求说明和界面预览。')
const references: readonly OReferenceTextareaReference[] = [
  { id: 'brief', label: '需求说明' },
  {
    id: 'preview',
    label: '界面预览',
    kind: 'image',
    thumbnailSrc: imageUrl,
  },
]
</script>

<template>
  <div class="omg-example-stack">
    <label for="reference-message">消息正文</label>
    <OReferenceTextarea
      id="reference-message"
      v-model="message"
      :references="references"
      aria-describedby="reference-message-help"
      placeholder="输入消息正文"
      :autosize="{ minRows: 3, maxRows: 8 }"
      :maxlength="240"
      show-count
    />
    <small id="reference-message-help">引用数据由使用方提供，输入内容不会被组件解析。</small>
  </div>
</template>
