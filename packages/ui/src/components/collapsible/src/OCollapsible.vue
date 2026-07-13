<script setup lang="ts">
import { CollapsibleRoot } from 'reka-ui'
import { computed, provide, ref, useId } from 'vue'

import {
  oCollapsibleContextKey,
  oCollapsibleProps,
  type OCollapsibleEmits,
  type OCollapsibleSlots,
} from './collapsible'

defineOptions({
  name: 'OCollapsible',
  inheritAttrs: false,
})

const props = defineProps(oCollapsibleProps)
const emit = defineEmits<OCollapsibleEmits>()

defineSlots<OCollapsibleSlots>()

const uncontrolledOpen = ref(props.defaultOpen)
const currentOpen = computed(() => props.open ?? uncontrolledOpen.value)

provide(oCollapsibleContextKey, {
  contentId: `o-collapsible-${useId()}-content`,
  open: currentOpen,
})

const handleOpenUpdate = (open: boolean): void => {
  if (props.open === undefined) uncontrolledOpen.value = open
  emit('update:open', open)
}
</script>

<template>
  <CollapsibleRoot
    v-slot="slotProps"
    v-bind="$attrs"
    class="o-collapsible"
    data-slot="collapsible"
    :open="currentOpen"
    :default-open="props.defaultOpen"
    :disabled="props.disabled"
    :unmount-on-hide="props.unmountOnHide"
    :as="props.as"
    :as-child="props.asChild"
    @update:open="handleOpenUpdate"
  >
    <slot :open="slotProps.open" />
  </CollapsibleRoot>
</template>
