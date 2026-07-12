<script setup lang="ts">
import { computed } from 'vue'
import { LuLoader2 } from 'vue-icons-plus/lu'

import { oButtonProps, type OButtonEmits, type OButtonSlots } from './button'

defineOptions({
  name: 'OButton',
  inheritAttrs: false,
})

const props = defineProps(oButtonProps)
const emit = defineEmits<OButtonEmits>()

defineSlots<OButtonSlots>()

const isDisabled = computed(() => props.disabled || props.loading)

const handleClick = (event: MouseEvent): void => {
  if (isDisabled.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  emit('click', event)
}
</script>

<template>
  <button
    v-bind="$attrs"
    class="o-button"
    :class="[
      `o-button--${props.variant}`,
      `o-button--${props.size}`,
      `o-button--${props.tone}`,
      {
        'o-button--icon-only': props.iconOnly,
        'is-loading': props.loading,
        'is-disabled': isDisabled,
      },
    ]"
    :type="props.type"
    :disabled="isDisabled"
    :aria-busy="props.loading || undefined"
    @click="handleClick"
  >
    <LuLoader2 v-if="props.loading" class="o-button__spinner" aria-hidden="true" />
    <span v-else-if="$slots.icon" class="o-button__icon" aria-hidden="true">
      <slot name="icon" />
    </span>
    <span class="o-button__content">
      <slot />
    </span>
  </button>
</template>
