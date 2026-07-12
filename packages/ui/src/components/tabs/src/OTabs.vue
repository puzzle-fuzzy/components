<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'

import { oTabsProps, type OTabsEmits, type OTabsItem, type OTabsSlots } from './tabs'

defineOptions({ name: 'OTabs' })

const props = defineProps(oTabsProps)
const emit = defineEmits<OTabsEmits>()
const slots = defineSlots<OTabsSlots>()

const tabElements = new Map<string, HTMLButtonElement>()
const instanceId = useId()

const enabledItems = computed(() => props.items.filter((item) => !item.disabled))
const selectedItem = computed(
  () =>
    props.items.find((item) => item.value === props.modelValue && !item.disabled) ??
    enabledItems.value[0],
)
const selectedValue = computed(() => selectedItem.value?.value)
const enabledValues = computed(() => enabledItems.value.map((item) => item.value))
const focusedValue = ref(selectedValue.value)

const valueIdSegment = (value: string): string =>
  Array.from(value, (character) => character.codePointAt(0)?.toString(16) ?? '').join('-') ||
  'empty'
const tabId = (value: string): string => `o-tabs-${instanceId}-tab-${valueIdSegment(value)}`
const panelId = (value: string): string => `o-tabs-${instanceId}-panel-${valueIdSegment(value)}`

const setTabElement = (element: unknown, value: string): void => {
  if (typeof HTMLButtonElement !== 'undefined' && element instanceof HTMLButtonElement) {
    tabElements.set(value, element)
  } else {
    tabElements.delete(value)
  }
}

const focusItem = async (item: OTabsItem): Promise<void> => {
  focusedValue.value = item.value
  await nextTick()
  tabElements.get(item.value)?.focus()
}

const activateItem = (item: OTabsItem, focus = false): void => {
  if (item.disabled) return

  focusedValue.value = item.value
  if (item.value !== props.modelValue) {
    emit('update:modelValue', item.value)
    emit('change', item.value)
  }

  if (focus) void focusItem(item)
}

const move = (current: OTabsItem, direction: 1 | -1): void => {
  const enabled = enabledItems.value
  if (enabled.length === 0) return

  const currentIndex = enabled.findIndex((item) => item.value === current.value)
  const nextIndex =
    currentIndex < 0 ? 0 : (currentIndex + direction + enabled.length) % enabled.length
  const nextItem = enabled[nextIndex]
  if (nextItem) activateItem(nextItem, true)
}

const handleKeydown = (event: KeyboardEvent, item: OTabsItem): void => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault()
    move(item, event.key === 'ArrowRight' ? 1 : -1)
    return
  }

  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    const boundaryItem = event.key === 'Home' ? enabledItems.value[0] : enabledItems.value.at(-1)
    if (boundaryItem) activateItem(boundaryItem, true)
  }
}

watch(enabledValues, (values) => {
  if (!focusedValue.value || !values.includes(focusedValue.value)) {
    focusedValue.value = selectedValue.value
  }
})

watch(selectedValue, (value, previousValue) => {
  if (
    focusedValue.value === previousValue ||
    !focusedValue.value ||
    !enabledValues.value.includes(focusedValue.value)
  ) {
    focusedValue.value = value
  }
})
</script>

<template>
  <div class="o-tabs" :class="`o-tabs--${props.variant}`">
    <div
      class="o-tabs__list"
      role="tablist"
      aria-orientation="horizontal"
      :aria-label="props.ariaLabel"
    >
      <button
        v-for="item in props.items"
        :id="tabId(item.value)"
        :key="item.value"
        :ref="(element) => setTabElement(element, item.value)"
        class="o-tabs__tab"
        :class="{ 'is-active': item.value === selectedValue }"
        type="button"
        role="tab"
        :aria-selected="item.value === selectedValue"
        :aria-disabled="item.disabled || undefined"
        :aria-controls="slots.default ? panelId(item.value) : undefined"
        :tabindex="!item.disabled && item.value === focusedValue ? 0 : -1"
        :disabled="item.disabled"
        @focus="focusedValue = item.value"
        @click="activateItem(item)"
        @keydown="handleKeydown($event, item)"
      >
        {{ item.label }}
      </button>
    </div>

    <template v-if="slots.default">
      <div
        v-for="item in props.items"
        :id="panelId(item.value)"
        :key="`panel-${item.value}`"
        class="o-tabs__panel"
        role="tabpanel"
        :aria-labelledby="tabId(item.value)"
        :hidden="item.value !== selectedValue"
        :tabindex="item.value === selectedValue ? 0 : -1"
      >
        <slot :item="item" :selected="item.value === selectedValue" />
      </div>
    </template>
  </div>
</template>
