<script setup>
import WidgetBasic from '../../examples/widget/Basic.vue'
</script>

# Widget 小组件

`OWidget` 是一款微型数据卡片组件，固定 200×160px，圆角 30px。适合在仪表盘或概览页中快速展示关键指标。

每个卡片分为四个象限：图标、名称、数值（含单位）、迷你图表。

## 演示

<DemoBlock label="Widget demos">
  <WidgetBasic />
</DemoBlock>

示例涵盖了：
- **花费**（💰） — 折线图展示近 7 天花费趋势
- **收入**（💰） — 折线图展示近 7 天收入趋势
- **活跃程度**（🔥） — 点阵图展示两周活跃天数
- **步数**（🏃） — 折线图展示近 7 天步数
- **专注**（🎯） — 点阵图展示本周专注天数
- **完成任务**（✅） — 折线图展示完成任务量

## 使用

```vue
<script setup lang="ts">
import { OWidget } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
</script>

<template>
  <OWidget
    title="花费"
    value="85"
    unit="元"
    icon="💳"
    chart-type="line"
    :chart-data="[42, 58, 45, 72, 60, 85, 78]"
  />
</template>
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| title | `string` | 必填 | 卡片名称（右上角） |
| value | `string \| number` | 必填 | 数据值（左下角大字） |
| unit | `string` | — | 数值单位，字体比数值小（左下角） |
| icon | `string` | `'📊'` | 图标 emoji（左上角），可通过 slot 自定义 |
| chartType | `'line' \| 'activity'` | `'line'` | 迷你图表类型 |
| chartData | `number[]` | `[]` | 图表数据 |

### chartType 说明

- **`line`** — 折线图。`chartData` 为数值数组（如每日花费），至少 2 个数据点。自动适配数值范围，无坐标轴。

- **`activity`** — 活动点阵图。`chartData` 为 0/1 数组（1 为活跃、0 为不活跃）。每 7 个值为一行，支持一或两周。适合展示打卡、活跃天数等。

## Slots

| 名称 | 说明 |
| --- | --- |
| `icon` | 自定义图标，替代默认 emoji |
| `chart` | 自定义图表，替代默认的迷你折线图或点阵图 |

## 示例

### 自定义图标 + 自定义图表

```vue
<OWidget
  title="访问量"
  value="12.3k"
  unit="次"
  chart-type="line"
  :chart-data="[2.1, 3.5, 2.8, 4.2, 5.1, 3.8, 6.0]"
>
  <template #icon>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-8 4 4 4-6" />
    </svg>
  </template>
</OWidget>
```
