<script setup lang="ts">
import { LuX } from 'vue-icons-plus/lu'
import { computed, nextTick, onMounted, shallowRef, useId, watch } from 'vue'

import { oDialogProps, type ODialogEmits, type ODialogSlots } from './dialog'

defineOptions({
  name: 'ODialog',
  inheritAttrs: false,
})

const props = defineProps(oDialogProps)
const emit = defineEmits<ODialogEmits>()
const slots = defineSlots<ODialogSlots>()

const dialogElement = shallowRef<HTMLDialogElement | null>(null)
const instanceId = useId()
const titleId = `o-dialog-${instanceId}-title`
const descriptionId = `o-dialog-${instanceId}-description`
const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const labelledBy = computed(() => {
  if (props.ariaLabel) return undefined
  return props.title || slots.header ? titleId : undefined
})
const describedBy = computed(() => (props.description && !slots.header ? descriptionId : undefined))

const requestClose = (): void => {
  emit('update:open', false)
  emit('close')
}

const syncOpenState = (): void => {
  const dialog = dialogElement.value
  if (!dialog) return

  if (props.open) {
    if (!dialog.open) dialog.showModal()
    return
  }

  if (dialog.open) dialog.close()
}

const handleCancel = (event: Event): void => {
  event.preventDefault()
  if (props.closeOnEsc) requestClose()
}

const handleBackdropClick = (event: MouseEvent): void => {
  if (!props.closeOnMask || event.target !== event.currentTarget) return

  const dialog = dialogElement.value
  if (!dialog) return

  const bounds = dialog.getBoundingClientRect()
  const outsideSurface =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom

  if (outsideSurface) requestClose()
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key !== 'Tab') return

  const dialog = dialogElement.value
  if (!dialog) return

  const focusableElements = Array.from(
    dialog.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter((element) => !element.hidden && !element.closest('[inert]'))
  const firstElement = focusableElements[0]
  const lastElement = focusableElements.at(-1)
  if (!firstElement || !lastElement) return

  const activeElement = document.activeElement
  if (event.shiftKey && (activeElement === firstElement || !dialog.contains(activeElement))) {
    event.preventDefault()
    lastElement.focus()
    return
  }

  if (!event.shiftKey && activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

const handleNativeClose = (): void => {
  if (!props.open) return

  requestClose()
  void nextTick(syncOpenState)
}

onMounted(syncOpenState)

watch(
  () => props.open,
  () => syncOpenState(),
  { flush: 'post' },
)
</script>

<template>
  <dialog
    v-bind="$attrs"
    ref="dialogElement"
    class="o-dialog"
    :aria-label="labelledBy ? undefined : props.ariaLabel"
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
    @cancel="handleCancel"
    @click="handleBackdropClick"
    @close="handleNativeClose"
    @keydown="handleKeydown"
  >
    <header
      v-if="props.title || slots.header || props.description || props.showClose"
      class="o-dialog__header"
    >
      <div :id="slots.header ? titleId : undefined" class="o-dialog__header-content">
        <slot name="header">
          <div
            v-if="props.title"
            :id="titleId"
            class="o-dialog__title"
            role="heading"
            aria-level="2"
          >
            {{ props.title }}
          </div>
          <p v-if="props.description" :id="descriptionId" class="o-dialog__description">
            {{ props.description }}
          </p>
        </slot>
      </div>

      <button
        v-if="props.showClose"
        class="o-dialog__close"
        type="button"
        :aria-label="props.closeAriaLabel"
        @click="requestClose"
      >
        <LuX aria-hidden="true" />
      </button>
    </header>

    <div class="o-dialog__body">
      <slot />
    </div>

    <footer v-if="slots.footer" class="o-dialog__footer">
      <slot name="footer" />
    </footer>
  </dialog>
</template>
