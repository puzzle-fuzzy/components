<script setup lang="ts">
import { computed, nextTick, onBeforeUpdate, onMounted, ref, shallowRef, useId, watch } from 'vue'
import { LuChevronDown } from 'vue-icons-plus/lu'

import { useControllableOpen } from '../../../composables/use-controllable-open'
import { useFloatingPanel } from '../../../composables/use-floating-panel'
import {
  findFirstEnabledIndex,
  findLastEnabledIndex,
  findNextEnabledIndex,
  type CollectionNavigationDirection,
} from '../../../utils/collection-navigation'
import {
  oDropdownProps,
  type ODropdownEmits,
  type ODropdownItem,
  type ODropdownSlots,
  type ODropdownValue,
} from './dropdown'

defineOptions({ name: 'ODropdown' })

const props = defineProps(oDropdownProps)
const emit = defineEmits<ODropdownEmits>()

defineSlots<ODropdownSlots>()

const triggerElement = shallowRef<HTMLButtonElement | null>(null)
const itemElements = shallowRef<Array<HTMLButtonElement | null>>([])
const activeIndex = ref(-1)
const activeValue = shallowRef<ODropdownValue>()
const isMounted = ref(false)
const dropdownId = `o-dropdown-${useId()}`
const triggerId = `${dropdownId}-trigger`
const menuId = `${dropdownId}-menu`

onMounted(() => {
  isMounted.value = true
})

const { isOpen, setOpen, toggle } = useControllableOpen({
  open: computed(() => props.open),
  emit: (event, value) => emit(event, value),
})
const isMenuOpen = computed(() => isOpen.value && !props.disabled)

const setTriggerElement = (element: unknown): void => {
  const trigger =
    typeof HTMLButtonElement !== 'undefined' && element instanceof HTMLButtonElement
      ? element
      : null

  triggerElement.value = trigger
  floating.setReferenceElement(trigger)
}

const setFloatingElement = (element: unknown): void => {
  const panel =
    typeof HTMLElement !== 'undefined' && element instanceof HTMLElement ? element : null
  floating.setFloatingElement(panel)
}

const setItemElement = (element: unknown, index: number): void => {
  itemElements.value[index] =
    typeof HTMLButtonElement !== 'undefined' && element instanceof HTMLButtonElement
      ? element
      : null
}

const focusActiveItem = (): boolean => {
  if (!isMenuOpen.value || !floating.ready.value || activeValue.value === undefined) return false

  const currentIndex = props.items.findIndex(
    (item) => Object.is(item.value, activeValue.value) && !item.disabled,
  )
  const element = itemElements.value[currentIndex]
  if (currentIndex < 0 || !element) return false

  activeIndex.value = currentIndex
  element.focus()
  return true
}

const focusItem = async (index: number): Promise<void> => {
  const item = props.items[index]
  if (!item || item.disabled) {
    activeIndex.value = -1
    activeValue.value = undefined
    await nextTick()
    if (isMenuOpen.value) triggerElement.value?.focus()
    return
  }

  activeIndex.value = index
  activeValue.value = item.value
  if (focusActiveItem()) return

  await nextTick()
  focusActiveItem()
}

const resolveActiveIndex = (): number => {
  if (activeValue.value !== undefined) {
    const index = props.items.findIndex(
      (item) => Object.is(item.value, activeValue.value) && !item.disabled,
    )
    if (index >= 0) return index
  }

  return findFirstEnabledIndex(props.items)
}

const close = async (restoreFocus: boolean): Promise<void> => {
  setOpen(false)
  await nextTick()
  if (isMenuOpen.value) return

  if (restoreFocus) {
    triggerElement.value?.focus()
  }
}

const floating = useFloatingPanel({
  isOpen: isMenuOpen,
  placement: computed(() => props.placement),
  onDismiss: () => void close(false),
})

const openFromKeyboard = async (direction: CollectionNavigationDirection): Promise<void> => {
  if (props.disabled) return

  if (!isMenuOpen.value) setOpen(true)
  const index =
    direction === 1 ? findFirstEnabledIndex(props.items) : findLastEnabledIndex(props.items)
  await focusItem(index)
}

const selectItem = async (item: ODropdownItem): Promise<void> => {
  if (props.disabled || item.disabled) return

  emit('select', item.value, item)
  await close(true)
}

const focusBoundaryItem = (boundary: 'first' | 'last'): void => {
  const index =
    boundary === 'first' ? findFirstEnabledIndex(props.items) : findLastEnabledIndex(props.items)
  void focusItem(index)
}

const focusAdjacentItem = (direction: CollectionNavigationDirection): void => {
  const index = findNextEnabledIndex(props.items, activeIndex.value, direction)
  void focusItem(index)
}

