<script setup lang="ts">
import { OProgress } from '@puzzle-fuzzy/ui'

const statuses = [
  { value: 'normal', label: '普通' },
  { value: 'success', label: '成功' },
  { value: 'warning', label: '警告' },
  { value: 'error', label: '错误' },
] as const
</script>

<template>
  <div class="progress-states">
    <section class="progress-states-panel" aria-labelledby="progress-status-heading">
      <strong id="progress-status-heading">显式状态</strong>
      <div v-for="status in statuses" :key="status.value" class="progress-states-item">
        <span>{{ status.label }}</span>
        <OProgress
          :value="status.value === 'normal' ? 100 : 72"
          :status="status.value"
          show-label
        />
      </div>
    </section>

    <section class="progress-states-panel" aria-labelledby="progress-indeterminate-heading">
      <strong id="progress-indeterminate-heading">不确定进度</strong>
      <OProgress show-label label="正在同步" status="normal" />
    </section>

    <section
      class="progress-states-panel progress-states-panel-dark"
      data-omg-theme="dark"
      aria-labelledby="progress-dark-heading"
    >
      <strong id="progress-dark-heading">Dark container</strong>
      <OProgress :value="58" status="warning" show-label aria-label="深色主题构建进度" />
      <OProgress status="success" aria-label="深色主题处理中" />
    </section>

    <section
      class="progress-states-panel progress-states-panel-rtl"
      dir="rtl"
      aria-labelledby="progress-rtl-heading"
    >
      <strong id="progress-rtl-heading">RTL / 从逻辑起点填充</strong>
      <OProgress :value="64" show-label />
      <OProgress label="RTL 同步中" show-label status="warning" />
    </section>
  </div>
</template>

<style scoped lang="less">
.progress-states {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--omg-space-3);
}

.progress-states-panel {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: var(--omg-space-3);
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
  color: var(--omg-color-text);
}

.progress-states-panel > strong,
.progress-states-item > span {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.progress-states-item {
  display: grid;
  min-width: 0;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: center;
  gap: var(--omg-space-2);
}

.progress-states-panel-dark {
  background: var(--omg-color-surface);
}

@media (width <= 640px) {
  .progress-states {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
