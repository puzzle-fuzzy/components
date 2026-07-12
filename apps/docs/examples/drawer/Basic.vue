<script setup lang="ts">
import { ref } from 'vue'
import { OButton, ODrawer } from '@puzzle-fuzzy/ui'

const open = ref(false)
const closeFeedback = ref('面板尚未打开')

const closeDrawer = (source: string): void => {
  open.value = false
  closeFeedback.value = source
}
</script>

<template>
  <div class="omg-example-stack">
    <div class="omg-drawer-trigger-row">
      <OButton @click="open = true">从右侧打开</OButton>
      <span aria-live="polite">{{ closeFeedback }}</span>
    </div>

    <ODrawer
      v-model:open="open"
      title="项目设置"
      description="调整这块界面的展示偏好。"
      :size="400"
      close-aria-label="关闭项目设置面板"
      @close="closeFeedback = '面板请求关闭'"
    >
      <div class="omg-drawer-summary">
        <p>Drawer 只呈现侧边内容和受控关闭路径，不会自动保存或提交任何数据。</p>
        <dl>
          <div>
            <dt>位置</dt>
            <dd>逻辑结束侧</dd>
          </div>
          <div>
            <dt>宽度</dt>
            <dd>400px</dd>
          </div>
        </dl>
      </div>

      <template #footer>
        <OButton variant="outline" tone="neutral" @click="closeDrawer('已从次要操作关闭')">
          取消
        </OButton>
        <OButton @click="closeDrawer('已从主要操作关闭')">完成</OButton>
      </template>
    </ODrawer>
  </div>
</template>

<style scoped>
.omg-drawer-trigger-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--omg-space-3);
  align-items: center;
}

.omg-drawer-trigger-row span {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.omg-drawer-summary {
  display: grid;
  gap: var(--omg-space-4);
}

.omg-drawer-summary p {
  margin: 0;
}

.omg-drawer-summary dl {
  display: grid;
  gap: var(--omg-space-2);
  margin: 0;
}

.omg-drawer-summary dl > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--omg-space-4);
  padding: var(--omg-space-3);
  border-radius: var(--omg-radius-md);
  background: var(--omg-color-surface-muted);
}

.omg-drawer-summary dt {
  color: var(--omg-color-text-muted);
}

.omg-drawer-summary dd {
  margin: 0;
  font-weight: var(--omg-font-weight-semibold);
}
</style>
