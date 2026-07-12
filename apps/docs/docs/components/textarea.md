<script setup>
import TextareaBasic from '../../examples/textarea/Basic.vue'
</script>

# Textarea 多行输入

`OTextarea` 是基础多行文本输入，支持受控值、字数统计、禁用、只读和错误状态。组件会把未声明的原生 textarea 属性与监听器绑定到真实的 `<textarea>`，可以直接使用 `id`、`name`、`required`、`aria-describedby`、`@change` 等原生能力。

## 基础用法

<DemoBlock label="Textarea basic">
  <TextareaBasic />
</DemoBlock>

## Props

| 名称        | 类型                                             | 默认值       | 说明         |
| ----------- | ------------------------------------------------ | ------------ | ------------ |
| modelValue  | `string`                                         | `''`         | 当前值       |
| placeholder | `string`                                         | —            | 占位文本     |
| rows        | `number`                                         | `4`          | 行数         |
| maxlength   | `number`                                         | —            | 最大长度     |
| resize      | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | 调整尺寸方向 |
| showCount   | `boolean`                                        | `false`      | 显示字数统计 |
| disabled    | `boolean`                                        | `false`      | 禁用         |
| readonly    | `boolean`                                        | `false`      | 只读         |
| invalid     | `boolean`                                        | `false`      | 错误状态     |
| ariaLabel   | `string`                                         | —            | 可访问名称   |

## Events

| 名称                | 说明     |
| ------------------- | -------- |
| `update:modelValue` | 值变化   |
| `focus`             | 获得焦点 |
| `blur`              | 失去焦点 |

## 可访问性

- 推荐使用原生 `<label for="...">` 与传入组件的 `id` 建立可访问名称。
- 开启 `showCount` 后，组件会使用 SSR-safe ID 自动把计数器合并到 textarea 的 `aria-describedby`，不会覆盖已有的帮助文本关联。
- `invalid` 会设置 `aria-invalid="true"`；具体错误文案应由表单层提供，并通过 `aria-describedby` 或 `aria-errormessage` 关联。
- `maxlength` 与计数器均遵循原生 textarea 的 UTF-16 code-unit 长度语义。
