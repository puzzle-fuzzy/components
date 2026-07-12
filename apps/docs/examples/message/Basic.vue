<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { OButton, oMessage, type OMessageHandle } from '@puzzle-fuzzy/ui'

const lifecycleFeedback = ref('尚无消息完成离场')
let persistentMessage: OMessageHandle | undefined

const showInfo = (): void => {
  oMessage('这是一条普通消息')
}

const showSuccess = (): void => {
  oMessage.success({
    message: '保存成功',
    closeAriaLabel: '关闭保存成功消息',
    onClose: () => {
      lifecycleFeedback.value = '保存成功消息已完成离场'
    },
  })
}

const showWarning = (): void => {
  oMessage.warning({
    message: '请检查当前输入',
    duration: 4200,
    closable: true,
    closeAriaLabel: '关闭检查输入消息',
  })
}

const showError = (): void => {
  oMessage.error({
    message: '暂时无法完成操作',
    duration: 4200,
    closable: true,
    closeAriaLabel: '关闭操作失败消息',
  })
}

const showStack = (): void => {
  oMessage.info({
    message: '第一条堆叠消息',
    duration: 0,
    closable: true,
    closeAriaLabel: '关闭第一条堆叠消息',
  })
  oMessage.success({
    message: '第二条堆叠消息',
    duration: 0,
    closable: true,
    closeAriaLabel: '关闭第二条堆叠消息',
  })
  oMessage.warning({
    message: '第三条堆叠消息',
    duration: 0,
    closable: true,
    closeAriaLabel: '关闭第三条堆叠消息',
  })
}

const showPersistent = (): void => {
  persistentMessage?.close()
  let handle: OMessageHandle
  handle = oMessage.info({
    message: '这条消息会一直保留',
    duration: 0,
    closable: true,
    closeAriaLabel: '关闭这条持久消息',
    onClose: () => {
      if (persistentMessage === handle) persistentMessage = undefined
      lifecycleFeedback.value = '持久消息已完成离场'
    },
  })
  persistentMessage = handle
}

const closePersistent = (): void => {
  persistentMessage?.close()
}

const closeAll = (): void => {
  oMessage.closeAll()
}

const showLongMessage = (): void => {
  oMessage.info({
    message:
      '这是一条用于检查长文本换行的消息：即使内容持续变长，消息也会保持在视口内，并为图标、正文与关闭按钮保留稳定空间。',
    duration: 0,
    closable: true,
    closeAriaLabel: '关闭长文本消息',
  })
}

onBeforeUnmount(() => {
  persistentMessage?.close()
  oMessage.closeAll()
})
</script>

<template>
  <div class="omg-message-actions">
    <OButton @click="showInfo">显示普通消息</OButton>
    <OButton variant="soft" @click="showSuccess">显示成功消息</OButton>
    <OButton variant="soft" tone="neutral" @click="showWarning">显示警告消息</OButton>
    <OButton tone="danger" @click="showError">显示错误消息</OButton>
    <OButton variant="outline" tone="neutral" @click="showStack">显示三条消息</OButton>
    <OButton variant="outline" tone="neutral" @click="showPersistent"> 显示持久消息 </OButton>
    <OButton variant="ghost" tone="neutral" @click="closePersistent">关闭持久消息</OButton>
    <OButton variant="ghost" tone="neutral" @click="closeAll">关闭全部消息</OButton>
    <OButton variant="outline" tone="neutral" @click="showLongMessage">显示长消息</OButton>
    <span class="omg-message-feedback" aria-live="polite">{{ lifecycleFeedback }}</span>
  </div>
</template>

<style scoped>
.omg-message-actions {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: var(--omg-space-2);
  align-items: center;
}

.omg-message-feedback {
  width: 100%;
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}
</style>
