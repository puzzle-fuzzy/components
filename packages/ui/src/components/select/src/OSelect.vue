<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller'
import { LuCheck, LuChevronDown, LuX } from 'vue-icons-plus/lu'
import {
  computed,
  nextTick,
  onMounted,
  ref,
  shallowRef,
  useId,
  watch,
  type CSSProperties,
  type ComponentPublicInstance,
} from 'vue'

import { useControllableOpen } from '../../../composables/use-controllable-open'
import { useFloatingPanel } from '../../../composables/use-floating-panel'
import {
  findFirstEnabledIndex,
  findLastEnabledIndex,
  findNextEnabledIndex,
} from '../../../utils/collection-navigation'
import {
  normalizeOSelectVirtualListHeight,
  normalizeOSelectVirtualThreshold,
  oSelectProps,
  type OSelectEmits,
  type OSelectOption,
  type OSelectSlots,
  type OSelectValue,
} from './select'

defineOptions({
  name: 'OSelect',
  inheritAttrs: false,
})

const props = defineProps(oSelectProps)
const emit = defineEmits<OSelectEmits>()

defineSlots<OSelectSlots>()

const triggerElement = shallowRef<HTMLButtonElement | null>(null)
interface OSelectVirtualScrollerExpose {
  scrollToItem: (
    index: number,
    options?: { align?: 'start' | 'center' | 'end' | 'nearest' },
  ) => void
}

const virtualScroller = shallowRef<OSelectVirtualScrollerExpose | null>(null)
const optionElements = shallowRef<Array<HTMLElement | null>>([])
const activeIndex = ref(-1)
const ariaActiveIndex = ref(-1)
const activeValue = shallowRef<OSelectValue>()
const isMounted = ref(false)
const instanceId = useId()
const comboboxId = `o-select-${instanceId}-combobox`
const listboxId = `o-select-${instanceId}-listbox`
const virtualItemSize = 36
const virtualPanelChromeSize = 10

onMounted(() => {
  isMounted.value = true
  if (isListboxOpen.value && isVirtualized.value) void scrollActiveOptionIntoView()
})

const selectedIndex = computed(() =>
  props.options.findIndex((option) => Object.is(option.value, props.modelValue)),
)
const selectedOption = computed(() => props.options[selectedIndex.value])
const virtualOptions = computed<OSelectOption[]>(() => Array.from(props.options))
const isVirtualized = computed(
  () =>
    props.virtual &&
    props.options.length >= normalizeOSelectVirtualThreshold(props.virtualThreshold),
)

const { isOpen, setOpen, toggle } = useControllableOpen({
  open: computed(() => props.open),
  emit: (event, value) => emit(event, value),
})
const isListboxOpen = computed(() => isOpen.value && !props.disabled)

const floating = useFloatingPanel({
  isOpen: isListboxOpen,
  placement: computed(() => props.placement),
  matchReferenceWidth: true,
  onDismiss: () => setOpen(false),
})
const virtualListStyle = computed<CSSProperties>(() => {
  const requestedHeight = Math.min(
    normalizeOSelectVirtualListHeight(props.virtualListHeight),
    Math.max(virtualItemSize, props.options.length * virtualItemSize),
  )
  const availableListHeight =
    floating.availableHeight.value === undefined
      ? requestedHeight
      : Math.max(0, floating.availableHeight.value - virtualPanelChromeSize)

  return { blockSize: `${String(Math.min(requestedHeight, availableListHeight))}px` }
})

const activeOptionId = computed(() =>
  isListboxOpen.value && ariaActiveIndex.value >= 0
    ? `${listboxId}-option-${ariaActiveIndex.value}`
    : undefined,
)

const getVirtualOptionKey = (option: OSelectOption, index: number): string =>
  `${typeof option.value}:${String(option.value)}:${String(index)}`

const getInitialActiveIndex = (): number => {
  const index = selectedIndex.value
  if (index >= 0 && !props.options[index]?.disabled) return index

  return findFirstEnabledIndex(props.options)
}

const setActiveIndex = (index: number): void => {
  const option = props.options[index]
  if (!option || option.disabled) {
    activeIndex.value = -1
    ariaActiveIndex.value = -1
    activeValue.value = undefined
    return
  }

  activeIndex.value = index
  activeValue.value = option.value
  if (!isVirtualized.value || optionElements.value[index]) ariaActiveIndex.value = index
}

