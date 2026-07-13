<script setup lang="ts">
import { OButton, OCard } from '@puzzle-fuzzy/ui'
</script>

<template>
  <OCard
    class="card-basic"
    title="个人组件计划"
    description="用一个紧凑表面组织标题、说明、操作、正文和页脚。"
  >
    <template #action>
      <OButton size="sm" variant="ghost">打开计划</OButton>
    </template>

    <p>Card 只负责呈现结构，不加载数据，也不替使用方处理操作。</p>

    <template #footer>
      <span>最后整理于今天</span>
      <OButton size="sm">继续编辑</OButton>
    </template>
  </OCard>
</template>

<style scoped lang="less">
.card-basic {
  width: min(100%, 560px);
}

.card-basic p {
  margin: 0;
  color: var(--omg-color-text-muted);
}

.card-basic span {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}
</style>
