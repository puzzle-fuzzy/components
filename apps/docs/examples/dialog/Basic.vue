<script setup lang="ts">
import { ref } from 'vue'
import {
  OButton,
  ODialog,
  type ODialogCloseReason,
  type ODialogCloseRequest,
} from '@puzzle-fuzzy/ui'
import { LuSettings2 } from 'vue-icons-plus/lu'

const open = ref(false)
const lastEvent = ref('尚未打开')
const displayDensity = ref('舒适')

const handleRequest = (request: ODialogCloseRequest): void => {
  lastEvent.value = `请求关闭：${request.reason}`
}

const handleClose = (reason: ODialogCloseReason): void => {
  lastEvent.value = `开始关闭：${reason}`
}

const handleClosed = (reason: ODialogCloseReason): void => {
  lastEvent.value = `完成关闭：${reason}`
}

const applyPreview = (close: () => void): void => {
  displayDensity.value = displayDensity.value === '舒适' ? '紧凑' : '舒适'
  close()
}
</script>

<template>
  <div class="omg-dialog-basic-example">
    <div class="omg-dialog-basic-actions">
      <OButton @click="open = true">
        <template #icon><LuSettings2 aria-hidden="true" /></template>
        打开基础弹窗
      </OButton>
      <span class="omg-dialog-basic-choice">当前密度：{{ displayDensity }}</span>
    </div>

    <p class="omg-dialog-basic-event" aria-live="polite">{{ lastEvent }}</p>

    <ODialog
      v-model:open="open"
      title="工作区设置"
      description="用受控状态组织弹窗，并观察每个进入与离开阶段。"
      close-aria-label="关闭工作区设置弹窗"
      @request-close="handleRequest"
      @open="lastEvent = '开始打开'"
      @opened="lastEvent = '完成打开'"
      @close="handleClose"
      @closed="handleClosed"
    >
      <template #default>
        <div class="omg-dialog-basic-preview">
          <span>界面密度预览</span>
          <strong>{{ displayDensity }}</strong>
        </div>
      </template>
      <template #footer="{ close }">
        <OButton variant="ghost" tone="neutral" @click="close">取消</OButton>
        <OButton @click="applyPreview(close)">切换并关闭</OButton>
      </template>
    </ODialog>
  </div>
</template>

<style scoped>
.omg-dialog-basic-example {
  display: grid;
  gap: var(--omg-space-3);
}

.omg-dialog-basic-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--omg-space-3);
}

.omg-dialog-basic-choice,
.omg-dialog-basic-event {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.omg-dialog-basic-event {
  margin: 0;
}

.omg-dialog-basic-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--omg-space-4);
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-md);
  background: var(--omg-color-surface-muted);
}

.omg-dialog-basic-preview > span {
  color: var(--omg-color-text-muted);
}
</style>
