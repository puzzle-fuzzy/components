<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

import { ODialog } from '../../dialog'
import { normalizeODrawerSize, oDrawerProps, type ODrawerEmits, type ODrawerSlots } from './drawer'

defineOptions({
  name: 'ODrawer',
  inheritAttrs: false,
})

const props = defineProps(oDrawerProps)
const emit = defineEmits<ODrawerEmits>()
const slots = defineSlots<ODrawerSlots>()

const optionalDialogProps = computed(() => {
  const values: { title?: string; description?: string; ariaLabel?: string } = {}
  if (props.title !== undefined) values.title = props.title
  if (props.description !== undefined) values.description = props.description
  if (props.ariaLabel !== undefined) values.ariaLabel = props.ariaLabel
  return values
})
const drawerStyle = computed<CSSProperties>(() => ({
  '--omg-drawer-inline-size': normalizeODrawerSize(props.size),
}))
</script>

<template>
  <ODialog
    v-bind="{ ...$attrs, ...optionalDialogProps }"
    class="o-drawer"
    :class="`o-drawer--${props.placement}`"
    :style="drawerStyle"
    :open="props.open"
    :close-on-mask="props.closeOnMask"
    :close-on-esc="props.closeOnEsc"
    :show-close="props.showClose"
    :close-aria-label="props.closeAriaLabel"
    @update:open="emit('update:open', $event)"
    @close="emit('close')"
  >
    <template v-if="slots.header" #header><slot name="header" /></template>
    <slot />
    <template v-if="slots.footer" #footer><slot name="footer" /></template>
  </ODialog>
</template>
