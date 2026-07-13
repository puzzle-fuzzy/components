<script setup lang="ts">
import { OButton, OKbd, OKbdGroup, OTooltip } from '@puzzle-fuzzy/ui'
import { LuCommand } from 'vue-icons-plus/lu'
</script>

<template>
  <div class="kbd-tooltip">
    <OTooltip placement="top">
      <OButton icon-only aria-label="打开命令面板"
        ><template #icon><LuCommand /></template
      ></OButton>
      <template #content>
        <span class="kbd-tooltip-content">
          <span>打开命令面板</span>
          <OKbdGroup aria-label="Control 加 K"
            ><OKbd>Ctrl</OKbd><span aria-hidden="true">+</span><OKbd>K</OKbd></OKbdGroup
          >
        </span>
      </template>
    </OTooltip>
    <span>聚焦或悬停按钮查看快捷键。</span>
  </div>
</template>

<style scoped lang="less">
.kbd-tooltip {
  display: flex;
  align-items: center;
  gap: var(--omg-space-3);
  color: var(--omg-color-text-muted);
}

.kbd-tooltip-content {
  display: inline-flex;
  align-items: center;
  gap: var(--omg-space-2);
}
</style>
