<script setup lang="ts">
import { ORadio, ORadioGroup, type ORadioValue } from '@puzzle-fuzzy/ui'
import { ref } from 'vue'

const channel = ref<ORadioValue>('email')
const density = ref<ORadioValue>(2)
</script>

<template>
  <div class="omg-example-stack">
    <span id="channel-label">通知方式</span>
    <ORadioGroup v-model="channel" aria-labelledby="channel-label" orientation="horizontal">
      <ORadio label="邮件" value="email" />
      <ORadio label="短信" value="sms" />
      <ORadio disabled label="电话（不可用）" value="phone" />
    </ORadioGroup>
    <span aria-live="polite">当前通知方式：{{ channel }}</span>

    <span id="density-label">界面密度</span>
    <ORadioGroup v-model="density" aria-labelledby="density-label">
      <ORadio label="紧凑" :value="1" />
      <ORadio label="舒适" :value="2" />
    </ORadioGroup>
  </div>
</template>
