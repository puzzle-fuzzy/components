import type { ExtractPublicPropTypes, VNodeChild } from 'vue'

export const oDialogProps = {
  open: {
    type: Boolean,
    default: false,
  },
  title: String,
  description: String,
  closeOnMask: {
    type: Boolean,
    default: true,
  },
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  closeAriaLabel: {
    type: String,
    default: 'Close dialog',
  },
  ariaLabel: String,
} as const

export type ODialogProps = ExtractPublicPropTypes<typeof oDialogProps>

export interface ODialogEmits {
  'update:open': [open: boolean]
  close: []
}

export interface ODialogSlots {
  default?: () => VNodeChild
  header?: () => VNodeChild
  footer?: () => VNodeChild
}
