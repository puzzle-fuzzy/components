<script setup>
import LabelBasic from '../../examples/label/Basic.vue'
import LabelStates from '../../examples/label/States.vue'
</script>

# Label 标签

`OLabel` 为表单控件提供真实 `<label>` 关联。它只负责可访问名称和必填提示，不猜测校验规则，也不会阻止浏览器原生 label 点击行为。

## 基础关联

<DemoBlock label="Label native control association">
  <LabelBasic />
</DemoBlock>

`for` 必须与目标控件的 `id` 一致。点击文字会使用浏览器原生行为把焦点或选择状态交给对应控件。

## 必填与禁用状态

<DemoBlock label="Label required and disabled states">
  <LabelStates />
</DemoBlock>

必填星号设置 `aria-hidden="true"`，因此可见标记不会污染控件的可访问名称。`required` 和 `disabled` 只表达 Label 状态；目标控件仍需显式传入对应原生属性。

## 导入

```ts
import { OLabel, type OLabelProps, type OLabelSlots } from '@puzzle-fuzzy/ui/label'
import '@puzzle-fuzzy/ui/styles.css'
```

## Props

| 名称     | 类型      | 默认值  | 说明                                          |
| -------- | --------- | ------- | --------------------------------------------- |
| for      | `string`  | —       | 关联控件的 `id`，输出为原生 `for`             |
| disabled | `boolean` | `false` | 显示禁用文字与光标，不禁用关联控件            |
| required | `boolean` | `false` | 显示装饰性必填星号，不添加校验或表单 required |

未声明的属性、class、style 与监听器会透传到真实 `<label>`。

## Slots

| 名称      | 说明             |
| --------- | ---------------- |
| `default` | Label 的可见内容 |

## 键盘、ARIA 与原生行为

- Label 本身不创建 Tab 停靠点；键盘焦点由关联控件管理。
- 不要仅依赖必填星号表达规则，复杂要求应在 Field Description 中提供文字说明。
- `disabled` 不调用 `preventDefault`。若控件不可操作，需要同时给控件传入 `disabled`。
- 无可见 Label 的控件必须自行提供 `aria-label` 或 `aria-labelledby`。

## 主题、RTL 与 SSR

组件使用 OMG UI 语义 tokens，不读取 VitePress 变量。间距使用逻辑方向，RTL 下必填标记自然位于文本逻辑结束侧。组件不访问 DOM globals，可直接 SSR；服务端与客户端应保持相同 `for` 和 `id`。

## UI-only 边界

Label 不判断字段是否真的必填、不生成错误、不触发校验，也不持有表单数据。它只输出语义标签与视觉状态。
