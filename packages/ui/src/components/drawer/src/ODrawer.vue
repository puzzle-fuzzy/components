<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

import { ODialog, type ODialogCloseRequest } from '../../dialog'
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

const handleCloseRequest = (request: ODialogCloseRequest): void => {
  // eslint-disable-next-line vue/custom-event-name-casing -- Public Vue events use template kebab-case.
  emit('request-close', request)
}
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
    @request-close="handleCloseRequest"
    @close="emit('close', $event)"
    @closed="emit('closed', $event)"
  >
    <template v-if="slots.header" #header="slotProps">
      <slot name="header" v-bind="slotProps" />
    </template>
    <template v-if="slots.title" #title="slotProps">
      <slot name="title" v-bind="slotProps" />
    </template>
    <template v-if="slots.description" #description="slotProps">
      <slot name="description" v-bind="slotProps" />
    </template>
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
    <template v-if="slots.footer" #footer="slotProps">
      <slot name="footer" v-bind="slotProps" />
    </template>
    <template v-if="slots.closeIcon" #closeIcon>
      <slot name="closeIcon" />
    </template>
  </ODialog>
</template>
