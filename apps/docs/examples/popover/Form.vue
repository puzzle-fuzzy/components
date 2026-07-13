<script setup lang="ts">
import { OButton } from '@puzzle-fuzzy/ui/button'
import { OInput } from '@puzzle-fuzzy/ui/input'
import { OPopover, OPopoverContent, OPopoverTrigger } from '@puzzle-fuzzy/ui/popover'
import { LuUserRound } from 'vue-icons-plus/lu'
import { ref } from 'vue'

const name = ref('OMG UI')
const alias = ref('omg')
const saved = ref('尚未保存')

const save = (close: () => void): void => {
  saved.value = `已保存：${name.value} / ${alias.value}`
  close()
}
</script>

<template>
  <div class="popover-form-example">
    <OPopover v-slot="{ close }">
      <OPopoverTrigger as-child>
        <OButton variant="soft" tone="neutral">
          <template #icon><LuUserRound aria-hidden="true" /></template>
          编辑资料
        </OButton>
      </OPopoverTrigger>
      <OPopoverContent align="start">
        <form class="popover-form" @submit.prevent="save(close)">
          <div>
            <strong>公开资料</strong>
            <p>表单逻辑完全由使用方维护。</p>
          </div>
          <label for="popover-display-name">显示名称</label>
          <OInput id="popover-display-name" v-model="name" autocomplete="name" />
          <label for="popover-alias">短名称</label>
          <OInput id="popover-alias" v-model="alias" autocomplete="off" />
          <div class="popover-form-actions">
            <OButton type="button" size="sm" variant="ghost" tone="neutral" @click="close">
              取消
            </OButton>
            <OButton type="submit" size="sm">保存</OButton>
          </div>
        </form>
      </OPopoverContent>
    </OPopover>
    <span aria-live="polite">{{ saved }}</span>
  </div>
</template>

<style scoped lang="less">
.popover-form-example,
.popover-form {
  display: grid;
  gap: var(--omg-space-3);
}

.popover-form {
  inline-size: min(300px, calc(100vw - (var(--omg-space-6) * 2)));
}

.popover-form strong,
.popover-form p {
  margin: 0;
}

.popover-form p,
.popover-form-example > span,
.popover-form label {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.popover-form p {
  margin-block-start: var(--omg-space-1);
}

.popover-form label {
  margin-block-end: calc(var(--omg-space-2) * -1);
  font-weight: var(--omg-font-weight-semibold);
}

.popover-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--omg-space-2);
}
</style>
