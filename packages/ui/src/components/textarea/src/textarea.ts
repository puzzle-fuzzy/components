import type { ExtractPublicPropTypes, PropType } from 'vue'

export const oTextareaResizeModes = ['none', 'vertical', 'horizontal', 'both'] as const

export type OTextareaResizeMode = (typeof oTextareaResizeModes)[number]

const isStringMember = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && (values as readonly string[]).includes(value)

export const oTextareaProps = {
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: String,
  rows: {
    type: Number,
    default: 4,
  },
  maxlength: Number as PropType<number | undefined>,
  resize: {
    type: String as PropType<OTextareaResizeMode>,
    default: 'vertical',
    validator: (value: unknown): value is OTextareaResizeMode =>
      isStringMember(oTextareaResizeModes, value),
  },
  showCount: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  invalid: Boolean,
  ariaLabel: String,
} as const

export type OTextareaProps = ExtractPublicPropTypes<typeof oTextareaProps>

export interface OTextareaEmits {
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}
