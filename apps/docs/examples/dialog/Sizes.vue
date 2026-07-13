<script setup lang="ts">
import { ref } from 'vue'
import { OButton, ODialog } from '@puzzle-fuzzy/ui'
import { LuExpand, LuMaximize2, LuRectangleHorizontal } from 'vue-icons-plus/lu'

const compactOpen = ref(false)
const wideOpen = ref(false)
const fullscreenOpen = ref(false)
</script>

<template>
  <div class="omg-dialog-size-actions">
    <OButton size="sm" variant="soft" @click="compactOpen = true">
      <template #icon><LuRectangleHorizontal aria-hidden="true" /></template>
      打开紧凑弹窗
    </OButton>
    <OButton size="sm" variant="outline" tone="neutral" @click="wideOpen = true">
      <template #icon><LuExpand aria-hidden="true" /></template>
      打开宽内容弹窗
    </OButton>
    <OButton size="sm" variant="ghost" tone="neutral" @click="fullscreenOpen = true">
      <template #icon><LuMaximize2 aria-hidden="true" /></template>
      打开全屏弹窗
    </OButton>

    <ODialog
      v-model:open="compactOpen"
      :width="360"
      title="紧凑提示"
      description="数字宽度会被规范化为整数像素。"
      close-aria-label="关闭紧凑提示弹窗"
    >
      360px 适合短提示、快速选择和少量说明。
      <template #footer="{ close }">
        <OButton @click="close">知道了</OButton>
      </template>
    </ODialog>

    <ODialog
      v-model:open="wideOpen"
      width="min(92vw, 44rem)"
      title="宽内容画布"
      description="CSS 长度和函数表达式会原样应用。"
      close-aria-label="关闭宽内容画布弹窗"
    >
      <div class="omg-dialog-size-columns">
        <section>
          <span>主区域</span>
          <strong>min(92vw, 44rem)</strong>
        </section>
        <section>
          <span>视口保护</span>
          <strong>始终保留安全留白</strong>
        </section>
      </div>
      <template #footer="{ close }">
        <OButton @click="close">关闭宽内容</OButton>
      </template>
    </ODialog>

    <ODialog
      v-model:open="fullscreenOpen"
      fullscreen
      title="全屏工作面"
      description="fullscreen 会覆盖 width，并使用完整动态视口。"
      close-aria-label="关闭全屏工作面弹窗"
    >
      <div class="omg-dialog-size-fullscreen">
        <LuMaximize2 aria-hidden="true" />
        <strong>完整动态视口</strong>
        <span>适合需要更大阅读范围的纯 UI 内容。</span>
      </div>
      <template #footer="{ close }">
        <OButton @click="close">退出全屏</OButton>
      </template>
    </ODialog>
  </div>
</template>

<style scoped>
.omg-dialog-size-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--omg-space-2);
}

.omg-dialog-size-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--omg-space-3);
}

.omg-dialog-size-columns section,
.omg-dialog-size-fullscreen {
  display: grid;
  gap: var(--omg-space-2);
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-md);
  background: var(--omg-color-surface-muted);
}

.omg-dialog-size-columns span,
.omg-dialog-size-fullscreen span {
  color: var(--omg-color-text-muted);
}

.omg-dialog-size-fullscreen {
  min-height: 40dvh;
  place-content: center;
  justify-items: center;
  text-align: center;
}

.omg-dialog-size-fullscreen > svg {
  width: 28px;
  height: 28px;
  color: var(--omg-color-brand);
}

@media (width <= 520px) {
  .omg-dialog-size-columns {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
