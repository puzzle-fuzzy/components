<script setup>
import ImageBasic from '../../examples/image/Basic.vue'
</script>

# Image 图片

`OImage` 展示单张图片，并通过共享 `ODialog` 提供轻量的全屏预览。预览入口是原生按钮，支持键盘操作；可以通过关闭按钮、遮罩或 Esc 退出，并在关闭后恢复焦点。

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
  <OImage
    src="/photo.jpg"
    alt="项目截图"
    preview-aria-label="预览项目截图"
    close-aria-label="关闭图片预览"
    :width="320"
    :height="200"
    fit="cover"
    decoding="async"
  />
</template>
```

## Props

| 名称             | 类型                                                       | 默认值                  | 说明                         |
| ---------------- | ---------------------------------------------------------- | ----------------------- | ---------------------------- |
| src              | `string`                                                   | 必填                    | 图片地址                     |
| alt              | `string`                                                   | `''`                    | 图片替代文字                 |
| previewSrc       | `string`                                                   | —                       | 预览层使用的高清图片地址     |
| fit              | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'contain'`             | 原生 `object-fit`            |
| width            | `string \| number`                                         | —                       | 图片宽度，数字会转换为 `px`  |
| height           | `string \| number`                                         | —                       | 图片高度，数字会转换为 `px`  |
| loading          | `'eager' \| 'lazy'`                                        | —                       | 原生图片加载策略             |
| preview          | `boolean`                                                  | `true`                  | 是否渲染原生预览按钮         |
| previewAriaLabel | `string`                                                   | `'Preview image'`       | 预览按钮与对话框的可访问名称 |
| closeAriaLabel   | `string`                                                   | `'Close image preview'` | 关闭预览按钮的可访问名称     |
| disabled         | `boolean`                                                  | `false`                 | 禁用预览按钮                 |

## Events

| 名称           | 说明             |
| -------------- | ---------------- |
| `load`         | 原生图片加载成功 |
| `error`        | 原生图片加载失败 |
| `previewOpen`  | 预览层打开       |
| `previewClose` | 预览层关闭       |

## 可访问性

启用预览时，图片由原生 `button` 触发，并通过 `previewAriaLabel` 提供独立的可访问名称。预览层复用原生 `dialog`，支持 Enter、Space、Esc、焦点圈定与关闭后的焦点恢复。

如果图片是装饰性的，可以传入空 `alt`，但仍应为可操作的预览按钮设置明确的 `previewAriaLabel`。未声明为组件 prop 的原生属性和监听器（例如 `decoding`、`crossorigin` 与 `@contextmenu`）会透传到主图片；数字 `width`/`height` 同时写入原生尺寸属性以减少布局偏移。
