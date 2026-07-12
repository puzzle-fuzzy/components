<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { OButton, oMessage, type OMessageHandle } from '@puzzle-fuzzy/ui'

const lightTarget = ref<HTMLElement | null>(null)
const darkTarget = ref<HTMLElement | null>(null)
let themeMessage: OMessageHandle | undefined

const clearThemeMessage = (): void => {
  themeMessage?.close()
  themeMessage = undefined
}

const showLight = (): void => {
  if (!lightTarget.value) return
  clearThemeMessage()
  themeMessage = oMessage.info({
    message: '白色消息表面',
    duration: 0,
    closable: true,
    closeAriaLabel: '关闭白色消息表面',
    appendTo: lightTarget.value,
  })
}

const showDark = (): void => {
  if (!darkTarget.value) return
  clearThemeMessage()
  themeMessage = oMessage.success({
    message: '深色消息表面',
    duration: 0,
    closable: true,
    closeAriaLabel: '关闭深色消息表面',
    appendTo: darkTarget.value,
  })
}

onBeforeUnmount(clearThemeMessage)
</script>

<template>
  <div class="omg-message-theme-grid">
    <section ref="lightTarget" class="omg-message-theme-target" data-omg-theme="light">
      <div>
        <strong>Light target</strong>
        <span>消息使用完全不透明的 #fff 表面。</span>
      </div>
      <OButton @click="showLight">显示浅色消息</OButton>
    </section>

    <section ref="darkTarget" class="omg-message-theme-target" data-omg-theme="dark">
      <div>
        <strong>Dark target</strong>
        <span>消息使用完全不透明的 #2d2d2d 表面。</span>
      </div>
      <OButton @click="showDark">显示深色消息</OButton>
    </section>
  </div>
</template>

<style scoped>
.omg-message-theme-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--omg-space-3);
}

.omg-message-theme-target {
  display: flex;
  min-height: 132px;
  box-sizing: border-box;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--omg-space-4);
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
  color: var(--omg-color-text);
}

.omg-message-theme-target div {
  display: grid;
  gap: var(--omg-space-1);
}

.omg-message-theme-target span {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

@media (width <= 640px) {
  .omg-message-theme-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
