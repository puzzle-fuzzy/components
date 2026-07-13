<script setup lang="ts">
import { computed, inject, provide } from 'vue'

import { oFieldContextKey } from './field-context'
import { oFieldProps, type OFieldSlots } from './field'

defineOptions({
  name: 'OField',
  inheritAttrs: false,
})

const props = defineProps(oFieldProps)
const parentField = inject(oFieldContextKey, undefined)

defineSlots<OFieldSlots>()

const disabled = computed(() => props.disabled || Boolean(parentField?.disabled.value))
const invalid = computed(() => props.invalid || Boolean(parentField?.invalid.value))
const required = computed(() => props.required || Boolean(parentField?.required.value))

provide(oFieldContextKey, { disabled, invalid, required })
</script>

<template>
  <div
    v-bind="$attrs"
    class="o-field"
    data-slot="field"
    :data-orientation="props.orientation"
    :data-disabled="disabled ? 'true' : undefined"
    :data-invalid="invalid ? 'true' : undefined"
    :data-required="required ? 'true' : undefined"
  >
    <slot />
  </div>
</template>
