<script setup lang="ts">
import { ref } from 'vue'
import { OTabs, type OTabsItem } from '@puzzle-fuzzy/ui'

const selected = ref('text')
const lineSelected = ref('overview')

const transferItems: OTabsItem[] = [
  { value: 'text', label: '传输文本' },
  { value: 'file', label: '传输文件' },
]

const lineItems: OTabsItem[] = [
  { value: 'overview', label: '概览' },
  { value: 'activity', label: '动态' },
  { value: 'disabled', label: '禁用', disabled: true },
]

const descriptions: Record<string, string> = {
  text: '编辑并传输一段文本。',
  file: '选择并传输一个或多个文件。',
  overview: '查看当前任务的概要信息。',
  activity: '查看最近的操作记录。',
  disabled: '此视图当前不可用。',
}
</script>

<template>
  <div class="omg-example-stack">
    <OTabs v-model="selected" :items="transferItems" aria-label="传输类型">
      <template #default="{ item }">
        <div class="omg-example-panel">{{ descriptions[item.value] }}</div>
      </template>
    </OTabs>
    <OTabs v-model="lineSelected" :items="lineItems" variant="line" aria-label="内容视图">
      <template #default="{ item }">
        <div class="omg-example-panel">{{ descriptions[item.value] }}</div>
      </template>
    </OTabs>
  </div>
</template>
