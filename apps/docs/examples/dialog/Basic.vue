<script setup lang="ts">
import { ref } from 'vue'
import { OButton, ODialog } from '@puzzle-fuzzy/ui'

const open = ref(false)
</script>

<template>
  <div class="omg-example-stack">
    <OButton @click="open = true">打开弹窗</OButton>
    <ODialog
      v-model:open="open"
      title="收到文本"
      description="来自 Yxswy"
      close-aria-label="关闭收到文本弹窗"
    >
      <div class="omg-example-panel">这是一段可以复制、阅读或进一步处理的文本内容。</div>
      <template #footer>
        <OButton variant="outline" tone="neutral" @click="open = false">取消</OButton>
        <OButton @click="open = false">确认</OButton>
      </template>
    </ODialog>
  </div>
</template>
