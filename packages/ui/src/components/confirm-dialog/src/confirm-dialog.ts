import { oDialogCommonProps } from '../../dialog'
import type { ODialogCloseReason, ODialogCloseRequest } from '../../dialog'
import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oConfirmDialogTones = ['neutral', 'danger'] as const

export type OConfirmDialogTone = (typeof oConfirmDialogTones)[number]

const isConfirmDialogTone = (value: unknown): value is OConfirmDialogTone =>
  typeof value === 'string' && oConfirmDialogTones.some((tone) => tone === value)

export const oConfirmDialogProps = {
  ...oDialogCommonProps,
  tone: {
    type: String as PropType<OConfirmDialogTone>,
    default: 'neutral',
    validator: isConfirmDialogTone,
  },
  confirmLabel: {
    type: String,
    default: 'Confirm',
  },
  cancelLabel: {
    type: String,
    default: 'Cancel',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
} as const

export type OConfirmDialogProps = ExtractPublicPropTypes<typeof oConfirmDialogProps>

export interface OConfirmDialogEmits {
  'update:open': [open: boolean]
  'request-close': [request: ODialogCloseRequest]
  close: [reason: ODialogCloseReason]
  closed: [reason: ODialogCloseReason]
  confirm: [event: MouseEvent]
  cancel: [event: MouseEvent]
}

export interface OConfirmDialogSlots {
  default?: () => VNodeChild
  details?: () => VNodeChild
}
