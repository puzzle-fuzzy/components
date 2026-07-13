<script setup lang="ts">
import { OSpinner } from '@puzzle-fuzzy/ui'
</script>

<template>
  <div class="spinner-basic">
    <span><OSpinner size="sm" label="正在同步小型任务" /> Small</span>
    <span><OSpinner label="正在同步默认任务" /> Medium</span>
    <span><OSpinner size="lg" label="正在同步大型任务" /> Large</span>
  </div>
</template>

<style scoped lang="less">
.spinner-basic {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--omg-space-5);
}

.spinner-basic > span {
  display: inline-flex;
  align-items: center;
  gap: var(--omg-space-2);
  color: var(--omg-color-text-muted);
}
</style>
