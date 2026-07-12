<script setup lang="ts">
import { ref } from 'vue'
import {
  OButton,
  ODrawer,
  OInput,
  OSelect,
  type OSelectOption,
  type OSelectValue,
} from '@puzzle-fuzzy/ui'

const open = ref(false)
const panelName = ref('个人工作台')
const density = ref<OSelectValue>('comfortable')

const densityOptions: readonly OSelectOption[] = [
  { value: 'compact', label: '紧凑' },
  { value: 'comfortable', label: '舒适' },
  { value: 'spacious', label: '宽松' },
]

const detailRows = Array.from({ length: 40 }, (_, index) => ({
  id: index + 1,
  label: `展示项目 ${String(index + 1).padStart(2, '0')}`,
  value: index % 3 === 0 ? '重点' : index % 3 === 1 ? '常规' : '安静',
}))
</script>

<template>
  <div class="omg-example-stack">
    <OButton @click="open = true">打开滚动面板</OButton>

    <ODrawer v-model:open="open" size="min(92vw, 34rem)" close-aria-label="关闭组件设置面板">
      <template #header>
        <div class="omg-drawer-custom-header">
          <span>Personal workspace</span>
          <h2>组件设置</h2>
          <p>自定义头部、表单控件与长内容保持在同一原生 top layer 中。</p>
        </div>
      </template>

      <div class="omg-drawer-fields">
        <label>
          <span>面板名称</span>
          <OInput v-model="panelName" aria-label="面板名称" clearable />
        </label>
        <label>
          <span>内容密度</span>
          <OSelect
            v-model="density"
            aria-label="抽屉内选择器"
            :options="densityOptions"
            :teleported="false"
          />
        </label>
      </div>

      <ol class="omg-drawer-detail-list" aria-label="滚动展示项目">
        <li v-for="row in detailRows" :key="row.id">
          <span>{{ row.label }}</span>
          <strong>{{ row.value }}</strong>
        </li>
      </ol>

      <template #footer>
        <span class="omg-drawer-footer-note">当前密度：{{ density }}</span>
        <OButton @click="open = false">关闭组件设置</OButton>
      </template>
    </ODrawer>
  </div>
</template>

<style scoped>
.omg-drawer-custom-header {
  display: grid;
  gap: var(--omg-space-1);
}

.omg-drawer-custom-header > span {
  color: var(--omg-color-brand);
  font-size: var(--omg-font-size-xs);
  font-weight: var(--omg-font-weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.omg-drawer-custom-header h2,
.omg-drawer-custom-header p {
  margin: 0;
}

.omg-drawer-custom-header h2 {
  font-size: var(--omg-font-size-lg);
  line-height: 1.25;
}

.omg-drawer-custom-header p {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.omg-drawer-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--omg-space-3);
  margin-bottom: var(--omg-space-4);
}

.omg-drawer-fields label {
  display: grid;
  min-width: 0;
  gap: var(--omg-space-2);
}

.omg-drawer-fields label > span {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
  font-weight: var(--omg-font-weight-semibold);
}

.omg-drawer-detail-list {
  display: grid;
  gap: var(--omg-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.omg-drawer-detail-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--omg-space-4);
  padding: var(--omg-space-2) var(--omg-space-3);
  border-radius: var(--omg-radius-md);
  background: var(--omg-color-surface-muted);
}

.omg-drawer-detail-list strong {
  flex: 0 0 auto;
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.omg-drawer-footer-note {
  margin-inline-end: auto;
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

@media (width <= 480px) {
  .omg-drawer-fields {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
