<script setup lang="ts">
import { OButton, OEmpty } from '@puzzle-fuzzy/ui'
import { LuInbox } from 'vue-icons-plus/lu'
</script>

<template>
  <OEmpty title="还没有收藏" description="收藏常用组件后，它们会出现在这里。" media-variant="soft">
    <template #media><LuInbox aria-hidden="true" /></template>
    <template #actions>
      <OButton size="sm">浏览组件</OButton>
      <OButton size="sm" tone="neutral" variant="ghost">了解收藏</OButton>
    </template>
  </OEmpty>
</template>
