<script setup lang="ts">
import { OInput, oInputProps, type OInputEmits } from '../../input'
import type { OInputGroupInputSlots } from './input-group'

defineOptions({
  name: 'OInputGroupInput',
  inheritAttrs: false,
})

const props = defineProps(oInputProps)
const emit = defineEmits<OInputEmits>()

defineSlots<OInputGroupInputSlots>()
</script>

<template>
  <OInput
    v-bind="{ ...props, ...$attrs }"
    class="o-input-group__input"
    data-slot="input-group-input"
    @update:model-value="emit('update:modelValue', $event)"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
    @clear="emit('clear')"
  >
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>
    <template v-if="$slots.suffix" #suffix>
      <slot name="suffix" />
    </template>
  </OInput>
</template>
