<script setup>
import ReferenceTextareaBasic from '../../examples/reference-textarea/Basic.vue'
</script>

# Reference Textarea 引用输入

`OReferenceTextarea` 在普通 textarea 之上解析约定格式，并在输入区下方展示成员 chip 与图片缩略图。

当前支持：

- `@[Yxswy](member:yxswy)` 渲染成员引用
- `![界面截图](image:https://example.com/a.png)` 渲染图片缩略图

## 基础用法

<DemoBlock label="Reference textarea">
  <ReferenceTextareaBasic />
</DemoBlock>

## Props

| 名称        | 类型      | 默认值  | 说明         |
| ----------- | --------- | ------- | ------------ |
| modelValue  | `string`  | `''`    | 当前文本     |
| placeholder | `string`  | —       | 占位文本     |
| rows        | `number`  | `4`     | 行数         |
| maxlength   | `number`  | —       | 最大长度     |
| showCount   | `boolean` | `false` | 显示字数统计 |
| disabled    | `boolean` | `false` | 禁用         |
| readonly    | `boolean` | `false` | 只读         |
| invalid     | `boolean` | `false` | 错误状态     |
| ariaLabel   | `string`  | —       | 可访问名称   |

## Events

| 名称                | 说明                 |
| ------------------- | -------------------- |
| `update:modelValue` | 值变化               |
| `referencesChange`  | 解析出的引用列表变化 |
