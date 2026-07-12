<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'

import { oTabsProps, type OTabsEmits, type OTabsItem } from './tabs'

defineOptions({ name: 'OTabs' })

const props = defineProps(oTabsProps)
const emit = defineEmits<OTabsEmits>()

const tabElements = ref<Array<HTMLButtonElement | undefined>>([])
const enabledItems = computed(() => props.items.filter((item) => !item.disabled))
const activeIndex = computed(() =>
  Math.max(
    0,
    props.items.findIndex((item) => item.value === props.modelValue),
  ),
)
const indicatorStyle = computed(() => ({
  width: props.items.length === 0 ? '0%' : `${String(100 / props.items.length)}%`,
  transform: `translateX(${String(activeIndex.value * 100)}%)`,
}))

const setTabElement = (element: unknown, index: number): void => {
  tabElements.value[index] = element instanceof HTMLButtonElement ? element : undefined
}

const selectItem = (item: OTabsItem, focus = false): void => {
  if (item.disabled || item.value === props.modelValue) return

  emit('update:modelValue', item.value)
  emit('change', item.value)

  if (focus) {
    void nextTick(() => {
      const index = props.items.findIndex((candidate) => candidate.value === item.value)
      tabElements.value[index]?.focus()
    })
  }
}

const move = (current: OTabsItem, direction: 1 | -1): void => {
  const enabled = enabledItems.value
  const currentIndex = enabled.findIndex((item) => item.value === current.value)
  if (currentIndex < 0) return

  const nextIndex = (currentIndex + direction + enabled.length) % enabled.length
  const nextItem = enabled[nextIndex]
  if (nextItem) selectItem(nextItem, true)
}

const handleKeydown = (event: KeyboardEvent, item: OTabsItem): void => {
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    move(item, 1)
    return
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    move(item, -1)
    return
  }

  if (event.key === 'Home') {
    event.preventDefault()
    const first = enabledItems.value[0]
    if (first) selectItem(first, true)
    return
  }

  if (event.key === 'End') {
    event.preventDefault()
    const last = enabledItems.value.at(-1)
    if (last) selectItem(last, true)
  }
}
</script>

<template>
  <div class="o-tabs" :class="`o-tabs--${props.variant}`">
    <div class="o-tabs__list" role="tablist" :aria-label="props.ariaLabel">
      <span class="o-tabs__indicator" :style="indicatorStyle" aria-hidden="true" />
      <button
        v-for="(item, index) in props.items"
        :key="item.value"
        :ref="(element) => setTabElement(element, index)"
        class="o-tabs__tab"
        type="button"
        role="tab"
        :aria-selected="item.value === props.modelValue"
        :aria-disabled="item.disabled || undefined"
        :tabindex="item.value === props.modelValue ? 0 : -1"
        :disabled="item.disabled"
        @click="selectItem(item)"
        @keydown="handleKeydown($event, item)"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>
