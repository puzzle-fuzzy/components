import type { ExtractPublicPropTypes, VNodeChild } from 'vue'

export const oCheckboxProps = {
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: String,
  indeterminate: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  invalid: Boolean,
} as const

export type OCheckboxProps = ExtractPublicPropTypes<typeof oCheckboxProps>

export interface OCheckboxEmits {
  'update:modelValue': [value: boolean]
  change: [value: boolean, event: Event]
}

export interface OCheckboxSlots {
  default?: () => VNodeChild
}
