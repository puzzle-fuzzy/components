<script setup lang="ts">
import { ref } from 'vue'
import { OButton, ODialog, OInput } from '@puzzle-fuzzy/ui'
import { LuFocus, LuSparkles, LuXCircle } from 'vue-icons-plus/lu'

const focusOpen = ref(false)
const headerOpen = ref(false)
const displayName = ref('Yxswy')
</script>

<template>
  <div class="omg-dialog-custom-example">
    <div class="omg-dialog-custom-actions">
      <OButton variant="soft" @click="focusOpen = true">
        <template #icon><LuFocus aria-hidden="true" /></template>
        打开插槽与焦点示例
      </OButton>
      <OButton variant="outline" tone="neutral" @click="headerOpen = true">
        打开完整自定义头部
      </OButton>
    </div>

    <ODialog
      v-model:open="focusOpen"
      initial-focus="#dialog-display-name"
      close-aria-label="关闭显示资料弹窗"
    >
      <template #title>
        <span class="omg-dialog-custom-title">
          <LuSparkles aria-hidden="true" />
          显示资料
        </span>
      </template>
      <template #description>标题与描述插槽会自动使用组件生成的语义 ID。</template>
      <template #closeIcon><LuXCircle aria-hidden="true" /></template>
      <template #default>
        <label class="omg-dialog-custom-field" for="dialog-display-name">
          <span>显示名称</span>
          <OInput id="dialog-display-name" v-model="displayName" autocomplete="name" />
        </label>
      </template>
      <template #footer="{ close }">
        <OButton variant="ghost" tone="neutral" @click="close">取消</OButton>
        <OButton @click="close">完成</OButton>
      </template>
    </ODialog>

    <ODialog
      v-model:open="headerOpen"
      :show-close="false"
      close-aria-label="关闭完整自定义头部弹窗"
    >
      <template #header="{ titleId }">
        <div class="omg-dialog-custom-header">
          <span>DISPLAY SYSTEM</span>
          <h2 :id="titleId">完整自定义头部</h2>
          <p>header 插槽需要把 titleId 交给自己的可见标题。</p>
        </div>
      </template>
      <template #default="{ close, titleId }">
        <div class="omg-dialog-custom-id-note">
          当前对话框名称由 <code>{{ titleId }}</code> 关联。
        </div>
        <OButton variant="soft" @click="close">使用 slot close() 关闭</OButton>
      </template>
    </ODialog>
  </div>
</template>

<style scoped>
.omg-dialog-custom-example,
.omg-dialog-custom-field,
.omg-dialog-custom-header {
  display: grid;
  gap: var(--omg-space-3);
}

.omg-dialog-custom-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--omg-space-2);
}

.omg-dialog-custom-title {
  display: inline-flex;
  align-items: center;
  gap: var(--omg-space-2);
}

.omg-dialog-custom-title > svg {
  color: var(--omg-color-brand);
}

.omg-dialog-custom-field > span {
  font-weight: var(--omg-font-weight-semibold);
}

.omg-dialog-custom-header {
  gap: var(--omg-space-1);
}

.omg-dialog-custom-header > span {
  color: var(--omg-color-brand);
  font-size: var(--omg-font-size-xs);
  font-weight: var(--omg-font-weight-semibold);
  letter-spacing: 0.08em;
}

.omg-dialog-custom-header h2,
.omg-dialog-custom-header p {
  margin: 0;
}

.omg-dialog-custom-header h2 {
  font-size: var(--omg-font-size-lg);
}

.omg-dialog-custom-header p,
.omg-dialog-custom-id-note {
  color: var(--omg-color-text-muted);
}

.omg-dialog-custom-id-note {
  margin-bottom: var(--omg-space-4);
  padding: var(--omg-space-3);
  border-radius: var(--omg-radius-md);
  background: var(--omg-color-surface-muted);
}

.omg-dialog-custom-id-note code {
  overflow-wrap: anywhere;
}
</style>
