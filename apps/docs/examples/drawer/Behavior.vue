<script setup lang="ts">
import { ref } from 'vue'
import { OButton, ODrawer } from '@puzzle-fuzzy/ui'

const lockedOpen = ref(false)
</script>

<template>
  <div class="omg-example-stack">
    <OButton variant="outline" tone="neutral" @click="lockedOpen = true"> 打开锁定面板 </OButton>

    <ODrawer
      v-model:open="lockedOpen"
      title="锁定面板"
      description="这个示例只允许通过面板内的明确操作关闭。"
      :size="360"
      :close-on-mask="false"
      :close-on-esc="false"
      :show-close="false"
    >
      <div class="omg-drawer-locked-content">
        <strong>关闭策略由 props 独立控制</strong>
        <p>点击遮罩或按下 Esc 都不会关闭；组件也不会显示默认关闭按钮。</p>
        <OButton autofocus @click="lockedOpen = false">关闭锁定面板</OButton>
      </div>
    </ODrawer>
  </div>
</template>

<style scoped>
.omg-drawer-locked-content {
  display: grid;
  gap: var(--omg-space-3);
  justify-items: start;
}

.omg-drawer-locked-content p {
  margin: 0;
  color: var(--omg-color-text-muted);
}
</style>
