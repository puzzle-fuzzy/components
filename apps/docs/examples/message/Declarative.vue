<script setup lang="ts">
import { ref } from 'vue'
import { OButton, OMessage } from '@puzzle-fuzzy/ui'
import { LuBell } from 'vue-icons-plus/lu'

const closableVisible = ref(true)
const closeFeedback = ref('可关闭消息仍在页面中')

const closeDeclarativeMessage = (): void => {
  closableVisible.value = false
  closeFeedback.value = '使用方已响应 close 事件并移除消息'
}

const restoreDeclarativeMessage = (): void => {
  closableVisible.value = true
  closeFeedback.value = '可关闭消息仍在页面中'
}
</script>

<template>
  <div class="omg-message-surfaces">
    <OMessage message="这是一条普通提示" status="info" />
    <OMessage message="内容已经保存" status="success" />
    <OMessage message="请检查当前输入" status="warning" />
    <OMessage message="暂时无法完成操作" status="error" />

    <OMessage status="info">
      <template #icon><LuBell aria-hidden="true" /></template>
      <strong>自定义消息内容</strong>
      <span>图标和正文均由插槽提供。</span>
    </OMessage>

    <OMessage
      v-if="closableVisible"
      message="关闭事件由使用方决定是否移除这条消息"
      status="success"
      closable
      close-aria-label="关闭声明式消息"
      @close="closeDeclarativeMessage"
    />
    <OButton v-else variant="soft" @click="restoreDeclarativeMessage"> 重新显示可关闭消息 </OButton>

    <OMessage
      class="omg-message-surfaces-long"
      message="声明式消息同样支持较长内容，并会在有限宽度内自然换行，不挤压状态图标或关闭控件。"
      status="info"
    />

    <span class="omg-message-surfaces-feedback" aria-live="polite">{{ closeFeedback }}</span>
  </div>
</template>

<style scoped>
.omg-message-surfaces {
  display: grid;
  width: min(100%, 760px);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--omg-space-3);
  align-items: start;
}

.omg-message-surfaces :deep(.o-message) {
  width: 100%;
}

.omg-message-surfaces-long,
.omg-message-surfaces-feedback {
  grid-column: 1 / -1;
}

.omg-message-surfaces-feedback {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

@media (width <= 640px) {
  .omg-message-surfaces {
    grid-template-columns: minmax(0, 1fr);
  }

  .omg-message-surfaces-long,
  .omg-message-surfaces-feedback {
    grid-column: auto;
  }
}
</style>
