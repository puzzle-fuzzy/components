import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oRadioGroupOrientations = ['horizontal', 'vertical'] as const

export type ORadioValue = string | number
export type ORadioGroupOrientation = (typeof oRadioGroupOrientations)[number]

const isStringMember = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && (values as readonly string[]).includes(value)

export const oRadioProps = {
  modelValue: [String, Number] as PropType<ORadioValue | undefined>,
  value: {
    type: [String, Number] as PropType<ORadioValue>,
    required: true,
  },
  label: String,
  name: String,
  disabled: Boolean,
  invalid: Boolean,
} as const

export const oRadioGroupProps = {
  modelValue: [String, Number] as PropType<ORadioValue | undefined>,
  name: String,
  orientation: {
    type: String as PropType<ORadioGroupOrientation>,
    default: 'vertical',
    validator: (value: unknown): value is ORadioGroupOrientation =>
      isStringMember(oRadioGroupOrientations, value),
  },
  disabled: Boolean,
  invalid: Boolean,
  ariaLabel: String,
} as const

export type ORadioProps = ExtractPublicPropTypes<typeof oRadioProps>
export type ORadioGroupProps = ExtractPublicPropTypes<typeof oRadioGroupProps>

export interface ORadioEmits {
  'update:modelValue': [value: ORadioValue]
  change: [value: ORadioValue, event: Event]
}

export interface ORadioGroupEmits {
  'update:modelValue': [value: ORadioValue]
  change: [value: ORadioValue, event: Event]
}

export interface ORadioSlots {
  default?: () => VNodeChild
}

export interface ORadioGroupSlots {
  default?: () => VNodeChild
}