const ensureActiveIndex = (): void => {
  if (activeValue.value !== undefined) {
    const index = props.options.findIndex(
      (option) => Object.is(option.value, activeValue.value) && !option.disabled,
    )
    if (index >= 0) {
      setActiveIndex(index)
      return
    }
  }

  setActiveIndex(getInitialActiveIndex())
}

watch(
  isListboxOpen,
  (open) => {
    if (open) {
      ensureActiveIndex()
      return
    }

    setActiveIndex(-1)
  },
  { immediate: true },
)

watch(
  () => props.options,
  () => {
    if (isListboxOpen.value) {
      ensureActiveIndex()
      if (isVirtualized.value) void scrollActiveOptionIntoView()
    }
  },
)

const setTriggerElement = (element: Element | ComponentPublicInstance | null): void => {
  const trigger = element instanceof HTMLButtonElement ? element : null
  triggerElement.value = trigger
  floating.setReferenceElement(trigger)
}

const setVirtualScroller = (element: unknown): void => {
  if (
    element &&
    typeof element === 'object' &&
    'scrollToItem' in element &&
    typeof element.scrollToItem === 'function'
  ) {
    virtualScroller.value = element as OSelectVirtualScrollerExpose
    return
  }

  virtualScroller.value = null
}

const setOptionElement = (
  element: Element | ComponentPublicInstance | null,
  index: number,
): void => {
  optionElements.value[index] = element instanceof HTMLElement ? element : null
}

async function scrollActiveOptionIntoView(): Promise<void> {
  const index = activeIndex.value
  if (index < 0) return

  if (isVirtualized.value) {
    await nextTick()
    if (activeIndex.value !== index) return
    virtualScroller.value?.scrollToItem(index, { align: 'nearest' })
    await nextTick()
    if (activeIndex.value !== index) return
    ariaActiveIndex.value = index
    return
  }

  await nextTick()
  if (activeIndex.value !== index) return
  optionElements.value[index]?.scrollIntoView?.({ block: 'nearest' })
}

const openAt = (index: number, keepActiveVisible = false): void => {
  if (props.disabled) return

  setActiveIndex(index)
  if (!isListboxOpen.value) setOpen(true)
  if (keepActiveVisible) void scrollActiveOptionIntoView()
}

const handleTriggerClick = (): void => {
  if (props.disabled) return

  const opening = !isListboxOpen.value
  if (opening) setActiveIndex(getInitialActiveIndex())
  toggle()
  if (opening && isVirtualized.value) void scrollActiveOptionIntoView()
}

const selectOption = (option: OSelectOption): void => {
  if (props.disabled || option.disabled) return

  emit('update:modelValue', option.value)
  emit('change', option.value, option)
  setOpen(false)
  triggerElement.value?.focus()
}

const clear = (event: MouseEvent): void => {
  event.stopPropagation()
  emit('update:modelValue', undefined)
  emit('clear')
  triggerElement.value?.focus()
}

const setActiveOption = (index: number): void => {
  if (!isListboxOpen.value || props.options[index]?.disabled) return
  setActiveIndex(index)
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (props.disabled) return

  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowUp': {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      const nextIndex = isListboxOpen.value
        ? findNextEnabledIndex(props.options, activeIndex.value, direction)
        : direction === 1
          ? findFirstEnabledIndex(props.options)
          : findLastEnabledIndex(props.options)
      openAt(nextIndex, true)
      break
    }
    case 'Home':
    case 'End':
      if (isListboxOpen.value) {
        event.preventDefault()
        setActiveIndex(
          event.key === 'Home'
            ? findFirstEnabledIndex(props.options)
            : findLastEnabledIndex(props.options),
        )
        void scrollActiveOptionIntoView()
      }
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (isListboxOpen.value) {
        if (activeIndex.value >= 0) {
          const option = props.options[activeIndex.value]
          if (option) selectOption(option)
        }
        break
      }
      openAt(getInitialActiveIndex(), true)
      break
    case 'Escape':
      if (isListboxOpen.value) {
        event.preventDefault()
        setOpen(false)
      }
      break
    case 'Tab':
      if (isListboxOpen.value) setOpen(false)
      break
  }
}

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled && isOpen.value) setOpen(false)
  },
)
</script>

