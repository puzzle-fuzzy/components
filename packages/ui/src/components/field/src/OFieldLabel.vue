<script setup lang="ts">
import { computed, inject } from 'vue'

import { OLabel } from '../../label'
import { oFieldContextKey } from './field-context'
import { oFieldLabelProps, type OFieldLabelSlots } from './field'

defineOptions({
  name: 'OFieldLabel',
  inheritAttrs: false,
})

const props = defineProps(oFieldLabelProps)
const field = inject(oFieldContextKey, undefined)

defineSlots<OFieldLabelSlots>()

const disabled = computed(() => props.disabled || Boolean(field?.disabled.value))
const required = computed(() => props.required || Boolean(field?.required.value))
</script>

<template>
  <OLabel
    v-bind="{ ...$attrs, ...(props.for === undefined ? {} : { for: props.for }) }"
    class="o-field__label"
    :disabled="disabled"
    :required="required"
    :data-invalid="field?.invalid.value ? 'true' : undefined"
    data-field-slot="field-label"
  >
    <slot />
  </OLabel>
</template>
