<script setup lang="ts">
import { OButton, OSpinner } from '@puzzle-fuzzy/ui'
</script>

<template>
  <div class="spinner-contexts">
    <OButton disabled>
      <template #icon><OSpinner decorative size="sm" /></template>
      正在保存
    </OButton>
    <div class="spinner-contexts-status">
      <OSpinner label="正在加载个人组件" />
      <span>独立 Spinner 会作为状态被辅助技术识别。</span>
    </div>
    <section class="spinner-contexts-dark" data-omg-theme="dark" aria-label="Spinner dark theme">
      <OSpinner label="深色主题加载中" size="lg" />
      <span>颜色继承当前文本。</span>
    </section>
  </div>
</template>

<style scoped lang="less">
.spinner-contexts,
.spinner-contexts-status,
.spinner-contexts-dark {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--omg-space-3);
}

.spinner-contexts-status,
.spinner-contexts-dark {
  padding: var(--omg-space-3);
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
  color: var(--omg-color-text-muted);
}
</style>
