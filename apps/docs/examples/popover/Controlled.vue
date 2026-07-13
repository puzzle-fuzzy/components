<script setup lang="ts">
import { OButton } from '@puzzle-fuzzy/ui/button'
import { OPopover, OPopoverContent, OPopoverTrigger } from '@puzzle-fuzzy/ui/popover'
import { LuSlidersHorizontal } from 'vue-icons-plus/lu'
import { ref } from 'vue'

const open = ref(false)
const acceptRequests = ref(true)
const lastRequest = ref('等待操作')

const handleOpenRequest = (nextOpen: boolean): void => {
  lastRequest.value = `收到请求：${nextOpen ? '打开' : '关闭'}`
  if (acceptRequests.value) open.value = nextOpen
}
</script>

<template>
  <div class="popover-controlled-example">
    <div class="popover-controlled-actions">
      <OPopover :open="open" @update:open="handleOpenRequest">
        <OPopoverTrigger as-child>
          <OButton variant="soft" tone="neutral">
            <template #icon><LuSlidersHorizontal aria-hidden="true" /></template>
            受控浮层
          </OButton>
        </OPopoverTrigger>
        <OPopoverContent>
          <div class="popover-controlled-content">
            <strong>受控状态</strong>
            <p>触发器只提出状态请求，父组件决定是否接受。</p>
          </div>
        </OPopoverContent>
      </OPopover>

      <OButton size="sm" variant="ghost" tone="neutral" @click="open = !open">
        外部{{ open ? '关闭' : '打开' }}
      </OButton>
      <OButton
        size="sm"
        :variant="acceptRequests ? 'soft' : 'outline'"
        tone="neutral"
        @click="acceptRequests = !acceptRequests"
      >
        {{ acceptRequests ? '接受请求' : '拒绝请求' }}
      </OButton>
    </div>

    <p aria-live="polite">{{ lastRequest }}，当前状态：{{ open ? '打开' : '关闭' }}</p>
  </div>
</template>

<style scoped lang="less">
.popover-controlled-example,
.popover-controlled-content {
  display: grid;
  gap: var(--omg-space-3);
}

.popover-controlled-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--omg-space-2);
}

.popover-controlled-example p,
.popover-controlled-content p,
.popover-controlled-content strong {
  margin: 0;
}

.popover-controlled-example p,
.popover-controlled-content p {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.popover-controlled-content {
  inline-size: min(240px, calc(100vw - (var(--omg-space-6) * 2)));
}
</style>
