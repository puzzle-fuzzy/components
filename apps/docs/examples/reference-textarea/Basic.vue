<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import {
  OReferenceTextarea,
  reindexOReferenceTextareaTokens,
  type OReferenceTextareaLabelOverrides,
  type OReferenceTextareaMedia,
} from '@puzzle-fuzzy/ui'

const prompt = ref('[Image 1]中身着红色旗袍的女性站在庭院中央。')
const media = ref<OReferenceTextareaMedia[]>([
  {
    id: 'reference-1',
    src: '/images/reference-textarea/reference-1.svg',
    label: '红色旗袍人物',
    alt: '庭院中身着红色旗袍的女性参考图',
  },
  {
    id: 'reference-2',
    src: '/images/reference-textarea/reference-2.svg',
    label: '桌边陶瓷花瓶',
    alt: '木桌旁的白色陶瓷花瓶参考图',
  },
])
const createdObjectUrls = new Set<string>()
let nextMediaId = 3

const labels = {
  mediaList: '已选参考图',
  upload: '上传参考图',
  add: '继续添加',
  remove: (_item, index) => `移除 Image ${String(index + 1)}`,
  mentionList: '选择参考图',
  mentionOption: (item, _index, token) => `${token} ${item.label}`,
} satisfies OReferenceTextareaLabelOverrides

const addFiles = (files: File[]): void => {
  const additions = files.map((file) => {
    const src = URL.createObjectURL(file)
    createdObjectUrls.add(src)

    return {
      id: `local-reference-${String(nextMediaId++)}`,
      src,
      label: file.name,
      alt: file.name,
    }
  })

  media.value = [...media.value, ...additions]
}

const removeMedia = (_item: OReferenceTextareaMedia, index: number): void => {
  const removed = media.value[index]
  if (!removed) return

  prompt.value = reindexOReferenceTextareaTokens(prompt.value, index)
  media.value = media.value.filter((_media, mediaIndex) => mediaIndex !== index)

  if (createdObjectUrls.delete(removed.src)) URL.revokeObjectURL(removed.src)
}

onBeforeUnmount(() => {
  for (const src of createdObjectUrls) URL.revokeObjectURL(src)
  createdObjectUrls.clear()
})
</script>

<template>
  <div class="omg-example-stack">
    <label for="reference-prompt">参考图提示词</label>
    <OReferenceTextarea
      id="reference-prompt"
      v-model="prompt"
      :media="media"
      :labels="labels"
      :max-count="6"
      :autosize="{ minRows: 4, maxRows: 8 }"
      aria-describedby="reference-prompt-help"
      placeholder="输入 @ 选择上方参考图"
      @select="addFiles"
      @remove="removeMedia"
    />
    <small id="reference-prompt-help">
      输入 @ 后选择图片，组件会把对应的 [Image n] 写入当前光标位置。
    </small>
  </div>
</template>
