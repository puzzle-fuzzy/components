<script setup lang="ts">
import { computed, useId } from 'vue'
import { LuBarChart3 } from 'vue-icons-plus/lu'

import { oWidgetProps, type OWidgetSlots } from './widget'

defineOptions({ name: 'OWidget' })

const props = defineProps(oWidgetProps)
defineSlots<OWidgetSlots>()

const instanceId = useId()
const lineGradId = `o-widget-line-fill-${instanceId}`

const linePath = computed(() => {
  const data = props.chartData
  if (!data || data.length < 2) return ''

  const w = 100
  const h = 36
  const pad = 2
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = (w - pad * 2) / (data.length - 1)

  return data
    .map((v, i) => {
      const x = pad + i * step
      const y = h - pad - ((v - min) / range) * (h - pad * 2)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})

const fillPath = computed(() => {
  if (!linePath.value) return ''
  const lastX = 100 - 2
  const lastY = 36 - 2
  const firstX = 2
  const firstY = 36 - 2
  return `${linePath.value} L${lastX},${lastY} L${firstX},${firstY} Z`
})

const chartColumns = computed(() => {
  const data = props.chartData
  if (!data) return []
  // Organize into columns (7 days per row)
  const cols: { x: number; y: number; active: boolean }[] = []
  data.forEach((v, i) => {
    cols.push({
      x: 10 + (i % 7) * 13,
      y: i < 7 ? 14 : 28,
      active: v === 1,
    })
  })
  return cols
})
</script>

<template>
  <div class="o-widget">
    <div class="o-widget__icon">
      <slot name="icon"><LuBarChart3 aria-hidden="true" /></slot>
    </div>

    <div class="o-widget__title">{{ title }}</div>

    <div class="o-widget__value">
      <span class="o-widget__value-number">{{ value }}</span>
      <span v-if="unit" class="o-widget__value-unit">{{ unit }}</span>
    </div>

    <div class="o-widget__chart">
      <slot name="chart">
        <!-- Mini line chart -->
        <svg
          v-if="chartType === 'line' && chartData.length >= 2"
          class="o-widget__chart-svg o-widget__chart-svg--line"
          viewBox="0 0 100 36"
          aria-hidden="true"
        >
          <defs>
            <linearGradient :id="lineGradId" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="currentColor" stop-opacity="0.25" />
              <stop offset="1" stop-color="currentColor" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path
            :d="linePath"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path :d="fillPath" :fill="`url(#${lineGradId})`" />
        </svg>

        <!-- Activity dot chart -->
        <svg
          v-if="chartType === 'activity' && chartData.length > 0"
          class="o-widget__chart-svg o-widget__chart-svg--activity"
          viewBox="0 0 96 40"
          aria-hidden="true"
        >
          <g
            v-for="(col, i) in chartColumns"
            :key="i"
          >
            <circle
              :cx="col.x"
              :cy="col.y"
              r="4"
              :fill="col.active ? 'currentColor' : 'none'"
              :stroke="col.active ? 'none' : 'currentColor'"
              :stroke-opacity="col.active ? 0 : 0.25"
              stroke-width="1.5"
            />
          </g>
        </svg>
      </slot>
    </div>
  </div>
</template>
