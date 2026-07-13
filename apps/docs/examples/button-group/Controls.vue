<script setup lang="ts">
import { ref } from 'vue'
import { OButtonGroup, ODropdown, OInput, OSelect } from '@puzzle-fuzzy/ui'
import type { ODropdownItem, OSelectOption } from '@puzzle-fuzzy/ui'

const query = ref('components')
const scope = ref('all')
const menuOpen = ref(false)

const scopes: readonly OSelectOption[] = [
  { label: '全部', value: 'all' },
  { label: '组件', value: 'components' },
]
const actions: readonly ODropdownItem[] = [
  { label: '保存筛选', value: 'save' },
  { label: '清除筛选', value: 'clear' },
]
</script>

<template>
  <div class="button-group-controls">
    <OButtonGroup aria-label="搜索组件">
      <OInput v-model="query" aria-label="搜索关键词" />
      <OSelect v-model="scope" aria-label="搜索范围" :options="scopes" />
      <ODropdown v-model:open="menuOpen" trigger-aria-label="筛选操作" :items="actions" />
    </OButtonGroup>

    <section dir="rtl" class="button-group-controls-rtl" aria-label="Button Group RTL state">
      <OButtonGroup aria-label="RTL 搜索组件">
        <OInput model-value="واجهة" aria-label="RTL 搜索关键词" />
        <OSelect model-value="all" aria-label="RTL 搜索范围" :options="scopes" />
      </OButtonGroup>
    </section>
  </div>
</template>

<style scoped lang="less">
.button-group-controls {
  display: grid;
  width: 100%;
  gap: var(--omg-space-4);
}

.button-group-controls :deep(.o-button-group) {
  width: min(100%, 620px);
}

.button-group-controls :deep(.o-input) {
  min-width: 0;
  flex: 1 1 220px;
}

.button-group-controls-rtl {
  padding: var(--omg-space-3);
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
}

@media (width <= 560px) {
  .button-group-controls :deep(.o-button-group) {
    align-items: stretch;
  }
}
</style>
