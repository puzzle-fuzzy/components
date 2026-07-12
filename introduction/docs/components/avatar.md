<script setup>
import { OAvatar } from '@components/ui'
</script>

# Avatar

`OAvatar` 用于展示用户、团队或实体身份。它支持图片加载、姓名 initials 回退、尺寸、形状、状态点和组件级日夜主题覆盖。默认回退背景使用纯色，不带高光或渐变效果。

## Fallback

<div class="preview-row">
  <OAvatar name="Yxswy" />
  <OAvatar name="Components UI" />
  <OAvatar initials="AI" />
  <OAvatar />
</div>

## Sizes

<div class="preview-row">
  <OAvatar name="Yxswy" size="xs" />
  <OAvatar name="Yxswy" size="sm" />
  <OAvatar name="Yxswy" size="md" />
  <OAvatar name="Yxswy" size="lg" />
  <OAvatar name="Yxswy" size="xl" />
</div>

## Shapes

<div class="preview-row">
  <OAvatar name="Circle" shape="circle" />
  <OAvatar name="Rounded" shape="rounded" />
  <OAvatar name="Square" shape="square" />
</div>

## Status

<div class="preview-row">
  <OAvatar name="Online" status="online" />
  <OAvatar name="Away" status="away" />
  <OAvatar name="Busy" status="busy" />
  <OAvatar name="Offline" status="offline" />
</div>

## Theme Override

`theme` 只影响当前头像实例，不会切换或修改 VitePress 的日夜模式。

<div class="preview-row">
  <OAvatar name="Light" theme="light" status="online" />
  <OAvatar name="Dark" theme="dark" status="online" />
</div>

```vue
<script setup lang="ts">
import { OAvatar } from '@components/ui'
import '@components/ui/style.css'
</script>

<template>
  <OAvatar name="Yxswy" status="online" />
  <OAvatar src="/avatar.png" name="Yxswy" />
  <OAvatar theme="dark" initials="UI" />
</template>
```

<style>
.preview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  margin: 16px 0 28px;
}
</style>
