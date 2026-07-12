import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oInputTypes = ['text', 'password', 'email', 'search', 'tel', 'url'] as const
export const oInputSizes = ['sm', 'md', 'lg'] as const

export type OInputType = (typeof oInputTypes)[number]
export type OInputSize = (typeof oInputSizes)[number]

const isStringMember = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && (values as readonly string[]).includes(value)

export const oInputProps = {
  modelValue: {
    type: String,
    default: '',
  },
  type: {
    type: String as PropType<OInputType>,
    default: 'text',
    validator: (value: unknown): value is OInputType => isStringMember(oInputTypes, value),
  },
  size: {
    type: String as PropType<OInputSize>,
    default: 'md',
    validator: (value: unknown): value is OInputSize => isStringMember(oInputSizes, value),
  },
  placeholder: String,
  clearable: Boolean,
  showPassword: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  invalid: Boolean,
  ariaLabel: String,
  clearAriaLabel: {
    type: String,
    default: 'Clear input',
  },
  showPasswordAriaLabel: {
    type: String,
    default: 'Show password',
  },
  hidePasswordAriaLabel: {
    type: String,
    default: 'Hide password',
  },
} as const

export type OInputProps = ExtractPublicPropTypes<typeof oInputProps>

export interface OInputEmits {
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  clear: []
}

export interface OInputSlots {
  prefix?: () => VNodeChild
  suffix?: () => VNodeChild
}
