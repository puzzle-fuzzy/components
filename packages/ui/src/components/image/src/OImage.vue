<script setup lang="ts">
import { computed, ref, watch, type CSSProperties } from 'vue'
import { LuZoomIn } from 'vue-icons-plus/lu'

import { ODialog } from '../../dialog'
import { oImageProps, type OImageEmits } from './image'

defineOptions({ name: 'OImage', inheritAttrs: false })

const props = defineProps(oImageProps)
const emit = defineEmits<OImageEmits>()

const isPreviewing = ref(false)
const previewImageSrc = computed(() => props.previewSrc ?? props.src)
const canPreview = computed(() => props.preview && !props.disabled)
const nativeWidth = computed(() => (typeof props.width === 'number' ? props.width : undefined))
const nativeHeight = computed(() => (typeof props.height === 'number' ? props.height : undefined))
const imageStyle = computed<CSSProperties>(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

const setPreviewOpen = (open: boolean): void => {
  if (open && !canPreview.value) return
  if (isPreviewing.value === open) return

  isPreviewing.value = open
  if (open) {
    emit('previewOpen')
  } else {
    emit('previewClose')
  }
}

const openPreview = (): void => {
  setPreviewOpen(true)
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
      <LuZoomIn class="o-image__preview-icon" aria-hidden="true" />
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

    <ODialog
      class="o-image__preview-dialog"
      :open="isPreviewing"
      :aria-label="props.previewAriaLabel"
      :close-aria-label="props.closeAriaLabel"
      :close-on-mask="true"
      :close-on-esc="true"
      :show-close="true"
      @update:open="setPreviewOpen"
    >
      <div class="o-image__preview-stage">
        <img
          class="o-image__preview-image"
          :src="previewImageSrc"
          :alt="props.alt"
          draggable="false"
        />
      </div>
    </ODialog>
  </div>
</template>
