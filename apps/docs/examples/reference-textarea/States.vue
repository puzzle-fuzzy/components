<script setup lang="ts">
import { ref } from 'vue'
import { OReferenceTextarea, type OReferenceTextareaMedia } from '@puzzle-fuzzy/ui'

const media: readonly OReferenceTextareaMedia[] = [
  {
    id: 'state-1',
    src: '/images/reference-textarea/reference-1.svg',
    label: '人物参考',
  },
  {
    id: 'state-2',
    src: '/images/reference-textarea/reference-2.svg',
    label: '场景参考',
  },
]

const readonlyPrompt = ref('[Image 1]中的人物保持原有服装。')
const disabledPrompt = ref('[Image 2]中的花瓶放在画面右侧。')
const limitedPrompt = ref('输入 @ 仍可引用已有图片。')
</script>

<template>
  <div class="omg-example-stack">
    <div class="omg-example-theme">
      <div class="omg-example-stack" style="width: 100%">
        <strong>只读，仍可预览图片</strong>
        <OReferenceTextarea
          v-model="readonlyPrompt"
          :media="media"
          aria-label="只读参考图提示词"
          readonly
        />
      </div>
    </div>

    <div class="omg-example-theme">
      <div class="omg-example-stack" style="width: 100%">
        <strong>禁用</strong>
        <OReferenceTextarea
          v-model="disabledPrompt"
          :media="media"
          aria-label="禁用参考图提示词"
          disabled
        />
      </div>
    </div>

    <div class="omg-example-theme" data-omg-theme="dark">
      <div class="omg-example-stack" style="width: min(100%, 360px)">
        <strong>暗色、窄容器与数量上限</strong>
        <OReferenceTextarea
          v-model="limitedPrompt"
          :media="media"
          :max-count="2"
          aria-label="暗色参考图提示词"
          variant="outline"
        />
      </div>
    </div>
  </div>
</template>
