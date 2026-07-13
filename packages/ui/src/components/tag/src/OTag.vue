<script setup lang="ts">
import { LuX } from 'vue-icons-plus/lu'

import { oTagProps, type OTagEmits, type OTagSlots } from './tag'

defineOptions({
  name: 'OTag',
})

const props = defineProps(oTagProps)
const emit = defineEmits<OTagEmits>()

defineSlots<OTagSlots>()
</script>

<template>
  <span
    class="o-tag"
    :class="[`o-tag--${props.tone}`, `o-tag--${props.variant}`, `o-tag--${props.size}`]"
  >
    <span v-if="$slots.icon" class="o-tag__icon" aria-hidden="true">
      <slot name="icon" />
    </span>
    <span class="o-tag__content"><slot /></span>
    <button
      v-if="props.closable"
      class="o-tag__close"
      type="button"
      :aria-label="props.closeAriaLabel"
      @click="emit('close', $event)"
    >
      <span class="o-tag__close-icon" aria-hidden="true">
        <slot name="closeIcon"><LuX /></slot>
      </span>
    </button>
  </span>
</template>
