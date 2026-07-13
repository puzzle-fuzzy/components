<script setup lang="ts">
import { LuX } from 'vue-icons-plus/lu'
import { computed, nextTick, onMounted, shallowRef, useId, watch, type CSSProperties } from 'vue'

import {
  normalizeODialogWidth,
  oDialogProps,
  type ODialogCloseReason,
  type ODialogCloseRequest,
  type ODialogEmits,
  type ODialogSlotProps,
  type ODialogSlots,
} from './dialog'

defineOptions({
  name: 'ODialog',
  inheritAttrs: false,
})

const props = defineProps(oDialogProps)
const emit = defineEmits<ODialogEmits>()
const slots = defineSlots<ODialogSlots>()

type DialogPhase = 'closed' | 'opening' | 'open' | 'closing'

const dialogElement = shallowRef<HTMLDialogElement | null>(null)
const phase = shallowRef<DialogPhase>('closed')
const rendered = shallowRef(props.open)
const pendingReason = shallowRef<ODialogCloseReason>()
const instanceId = useId()
const titleId = `o-dialog-${instanceId}-title`
const descriptionId = `o-dialog-${instanceId}-description`

let transitionGeneration = 0
let internalNativeClose = false
let pointerDownOutside = false
let warnedAboutName = false

const labelledBy = computed(() => {
  if (props.ariaLabel) return undefined
  return props.title || slots.title || slots.header ? titleId : undefined
})
const describedBy = computed(() =>
  !slots.header && (props.description || slots.description) ? descriptionId : undefined,
)
const dialogStyle = computed<CSSProperties & Record<'--omg-dialog-inline-size', string>>(() => ({
  '--omg-dialog-inline-size': normalizeODialogWidth(props.width),
}))

const slotProps: ODialogSlotProps = {
  close: () => requestClose('slot'),
  titleId,
  descriptionId,
}

const warnAboutAccessibleName = async (): Promise<void> => {
  if (!import.meta.env.DEV || warnedAboutName) return
  await nextTick()

  const hasSource = Boolean(props.ariaLabel || props.title || slots.title || slots.header)
  if (hasSource && slots.header && !rendered.value) return
  const customHeaderTarget = slots.header
    ? [...(dialogElement.value?.querySelectorAll<HTMLElement>('[id]') ?? [])].find(
        ({ id }) => id === titleId,
      )
    : undefined
  const customHeaderIsNamed =
    !slots.header ||
    Boolean(customHeaderTarget && dialogElement.value?.contains(customHeaderTarget))

  if (hasSource && customHeaderIsNamed) return
  warnedAboutName = true
  console.warn('[OMG UI][ODialog] Provide ariaLabel, title, a title slot, or titleId in header.')
}

const focusInitialTarget = (dialog: HTMLDialogElement): void => {
  let target: HTMLElement | null = null

  if (props.initialFocus) {
    try {
      target = dialog.querySelector<HTMLElement>(props.initialFocus)
    } catch {
      target = null
    }
  }

  if (!target || !dialog.contains(target)) {
    target = dialog.querySelector<HTMLElement>('[autofocus]')
  }

  target?.focus()
}

const waitForOwnMotion = async (dialog: HTMLDialogElement): Promise<void> => {
  await nextTick()
  await new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === 'undefined') {
      resolve()
      return
    }
    requestAnimationFrame(() => resolve())
  })

  const animations = dialog.getAnimations?.().filter(({ effect }) => {
    if (typeof KeyframeEffect === 'undefined' || !(effect instanceof KeyframeEffect)) return false
    return effect.target === dialog
  })
  await Promise.allSettled((animations ?? []).map(({ finished }) => finished))
}

const beginOpen = async (): Promise<void> => {
  const dialog = dialogElement.value
  if (!dialog || !props.open) return

  const generation = ++transitionGeneration
  rendered.value = true
  phase.value = 'opening'
  await nextTick()
  if (generation !== transitionGeneration || !props.open) return

  if (!dialog.open) dialog.showModal()
  emit('open')
  focusInitialTarget(dialog)
  void warnAboutAccessibleName()
  await waitForOwnMotion(dialog)

  if (generation !== transitionGeneration || !props.open) return
  phase.value = 'open'
  emit('opened')
}

const beginClose = async (): Promise<void> => {
  const dialog = dialogElement.value
  if (!dialog || props.open) return

  if (!dialog.open) {
    phase.value = 'closed'
    if (props.destroyOnClose) rendered.value = false
    return
  }

  const generation = ++transitionGeneration
  const reason = pendingReason.value ?? 'programmatic'
  pendingReason.value = undefined
  phase.value = 'closing'
  emit('close', reason)
  await waitForOwnMotion(dialog)

  if (generation !== transitionGeneration || props.open) return
  internalNativeClose = true
  dialog.close()
  internalNativeClose = false
  phase.value = 'closed'
  if (props.destroyOnClose) rendered.value = false
  await nextTick()

  if (generation !== transitionGeneration || props.open) return
  emit('closed', reason)
}

