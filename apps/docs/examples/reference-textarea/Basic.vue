<script setup lang="ts">
import { ref } from 'vue'
import { OReferenceTextarea } from '@puzzle-fuzzy/ui'

const imageUrl =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 96">
  <rect width="160" height="96" rx="12" fill="#1d4ed8"/>
  <circle cx="122" cy="26" r="13" fill="#fec84b"/>
  <path d="M0 76 42 40l30 24 34-38 54 48v22H0Z" fill="#121316"/>
</svg>
`)

const message = ref(`请看 @[Yxswy](member:yxswy) 的设计图：![界面截图](image:${imageUrl})`)
</script>

<template>
  <div class="omg-example-stack">
    <OReferenceTextarea
      v-model="message"
      aria-label="带引用的消息"
      placeholder="输入 @[成员](member:id) 或 ![图片](image:url)"
      :maxlength="240"
      show-count
    />
  </div>
</template>
