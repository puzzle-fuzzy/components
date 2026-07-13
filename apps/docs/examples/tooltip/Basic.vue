<script setup lang="ts">
import { OButton, OTooltip, type OTooltipPlacement } from '@puzzle-fuzzy/ui'
import { LuSettings } from 'vue-icons-plus/lu'

const placements: readonly OTooltipPlacement[] = [
  'top-start',
  'top',
  'top-end',
  'right-start',
  'right',
  'right-end',
  'bottom-start',
  'bottom',
  'bottom-end',
  'left-start',
  'left',
  'left-end',
]
</script>

<template>
  <div class="tooltip-basic">
    <p>悬停或聚焦任意图标按钮，检查四个方向以及 start / end 对齐。</p>
    <div class="tooltip-basic-grid">
      <OTooltip
        v-for="placement in placements"
        :key="placement"
        :content="`首选位置：${placement}`"
        :placement="placement"
        :show-delay="0"
      >
        <OButton
          icon-only
          size="sm"
          tone="neutral"
          variant="outline"
          :aria-label="`查看 ${placement} 位置提示`"
        >
          <template #icon><LuSettings /></template>
          {{ placement }}
        </OButton>
      </OTooltip>
    </div>

    <OTooltip
      placement="bottom"
      content="这是一段会限制在 240px 内并安全换行的较长文字提示；它只提供说明，不承载按钮、链接或其他交互内容。"
      :show-delay="0"
    >
      <OButton variant="soft" tone="neutral">长文字提示</OButton>
    </OTooltip>
  </div>
</template>

<style scoped lang="less">
.tooltip-basic {
  display: grid;
  width: 100%;
  justify-items: start;
  gap: var(--omg-space-4);
}

.tooltip-basic p {
  margin: 0;
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.tooltip-basic-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  justify-items: center;
  gap: var(--omg-space-3);
  padding-block: var(--omg-space-6);
}

@media (width <= 640px) {
  .tooltip-basic-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
