<script setup lang="ts">
import { ref } from 'vue'
import { OButton, OCheckbox, OFormDialog, OInput, ORadio, ORadioGroup } from '@puzzle-fuzzy/ui'

const open = ref(false)
const displayName = ref('Yxswy')
const channel = ref('email')
const subscribed = ref(true)
</script>

<template>
  <div class="omg-example-stack">
    <OButton @click="open = true">编辑资料</OButton>

    <OFormDialog
      v-model:open="open"
      title="编辑资料"
      description="原生表单校验通过后，组件会向使用方发出 submit 事件。"
      submit-label="保存"
      cancel-label="取消"
      close-aria-label="关闭资料表单"
      @submit="open = false"
    >
      <div class="form-dialog-example-field">
        <label for="form-dialog-display-name">显示名称</label>
        <OInput
          id="form-dialog-display-name"
          v-model="displayName"
          name="displayName"
          autocomplete="name"
          required
        />
      </div>

      <fieldset class="form-dialog-example-fieldset">
        <legend>通知方式</legend>
        <ORadioGroup v-model="channel" name="notificationChannel" aria-label="通知方式">
          <ORadio value="email" label="邮件" />
          <ORadio value="message" label="站内消息" />
        </ORadioGroup>
      </fieldset>

      <OCheckbox v-model="subscribed" name="subscribed" label="接收产品更新" />
    </OFormDialog>
  </div>
</template>

<style scoped>
.form-dialog-example-field {
  display: grid;
  gap: var(--omg-space-2);
}

.form-dialog-example-field > label,
.form-dialog-example-fieldset > legend {
  color: var(--omg-color-text);
  font-size: var(--omg-font-size-sm);
  font-weight: var(--omg-font-weight-semibold);
}

.form-dialog-example-fieldset {
  display: grid;
  gap: var(--omg-space-2);
  min-inline-size: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
</style>
