<script setup lang="ts">
import { computed, ref } from 'vue'
import { OSelect, type OSelectOption, type OSelectValue } from '@puzzle-fuzzy/ui'

const selected = ref<OSelectValue>()
const alignedSelection = ref<OSelectValue>('foundation')

const options: readonly OSelectOption[] = [
  { value: 'foundation', label: '基础选项' },
  { value: 'reserved', label: '停用选项', disabled: true },
  { value: 'advanced', label: '进阶选项' },
]

const selectedLabel = computed(
  () => options.find((option) => option.value === selected.value)?.label ?? '未选择',
)
</script>

<template>
  <div class="omg-example-stack">
    <OSelect
      v-model="selected"
      aria-label="选择展示项"
      clearable
      :options="options"
      placeholder="选择一个选项"
      size="md"
    />

    <span aria-live="polite">当前选择：{{ selectedLabel }}</span>

    <OSelect
      v-model="alignedSelection"
      aria-label="选择右对齐展示项"
      :options="options"
      placement="bottom-end"
    />
  </div>
</template>
