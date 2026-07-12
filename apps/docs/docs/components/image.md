<script setup>
import ImageBasic from '../../examples/image/Basic.vue'
</script>

# Image 图片

`OImage` 展示单张图片，并提供轻量的全屏预览。点击图片后会打开黑色遮罩预览层，点击遮罩或按 Esc 关闭。

## 基础用法

<DemoBlock label="Image click preview">
  <ImageBasic />
</DemoBlock>

## 使用

```vue
<script setup lang="ts">
import { OImage } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
</script>

<template>
  <OImage src="/photo.jpg" alt="项目截图" width="320px" height="200px" fit="cover" />
</template>
```

## Props

| 名称       | 类型                                                       | 默认值      | 说明                        |
| ---------- | ---------------------------------------------------------- | ----------- | --------------------------- |
| src        | `string`                                                   | 必填        | 图片地址                    |
| alt        | `string`                                                   | `''`        | 图片替代文字                |
| previewSrc | `string`                                                   | —           | 预览层使用的高清图片地址    |
| fit        | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'contain'` | 原生 `object-fit`           |
| width      | `string \| number`                                         | —           | 图片宽度，数字会转换为 `px` |
| height     | `string \| number`                                         | —           | 图片高度，数字会转换为 `px` |
| loading    | `'eager' \| 'lazy'`                                        | —           | 原生图片加载策略            |
| preview    | `boolean`                                                  | `true`      | 是否允许点击预览            |
| disabled   | `boolean`                                                  | `false`     | 禁用点击预览                |

## Events

| 名称           | 说明             |
| -------------- | ---------------- |
| `load`         | 原生图片加载成功 |
| `error`        | 原生图片加载失败 |
| `previewOpen`  | 预览层打开       |
| `previewClose` | 预览层关闭       |

## 可访问性

预览层使用 `role="dialog"` 与 `aria-modal="true"`。如果图片是装饰性的，传入空 `alt`；有内容意义时传入明确替代文字。
