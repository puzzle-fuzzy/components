<script setup lang="ts">
import { PopoverRoot } from 'reka-ui'
import { computed } from 'vue'

import { provideOPopoverContext } from './popover-context'
import { oPopoverProps, type OPopoverEmits, type OPopoverSlots } from './popover'

defineOptions({
  name: 'OPopover',
})

const props = defineProps(oPopoverProps)
const emit = defineEmits<OPopoverEmits>()

defineSlots<OPopoverSlots>()
provideOPopoverContext()

const delegatedProps = computed(() => ({
  defaultOpen: props.defaultOpen,
  modal: props.modal,
  ...(props.open === undefined ? {} : { open: props.open }),
}))
</script>

<template>
  <PopoverRoot v-bind="delegatedProps" @update:open="emit('update:open', $event)">
    <template #default="slotProps">
      <slot :open="slotProps.open" :close="slotProps.close" />
    </template>
  </PopoverRoot>
</template>
