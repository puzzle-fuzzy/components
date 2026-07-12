<script setup lang="ts">
import { ref } from 'vue'
import { OButton, ODrawer } from '@puzzle-fuzzy/ui'

const startOpen = ref(false)
const endOpen = ref(false)
const rtlStartOpen = ref(false)
</script>

<template>
  <div class="omg-drawer-placement-grid">
    <section class="omg-drawer-placement-group">
      <span>LTR · 两种尺寸表达</span>
      <div class="omg-drawer-placement-actions">
        <OButton variant="outline" tone="neutral" @click="startOpen = true"> 从起始侧打开 </OButton>
        <OButton @click="endOpen = true">从结束侧打开</OButton>
      </div>

      <ODrawer
        v-model:open="startOpen"
        placement="start"
        :size="320"
        title="起始侧面板"
        description="数字尺寸会被规范化为像素。"
        close-aria-label="关闭起始侧面板"
      >
        在 LTR 环境中，逻辑起始侧对应视口左侧。
        <template #footer>
          <OButton @click="startOpen = false">完成</OButton>
        </template>
      </ODrawer>

      <ODrawer
        v-model:open="endOpen"
        placement="end"
        size="28rem"
        title="结束侧面板"
        description="CSS 长度表达式会原样应用。"
        close-aria-label="关闭结束侧面板"
      >
        在 LTR 环境中，逻辑结束侧对应视口右侧。
        <template #footer>
          <OButton @click="endOpen = false">完成</OButton>
        </template>
      </ODrawer>
    </section>

    <section class="omg-drawer-placement-group" data-omg-theme="dark" dir="rtl" lang="zh-CN">
      <span>RTL · Dark</span>
      <OButton @click="rtlStartOpen = true">在 RTL 中从起始侧打开</OButton>

      <ODrawer
        v-model:open="rtlStartOpen"
        placement="start"
        size="min(88vw, 24rem)"
        title="RTL 起始侧面板"
        description="起始侧会随书写方向自动切换。"
        close-aria-label="关闭 RTL 起始侧面板"
      >
        这里的起始侧位于视口右侧，Message 的物理右上角规则不会因此改变。
        <template #footer>
          <OButton @click="rtlStartOpen = false">完成</OButton>
        </template>
      </ODrawer>
    </section>
  </div>
</template>

<style scoped>
.omg-drawer-placement-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--omg-space-3);
}

.omg-drawer-placement-group {
  display: flex;
  min-height: 132px;
  box-sizing: border-box;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--omg-space-4);
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
  color: var(--omg-color-text);
}

.omg-drawer-placement-group > span {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
  font-weight: var(--omg-font-weight-semibold);
}

.omg-drawer-placement-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--omg-space-2);
}

@media (width <= 640px) {
  .omg-drawer-placement-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
