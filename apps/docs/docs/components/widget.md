<script setup>
import WidgetBasic from '../../examples/widget/Basic.vue'
</script>

# Widget 小组件

`OWidget` 是一款具有个人风格的微型数据卡片，固定 `160 × 130px`，使用 35px 大圆角和无外框磨砂表面。适合在仪表盘或概览页中紧凑展示关键指标。

每个卡片分为四个象限：图标、名称、数值（含单位）、迷你图表。

## 演示

<DemoBlock label="Widget demos">
  <WidgetBasic />
</DemoBlock>

示例涵盖了：

- **花费**：折线图展示近 7 天花费趋势
- **收入**：折线图展示近 7 天收入趋势
- **活跃程度**：点阵图展示两周活跃天数
- **步数**：折线图展示近 7 天步数
- **专注**：点阵图展示本周专注天数
- **完成任务**：折线图展示完成任务量

## 使用

```vue
<script setup lang="ts">
import { OWidget } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
import { LuWallet } from 'vue-icons-plus/lu'
</script>

<template>
  <OWidget
    title="花费"
    value="85"
    unit="元"
    chart-type="line"
    :chart-data="[42, 58, 45, 72, 60, 85, 78]"
    chart-aria-label="近 7 天花费趋势"
  >
    <template #icon><LuWallet aria-hidden="true" /></template>
  </OWidget>
</template>
```

## Props

| 名称           | 类型                   | 默认值   | 说明                     |
| -------------- | ---------------------- | -------- | ------------------------ |
| title          | `string`               | 必填     | 卡片名称（右上角）       |
| value          | `string \| number`     | 必填     | 数据值（左下角大字）     |
| unit           | `string`               | —        | 数值单位，字体比数值小   |
| chartType      | `'line' \| 'activity'` | `'line'` | 迷你图表类型             |
| chartData      | `readonly number[]`    | `[]`     | 图表数据，不会被组件修改 |
| chartAriaLabel | `string`               | —        | 默认图表的独立可访问名称 |

### chartType 说明

- **`line`**：折线图。至少需要 2 个有限数值；非有限值会被忽略。组件自动适配数值范围，不显示坐标轴。

- **`activity`**：活动点阵图。`chartData` 使用 0/1 数组（1 为活跃，0 为不活跃），每 7 个值为一行，最多展示两周共 14 个值。

## Slots

| 名称    | 说明                                     |
| ------- | ---------------------------------------- |
| `icon`  | 自定义图标（左上角），默认显示柱状图图标 |
| `chart` | 自定义图表，替代默认的迷你折线图或点阵图 |

## 示例

### 自定义图标

图标通过 `#icon` 插槽传入，统一从 `vue-icons-plus/lu` 直接导入：

```vue
<script setup lang="ts">
import { LuTrendingUp } from 'vue-icons-plus/lu'
</script>

<template>
  <OWidget
    title="访问量"
    value="12.3k"
    unit="次"
    chart-type="line"
    :chart-data="[2.1, 3.5, 2.8, 4.2, 5.1, 3.8, 6.0]"
    chart-aria-label="最近 7 天访问量趋势"
  >
    <template #icon><LuTrendingUp aria-hidden="true" /></template>
  </OWidget>
</template>
```

## 可访问性

标题和数值始终作为普通文本进入可访问树。默认迷你图表在未提供 `chartAriaLabel` 时作为装饰隐藏；图表本身传达额外趋势时，应提供明确名称。自定义 `#chart` slot 的语义由使用方负责。

## 视觉边界

Widget 通过半透明表面、20px 背景模糊和柔光层表达层级，不增加卡片外框。圆形图标容器使用安静的色调背景而不是描边，保留构图同时减少视觉噪声。
