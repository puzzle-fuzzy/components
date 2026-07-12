<script setup lang="ts">
import { ref } from 'vue'
import { OTextarea } from '@puzzle-fuzzy/ui'

const message = ref('第一行\n第二行')
</script>

<template>
  <div class="omg-example-stack">
    <OTextarea
      v-model="message"
      aria-label="消息正文"
      placeholder="输入要传输的文本…"
      :maxlength="120"
      show-count
    />
  </div>
</template>
