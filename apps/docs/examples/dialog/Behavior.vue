<script setup lang="ts">
import { ref } from 'vue'
import { OButton, OCheckbox, ODialog, type ODialogCloseRequest } from '@puzzle-fuzzy/ui'
import { LuLockKeyhole, LuMoonStar, LuShieldCheck } from 'vue-icons-plus/lu'

const lockedOpen = ref(false)
const guardedOpen = ref(false)
const rtlOpen = ref(false)
const allowClose = ref(false)
const guardedFeedback = ref('关闭请求尚未触发')

const handleGuardedUpdate = (nextOpen: boolean): void => {
  if (nextOpen) {
    guardedOpen.value = true
    return
  }

  if (allowClose.value) {
    guardedOpen.value = false
    return
  }

  guardedFeedback.value = '已拒绝关闭：请先选择「允许关闭」'
}

const handleGuardedRequest = (request: ODialogCloseRequest): void => {
  guardedFeedback.value = `收到 ${request.reason} 请求`
}
</script>

<template>
  <div class="omg-dialog-behavior-grid">
    <section class="omg-dialog-behavior-card" aria-label="Dialog explicit close policy">
      <LuLockKeyhole aria-hidden="true" />
      <div>
        <strong>唯一显式关闭路径</strong>
        <p>关闭按钮、遮罩和 Esc 均已停用，只保留内容区操作。</p>
      </div>
      <OButton size="sm" variant="soft" @click="lockedOpen = true">打开锁定弹窗</OButton>

      <ODialog
        v-model:open="lockedOpen"
        title="锁定的展示面"
        description="此示例只允许通过内容中的明确操作关闭。"
        :close-on-mask="false"
        :close-on-esc="false"
        :show-close="false"
      >
        <template #default="{ close }">
          <div class="omg-dialog-behavior-explicit">
            <LuShieldCheck aria-hidden="true" />
            <span>焦点不会被困住，因为仍有一个可键盘操作的退出按钮。</span>
            <OButton autofocus @click="close">明确关闭</OButton>
          </div>
        </template>
      </ODialog>
    </section>

    <section class="omg-dialog-behavior-card" aria-label="Dialog rejected close request">
      <LuShieldCheck aria-hidden="true" />
      <div>
        <strong>受控拒绝关闭</strong>
        <p>关闭意图先交给使用方；保持 open 即可拒绝。</p>
      </div>
      <OButton size="sm" variant="outline" tone="neutral" @click="guardedOpen = true">
        打开策略弹窗
      </OButton>

      <ODialog
        :open="guardedOpen"
        title="关闭策略"
        description="尝试点击遮罩、关闭按钮或按 Esc。"
        close-aria-label="请求关闭策略弹窗"
        @request-close="handleGuardedRequest"
        @update:open="handleGuardedUpdate"
      >
        <div class="omg-dialog-behavior-guard">
          <OCheckbox v-model="allowClose" label="允许关闭" />
          <p aria-live="polite">{{ guardedFeedback }}</p>
        </div>
      </ODialog>
    </section>

    <section
      class="omg-dialog-behavior-card omg-dialog-behavior-card-dark"
      data-omg-theme="dark"
      dir="rtl"
      lang="zh-CN"
      aria-label="Dialog dark RTL surface"
    >
      <LuMoonStar aria-hidden="true" />
      <div>
        <strong>深色 · RTL</strong>
        <p>逻辑排版、关闭区和操作顺序会跟随书写方向。</p>
      </div>
      <OButton size="sm" @click="rtlOpen = true">打开深色 RTL 弹窗</OButton>

      <ODialog
        v-model:open="rtlOpen"
        data-omg-theme="dark"
        dir="rtl"
        lang="zh-CN"
        title="深色 RTL 展示"
        description="对话框位于原生 top layer，但仍保留局部主题与方向。"
        close-aria-label="关闭深色 RTL 弹窗"
      >
        内容和操作使用逻辑方向属性，无需复制左右两套样式。
        <template #footer="{ close }">
          <OButton variant="ghost" tone="neutral" @click="close">返回</OButton>
          <OButton @click="close">完成</OButton>
        </template>
      </ODialog>
    </section>
  </div>
</template>

<style scoped>
.omg-dialog-behavior-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--omg-space-3);
}

.omg-dialog-behavior-card {
  display: grid;
  min-width: 0;
  align-content: start;
  justify-items: start;
  gap: var(--omg-space-3);
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
  color: var(--omg-color-text);
}

.omg-dialog-behavior-card > svg {
  width: 22px;
  height: 22px;
  color: var(--omg-color-brand);
}

.omg-dialog-behavior-card strong,
.omg-dialog-behavior-card p {
  margin: 0;
}

.omg-dialog-behavior-card p {
  margin-top: var(--omg-space-1);
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.omg-dialog-behavior-card-dark {
  background: var(--omg-color-surface);
}

.omg-dialog-behavior-explicit,
.omg-dialog-behavior-guard {
  display: grid;
  gap: var(--omg-space-3);
}

.omg-dialog-behavior-explicit {
  justify-items: start;
}

.omg-dialog-behavior-explicit > svg {
  width: 28px;
  height: 28px;
  color: var(--omg-color-success);
}

.omg-dialog-behavior-guard p {
  min-height: 1.6em;
}

@media (width <= 760px) {
  .omg-dialog-behavior-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
