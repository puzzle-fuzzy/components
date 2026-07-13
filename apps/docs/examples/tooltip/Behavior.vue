<script setup lang="ts">
import { ref } from 'vue'
import { OButton, OTooltip } from '@puzzle-fuzzy/ui'
import { LuBell, LuSettings } from 'vue-icons-plus/lu'

const controlledOpen = ref(false)
</script>

<template>
  <div class="tooltip-behavior">
    <section class="tooltip-behavior-panel" aria-label="Controlled tooltip">
      <strong>受控 open</strong>
      <p>外部按钮与 trigger 的悬停、焦点请求共同驱动同一个值。</p>
      <div class="tooltip-behavior-actions">
        <OTooltip
          :open="controlledOpen"
          content="这是由使用方接受的受控提示"
          :show-delay="0"
          @update:open="controlledOpen = $event"
        >
          <OButton icon-only tone="neutral" variant="outline" aria-label="受控提示触发器">
            <template #icon><LuSettings /></template>
            受控提示触发器
          </OButton>
        </OTooltip>
        <OButton size="sm" variant="soft" @click="controlledOpen = !controlledOpen">
          {{ controlledOpen ? '关闭提示' : '打开提示' }}
        </OButton>
      </div>
    </section>

    <section class="tooltip-behavior-panel" aria-label="Delayed tooltip">
      <strong>延时与 Escape</strong>
      <p>悬停等待 800ms，离开等待 300ms；键盘聚焦立即显示，Escape 立即关闭。</p>
      <OTooltip content="延时提示" :show-delay="800" :hide-delay="300">
        <OButton variant="soft" tone="neutral">检查延时</OButton>
      </OTooltip>
    </section>

    <section
      class="tooltip-behavior-panel tooltip-behavior-panel-compact"
      data-omg-theme="dark"
      dir="rtl"
      lang="zh-CN"
      aria-label="Tooltip dark compact viewport"
    >
      <strong>深色 · RTL · 紧凑容器</strong>
      <p>默认 Teleport 会同步局部主题、排版、语言与方向；视口不足时自动 flip / shift。</p>
      <div class="tooltip-behavior-edge">
        <OTooltip placement="right-end" :show-delay="0">
          <OButton icon-only aria-label="查看边缘提示">
            <template #icon><LuBell /></template>
            查看边缘提示
          </OButton>
          <template #content>
            深色长提示会保持在视口内；系统启用 reduced motion 时不再平移动画。
          </template>
        </OTooltip>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.tooltip-behavior {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--omg-space-3);
}

.tooltip-behavior-panel {
  display: grid;
  min-width: 0;
  min-height: 168px;
  align-content: start;
  justify-items: start;
  gap: var(--omg-space-3);
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
  color: var(--omg-color-text);
}

.tooltip-behavior-panel strong,
.tooltip-behavior-panel p {
  margin: 0;
}

.tooltip-behavior-panel p {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.tooltip-behavior-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--omg-space-2);
}

.tooltip-behavior-panel-compact {
  inline-size: min(100%, 224px);
  justify-self: end;
  background: var(--omg-color-surface);
}

.tooltip-behavior-edge {
  display: flex;
  width: 100%;
  justify-content: flex-end;
}

@media (width <= 760px) {
  .tooltip-behavior {
    grid-template-columns: minmax(0, 1fr);
  }

  .tooltip-behavior-panel-compact {
    justify-self: start;
  }
}
</style>
