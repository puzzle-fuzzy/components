<script setup lang="ts">
import { OTextarea, oTextareaProps, type OTextareaEmits } from '../../textarea'

defineOptions({
  name: 'OInputGroupTextarea',
  inheritAttrs: false,
})

const props = defineProps(oTextareaProps)
const emit = defineEmits<OTextareaEmits>()
</script>

<template>
  <OTextarea
    v-bind="{ ...props, ...$attrs }"
    class="o-input-group__textarea"
    data-slot="input-group-textarea"
    @update:model-value="emit('update:modelValue', $event)"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  />
</template>
