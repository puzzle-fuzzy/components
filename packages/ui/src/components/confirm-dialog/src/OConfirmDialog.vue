<script setup lang="ts">
import { LuAlertTriangle } from 'vue-icons-plus/lu'
import { computed } from 'vue'

import { OButton } from '../../button'
import { ODialog } from '../../dialog'
import {
  oConfirmDialogProps,
  type OConfirmDialogEmits,
  type OConfirmDialogSlots,
} from './confirm-dialog'

defineOptions({ name: 'OConfirmDialog' })

const props = defineProps(oConfirmDialogProps)
const emit = defineEmits<OConfirmDialogEmits>()
const slots = defineSlots<OConfirmDialogSlots>()

const optionalDialogProps = computed(() => {
  const values: { title?: string; description?: string; ariaLabel?: string } = {}
  if (props.title !== undefined) values.title = props.title
  if (props.description !== undefined) values.description = props.description
  if (props.ariaLabel !== undefined) values.ariaLabel = props.ariaLabel
  return values
})

const handleOpenUpdate = (open: boolean): void => {
  emit('update:open', open)
}

const handleConfirm = (event: MouseEvent): void => {
  emit('confirm', event)
}

const handleCancel = (event: MouseEvent): void => {
  emit('cancel', event)
  emit('update:open', false)
}
</script>

<template>
  <ODialog
    v-bind="optionalDialogProps"
    class="o-confirm-dialog"
    :class="`o-confirm-dialog--${props.tone}`"
    :open="props.open"
    :close-on-mask="props.closeOnMask"
    :close-on-esc="props.closeOnEsc"
    :show-close="props.showClose"
    :close-aria-label="props.closeAriaLabel"
    @update:open="handleOpenUpdate"
  >
    <div
      v-if="props.tone === 'danger' || slots.default || slots.details"
      class="o-confirm-dialog__content"
    >
      <span v-if="props.tone === 'danger'" class="o-confirm-dialog__signal" aria-hidden="true">
        <LuAlertTriangle aria-hidden="true" />
      </span>

      <div v-if="slots.default || slots.details" class="o-confirm-dialog__message">
        <slot />
        <div v-if="slots.details" class="o-confirm-dialog__details">
          <slot name="details" />
        </div>
      </div>
    </div>

    <template #footer>
      <OButton
        class="o-confirm-dialog__cancel"
        variant="outline"
        tone="neutral"
        autofocus
        @click="handleCancel"
      >
        {{ props.cancelLabel }}
      </OButton>
      <OButton
        class="o-confirm-dialog__confirm"
        :tone="props.tone === 'danger' ? 'danger' : 'brand'"
        :loading="props.loading"
        :disabled="props.disabled"
        @click="handleConfirm"
      >
        {{ props.confirmLabel }}
      </OButton>
    </template>
  </ODialog>
</template>
