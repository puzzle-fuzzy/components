<script setup>
import CheckboxBasic from '../../examples/checkbox/Basic.vue'
</script>

# Checkbox 复选框

`OCheckbox` 使用真实的原生 checkbox，并以 `LuCheck`、`LuMinus` 镜像选中与 mixed 状态。它只请求更新布尔值，不维护第二份公开选择状态。

## 基础用法

<DemoBlock label="Checkbox controlled states">
  <CheckboxBasic />
</DemoBlock>

## 导入

```ts
import { OCheckbox } from '@puzzle-fuzzy/ui'
// 或 import { OCheckbox } from '@puzzle-fuzzy/ui/checkbox'
import '@puzzle-fuzzy/ui/styles.css'
```

## Props

| 名称          | 类型      | 默认值  | 说明                                        |
| ------------- | --------- | ------- | ------------------------------------------- |
| modelValue    | `boolean` | `false` | 当前受控选中值                              |
| label         | `string`  | —       | 可见标签，也可以使用默认 slot               |
| indeterminate | `boolean` | `false` | 同步原生 `indeterminate` 和 mixed ARIA 状态 |
| disabled      | `boolean` | `false` | 原生禁用                                    |
| readonly      | `boolean` | `false` | 保持可聚焦但阻止用户修改                    |
| invalid       | `boolean` | `false` | 设置错误视觉状态与 `aria-invalid`           |

未声明的原生属性和监听器会绑定到 `<input type="checkbox">`。传入 `id` 时可用于外部帮助文本；省略 `id` 时组件使用 SSR-safe ID 连接输入与可见 label。

## Events

| 名称                | 参数                             | 说明               |
| ------------------- | -------------------------------- | ------------------ |
| `update:modelValue` | `(value: boolean)`               | 请求更新选中值     |
| `change`            | `(value: boolean, event: Event)` | 原生 change 后发出 |

## Slots

| 名称      | 说明               |
| --------- | ------------------ |
| `default` | 自定义可见标签内容 |

## Mixed 与只读

`indeterminate` 是视觉与语义状态，不代表第三种提交值。用户操作仍发出布尔值，是否结束 mixed 状态由父级数据决定。原生 checkbox 没有 `readonly` 属性，因此组件用 `aria-readonly="true"` 表达状态并阻止指针、空格键改变值。

勾选和减号图标均来自 `vue-icons-plus/lu`，真实 input 继续拥有 Space 键、表单提交、required 和辅助技术语义。
