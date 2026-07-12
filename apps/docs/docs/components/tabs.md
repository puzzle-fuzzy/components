<script setup>
import TabsBasic from '../../examples/tabs/Basic.vue'
</script>

# Tabs 标签页

`OTabs` 提供受控标签切换，支持**滑块滑动指示器**与**底部线条**两种视觉样式。切换标签时，选中指示器会平滑滑动到目标位置。方向键、Home 和 End 会在可用标签之间自动选择并移动焦点；无效或禁用的当前值会回退到首个可用标签。

## 演示

<DemoBlock label="Tabs demos">
  <TabsBasic />
</DemoBlock>

示例涵盖了：
- **slider 变体**：默认样式，滑块以圆角 pill 形态滑动
- **line 变体**：底部细线条滑动指示器
- **fill 占满模式**：标签平分容器宽度，支持与 slider / line 组合
- **禁用项**：`disabled: true` 的标签不可选、不可聚焦，自动跳过

## 使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { OTabs, type OTabsItem } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'

const selected = ref('tab1')

const items: OTabsItem[] = [
  { value: 'tab1', label: '标签一' },
  { value: 'tab2', label: '标签二' },
  { value: 'tab3', label: '标签三', disabled: true },
]
</script>

<template>
  <OTabs v-model="selected" :items="items" variant="slider" :fill="true">
    <template #default="{ item }">
      <p>{{ item.label }} 的内容</p>
    </template>
  </OTabs>
</template>
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `string` | 必填 | 当前选中值 |
| items | `OTabsItem[]` | `[]` | 标签列表 |
| variant | `'slider' \| 'line'` | `'slider'` | 视觉样式 |
| fill | `boolean` | `false` | 是否占满父容器宽度，标签平分空间 |
| ariaLabel | `string` | `'Tabs'` | 可访问名称 |

```ts
interface OTabsItem {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}
```

## 特性

### 滑块动画

两种变体均带有平滑滑动动画：

- **slider**（默认）：选中指示器为圆角 pill 形态，带有背景、边框和阴影，在标签间平滑滑动
- **line**：选中指示器为底部 2px 品牌色线条，从左到右滑动

动画遵循 `prefers-reduced-motion` 媒体查询，用户开启减少动效时自动停用。

### fill 占满模式

设置 `:fill="true"` 后，组件宽度占满父容器，所有标签平分可用宽度。可以与 `slider` 和 `line` 变体自由组合，适用于空间充裕的布局。

### 键盘导航

| 按键 | 行为 |
| --- | --- |
| ← / → | 在可用标签间循环切换 |
| Home | 跳转到首个标签 |
| End | 跳转到最后一个标签 |

禁用项会被跳过。选中的同时会自动移动焦点。

## Events

| 名称 | 说明 |
| --- | --- |
| `update:modelValue` | 选中值变化 |
| `change` | 选中值变化 |

## Slots

| 名称 | Slot Props | 说明 |
| --- | --- | --- |
| `default` | `{ item: OTabsItem, selected: boolean }` | 为每个标签渲染关联的可访问 `tabpanel` |

未提供默认 slot 时，组件只渲染标签列表；提供 slot 后，每个 tab 会通过稳定 ID 与对应 panel 建立 `aria-controls` / `aria-labelledby` 关联。

## 可访问性

- `role="tablist"`、`role="tab"`、`role="tabpanel"` 完整 ARIA 模式
- `aria-selected`、`aria-disabled`、`aria-controls`、`aria-labelledby` 关联
- roving tabindex 键盘导航
