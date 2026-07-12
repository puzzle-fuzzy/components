<script setup>
import CodeInputBasic from '../../examples/code-input/Basic.vue'
</script>

# Code Input 验证码输入

`OCodeInput` 提供六个独立输入框的验证码体验，支持自动前进、退格回退、方向键和整段粘贴。

## 基础用法

<DemoBlock label="Six digit verification code">
  <CodeInputBasic />
</DemoBlock>

## 尺寸与焦点

| `size` | 宽度 | 高度 |
| ------ | ---- | ---- |
| `sm`   | 32px | 40px |
| `md`   | 40px | 48px |
| `lg`   | 48px | 56px |

输入框默认使用 1px 边框；聚焦后边框变为 2px 品牌色，不使用 outline、阴影或光晕。`invalid` 状态始终使用危险色边框，聚焦时同样保持危险色。

## 使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { OCodeInput } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'

const code = ref('')
</script>

<template>
  <OCodeInput v-model="code" aria-label="六位验证码" @complete="submitCode" />
</template>
```

## Props

| 名称       | 类型                   | 默认值                | 说明                     |
| ---------- | ---------------------- | --------------------- | ------------------------ |
| modelValue | `string`               | `''`                  | 数字验证码               |
| length     | `number`               | `6`                   | 输入框数量               |
| size       | `'sm' \| 'md' \| 'lg'` | `'md'`                | 输入框尺寸               |
| disabled   | `boolean`              | `false`               | 禁用所有输入框           |
| readonly   | `boolean`              | `false`               | 只读                     |
| autofocus  | `boolean`              | `false`               | 挂载后聚焦第一格         |
| invalid    | `boolean`              | `false`               | 显示错误状态和 ARIA 状态 |
| ariaLabel  | `string`               | `'Verification code'` | 输入组的可访问名称       |

## Events 与暴露方法

| 类型   | 名称                | 说明                           |
| ------ | ------------------- | ------------------------------ |
| Event  | `update:modelValue` | 值变化                         |
| Event  | `complete`          | 数字数量达到 length            |
| Event  | `focus`             | 任一输入框获得焦点             |
| Event  | `blur`              | 任一输入框失去焦点             |
| Expose | `focus(index?)`     | 聚焦指定位置，默认聚焦第一位置 |

倒计时、验证码请求、提交校验和重试属于业务层，不由该组件处理。
