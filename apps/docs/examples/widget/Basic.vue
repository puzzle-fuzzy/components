<script setup lang="ts">
import { OWidget } from '@puzzle-fuzzy/ui'
import { LuWallet, LuCoins, LuFlame, LuFootprints, LuTarget, LuCheckCheck } from 'vue-icons-plus/lu'

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
      chart-aria-label="近 7 天花费趋势"
    >
      <template #icon><LuWallet aria-hidden="true" :size="18" /></template>
    </OWidget>

    <OWidget
      title="收入"
      value="60"
      unit="元"
      chart-type="line"
      :chart-data="incomeData"
      chart-aria-label="近 7 天收入趋势"
    >
      <template #icon><LuCoins aria-hidden="true" :size="18" /></template>
    </OWidget>

    <OWidget
      title="活跃程度"
      value="8"
      unit="天"
      chart-type="activity"
      :chart-data="activityData"
      chart-aria-label="最近两周活跃记录"
    >
      <template #icon><LuFlame aria-hidden="true" :size="18" /></template>
    </OWidget>

    <OWidget
      title="步数"
      value="8.9"
      unit="k"
      chart-type="line"
      :chart-data="stepsData"
      chart-aria-label="近 7 天步数趋势"
    >
      <template #icon><LuFootprints aria-hidden="true" :size="18" /></template>
    </OWidget>

    <OWidget
      title="专注"
      value="5"
      unit="天"
      chart-type="activity"
      :chart-data="focusData"
      chart-aria-label="最近一周专注记录"
    >
      <template #icon><LuTarget aria-hidden="true" :size="18" /></template>
    </OWidget>

    <OWidget
      title="完成任务"
      value="8"
      unit="个"
      chart-type="line"
      :chart-data="tasksData"
      chart-aria-label="近 7 天任务完成趋势"
    >
      <template #icon><LuCheckCheck aria-hidden="true" :size="18" /></template>
    </OWidget>
  </div>
</template>

<style scoped>
.omg-widget-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: flex-start;
}
</style>
