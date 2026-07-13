<script setup lang="ts">
import { computed, ref } from 'vue'
import { OSelect, type OSelectOption, type OSelectValue } from '@puzzle-fuzzy/ui'

const selected = ref<OSelectValue>('foundation')
const outlineSelection = ref<OSelectValue>('advanced')
const longSelection = ref<OSelectValue>('long')
const rtlSelection = ref<OSelectValue>('advanced')
const lightSelection = ref<OSelectValue>('foundation')
const darkSelection = ref<OSelectValue>('advanced')
const virtualSelection = ref<OSelectValue>()

const options: readonly OSelectOption[] = [
  { value: 'foundation', label: '基础选项' },
  { value: 'reserved', label: '停用选项', disabled: true },
  { value: 'advanced', label: '进阶选项' },
  {
    value: 'long',
    label: '这是一个用于验证长文本省略和稳定尾部轨道的选项',
  },
]

const emptyOptions: readonly OSelectOption[] = []

const virtualOptions: readonly OSelectOption[] = Array.from({ length: 500 }, (_, index) => ({
  value: `virtual-${String(index + 1)}`,
  label: `大型选项 ${String(index + 1)}`,
}))

const selectedLabel = computed(
  () => options.find((option) => option.value === selected.value)?.label ?? '未选择',
)
</script>

<template>
  <div class="omg-example-stack">
    <div class="select-example-grid">
      <div class="select-example-field">
        <span>默认 soft · 可清除已选项</span>
        <OSelect
          v-model="selected"
          aria-label="选择展示项"
          class="select-example-control"
          clearable
          :options="options"
          placeholder="选择一个选项"
        />
        <small aria-live="polite">当前选择：{{ selectedLabel }}</small>
      </div>

      <div class="select-example-field">
        <span>Outline · 右对齐浮层</span>
        <OSelect
          v-model="outlineSelection"
          aria-label="选择右对齐展示项"
          class="select-example-control"
          :options="options"
          placement="bottom-end"
          variant="outline"
        />
      </div>

      <div class="select-example-field">
        <span>长文本</span>
        <OSelect
          v-model="longSelection"
          aria-label="选择长文本展示项"
          class="select-example-control"
          clearable
          :options="options"
        />
      </div>
    </div>

    <div class="select-example-grid select-example-grid-states">
      <div class="select-example-field">
        <span>Disabled（列表内同时包含停用项）</span>
        <OSelect
          aria-label="禁用选择器"
          class="select-example-control"
          disabled
          model-value="advanced"
          :options="options"
        />
      </div>
      <div class="select-example-field">
        <span>空列表</span>
        <OSelect
          aria-label="空选项选择器"
          class="select-example-control"
          :options="emptyOptions"
          placeholder="打开查看空状态"
        />
      </div>
      <div class="select-example-field" dir="rtl">
        <span>RTL</span>
        <OSelect
          v-model="rtlSelection"
          aria-label="从右到左选择器"
          class="select-example-control"
          clearable
          :options="options"
        />
      </div>
    </div>

    <div class="select-example-themes">
      <div class="omg-example-theme" data-omg-theme="light">
        <div class="select-example-field">
          <span>Light soft</span>
          <OSelect
            v-model="lightSelection"
            aria-label="浅色选择器"
            class="select-example-control"
            :options="options"
          />
        </div>
      </div>
      <div class="omg-example-theme" data-omg-theme="dark">
        <div class="select-example-field">
          <span>Dark outline</span>
          <OSelect
            v-model="darkSelection"
            aria-label="深色选择器"
            class="select-example-control"
            clearable
            :options="options"
            variant="outline"
          />
        </div>
      </div>
    </div>

    <div class="select-example-field">
      <span>虚拟滚动</span>
      <OSelect
        v-model="virtualSelection"
        aria-label="选择大型数据项"
        class="select-example-control"
        :options="virtualOptions"
        placeholder="500 个选项按需渲染"
        :virtual-threshold="100"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.select-example-grid,
.select-example-themes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: var(--omg-space-4);
}

.select-example-grid-states {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr));
}

.select-example-field {
  display: grid;
  min-inline-size: 0;
  gap: var(--omg-space-1);
}

.select-example-field small {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.select-example-control,
.omg-example-theme .select-example-field {
  inline-size: 100%;
}
</style>