const handleTriggerClick = (): void => {
  if (props.disabled) return

  const opening = !isMenuOpen.value
  toggle()
  if (opening) focusBoundaryItem('first')
}

const handleTriggerKeydown = (event: KeyboardEvent): void => {
  if (props.disabled) return

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    void openFromKeyboard(event.key === 'ArrowDown' ? 1 : -1)
    return
  }

  if (event.key === 'Escape' && isMenuOpen.value) {
    event.preventDefault()
    void close(true)
    return
  }

  if (event.key === 'Tab' && isMenuOpen.value) void close(false)
}

const handleMenuKeydown = (event: KeyboardEvent): void => {
  if (props.disabled) return

  const target = event.target
  if (typeof HTMLButtonElement !== 'undefined' && target instanceof HTMLButtonElement) {
    const targetIndex = itemElements.value.indexOf(target)
    const targetItem = props.items[targetIndex]
    if (targetIndex >= 0 && targetItem && !targetItem.disabled) {
      activeIndex.value = targetIndex
      activeValue.value = targetItem.value
    }
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    focusAdjacentItem(event.key === 'ArrowDown' ? 1 : -1)
    return
  }

  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    focusBoundaryItem(event.key === 'Home' ? 'first' : 'last')
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const item = props.items[activeIndex.value]
    if (item) void selectItem(item)
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    void close(true)
    return
  }

  if (event.key === 'Tab') {
    triggerElement.value?.focus()
    void close(false)
  }
}

const handleItemFocus = (index: number): void => {
  const item = props.items[index]
  if (!item || item.disabled) return

  activeIndex.value = index
  activeValue.value = item.value
}

onBeforeUpdate(() => {
  itemElements.value = []
})

watch(
  isMenuOpen,
  (open, wasOpen) => {
    if (open || !wasOpen) return

    const panel = floating.floatingElement.value
    if (panel?.contains(panel.ownerDocument.activeElement)) triggerElement.value?.focus()
  },
  { flush: 'pre' },
)

watch(
  [isMenuOpen, floating.ready],
  ([open, ready]) => {
    if (!open) {
      activeIndex.value = -1
      activeValue.value = undefined
      return
    }

    const index = resolveActiveIndex()
    if (ready) {
      void focusItem(index)
      return
    }

    const item = props.items[index]
    activeIndex.value = index
    activeValue.value = item?.value
  },
  { immediate: true, flush: 'post' },
)

watch(
  () => props.items,
  () => {
    if (!isMenuOpen.value) return
    void focusItem(resolveActiveIndex())
  },
  { flush: 'post' },
)

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled && isOpen.value) setOpen(false)
  },
)
</script>

<template>
  <div class="o-dropdown" :data-open="isMenuOpen || undefined">
    <button
      :id="triggerId"
      :ref="setTriggerElement"
      class="o-dropdown__trigger"
      type="button"
      :disabled="props.disabled"
      aria-haspopup="menu"
      :aria-expanded="isMenuOpen"
      :aria-controls="isMenuOpen ? menuId : undefined"
      :aria-label="props.triggerAriaLabel"
      @click="handleTriggerClick"
      @keydown="handleTriggerKeydown"
    >
      <span class="o-dropdown__trigger-content">
        <slot name="trigger" :open="isMenuOpen" />
      </span>
      <LuChevronDown v-if="props.showIndicator" class="o-dropdown__indicator" aria-hidden="true" />
    </button>

    <Teleport :to="props.teleportTo" :disabled="!isMounted || !props.teleported">
      <Transition name="o-dropdown-panel">
        <div
          v-if="isMenuOpen"
          :id="menuId"
          :ref="setFloatingElement"
          class="o-dropdown__panel"
          :style="floating.floatingStyle.value"
          :data-placement="floating.resolvedPlacement.value"
          role="menu"
          :aria-labelledby="triggerId"
          @keydown="handleMenuKeydown"
        >
          <button
            v-for="(item, index) in props.items"
            :key="item.value"
            :ref="(element) => setItemElement(element, index)"
            class="o-dropdown__item"
            :class="[
              `o-dropdown__item--${item.tone ?? 'default'}`,
              { 'o-dropdown__item--divided': item.dividerBefore },
            ]"
            type="button"
            role="menuitem"
            :disabled="item.disabled"
            :tabindex="activeIndex === index ? 0 : -1"
            @focus="handleItemFocus(index)"
            @click="selectItem(item)"
          >
            <component
              :is="item.icon"
              v-if="item.icon"
              class="o-dropdown__item-icon"
              aria-hidden="true"
            />
            <span class="o-dropdown__item-label">
              <slot name="item" :item="item">{{ item.label }}</slot>
            </span>
          </button>
          <div v-if="props.items.length === 0" class="o-dropdown__empty">
            <slot name="empty" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
