import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oSwitchSizes = ['sm', 'md'] as const

export type OSwitchSize = (typeof oSwitchSizes)[number]

const isOSwitchSize = (value: unknown): value is OSwitchSize =>
  typeof value === 'string' && oSwitchSizes.includes(value as OSwitchSize)

export const oSwitchProps = {
  modelValue: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String as PropType<OSwitchSize>,
    default: 'md',
    validator: isOSwitchSize,
  },
  label: String,
  description: String,
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  invalid: {
    type: Boolean,
    default: false,
  },
} as const

export type OSwitchProps = ExtractPublicPropTypes<typeof oSwitchProps>

export interface OSwitchEmits {
  'update:modelValue': [value: boolean]
  change: [value: boolean, event: Event]
}

export interface OSwitchSlots {
  default?: () => VNodeChild
  description?: () => VNodeChild
}
