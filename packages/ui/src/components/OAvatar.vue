<script setup lang="ts">
import { computed } from 'vue'
import { useImage } from '@vueuse/core'
import type { OAvatarProps } from './avatar'

const props = withDefaults(defineProps<OAvatarProps>(), {
  size: 'md',
  shape: 'circle',
})

const imageOptions = computed(() => ({
  src: props.src || '',
  alt: props.alt ?? props.name ?? '',
  loading: 'lazy' as const,
  decoding: 'async' as const,
}))

const { isLoading, error } = useImage(imageOptions, {
  immediate: Boolean(props.src),
})

const label = computed(() => props.alt ?? props.name ?? props.initials ?? 'Avatar')

const fallbackText = computed(() => {
  if (props.initials) return props.initials.slice(0, 3).toUpperCase()
  if (!props.name) return ''

  return props.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.at(0))
    .join('')
    .toUpperCase()
})

const shouldShowImage = computed(() => Boolean(props.src && !error.value))
const shouldShowFallback = computed(() => !shouldShowImage.value || isLoading.value)
</script>

<template>
  <span
    class="o-avatar"
    :class="[
      `o-avatar--${props.size}`,
      `o-avatar--${props.shape}`,
      { 'is-loading': isLoading && props.src },
    ]"
    :data-o-theme="props.theme"
    :aria-label="label"
    role="img"
  >
    <img
      v-if="shouldShowImage"
      class="o-avatar__image"
      :src="props.src"
      :alt="label"
      draggable="false"
    />
    <span v-if="shouldShowFallback" class="o-avatar__fallback" aria-hidden="true">
      <slot>{{ fallbackText }}</slot>
    </span>
    <span
      v-if="props.status"
      class="o-avatar__status"
      :class="`o-avatar__status--${props.status}`"
      aria-hidden="true"
    />
  </span>
</template>

<style scoped>
.o-avatar {
  --o-avatar-size: 40px;
  --o-avatar-radius: 999px;
  --o-avatar-bg: #eef2f7;
  --o-avatar-fg: #273040;
  --o-avatar-border: rgba(24, 30, 40, 0.08);
  --o-avatar-ring: rgba(255, 255, 255, 0.92);
  --o-avatar-shadow: 0 1px 2px rgba(15, 23, 42, 0.1);

  position: relative;
  display: inline-grid;
  width: var(--o-avatar-size);
  height: var(--o-avatar-size);
  flex: 0 0 auto;
  place-items: center;
  overflow: visible;
  border: 1px solid var(--o-avatar-border);
  border-radius: var(--o-avatar-radius);
  background: var(--o-avatar-bg);
  box-shadow: var(--o-avatar-shadow);
  color: var(--o-avatar-fg);
  font-family: inherit;
  font-weight: 750;
  letter-spacing: 0;
  line-height: 1;
  vertical-align: middle;
  user-select: none;
}

.o-avatar--xs {
  --o-avatar-size: 24px;
  font-size: 10px;
}

.o-avatar--sm {
  --o-avatar-size: 32px;
  font-size: 12px;
}

.o-avatar--md {
  --o-avatar-size: 40px;
  font-size: 14px;
}

.o-avatar--lg {
  --o-avatar-size: 52px;
  font-size: 18px;
}

.o-avatar--xl {
  --o-avatar-size: 72px;
  font-size: 24px;
}

.o-avatar--rounded {
  --o-avatar-radius: 12px;
}

.o-avatar--square {
  --o-avatar-radius: 6px;
}

.o-avatar__image,
.o-avatar__fallback {
  grid-area: 1 / 1;
  width: 100%;
  height: 100%;
  border-radius: calc(var(--o-avatar-radius) - 1px);
}

.o-avatar__image {
  display: block;
  object-fit: cover;
}

.o-avatar__fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-top: 0.04em;
  box-sizing: border-box;
}

.o-avatar.is-loading .o-avatar__fallback {
  opacity: 0.72;
}

.o-avatar__status {
  position: absolute;
  right: 0;
  bottom: 0;
  width: max(8px, calc(var(--o-avatar-size) * 0.24));
  height: max(8px, calc(var(--o-avatar-size) * 0.24));
  border: 2px solid var(--o-avatar-ring);
  border-radius: 999px;
  box-sizing: border-box;
}

.o-avatar__status--online {
  background: #17b26a;
}

.o-avatar__status--away {
  background: #f79009;
}

.o-avatar__status--busy {
  background: #f04438;
}

.o-avatar__status--offline {
  background: #98a2b3;
}

:global(.dark) .o-avatar,
:global([data-theme='dark']) .o-avatar,
.o-avatar[data-o-theme='dark'] {
  --o-avatar-bg: #242936;
  --o-avatar-fg: #f4f6fb;
  --o-avatar-border: rgba(244, 246, 251, 0.14);
  --o-avatar-ring: #141821;
  --o-avatar-shadow: 0 1px 2px rgba(0, 0, 0, 0.26);
}

@media (prefers-color-scheme: dark) {
  .o-avatar {
    --o-avatar-bg: #242936;
    --o-avatar-fg: #f4f6fb;
    --o-avatar-border: rgba(244, 246, 251, 0.14);
    --o-avatar-ring: #141821;
    --o-avatar-shadow: 0 1px 2px rgba(0, 0, 0, 0.26);
  }
}

.o-avatar[data-o-theme='light'] {
  --o-avatar-bg: #eef2f7;
  --o-avatar-fg: #273040;
  --o-avatar-border: rgba(24, 30, 40, 0.08);
  --o-avatar-ring: rgba(255, 255, 255, 0.92);
  --o-avatar-shadow: 0 1px 2px rgba(15, 23, 42, 0.1);
}
</style>
