<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch, type CSSProperties } from 'vue'

import { oImageProps, type OImageEmits } from './image'

defineOptions({ name: 'OImage', inheritAttrs: false })

const props = defineProps(oImageProps)
const emit = defineEmits<OImageEmits>()

const isPreviewing = ref(false)
const triggerElement = shallowRef<HTMLButtonElement | null>(null)
const previewLayer = shallowRef<HTMLElement | null>(null)
const previewTheme = ref<string>()
const previewLanguage = ref<string>()
const previewDirection = ref<'ltr' | 'rtl'>()
const previewContextStyle = shallowRef<Record<string, string>>({})
const previewImageSrc = computed(() => props.previewSrc ?? props.src)
const canPreview = computed(() => props.preview && !props.disabled)
const nativeWidth = computed(() => (typeof props.width === 'number' ? props.width : undefined))
const nativeHeight = computed(() => (typeof props.height === 'number' ? props.height : undefined))
const imageStyle = computed<CSSProperties>(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

const focusPreviewLayer = (): void => {
  void nextTick(() => {
    if (!isPreviewing.value) return
    previewLayer.value?.focus({ preventScroll: true })
  })
}

const restoreTriggerFocus = (): void => {
  void nextTick(() => {
    if (isPreviewing.value) return

    const trigger = triggerElement.value
    if (!trigger || trigger.disabled || !trigger.isConnected) return
    trigger.focus({ preventScroll: true })
  })
}

const syncPreviewContext = (): void => {
  const trigger = triggerElement.value
  const view = trigger?.ownerDocument.defaultView
  if (!trigger || !view) return

  const documentElement = trigger.ownerDocument.documentElement
  const triggerStyle = view.getComputedStyle(trigger)
  const rootStyle = view.getComputedStyle(documentElement)
  const contextStyle: Record<string, string> = {}

  for (const property of ['--omg-radius-md', '--omg-shadow-sm', '--omg-space-3'] as const) {
    const value = triggerStyle.getPropertyValue(property)
    if (value && value !== rootStyle.getPropertyValue(property)) contextStyle[property] = value
  }

  const themeOwner = trigger.closest<HTMLElement>('[data-omg-theme]')
  const languageOwner = trigger.closest<HTMLElement>('[lang]')
  const direction = triggerStyle.direction

  previewTheme.value =
    themeOwner && themeOwner !== documentElement ? themeOwner.dataset.omgTheme : undefined
  previewLanguage.value =
    languageOwner && languageOwner !== documentElement ? languageOwner.lang : undefined
  previewDirection.value = direction === 'ltr' || direction === 'rtl' ? direction : undefined
  previewContextStyle.value = contextStyle
}

const setPreviewOpen = (open: boolean): void => {
  if (open && !canPreview.value) return
  if (isPreviewing.value === open) return

  if (open) syncPreviewContext()
  isPreviewing.value = open
  if (open) {
    emit('previewOpen')
    focusPreviewLayer()
  } else {
    emit('previewClose')
    restoreTriggerFocus()
  }
}

const openPreview = (): void => {
  setPreviewOpen(true)
}

const closePreview = (): void => {
  setPreviewOpen(false)
}

watch(
  () => [props.preview, props.disabled] as const,
  () => {
    if (!canPreview.value) setPreviewOpen(false)
  },
)

const handleLoad = (event: Event): void => {
  emit('load', event)
}

const handleError = (event: Event): void => {
  emit('error', event)
}
</script>

<template>
  <div
    class="o-image"
    :class="[
      `o-image--${props.fit}`,
      {
        'is-previewable': canPreview,
        'is-previewing': isPreviewing,
        'is-disabled': props.disabled,
      },
    ]"
  >
    <button
      v-if="props.preview"
      ref="triggerElement"
      class="o-image__trigger"
      type="button"
      :disabled="props.disabled"
      :aria-label="props.previewAriaLabel"
      aria-haspopup="dialog"
      :aria-expanded="isPreviewing"
      @click="openPreview"
    >
      <img
        v-bind="$attrs"
        class="o-image__img"
        :src="props.src"
        :alt="props.alt"
        :loading="props.loading"
        :width="nativeWidth"
        :height="nativeHeight"
        :style="imageStyle"
        draggable="false"
        @load="handleLoad"
        @error="handleError"
      />
    </button>

    <img
      v-else
      v-bind="$attrs"
      class="o-image__img"
      :src="props.src"
      :alt="props.alt"
      :loading="props.loading"
      :width="nativeWidth"
      :height="nativeHeight"
      :style="imageStyle"
      draggable="false"
      @load="handleLoad"
      @error="handleError"
    />

    <Teleport v-if="isPreviewing" to="body">
      <div
        ref="previewLayer"
        class="o-image__preview-mask"
        role="dialog"
        aria-modal="true"
        :aria-label="props.previewAriaLabel"
        :data-omg-theme="previewTheme"
        :lang="previewLanguage"
        :dir="previewDirection"
        :style="previewContextStyle"
        tabindex="-1"
        @click.self="closePreview"
        @keydown.esc.stop.prevent="closePreview"
        @keydown.tab.prevent
      >
        <img
          class="o-image__preview-image"
          :src="previewImageSrc"
          :alt="props.alt"
          draggable="false"
          @click.stop
        />
      </div>
    </Teleport>
  </div>
</template>
