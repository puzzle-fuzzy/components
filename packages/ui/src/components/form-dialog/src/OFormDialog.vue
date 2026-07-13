<script setup lang="ts">
import { computed, useId } from 'vue'

import { OButton } from '../../button'
import { ODialog, type ODialogCloseRequest } from '../../dialog'
import { oFormDialogProps, type OFormDialogEmits, type OFormDialogSlots } from './form-dialog'

defineOptions({ name: 'OFormDialog' })

const props = defineProps(oFormDialogProps)
const emit = defineEmits<OFormDialogEmits>()

defineSlots<OFormDialogSlots>()

const formId = `o-form-dialog-${useId()}-form`
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

const handleSubmit = (event: SubmitEvent): void => {
  emit('submit', event)
}

const handleCancel = (event: MouseEvent, close: () => void): void => {
  emit('cancel', event)
  close()
}
</script>

<template>
  <ODialog
    v-bind="optionalDialogProps"
    class="o-form-dialog"
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
    <form :id="formId" class="o-form-dialog__form" @submit.prevent="handleSubmit">
      <slot />
    </form>

    <template #footer="{ close }">
      <OButton
        class="o-form-dialog__cancel"
        variant="outline"
        tone="neutral"
        autofocus
        @click="handleCancel($event, close)"
      >
        {{ props.cancelLabel }}
      </OButton>
      <OButton
        class="o-form-dialog__submit"
        type="submit"
        :form="formId"
        :loading="props.loading"
        :disabled="props.submitDisabled"
      >
        {{ props.submitLabel }}
      </OButton>
    </template>
  </ODialog>
</template>
