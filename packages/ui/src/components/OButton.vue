<script setup lang="ts">
import type { OButtonProps } from './button'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<OButtonProps>(),
  {
    variant: 'solid',
    size: 'md',
    tone: 'brand',
    type: 'button',
    loading: false,
    disabled: false,
  },
)
</script>

<template>
  <button
    v-bind="$attrs"
    class="o-button"
    :class="[
      `o-button--${props.variant}`,
      `o-button--${props.size}`,
      `o-button--${props.tone}`,
      { 'is-loading': props.loading },
    ]"
    :data-o-theme="props.theme"
    :type="props.type"
    :disabled="props.disabled || props.loading"
    :aria-busy="props.loading || undefined"
  >
    <span v-if="props.loading" class="o-button__spinner" aria-hidden="true" />
    <span v-if="$slots.icon" class="o-button__icon" aria-hidden="true">
      <slot name="icon" />
    </span>
    <span class="o-button__content">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.o-button {
  --o-button-bg: #121316;
  --o-button-bg-hover: #2a2d34;
  --o-button-fg: #ffffff;
  --o-button-border: transparent;
  --o-button-ring: rgba(47, 111, 237, 0.34);
  --o-button-shadow: 0 1px 2px rgba(17, 24, 39, 0.08);

  position: relative;
  display: inline-flex;
  min-width: max-content;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--o-button-border);
  border-radius: 8px;
  background: var(--o-button-bg);
  box-shadow: var(--o-button-shadow);
  color: var(--o-button-fg);
  cursor: pointer;
  font-family: inherit;
  font-weight: 650;
  letter-spacing: 0;
  line-height: 1;
  text-decoration: none;
  user-select: none;
  white-space: nowrap;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.o-button:hover:not(:disabled) {
  background: var(--o-button-bg-hover);
}

.o-button:active:not(:disabled) {
  transform: translateY(1px);
}

.o-button:focus-visible {
  outline: 3px solid var(--o-button-ring);
  outline-offset: 2px;
}

.o-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.o-button--sm {
  gap: 6px;
  min-height: 32px;
  padding: 0 12px;
  font-size: 13px;
}

.o-button--md {
  gap: 8px;
  min-height: 38px;
  padding: 0 16px;
  font-size: 14px;
}

.o-button--lg {
  gap: 10px;
  min-height: 46px;
  padding: 0 20px;
  font-size: 15px;
}

.o-button__content,
.o-button__icon {
  display: inline-flex;
  align-items: center;
}

.o-button__spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 999px;
  opacity: 0.84;
  animation: o-button-spin 760ms linear infinite;
}

.o-button--brand {
  --o-tone: #2f6fed;
  --o-tone-hover: #245fd4;
  --o-tone-subtle: rgba(47, 111, 237, 0.12);
  --o-tone-border: rgba(47, 111, 237, 0.28);
  --o-tone-fg: #ffffff;
}

.o-button--neutral {
  --o-tone: #202226;
  --o-tone-hover: #343841;
  --o-tone-subtle: rgba(32, 34, 38, 0.08);
  --o-tone-border: rgba(32, 34, 38, 0.18);
  --o-tone-fg: #ffffff;
}

.o-button--danger {
  --o-tone: #d92d20;
  --o-tone-hover: #b42318;
  --o-tone-subtle: rgba(217, 45, 32, 0.1);
  --o-tone-border: rgba(217, 45, 32, 0.28);
  --o-tone-fg: #ffffff;
}

.o-button--solid {
  --o-button-bg: var(--o-tone);
  --o-button-bg-hover: var(--o-tone-hover);
  --o-button-fg: var(--o-tone-fg);
  --o-button-border: transparent;
}

.o-button--soft {
  --o-button-bg: var(--o-tone-subtle);
  --o-button-bg-hover: color-mix(in srgb, var(--o-tone-subtle), var(--o-tone) 10%);
  --o-button-fg: var(--o-tone);
  --o-button-border: transparent;
  --o-button-shadow: none;
}

.o-button--outline {
  --o-button-bg: transparent;
  --o-button-bg-hover: var(--o-tone-subtle);
  --o-button-fg: var(--o-tone);
  --o-button-border: var(--o-tone-border);
  --o-button-shadow: none;
}

.o-button--ghost {
  --o-button-bg: transparent;
  --o-button-bg-hover: var(--o-tone-subtle);
  --o-button-fg: var(--o-tone);
  --o-button-border: transparent;
  --o-button-shadow: none;
}

:global(.dark) .o-button--brand,
:global([data-theme='dark']) .o-button--brand,
.o-button[data-o-theme='dark'].o-button--brand {
  --o-tone: #7da2ff;
  --o-tone-hover: #9ab6ff;
  --o-tone-subtle: rgba(125, 162, 255, 0.16);
  --o-tone-border: rgba(125, 162, 255, 0.32);
  --o-tone-fg: #08111f;
}

:global(.dark) .o-button--neutral,
:global([data-theme='dark']) .o-button--neutral,
.o-button[data-o-theme='dark'].o-button--neutral {
  --o-tone: #f4f6fb;
  --o-tone-hover: #d9dee9;
  --o-tone-subtle: rgba(244, 246, 251, 0.12);
  --o-tone-border: rgba(244, 246, 251, 0.22);
  --o-tone-fg: #121316;
}

:global(.dark) .o-button--danger,
:global([data-theme='dark']) .o-button--danger,
.o-button[data-o-theme='dark'].o-button--danger {
  --o-tone: #ff8a80;
  --o-tone-hover: #ffb0aa;
  --o-tone-subtle: rgba(255, 138, 128, 0.14);
  --o-tone-border: rgba(255, 138, 128, 0.3);
  --o-tone-fg: #230706;
}

@media (prefers-color-scheme: dark) {
  .o-button--brand {
    --o-tone: #7da2ff;
    --o-tone-hover: #9ab6ff;
    --o-tone-subtle: rgba(125, 162, 255, 0.16);
    --o-tone-border: rgba(125, 162, 255, 0.32);
    --o-tone-fg: #08111f;
  }

  .o-button--neutral {
    --o-tone: #f4f6fb;
    --o-tone-hover: #d9dee9;
    --o-tone-subtle: rgba(244, 246, 251, 0.12);
    --o-tone-border: rgba(244, 246, 251, 0.22);
    --o-tone-fg: #121316;
  }

  .o-button--danger {
    --o-tone: #ff8a80;
    --o-tone-hover: #ffb0aa;
    --o-tone-subtle: rgba(255, 138, 128, 0.14);
    --o-tone-border: rgba(255, 138, 128, 0.3);
    --o-tone-fg: #230706;
  }
}

.o-button[data-o-theme='light'].o-button--brand {
  --o-tone: #2f6fed;
  --o-tone-hover: #245fd4;
  --o-tone-subtle: rgba(47, 111, 237, 0.12);
  --o-tone-border: rgba(47, 111, 237, 0.28);
  --o-tone-fg: #ffffff;
}

.o-button[data-o-theme='light'].o-button--neutral {
  --o-tone: #202226;
  --o-tone-hover: #343841;
  --o-tone-subtle: rgba(32, 34, 38, 0.08);
  --o-tone-border: rgba(32, 34, 38, 0.18);
  --o-tone-fg: #ffffff;
}

.o-button[data-o-theme='light'].o-button--danger {
  --o-tone: #d92d20;
  --o-tone-hover: #b42318;
  --o-tone-subtle: rgba(217, 45, 32, 0.1);
  --o-tone-border: rgba(217, 45, 32, 0.28);
  --o-tone-fg: #ffffff;
}

@keyframes o-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
