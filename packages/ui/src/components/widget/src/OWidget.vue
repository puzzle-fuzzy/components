<script setup lang="ts">
import { computed, useId } from 'vue'
import { LuBarChart3 } from 'vue-icons-plus/lu'

import { oWidgetProps, type OWidgetSlots } from './widget'

defineOptions({ name: 'OWidget' })

const props = defineProps(oWidgetProps)
defineSlots<OWidgetSlots>()

const instanceId = useId()
const lineGradId = `o-widget-line-fill-${instanceId}`
const lineChartData = computed(() => props.chartData.filter(Number.isFinite))
const resolvedChartAriaLabel = computed(() => props.chartAriaLabel?.trim() || undefined)

const linePath = computed(() => {
  const data = lineChartData.value
  if (data.length < 2) return ''

  const w = 100
  const h = 36
  const pad = 2
  let min = data[0] ?? 0
  let max = min

  for (const value of data) {
    if (value < min) min = value
    if (value > max) max = value
  }

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

const activityPoints = computed(() =>
  props.chartData.slice(0, 14).map((value, index) => ({
    x: 10 + (index % 7) * 13,
    y: index < 7 ? 14 : 28,
    active: value === 1,
  })),
)
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
          v-if="chartType === 'line' && lineChartData.length >= 2"
          class="o-widget__chart-svg o-widget__chart-svg--line"
          viewBox="0 0 100 36"
          data-omg-visualization="line"
          :role="resolvedChartAriaLabel ? 'img' : undefined"
          :aria-label="resolvedChartAriaLabel"
          :aria-hidden="resolvedChartAriaLabel ? undefined : true"
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
          v-if="chartType === 'activity' && activityPoints.length > 0"
          class="o-widget__chart-svg o-widget__chart-svg--activity"
          viewBox="0 0 96 40"
          data-omg-visualization="activity"
          :role="resolvedChartAriaLabel ? 'img' : undefined"
          :aria-label="resolvedChartAriaLabel"
          :aria-hidden="resolvedChartAriaLabel ? undefined : true"
        >
          <g v-for="(point, index) in activityPoints" :key="index">
            <circle
              :cx="point.x"
              :cy="point.y"
              r="4"
              :fill="point.active ? 'currentColor' : 'none'"
              :stroke="point.active ? 'none' : 'currentColor'"
              :stroke-opacity="point.active ? 0 : 0.25"
              stroke-width="1.5"
            />
          </g>
        </svg>
      </slot>
    </div>
  </div>
</template>
