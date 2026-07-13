<script setup lang="ts">
import { defineComponent, h, ref, useId } from 'vue'
import { OButton, ODialog, OInput } from '@puzzle-fuzzy/ui'
import { LuListRestart, LuListTree, LuPlus } from 'vue-icons-plus/lu'

const persistentOpen = ref(false)
const destroyOpen = ref(false)

const detailRows = Array.from({ length: 36 }, (_, index) => ({
  id: index + 1,
  title: `界面项目 ${String(index + 1).padStart(2, '0')}`,
  state: index % 3 === 0 ? '强调' : index % 3 === 1 ? '常规' : '弱化',
}))

const MountPolicyState = defineComponent({
  name: 'MountPolicyState',
  props: {
    label: { type: String, required: true },
  },
  setup(props) {
    const inputId = `dialog-local-${useId()}`
    const value = ref('')
    const count = ref(0)

    return () =>
      h('div', { class: 'omg-dialog-mount-state' }, [
        h('label', { class: 'omg-dialog-mount-state-field', for: inputId }, [
          h('span', props.label),
          h(OInput, {
            id: inputId,
            modelValue: value.value,
            placeholder: '输入仅属于当前挂载实例的内容',
            'onUpdate:modelValue': (nextValue: string) => {
              value.value = nextValue
            },
          }),
        ]),
        h('div', { class: 'omg-dialog-mount-state-counter' }, [
          h('span', `本地计数：${String(count.value)}`),
          h(
            OButton,
            {
              size: 'sm',
              variant: 'soft',
              onClick: () => {
                count.value += 1
              },
            },
            {
              icon: () => h(LuPlus, { 'aria-hidden': 'true' }),
              default: () => '增加',
            },
          ),
        ]),
      ])
  },
})
</script>

<template>
  <div class="omg-dialog-content-actions">
    <OButton variant="soft" @click="persistentOpen = true">
      <template #icon><LuListTree aria-hidden="true" /></template>
      打开保留状态的长内容
    </OButton>
    <OButton variant="outline" tone="neutral" @click="destroyOpen = true">
      <template #icon><LuListRestart aria-hidden="true" /></template>
      打开关闭后销毁的内容
    </OButton>

    <ODialog
      v-model:open="persistentOpen"
      width="min(92vw, 40rem)"
      title="保留挂载状态"
      description="默认只隐藏内容；再次打开时，本地输入和计数仍然存在。"
      close-aria-label="关闭保留挂载状态弹窗"
    >
      <MountPolicyState label="保留的本地输入" />

      <ol class="omg-dialog-content-list" aria-label="36 个滚动界面项目">
        <li v-for="row in detailRows" :key="row.id">
          <span>{{ row.title }}</span>
          <strong>{{ row.state }}</strong>
        </li>
      </ol>

      <template #footer="{ close }">
        <span class="omg-dialog-content-footer-note">主体独立滚动，操作区保持可见</span>
        <OButton @click="close">关闭并保留</OButton>
      </template>
    </ODialog>

    <ODialog
      v-model:open="destroyOpen"
      destroy-on-close
      :width="420"
      title="关闭后销毁内容"
      description="离场完成后卸载内部状态；下次打开会获得新的输入和计数。"
      close-aria-label="关闭销毁挂载状态弹窗"
    >
      <MountPolicyState label="关闭后重置的本地输入" />

      <template #footer="{ close }">
        <OButton @click="close">关闭并销毁</OButton>
      </template>
    </ODialog>
  </div>
</template>

<style scoped>
.omg-dialog-content-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--omg-space-2);
}

:deep(.omg-dialog-mount-state) {
  display: grid;
  gap: var(--omg-space-3);
  margin-bottom: var(--omg-space-4);
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-md);
  background: var(--omg-color-surface-muted);
}

:deep(.omg-dialog-mount-state-field) {
  display: grid;
  gap: var(--omg-space-2);
  font-weight: var(--omg-font-weight-semibold);
}

:deep(.omg-dialog-mount-state-counter) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--omg-space-3);
  color: var(--omg-color-text-muted);
}

.omg-dialog-content-list {
  display: grid;
  gap: var(--omg-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.omg-dialog-content-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--omg-space-4);
  padding: var(--omg-space-2) var(--omg-space-3);
  border-radius: var(--omg-radius-sm);
}

.omg-dialog-content-list li:nth-child(odd) {
  background: var(--omg-color-surface-muted);
}

.omg-dialog-content-list strong {
  flex: 0 0 auto;
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.omg-dialog-content-footer-note {
  margin-inline-end: auto;
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}
</style>
