<script setup lang="ts">
import { ref } from 'vue'
import { OTextarea } from '@puzzle-fuzzy/ui'

const fixedMessage = ref('第一行\n第二行\n第三行\n第四行')
const growingMessage = ref('输入更多内容时，输入框会随内容增长。')
</script>

<template>
  <div class="omg-example-stack">
    <label for="fixed-message-body">固定三行</label>
    <OTextarea
      id="fixed-message-body"
      v-model="fixedMessage"
      aria-describedby="fixed-message-help"
      placeholder="输入要传输的文本…"
      :rows="3"
      :maxlength="120"
      show-count
    />
    <small id="fixed-message-help">固定高度，内容超出后在原生编辑区域内滚动。</small>

    <label for="growing-message-body">按内容增长</label>
    <OTextarea
      id="growing-message-body"
      v-model="growingMessage"
      aria-describedby="growing-message-help"
      placeholder="继续输入以观察高度变化…"
      :autosize="{ minRows: 2, maxRows: 6 }"
    />
    <small id="growing-message-help">从 2 行增长到 6 行，达到上限后开始滚动。</small>
  </div>
</template>
