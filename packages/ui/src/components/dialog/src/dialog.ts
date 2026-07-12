import type { ExtractPublicPropTypes } from 'vue'

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
  ariaLabel: String,
} as const

export type ODialogProps = ExtractPublicPropTypes<typeof oDialogProps>

export interface ODialogEmits {
  'update:open': [open: boolean]
  close: []
}
