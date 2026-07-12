<script setup>
import DividerVariants from '../../examples/divider/Variants.vue'
</script>

# Divider 分割线

`ODivider` 分隔内容区域，支持水平、垂直、实线、虚线以及水平标题位置。

## 变体

<DemoBlock label="Divider variants">
  <DividerVariants />
</DemoBlock>

## 使用

```vue
<script setup lang="ts">
import { ODivider } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
</script>

<template>
  <ODivider>详细信息</ODivider>
  <ODivider dashed content-position="left">可选设置</ODivider>
  <span>账户</span><ODivider direction="vertical" /><span>安全</span>
</template>
```

## Props

| 名称            | 类型                            | 默认值         | 说明               |
| --------------- | ------------------------------- | -------------- | ------------------ |
| direction       | `'horizontal' \| 'vertical'`    | `'horizontal'` | 方向               |
| dashed          | `boolean`                       | `false`        | 使用虚线           |
| contentPosition | `'left' \| 'center' \| 'right'` | `'center'`     | 水平模式的文字位置 |

默认 slot 只在水平模式显示。根节点始终提供 `role="separator"` 和准确的
`aria-orientation`。
