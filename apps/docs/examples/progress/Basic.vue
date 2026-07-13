<script setup lang="ts">
import { OProgress } from '@puzzle-fuzzy/ui'

const values = [0, 24, 68, 100] as const
</script>

<template>
  <div class="progress-basic">
    <section class="progress-basic-group" aria-labelledby="progress-values-heading">
      <strong id="progress-values-heading">确定进度与默认可访问名称</strong>
      <div v-for="value in values" :key="value" class="progress-basic-item">
        <span>输入 {{ value }}</span>
        <OProgress :value="value" show-label />
      </div>
    </section>

    <section class="progress-basic-group" aria-labelledby="progress-clamp-heading">
      <strong id="progress-clamp-heading">边界钳制</strong>
      <div class="progress-basic-item">
        <span>输入 -20 → 渲染 0</span>
        <OProgress :value="-20" show-label />
      </div>
      <div class="progress-basic-item">
        <span>输入 140 → 渲染 100</span>
        <OProgress :value="140" show-label />
      </div>
    </section>

    <section class="progress-basic-group" aria-labelledby="progress-label-heading">
      <strong id="progress-label-heading">尺寸与自定义名称</strong>
      <div class="progress-basic-item">
        <span>Small / label prop</span>
        <OProgress :value="42" size="sm" show-label label="同步进度" />
      </div>
      <div class="progress-basic-item">
        <span>Medium / label slot</span>
        <OProgress :value="73" show-label aria-label="文件导入进度">
          <template #label="{ value }">已导入 {{ Math.round(value ?? 0) }}%</template>
        </OProgress>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.progress-basic,
.progress-basic-group {
  display: grid;
  width: 100%;
  min-width: 0;
  gap: var(--omg-space-4);
}

.progress-basic-group > strong,
.progress-basic-item > span {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.progress-basic-item {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(116px, 0.35fr) minmax(180px, 1fr);
  align-items: center;
  gap: var(--omg-space-3);
}

@media (width <= 560px) {
  .progress-basic-item {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
