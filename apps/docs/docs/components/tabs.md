<script setup>
import TabsBasic from '../../examples/tabs/Basic.vue'
</script>

# Tabs 标签页

`OTabs` 提供受控标签切换，支持滑块与底部线条两种视觉样式。方向键、Home 和 End 会在可用标签之间自动选择并移动焦点；无效或禁用的当前值会回退到首个可用标签。

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
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}
```

## Events

| 名称                | 说明       |
| ------------------- | ---------- |
| `update:modelValue` | 选中值变化 |
| `change`            | 选中值变化 |

## Slots

| 名称      | Slot Props                               | 说明                                  |
| --------- | ---------------------------------------- | ------------------------------------- |
| `default` | `{ item: OTabsItem, selected: boolean }` | 为每个标签渲染关联的可访问 `tabpanel` |

未提供默认 slot 时，组件只渲染标签列表；提供 slot 后，每个 tab 会通过稳定 ID 与对应 panel 建立 `aria-controls` / `aria-labelledby` 关联。
