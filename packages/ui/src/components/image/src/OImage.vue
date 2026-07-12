<script setup lang="ts">
import { computed, onBeforeUnmount, watch, ref, type CSSProperties } from 'vue'

import { oImageProps, type OImageEmits } from './image'

defineOptions({ name: 'OImage' })

const props = defineProps(oImageProps)
const emit = defineEmits<OImageEmits>()

const isPreviewing = ref(false)
const previewImageSrc = computed(() => props.previewSrc ?? props.src)
const canPreview = computed(() => props.preview && !props.disabled)
const imageStyle = computed<CSSProperties>(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

const openPreview = (): void => {
  if (!canPreview.value) return
  isPreviewing.value = true
  emit('previewOpen')
}

const closePreview = (): void => {
  if (!isPreviewing.value) return
  isPreviewing.value = false
  emit('previewClose')
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') closePreview()
}

watch(isPreviewing, (active) => {
  if (typeof window === 'undefined') return

  if (active) {
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
})

watch(
  () => [props.src, props.previewSrc, props.preview, props.disabled] as const,
  () => {
    if (!canPreview.value) closePreview()
  },
)

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
})

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
    <img
      class="o-image__img"
      :src="props.src"
      :alt="props.alt"
      :loading="props.loading"
      :style="imageStyle"
      draggable="false"
      @click="openPreview"
      @load="handleLoad"
      @error="handleError"
    />

    <Teleport to="body">
      <div
        v-if="isPreviewing"
        class="o-image__preview-mask"
        role="presentation"
        @click="closePreview"
      >
        <div class="o-image__preview-dialog" role="dialog" aria-modal="true">
          <img
            class="o-image__preview-image"
            :src="previewImageSrc"
            :alt="props.alt"
            draggable="false"
            @click.stop
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
