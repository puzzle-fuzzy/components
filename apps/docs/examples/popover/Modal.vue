<script setup lang="ts">
import { OButton } from '@puzzle-fuzzy/ui/button'
import { OInput } from '@puzzle-fuzzy/ui/input'
import { OPopover, OPopoverContent, OPopoverTrigger } from '@puzzle-fuzzy/ui/popover'
import { LuShieldCheck } from 'vue-icons-plus/lu'
import { ref } from 'vue'

const open = ref(false)
const focusEvent = ref('等待打开')
</script>

<template>
  <div class="popover-modal-example">
    <OPopover v-model:open="open" modal>
      <OPopoverTrigger as-child>
        <OButton>
          <template #icon><LuShieldCheck aria-hidden="true" /></template>
          打开 modal Popover
        </OButton>
      </OPopoverTrigger>
      <OPopoverContent
        align="start"
        @open-auto-focus="focusEvent = '焦点已进入浮层'"
        @close-auto-focus="focusEvent = '焦点已归还触发器'"
      >
        <div class="popover-modal-card">
          <div>
            <strong>确认访问</strong>
            <p>modal 模式会隔离背景交互并把焦点限制在浮层中。</p>
          </div>
          <label for="popover-access-code">访问说明</label>
          <OInput id="popover-access-code" placeholder="输入说明" />
          <OButton size="sm" @click="open = false">完成</OButton>
        </div>
      </OPopoverContent>
    </OPopover>
    <span aria-live="polite">{{ focusEvent }}</span>
  </div>
</template>

<style scoped lang="less">
.popover-modal-example,
.popover-modal-card {
  display: grid;
  gap: var(--omg-space-3);
}

.popover-modal-card {
  inline-size: min(280px, calc(100vw - (var(--omg-space-6) * 2)));
}

.popover-modal-card strong,
.popover-modal-card p {
  margin: 0;
}

.popover-modal-card p,
.popover-modal-card label,
.popover-modal-example > span {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.popover-modal-card p {
  margin-block-start: var(--omg-space-1);
}

.popover-modal-card .o-button {
  justify-self: end;
}
</style>
