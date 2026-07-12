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
</script>

<template>
  <div class="omg-example-stack">
    <OTabs v-model="selected" :items="transferItems" aria-label="传输类型" />
    <OTabs v-model="lineSelected" :items="lineItems" variant="line" aria-label="内容视图" />
  </div>
</template>