<template>
  <div
    v-bind="$attrs"
    class="o-select"
    :class="[
      `o-select--${props.size}`,
      `o-select--${props.variant}`,
      {
        'is-clearable': props.clearable && selectedOption && !props.disabled,
        'is-disabled': props.disabled,
      },
    ]"
    :data-open="isListboxOpen || undefined"
  >
    <div class="o-select__control">
      <button
        :id="comboboxId"
        :ref="setTriggerElement"
        class="o-select__trigger"
        type="button"
        role="combobox"
        :disabled="props.disabled"
        aria-autocomplete="none"
        aria-haspopup="listbox"
        :aria-label="props.ariaLabel"
        :aria-expanded="isListboxOpen"
        :aria-controls="isListboxOpen ? listboxId : undefined"
        :aria-activedescendant="activeOptionId"
        @click="handleTriggerClick"
        @keydown="handleKeydown"
      >
        <span class="o-select__value" :class="{ 'o-select__value--placeholder': !selectedOption }">
          {{ selectedOption?.label ?? props.placeholder }}
        </span>
        <LuChevronDown class="o-select__indicator" aria-hidden="true" />
      </button>

      <button
        v-if="props.clearable && selectedOption && !props.disabled"
        class="o-select__clear"
        type="button"
        :aria-label="props.clearAriaLabel"
        @click="clear"
      >
        <LuX aria-hidden="true" />
      </button>
    </div>

    <Teleport :to="props.teleportTo" :disabled="!isMounted || !props.teleported">
      <Transition name="o-select-panel">
        <div
          v-if="isListboxOpen"
          :id="listboxId"
          :ref="floating.setFloatingElement"
          class="o-select__panel"
          :class="{ 'is-virtualized': isVirtualized }"
          :style="floating.floatingStyle.value"
          :data-placement="floating.resolvedPlacement.value"
          role="listbox"
          :aria-labelledby="comboboxId"
        >
          <RecycleScroller
            v-if="isVirtualized"
            :ref="setVirtualScroller"
            class="o-select__virtual-list"
            :style="virtualListStyle"
            :items="virtualOptions"
            :item-size="virtualItemSize"
            :key-field="getVirtualOptionKey"
            :buffer="200"
            :prerender="8"
          >
            <template #default="{ item: option, index }">
              <div
                :id="`${listboxId}-option-${index}`"
                :ref="(element) => setOptionElement(element, index)"
                class="o-select__option"
                :class="{
                  'is-active': activeIndex === index,
                  'is-selected': selectedIndex === index,
                  'is-disabled': option.disabled,
                }"
                role="option"
                :aria-selected="selectedIndex === index"
                :aria-disabled="option.disabled || undefined"
                :aria-setsize="props.options.length"
                :aria-posinset="index + 1"
                @pointerdown.prevent
                @pointerenter="setActiveOption(index)"
                @click="selectOption(option)"
              >
                <span class="o-select__option-label">
                  <slot
                    name="option"
                    :option="option"
                    :selected="selectedIndex === index"
                    :active="activeIndex === index"
                  >
                    {{ option.label }}
                  </slot>
                </span>
                <LuCheck
                  v-if="selectedIndex === index"
                  class="o-select__check"
                  aria-hidden="true"
                />
              </div>
            </template>
          </RecycleScroller>

          <template v-else>
            <div
              v-for="(option, index) in props.options"
              :id="`${listboxId}-option-${index}`"
              :ref="(element) => setOptionElement(element, index)"
              :key="option.value"
              class="o-select__option"
              :class="{
                'is-active': activeIndex === index,
                'is-selected': selectedIndex === index,
                'is-disabled': option.disabled,
              }"
              role="option"
              :aria-selected="selectedIndex === index"
              :aria-disabled="option.disabled || undefined"
              :aria-setsize="props.options.length"
              :aria-posinset="index + 1"
              @pointerdown.prevent
              @pointerenter="setActiveOption(index)"
              @click="selectOption(option)"
            >
              <span class="o-select__option-label">
                <slot
                  name="option"
                  :option="option"
                  :selected="selectedIndex === index"
                  :active="activeIndex === index"
                >
                  {{ option.label }}
                </slot>
              </span>
              <LuCheck v-if="selectedIndex === index" class="o-select__check" aria-hidden="true" />
            </div>
          </template>

          <div v-if="props.options.length === 0" class="o-select__empty">
            <slot name="empty">No options</slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