function requestClose(
  reason: Exclude<ODialogCloseReason, 'programmatic'>,
  originalEvent?: Event,
): void {
  if (!props.open || phase.value === 'closing' || pendingReason.value !== undefined) return

  const request: ODialogCloseRequest = originalEvent ? { reason, originalEvent } : { reason }
  pendingReason.value = reason
  // eslint-disable-next-line vue/custom-event-name-casing -- Public Vue events use template kebab-case.
  emit('request-close', request)
  emit('update:open', false)

  void nextTick(() => {
    if (props.open && pendingReason.value === reason) pendingReason.value = undefined
  })
}

const isOutsideSurface = (event: PointerEvent): boolean => {
  const dialog = dialogElement.value
  if (!dialog || event.target !== event.currentTarget) return false
  const bounds = dialog.getBoundingClientRect()
  return (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
}

const handlePointerDown = (event: PointerEvent): void => {
  pointerDownOutside = isOutsideSurface(event)
}

const handlePointerUp = (event: PointerEvent): void => {
  const shouldRequest = pointerDownOutside && isOutsideSurface(event)
  pointerDownOutside = false
  if (props.closeOnMask && shouldRequest) requestClose('mask', event)
}

const handleCancel = (event: Event): void => {
  event.preventDefault()
  if (props.closeOnEsc) requestClose('escape', event)
}

const handleNativeClose = (): void => {
  if (internalNativeClose || !props.open) return

  if (pendingReason.value !== undefined) {
    void nextTick(() => {
      if (props.open) void beginOpen()
    })
    return
  }

  ++transitionGeneration
  pendingReason.value = 'native'
  // eslint-disable-next-line vue/custom-event-name-casing -- Public Vue events use template kebab-case.
  emit('request-close', { reason: 'native' })
  emit('update:open', false)

  void nextTick(async () => {
    if (props.open) {
      pendingReason.value = undefined
      await beginOpen()
      return
    }

    const generation = ++transitionGeneration
    pendingReason.value = undefined
    phase.value = 'closing'
    emit('close', 'native')
    phase.value = 'closed'
    if (props.destroyOnClose) rendered.value = false
    await nextTick()
    if (generation !== transitionGeneration || props.open) return
    emit('closed', 'native')
  })
}

onMounted(() => {
  void warnAboutAccessibleName()
  if (props.open) void beginOpen()
})

watch(
  () => props.open,
  (open) => {
    if (open) void beginOpen()
    else void beginClose()
  },
  { flush: 'post' },
)
</script>

<template>
  <dialog
    v-bind="$attrs"
    ref="dialogElement"
    class="o-dialog"
    :class="{ 'o-dialog--fullscreen': props.fullscreen }"
    :data-state="phase"
    :style="dialogStyle"
    :aria-label="labelledBy ? undefined : props.ariaLabel"
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
    @cancel="handleCancel"
    @close="handleNativeClose"
    @pointerdown="handlePointerDown"
    @pointerup="handlePointerUp"
  >
    <template v-if="rendered">
      <header
        v-if="
          props.title ||
          slots.title ||
          slots.header ||
          props.description ||
          slots.description ||
          props.showClose
        "
        class="o-dialog__header"
      >
        <div class="o-dialog__header-content">
          <slot v-if="slots.header" name="header" v-bind="slotProps" />
          <template v-else>
            <div
              v-if="props.title || slots.title"
              :id="titleId"
              class="o-dialog__title"
              role="heading"
              aria-level="2"
            >
              <slot name="title" v-bind="slotProps">{{ props.title }}</slot>
            </div>
            <p
              v-if="props.description || slots.description"
              :id="descriptionId"
              class="o-dialog__description"
            >
              <slot name="description" v-bind="slotProps">{{ props.description }}</slot>
            </p>
          </template>
        </div>

        <button
          v-if="props.showClose"
          class="o-dialog__close"
          type="button"
          :aria-label="props.closeAriaLabel"
          @click="requestClose('close-button', $event)"
        >
          <slot name="closeIcon"><LuX aria-hidden="true" /></slot>
        </button>
      </header>

      <div class="o-dialog__body">
        <slot v-bind="slotProps" />
      </div>

      <footer v-if="slots.footer" class="o-dialog__footer">
        <slot name="footer" v-bind="slotProps" />
      </footer>
    </template>
  </dialog>
</template>
