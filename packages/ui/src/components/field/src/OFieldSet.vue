<script setup lang="ts">
import { oFieldSetProps, type OFieldSetSlots } from './field'

defineOptions({
  name: 'OFieldSet',
  inheritAttrs: false,
})

const props = defineProps(oFieldSetProps)

defineSlots<OFieldSetSlots>()
</script>

<template>
  <fieldset
    v-bind="$attrs"
    class="o-field-set"
    data-slot="field-set"
    :disabled="props.disabled"
    :data-disabled="props.disabled ? 'true' : undefined"
  >
    <slot />
  </fieldset>
</template>
