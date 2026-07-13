<script setup lang="ts">
import { OPopover, OPopoverContent, OPopoverTrigger } from '@puzzle-fuzzy/ui/popover'
import { OButton } from '@puzzle-fuzzy/ui/button'
import { LuBell, LuCheck } from 'vue-icons-plus/lu'
import { ref } from 'vue'

const lastAction = ref('尚未处理')
</script>

<template>
  <div class="popover-basic-example">
    <OPopover v-slot="{ close }">
      <OPopoverTrigger as-child>
        <OButton aria-label="打开通知摘要">
          <template #icon><LuBell aria-hidden="true" /></template>
          查看通知
        </OButton>
      </OPopoverTrigger>

      <OPopoverContent align="start">
        <div class="popover-basic-card">
          <div>
            <strong>3 条新通知</strong>
            <p>Popover 可以容纳按钮、链接和简短的交互内容。</p>
          </div>
          <OButton
            size="sm"
            variant="soft"
            @click="
              lastAction = '已全部标记为已读'
              close()
            "
          >
            <template #icon><LuCheck aria-hidden="true" /></template>
            全部已读
          </OButton>
        </div>
      </OPopoverContent>
    </OPopover>

    <span class="popover-basic-result" aria-live="polite">{{ lastAction }}</span>
  </div>
</template>

<style scoped lang="less">
.popover-basic-example {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--omg-space-3);
}

.popover-basic-card {
  display: grid;
  inline-size: min(280px, calc(100vw - (var(--omg-space-6) * 2)));
  gap: var(--omg-space-4);
}

.popover-basic-card strong,
.popover-basic-card p {
  margin: 0;
}

.popover-basic-card p,
.popover-basic-result {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.popover-basic-card p {
  margin-block-start: var(--omg-space-1);
}

.popover-basic-card .o-button {
  justify-self: start;
}
</style>
