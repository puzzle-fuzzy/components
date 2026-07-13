<script setup lang="ts">
import { LuAlertTriangle } from 'vue-icons-plus/lu'
import { computed } from 'vue'

import { OButton } from '../../button'
import { ODialog, type ODialogCloseRequest } from '../../dialog'
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

const handleCloseRequest = (request: ODialogCloseRequest): void => {
  // eslint-disable-next-line vue/custom-event-name-casing -- Public Vue events use template kebab-case.
  emit('request-close', request)
}

const handleConfirm = (event: MouseEvent): void => {
  emit('confirm', event)
}

const handleCancel = (event: MouseEvent, close: () => void): void => {
  emit('cancel', event)
  close()
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
    @request-close="handleCloseRequest"
    @close="emit('close', $event)"
    @closed="emit('closed', $event)"
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

    <template #footer="{ close }">
      <OButton
        class="o-confirm-dialog__cancel"
        variant="outline"
        tone="neutral"
        autofocus
        @click="handleCancel($event, close)"
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
