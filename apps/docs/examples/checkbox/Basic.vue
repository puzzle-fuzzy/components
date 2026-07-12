<script setup lang="ts">
import { OCheckbox } from '@puzzle-fuzzy/ui'
import { computed, ref } from 'vue'

const choices = ref(['design'])
const allValues = ['design', 'testing'] as const
const allSelected = computed(() => allValues.every((value) => choices.value.includes(value)))
const partlySelected = computed(() => choices.value.length > 0 && !allSelected.value)

const toggleChoice = (value: (typeof allValues)[number], selected: boolean): void => {
  choices.value = selected
    ? [...new Set([...choices.value, value])]
    : choices.value.filter((choice) => choice !== value)
}

const toggleAll = (selected: boolean): void => {
  choices.value = selected ? [...allValues] : []
}
</script>

<template>
  <div class="omg-example-stack">
    <OCheckbox
      label="选择全部能力"
      :indeterminate="partlySelected"
      :model-value="allSelected"
      @update:model-value="toggleAll"
    />
    <OCheckbox
      label="组件设计"
      :model-value="choices.includes('design')"
      @update:model-value="toggleChoice('design', $event)"
    />
    <OCheckbox
      label="自动化测试"
      :model-value="choices.includes('testing')"
      @update:model-value="toggleChoice('testing', $event)"
    />
    <span aria-live="polite">当前选择：{{ choices.join('、') || '无' }}</span>
  </div>
</template>
