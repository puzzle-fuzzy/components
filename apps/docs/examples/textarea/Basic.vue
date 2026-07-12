<script setup lang="ts">
import { ref } from 'vue'
import { OTextarea } from '@puzzle-fuzzy/ui'

const message = ref('第一行\n第二行')
</script>

<template>
  <div class="omg-example-stack">
    <label for="message-body">消息正文</label>
    <OTextarea
      id="message-body"
      v-model="message"
      aria-describedby="message-help"
      placeholder="输入要传输的文本…"
      :maxlength="120"
      show-count
    />
    <small id="message-help">最多输入 120 个 UTF-16 代码单元。</small>
  </div>
</template>
