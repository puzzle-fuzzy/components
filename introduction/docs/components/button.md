<script setup>
import { OButton } from '@components/ui'
</script>

# Button

`OButton` 是组件库的第一个按钮组件。它默认跟随外部环境：VitePress 切换日夜模式时，按钮会通过父级 `.dark` 自动适配；组件本身不会修改 VitePress 的主题状态。

## Variants

<div class="preview-row">
  <OButton>Solid</OButton>
  <OButton variant="soft">Soft</OButton>
  <OButton variant="outline">Outline</OButton>
  <OButton variant="ghost">Ghost</OButton>
</div>

## Sizes

<div class="preview-row">
  <OButton size="sm" tone="neutral">Small</OButton>
  <OButton tone="neutral">Medium</OButton>
  <OButton size="lg" tone="neutral">Large</OButton>
</div>

## States

<div class="preview-row">
  <OButton loading>Loading</OButton>
  <OButton disabled>Disabled</OButton>
  <OButton tone="danger">Danger</OButton>
</div>

## Theme Override

当你需要某个组件实例独立展示日间或夜间效果时，可以传 `theme`。这只影响当前按钮，不会影响页面或 VitePress 主题。

<div class="preview-row">
  <OButton theme="light" variant="soft">Forced light</OButton>
  <OButton theme="dark" variant="soft">Forced dark</OButton>
</div>

```vue
<script setup lang="ts">
import { OButton } from '@components/ui'
import '@components/ui/style.css'
</script>

<template>
  <OButton>Save</OButton>
  <OButton theme="dark" variant="soft">Preview dark</OButton>
</template>
```

<style>
.preview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin: 16px 0 28px;
}
</style>
