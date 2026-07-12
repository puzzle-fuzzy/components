<script setup>
import ImageBasic from '../../examples/image/Basic.vue'
</script>

# Image 图片

`OImage` 展示单张图片，并通过原生 `<dialog>` 提供轻量全屏预览。预览时图片约占视口 80%，遮罩颜色加深，点击遮罩或按 Esc 即可关闭。

## 演示

<DemoBlock label="Image demos">
  <ImageBasic />
</DemoBlock>

示例涵盖了：
- **基础预览** — 点击图片打开全屏预览
- **object-fit 对比** — `contain` / `cover` / `fill` / `none` / `scale-down` 五种模式
- **禁用预览** — `:preview="false"` 时仅渲染静态图片，不生成预览按钮
- **禁用状态** — 预览按钮被禁用，无法交互

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
  />
</template>
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| src | `string` | 必填 | 图片地址 |
| alt | `string` | `''` | 图片替代文字 |
| previewSrc | `string` | — | 预览层使用的高清图片地址，不传则复用 `src` |
| fit | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'contain'` | 原生 `object-fit` |
| width | `string \| number` | — | 图片宽度，数字会转换为 `px` |
| height | `string \| number` | — | 图片高度，数字会转换为 `px` |
| loading | `'eager' \| 'lazy'` | — | 原生图片加载策略 |
| preview | `boolean` | `true` | 是否渲染原生预览按钮 |
| previewAriaLabel | `string` | `'Preview image'` | 预览按钮与对话框的可访问名称 |
| closeAriaLabel | `string` | `'Close image preview'` | 关闭按钮的可访问名称 |
| disabled | `boolean` | `false` | 禁用预览按钮 |

## 预览特性

- **尺寸**：预览图片约占视口 80%（`80vw × 80dvh`），移动端扩展至接近全屏
- **关闭**：点击遮罩区域或按 Esc 关闭，**无关闭按钮**
- **遮罩**：深色半透明遮罩（`rgba(0, 0, 0, 0.85)`），聚焦图片内容
- **高清图**：通过 `previewSrc` 可指定与缩略图不同的高清预览图

## Events

| 名称 | 说明 |
| --- | --- |
| `load` | 原生图片加载成功 |
| `error` | 原生图片加载失败 |
| `previewOpen` | 预览层打开 |
| `previewClose` | 预览层关闭 |

## 可访问性

启用预览时，图片由原生 `button` 触发，通过 `previewAriaLabel` 提供独立的可访问名称。预览层复用原生 `<dialog>`，支持 Enter、Space、Esc、焦点圈定与关闭后的焦点恢复。

如果图片是装饰性的可以传空 `alt`，但仍应为可操作的预览按钮设置明确的 `previewAriaLabel`。未声明为组件 prop 的原生属性和监听器（例如 `decoding`、`crossorigin` 与 `@contextmenu`）会透传到主图片；数字 `width`/`height` 同时写入原生尺寸属性以减少布局偏移。
