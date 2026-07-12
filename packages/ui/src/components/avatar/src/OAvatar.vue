<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getOAvatarInitials, oAvatarProps, type OAvatarEmits, type OAvatarSlots } from './avatar'

defineOptions({ name: 'OAvatar' })

const props = defineProps(oAvatarProps)
const emit = defineEmits<OAvatarEmits>()

defineSlots<OAvatarSlots>()

const hasLoaded = ref(false)
const hasError = ref(false)

const hasImageSource = computed(() => Boolean(props.src))
const isLoading = computed(() => hasImageSource.value && !hasLoaded.value && !hasError.value)
const shouldShowImage = computed(() => hasImageSource.value && !hasError.value)
const shouldShowFallback = computed(
  () => !hasImageSource.value || hasError.value || !hasLoaded.value,
)
const fallbackInitials = computed(() =>
  getOAvatarInitials({ initials: props.initials, name: props.name }),
)
const accessibleLabel = computed(() => {
  if (props.alt !== undefined) return props.alt

  const normalizedName = props.name?.trim()
  return normalizedName || fallbackInitials.value
})
const hasSemanticFallback = computed(() => !shouldShowImage.value && Boolean(accessibleLabel.value))

watch(
  () => props.src,
  () => {
    hasLoaded.value = false
    hasError.value = false
  },
)

const handleLoad = (event: Event): void => {
  hasLoaded.value = true
  hasError.value = false
  emit('load', event)
}

const handleError = (event: Event): void => {
  hasLoaded.value = false
  hasError.value = true
  emit('error', event)
}
</script>

<template>
  <span
    class="o-avatar"
    :class="[
      `o-avatar--${props.size}`,
      `o-avatar--${props.shape}`,
      {
        'is-loading': isLoading,
        'is-error': hasError,
      },
    ]"
    :data-size="props.size"
    :data-shape="props.shape"
    :data-state="hasError ? 'error' : isLoading ? 'loading' : 'ready'"
    :aria-busy="isLoading || undefined"
  >
    <img
      v-if="shouldShowImage"
      :key="props.src"
      class="o-avatar__image"
      :class="{ 'o-avatar__image--loaded': hasLoaded }"
      :src="props.src"
      :alt="accessibleLabel"
      draggable="false"
      @load="handleLoad"
      @error="handleError"
    />

    <span
      v-if="shouldShowFallback"
      class="o-avatar__fallback"
      :role="hasSemanticFallback ? 'img' : undefined"
      :aria-label="hasSemanticFallback ? accessibleLabel : undefined"
      :aria-hidden="hasSemanticFallback ? undefined : 'true'"
    >
      <slot name="fallback" :initials="fallbackInitials" :has-error="hasError">
        {{ fallbackInitials }}
      </slot>
    </span>

    <span
      v-if="props.status"
      class="o-avatar__status"
      :class="`o-avatar__status--${props.status}`"
      :data-status="props.status"
    >
      <span class="o-avatar__status-symbol" :data-status-marker="props.status" aria-hidden="true" />
      <span v-if="props.statusLabel" class="o-avatar__status-label">
        {{ props.statusLabel }}
      </span>
    </span>
  </span>
</template>
