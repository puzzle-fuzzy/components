<script setup lang="ts">
import { OAspectRatio } from '@puzzle-fuzzy/ui'
import { LuImage } from 'vue-icons-plus/lu'
</script>

<template>
  <OAspectRatio class="aspect-ratio-basic" :ratio="16 / 9">
    <div class="aspect-ratio-basic-media">
      <LuImage aria-hidden="true" />
      <strong>16 : 9</strong>
      <span>媒体内容会随容器宽度保持比例</span>
    </div>
  </OAspectRatio>
</template>

<style scoped lang="less">
.aspect-ratio-basic {
  width: min(100%, 640px);
}

.aspect-ratio-basic-media {
  display: grid;
  width: 100%;
  height: 100%;
  place-content: center;
  justify-items: center;
  gap: var(--omg-space-2);
  border-radius: var(--omg-radius-xl);
  background:
    radial-gradient(circle at 25% 20%, var(--omg-color-brand-soft), transparent 42%),
    var(--omg-color-surface-muted);
  color: var(--omg-color-text);
}

.aspect-ratio-basic-media svg {
  width: var(--omg-space-8);
  height: var(--omg-space-8);
  color: var(--omg-color-brand);
}

.aspect-ratio-basic-media span {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}
</style>
