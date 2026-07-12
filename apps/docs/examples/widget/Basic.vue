<script setup lang="ts">
import { OWidget } from '@puzzle-fuzzy/ui'

const spendingData = [42, 58, 45, 72, 60, 85, 78]
const incomeData = [20, 35, 28, 45, 52, 38, 60]
const activityData = [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1]
const stepsData = [3200, 5800, 4100, 7200, 6500, 8900, 7800]
const focusData = [1, 0, 1, 1, 1, 0, 1]
const tasksData = [3, 5, 2, 7, 4, 6, 8]
</script>

<template>
  <div class="omg-widget-grid">
    <!-- Spending -->
    <OWidget
      title="花费"
      value="85"
      unit="元"
      icon="💳"
      chart-type="line"
      :chart-data="spendingData"
    />

    <!-- Income -->
    <OWidget
      title="收入"
      value="60"
      unit="元"
      icon="💰"
      chart-type="line"
      :chart-data="incomeData"
    />

    <!-- Activity -->
    <OWidget
      title="活跃程度"
      value="8"
      unit="天"
      icon="🔥"
      chart-type="activity"
      :chart-data="activityData"
    />

    <!-- Steps -->
    <OWidget
      title="步数"
      value="8.9"
      unit="k"
      icon="🏃"
      chart-type="line"
      :chart-data="stepsData"
    />

    <!-- Focus days -->
    <OWidget
      title="专注"
      value="5"
      unit="天"
      icon="🎯"
      chart-type="activity"
      :chart-data="focusData"
    />

    <!-- Tasks -->
    <OWidget
      title="完成任务"
      value="8"
      unit="个"
      icon="✅"
      chart-type="line"
      :chart-data="tasksData"
    />
  </div>
</template>

<style scoped>
.omg-widget-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: flex-start;
}
</style>
