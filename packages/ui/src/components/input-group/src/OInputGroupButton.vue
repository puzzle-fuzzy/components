<script setup lang="ts">
import { OButton, type OButtonEmits } from '../../button'
import { oInputGroupButtonProps, type OInputGroupButtonSlots } from './input-group'

defineOptions({
  name: 'OInputGroupButton',
  inheritAttrs: false,
})

const props = defineProps(oInputGroupButtonProps)
const emit = defineEmits<OButtonEmits>()

defineSlots<OInputGroupButtonSlots>()
</script>

<template>
  <OButton
    v-bind="{ ...props, ...$attrs }"
    class="o-input-group__button"
    data-slot="input-group-button"
    @click="emit('click', $event)"
  >
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
    <slot />
  </OButton>
</template>
