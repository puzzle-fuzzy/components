<script setup lang="ts">
import { OButton } from '@puzzle-fuzzy/ui/button'
import {
  OPopover,
  OPopoverAnchor,
  OPopoverContent,
  OPopoverTrigger,
  oPopoverAlignments,
  oPopoverSides,
  type OPopoverAlign,
  type OPopoverSide,
} from '@puzzle-fuzzy/ui/popover'
import { LuMapPin } from 'vue-icons-plus/lu'
import { ref } from 'vue'

const customTarget = ref<HTMLElement | null>(null)

const sideNames: Record<OPopoverSide, string> = {
  top: '上方',
  right: '右侧',
  bottom: '下方',
  left: '左侧',
}

const alignNames: Record<OPopoverAlign, string> = {
  start: '起点',
  center: '居中',
  end: '终点',
}
</script>

<template>
  <div class="popover-placement-example">
    <section aria-label="Popover sides and alignments">
      <strong>方向与对齐</strong>
      <div class="popover-placement-grid">
        <template v-for="side in oPopoverSides" :key="side">
          <OPopover v-for="align in oPopoverAlignments" :key="`${side}-${align}`">
            <OPopoverTrigger as-child>
              <OButton size="sm" variant="soft" tone="neutral">
                {{ sideNames[side] }} · {{ alignNames[align] }}
              </OButton>
            </OPopoverTrigger>
            <OPopoverContent :side="side" :align="align">
              <span class="popover-placement-label">{{ side }} / {{ align }}</span>
            </OPopoverContent>
          </OPopover>
        </template>
      </div>
    </section>

    <section class="popover-placement-modes" aria-label="Popover mount modes">
      <strong>挂载模式与独立锚点</strong>
      <div class="popover-placement-targets">
        <div class="popover-placement-anchor-line">
          <OPopover>
            <OPopoverAnchor as-child>
              <span class="popover-placement-pin" aria-hidden="true">
                <LuMapPin />
              </span>
            </OPopoverAnchor>
            <OPopoverTrigger as-child>
              <OButton size="sm">独立锚点</OButton>
            </OPopoverTrigger>
            <OPopoverContent align="start">内容相对图钉定位</OPopoverContent>
          </OPopover>
        </div>

        <div ref="customTarget" class="popover-placement-target">
          <OPopover>
            <OPopoverTrigger as-child>
              <OButton size="sm" variant="soft" tone="neutral">自定义目标</OButton>
            </OPopoverTrigger>
            <OPopoverContent
              v-if="customTarget"
              :teleport-to="customTarget"
              position-strategy="fixed"
            >
              Teleport 到当前演示容器
            </OPopoverContent>
          </OPopover>
        </div>

        <div data-omg-theme="dark" dir="rtl" lang="zh-CN" class="popover-placement-dark">
          <OPopover>
            <OPopoverTrigger as-child>
              <OButton size="sm">局部深色与 RTL</OButton>
            </OPopoverTrigger>
            <OPopoverContent side="top" align="start">
              Teleport 后仍同步局部主题、方向和语言
            </OPopoverContent>
          </OPopover>
        </div>

        <OPopover>
          <OPopoverTrigger as-child>
            <OButton size="sm" variant="outline" tone="neutral">内联浮层</OButton>
          </OPopoverTrigger>
          <OPopoverContent :teleported="false">适合原生 Dialog top layer 内部</OPopoverContent>
        </OPopover>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.popover-placement-example,
.popover-placement-example section,
.popover-placement-modes,
.popover-placement-targets {
  display: grid;
  gap: var(--omg-space-3);
}

.popover-placement-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--omg-space-2);
}

.popover-placement-grid .o-button {
  inline-size: 100%;
}

.popover-placement-label {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
  white-space: nowrap;
}

.popover-placement-targets {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.popover-placement-anchor-line,
.popover-placement-target,
.popover-placement-dark {
  display: flex;
  min-block-size: 72px;
  align-items: center;
  gap: var(--omg-space-2);
  padding: var(--omg-space-3);
  border-radius: var(--omg-radius-md);
  background: var(--omg-color-surface-muted);
}

.popover-placement-target {
  position: relative;
}

.popover-placement-pin {
  display: grid;
  inline-size: var(--omg-control-height-sm);
  block-size: var(--omg-control-height-sm);
  place-items: center;
  border-radius: var(--omg-radius-full);
  background: var(--omg-color-brand-soft);
  color: var(--omg-color-brand-soft-text);
}

.popover-placement-dark {
  background: var(--omg-color-surface);
  color: var(--omg-color-text);
}

@media (width <= 680px) {
  .popover-placement-grid,
  .popover-placement-targets {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
