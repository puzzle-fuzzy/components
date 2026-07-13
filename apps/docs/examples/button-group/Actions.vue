<script setup lang="ts">
import { OButton, OButtonGroup, OButtonGroupSeparator, OButtonGroupText } from '@puzzle-fuzzy/ui'
import { LuChevronDown, LuCopy, LuShare2 } from 'vue-icons-plus/lu'
</script>

<template>
  <div class="button-group-actions">
    <OButtonGroup aria-label="文档操作">
      <OButton
        ><template #icon><LuCopy /></template>复制</OButton
      >
      <OButtonGroupSeparator />
      <OButton
        ><template #icon><LuShare2 /></template>分享</OButton
      >
      <OButton icon-only aria-label="更多文档操作"
        ><template #icon><LuChevronDown /></template
      ></OButton>
    </OButtonGroup>

    <OButtonGroup orientation="vertical" aria-label="垂直视图选择">
      <OButton tone="neutral" variant="soft">列表视图</OButton>
      <OButtonGroupText>默认</OButtonGroupText>
      <OButton tone="neutral" variant="soft">网格视图</OButton>
    </OButtonGroup>
  </div>
</template>

<style scoped lang="less">
.button-group-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--omg-space-5);
}
</style>
