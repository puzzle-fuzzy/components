<script setup>
import TextareaBasic from '../../examples/textarea/Basic.vue'
</script>

# Textarea 多行输入

`OTextarea` 是基础多行文本输入，支持受控值、字数统计、禁用、只读和错误状态。

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
