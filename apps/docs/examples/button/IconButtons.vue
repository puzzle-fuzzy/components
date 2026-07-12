<script setup lang="ts">
import { OButton } from '@puzzle-fuzzy/ui'
import { LuPlus, LuSave, LuSettings, LuTrash2 } from 'vue-icons-plus/lu'
</script>

<template>
  <OButton icon-only size="sm" variant="ghost">
    <template #icon><LuPlus /></template>
    新建
  </OButton>
  <OButton icon-only variant="soft" aria-label="设置">
    <template #icon><LuSettings /></template>
  </OButton>
  <OButton icon-only size="lg" variant="outline" tone="danger">
    <template #icon><LuTrash2 /></template>
    删除
  </OButton>
  <OButton icon-only loading aria-label="正在保存">
    <template #icon><LuSave /></template>
  </OButton>
</template>
