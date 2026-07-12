import { oDialogProps } from '../../dialog'
import type { ExtractPublicPropTypes, VNodeChild } from 'vue'

export const oFormDialogProps = {
  ...oDialogProps,
  submitLabel: {
    type: String,
    default: 'Submit',
  },
  cancelLabel: {
    type: String,
    default: 'Cancel',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  submitDisabled: {
    type: Boolean,
    default: false,
  },
} as const

export type OFormDialogProps = ExtractPublicPropTypes<typeof oFormDialogProps>

export interface OFormDialogEmits {
  'update:open': [open: boolean]
  submit: [event: SubmitEvent]
  cancel: [event: MouseEvent]
}

export interface OFormDialogSlots {
  default?: () => VNodeChild
}
