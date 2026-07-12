<script setup>
import TabsBasic from '../../examples/tabs/Basic.vue'
</script>

# Tabs 标签页

`OTabs` 提供受控标签切换，支持滑块与底部线条两种动效。方向键、Home 和 End 可在可用标签之间移动。

## 基础用法

<DemoBlock label="Tabs variants">
  <TabsBasic />
</DemoBlock>

## Props

| 名称       | 类型                 | 默认值     | 说明       |
| ---------- | -------------------- | ---------- | ---------- |
| modelValue | `string`             | 必填       | 当前选中值 |
| items      | `OTabsItem[]`        | `[]`       | 标签列表   |
| variant    | `'slider' \| 'line'` | `'slider'` | 视觉样式   |
| ariaLabel  | `string`             | `'Tabs'`   | 可访问名称 |

```ts
interface OTabsItem {
  value: string
  label: string
  disabled?: boolean
}
```

## Events

| 名称                | 说明       |
| ------------------- | ---------- |
| `update:modelValue` | 选中值变化 |
| `change`            | 选中值变化 |
