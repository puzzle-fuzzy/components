<script setup lang="ts">
import { ref } from 'vue'
import { OButton, OSwitch } from '@puzzle-fuzzy/ui'

const compactEnabled = ref(false)
const syncEnabled = ref(true)
const digestEnabled = ref(false)
const formFeedback = ref('尚未提交原生表单')

const handleSubmit = (event: SubmitEvent): void => {
  const form = event.currentTarget as HTMLFormElement
  const value = new FormData(form).get('digest')
  formFeedback.value = value === 'weekly' ? '表单值：weekly' : '表单中没有开关值'
}
</script>

<template>
  <div class="switch-basic">
    <section class="switch-basic-group" aria-labelledby="switch-size-heading">
      <strong id="switch-size-heading">尺寸、标签与说明</strong>
      <OSwitch v-model="compactEnabled" size="sm" label="紧凑开关" />
      <OSwitch v-model="syncEnabled" label="同步工作区" description="在设备之间保持视觉设置一致" />
    </section>

    <form class="switch-basic-form" @submit.prevent="handleSubmit">
      <strong>原生表单属性</strong>
      <OSwitch
        v-model="digestEnabled"
        name="digest"
        value="weekly"
        required
        label="接收每周摘要"
        description="真实 checkbox 保留 name、value 与 required"
      />
      <div class="switch-basic-actions">
        <OButton size="sm" type="submit">提交表单</OButton>
        <span aria-live="polite">{{ formFeedback }}</span>
      </div>
    </form>
  </div>
</template>

<style scoped lang="less">
.switch-basic {
  display: grid;
  width: 100%;
  gap: var(--omg-space-4);
}

.switch-basic-group,
.switch-basic-form {
  display: grid;
  min-width: 0;
  justify-items: start;
  gap: var(--omg-space-3);
}

.switch-basic strong,
.switch-basic-actions span {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.switch-basic-form {
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
}

.switch-basic-actions {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--omg-space-3);
}
</style>
