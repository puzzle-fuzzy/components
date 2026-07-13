<script setup lang="ts">
import { ref } from 'vue'
import { OAlert, OButton } from '@puzzle-fuzzy/ui'
import { LuXCircle } from 'vue-icons-plus/lu'

const longAlertVisible = ref(true)
const darkAlertVisible = ref(true)
</script>

<template>
  <div class="alert-closable">
    <section class="alert-closable-panel" aria-label="Consumer-controlled alert close">
      <div class="alert-closable-heading">
        <strong>受控关闭意图</strong>
        <OButton
          v-if="!longAlertVisible"
          size="sm"
          tone="neutral"
          variant="soft"
          @click="longAlertVisible = true"
        >
          恢复提示
        </OButton>
      </div>
      <OAlert
        v-if="longAlertVisible"
        status="warning"
        title="这是一段需要持续阅读的长提示"
        closable
        close-aria-label="关闭长提示"
        @close="longAlertVisible = false"
      >
        即使容器变窄、标题和正文都很长，操作区域与关闭按钮仍不会覆盖内容。组件只发出 close
        意图，是否移除、稍后恢复或记录偏好由当前示例控制。
        <template #action>
          <OButton size="sm" variant="outline" tone="neutral">了解影响</OButton>
        </template>
      </OAlert>
      <span v-else class="alert-closable-feedback" aria-live="polite">长提示已由使用方移除</span>
    </section>

    <section
      class="alert-closable-panel alert-closable-panel-dark"
      data-omg-theme="dark"
      aria-label="Alert dark theme"
    >
      <div class="alert-closable-heading">
        <strong>深色与自定义关闭图标</strong>
        <OButton
          v-if="!darkAlertVisible"
          size="sm"
          tone="neutral"
          variant="ghost"
          @click="darkAlertVisible = true"
        >
          恢复深色提示
        </OButton>
      </div>
      <OAlert
        v-if="darkAlertVisible"
        status="success"
        title="深色表面仍保持柔和层级"
        description="Alert 不添加外边框，状态由图标、文字与语义表面共同表达。"
        closable
        close-aria-label="关闭深色成功提示"
        @close="darkAlertVisible = false"
      >
        <template #closeIcon><LuXCircle /></template>
      </OAlert>
      <span v-else class="alert-closable-feedback" aria-live="polite">深色提示已关闭</span>
    </section>
  </div>
</template>

<style scoped lang="less">
.alert-closable {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--omg-space-3);
}

.alert-closable-panel {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: var(--omg-space-3);
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
  color: var(--omg-color-text);
}

.alert-closable-panel-dark {
  background: var(--omg-color-surface);
}

.alert-closable-heading {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--omg-space-2);
}

.alert-closable-heading strong,
.alert-closable-feedback {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

@media (width <= 720px) {
  .alert-closable {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
