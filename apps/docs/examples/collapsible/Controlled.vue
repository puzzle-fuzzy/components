<script setup lang="ts">
import { OButton } from '@puzzle-fuzzy/ui/button'
import {
  OCollapsible,
  OCollapsibleContent,
  OCollapsibleTrigger,
} from '@puzzle-fuzzy/ui/collapsible'
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <div class="controlled-example">
    <div class="controlled-actions">
      <OButton size="sm" variant="soft" @click="open = !open">
        {{ open ? '收起详情' : '展开详情' }}
      </OButton>
      <span aria-live="polite">当前：{{ open ? '已展开' : '已收起' }}</span>
    </div>

    <OCollapsible v-model:open="open" class="controlled-content">
      <OCollapsibleTrigger>也可以从这里切换</OCollapsibleTrigger>
      <OCollapsibleContent>
        受控状态始终由父级 ref 持有，组件只发出下一次状态请求。
      </OCollapsibleContent>
    </OCollapsible>

    <OCollapsible class="controlled-content" disabled>
      <OCollapsibleTrigger>禁用的折叠区域</OCollapsibleTrigger>
      <OCollapsibleContent>此内容不会通过交互展开。</OCollapsibleContent>
    </OCollapsible>
  </div>
</template>

<style scoped lang="less">
.controlled-example {
  display: grid;
  inline-size: min(100%, 560px);
  gap: var(--omg-space-5);
}

.controlled-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--omg-space-3);
  color: var(--omg-color-text-muted);
}

.controlled-content {
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
}
</style>
