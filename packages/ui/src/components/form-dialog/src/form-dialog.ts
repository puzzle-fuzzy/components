import { oDialogCommonProps } from '../../dialog'
import type { ODialogCloseReason, ODialogCloseRequest } from '../../dialog'
import type { ExtractPublicPropTypes, VNodeChild } from 'vue'

export const oFormDialogProps = {
  ...oDialogCommonProps,
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
  'request-close': [request: ODialogCloseRequest]
  close: [reason: ODialogCloseReason]
  closed: [reason: ODialogCloseReason]
  submit: [event: SubmitEvent]
  cancel: [event: MouseEvent]
}

export interface OFormDialogSlots {
  default?: () => VNodeChild
}
