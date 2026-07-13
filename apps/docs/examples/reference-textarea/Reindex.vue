<script setup lang="ts">
import { ref } from 'vue'
import {
  OButton,
  OReferenceTextarea,
  reindexOReferenceTextareaTokens,
  type OReferenceTextareaMedia,
} from '@puzzle-fuzzy/ui'

const initialPrompt = '[Image 1]控制人物服装，[Image 2]控制桌面花瓶，[Image 3]作为整体光线参考。'
const initialMedia: readonly OReferenceTextareaMedia[] = [
  {
    id: 'reindex-1',
    src: '/images/reference-textarea/reference-1.svg',
    label: '人物服装',
  },
  {
    id: 'reindex-2',
    src: '/images/reference-textarea/reference-2.svg',
    label: '陶瓷花瓶',
  },
  {
    id: 'reindex-3',
    src: '/images/reference-textarea/reference-1.svg',
    label: '庭院光线',
  },
]

const prompt = ref(initialPrompt)
const media = ref<OReferenceTextareaMedia[]>(initialMedia.map((item) => ({ ...item })))

const removeMedia = (_item: OReferenceTextareaMedia, index: number): void => {
  prompt.value = reindexOReferenceTextareaTokens(prompt.value, index)
  media.value = media.value.filter((_media, mediaIndex) => mediaIndex !== index)
}

const reset = (): void => {
  prompt.value = initialPrompt
  media.value = initialMedia.map((item) => ({ ...item }))
}
</script>

<template>
  <div class="omg-example-stack">
    <OReferenceTextarea
      v-model="prompt"
      :media="media"
      aria-label="可重排编号的参考图提示词"
      :uploadable="false"
      @remove="removeMedia"
    />
    <div>
      <OButton size="sm" variant="ghost" tone="neutral" @click="reset">重置示例</OButton>
    </div>
  </div>
</template>
