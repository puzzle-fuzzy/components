import type { ExtractPublicPropTypes, VNodeChild } from 'vue'

export const oLabelProps = {
  for: String,
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
} as const

export type OLabelProps = ExtractPublicPropTypes<typeof oLabelProps>

export interface OLabelSlots {
  default?: () => VNodeChild
}
