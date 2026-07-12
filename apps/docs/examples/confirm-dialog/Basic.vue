<script setup lang="ts">
import { ref } from 'vue'
import { OButton, OConfirmDialog } from '@puzzle-fuzzy/ui'

const neutralOpen = ref(false)
const dangerOpen = ref(false)
</script>

<template>
  <div class="omg-example-row">
    <OButton variant="outline" tone="neutral" @click="neutralOpen = true"> 打开确认弹窗 </OButton>
    <OButton tone="danger" @click="dangerOpen = true">打开危险确认</OButton>

    <OConfirmDialog
      v-model:open="neutralOpen"
      title="发布当前更改？"
      description="确认后由使用方决定下一步动作。"
      confirm-label="继续"
      cancel-label="返回"
      close-aria-label="关闭发布确认弹窗"
      @confirm="neutralOpen = false"
    >
      组件只发出确认意图，不会自动执行操作或关闭自身。
    </OConfirmDialog>

    <OConfirmDialog
      v-model:open="dangerOpen"
      title="删除这个项目？"
      description="请确认你了解此操作的影响。"
      tone="danger"
      confirm-label="确认删除"
      cancel-label="取消"
      close-aria-label="关闭删除确认弹窗"
      @confirm="dangerOpen = false"
    >
      删除逻辑仍由业务层实现。
      <template #details>project-01 / design-system</template>
    </OConfirmDialog>
  </div>
</template>
