<script setup lang="ts">
import { OWidget } from '@puzzle-fuzzy/ui'
import {
  LuWallet,
  LuCoins,
  LuFlame,
  LuFootprints,
  LuTarget,
  LuCheckCheck,
} from 'vue-icons-plus/lu'

const spendingData = [42, 58, 45, 72, 60, 85, 78]
const incomeData = [20, 35, 28, 45, 52, 38, 60]
const activityData = [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1]
const stepsData = [3200, 5800, 4100, 7200, 6500, 8900, 7800]
const focusData = [1, 0, 1, 1, 1, 0, 1]
const tasksData = [3, 5, 2, 7, 4, 6, 8]
</script>

<template>
  <div class="omg-widget-grid">
    <OWidget
      title="花费"
      value="85"
      unit="元"
      chart-type="line"
      :chart-data="spendingData"
    >
      <template #icon><LuWallet aria-hidden="true" /></template>
    </OWidget>

    <OWidget
      title="收入"
      value="60"
      unit="元"
      chart-type="line"
      :chart-data="incomeData"
    >
      <template #icon><LuCoins aria-hidden="true" /></template>
    </OWidget>

    <OWidget
      title="活跃程度"
      value="8"
      unit="天"
      chart-type="activity"
      :chart-data="activityData"
    >
      <template #icon><LuFlame aria-hidden="true" /></template>
    </OWidget>

    <OWidget
      title="步数"
      value="8.9"
      unit="k"
      chart-type="line"
      :chart-data="stepsData"
    >
      <template #icon><LuFootprints aria-hidden="true" /></template>
    </OWidget>

    <OWidget
      title="专注"
      value="5"
      unit="天"
      chart-type="activity"
      :chart-data="focusData"
    >
      <template #icon><LuTarget aria-hidden="true" /></template>
    </OWidget>

    <OWidget
      title="完成任务"
      value="8"
      unit="个"
      chart-type="line"
      :chart-data="tasksData"
    >
      <template #icon><LuCheckCheck aria-hidden="true" /></template>
    </OWidget>
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
