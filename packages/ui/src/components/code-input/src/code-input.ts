import type { ExtractPublicPropTypes, PropType } from 'vue'

export const oCodeInputSizes = ['sm', 'md', 'lg'] as const

export type OCodeInputSize = (typeof oCodeInputSizes)[number]

const DEFAULT_CODE_INPUT_LENGTH = 6

export const normalizeOCodeInputLength = (length: number): number =>
  Number.isFinite(length) ? Math.max(1, Math.floor(length)) : DEFAULT_CODE_INPUT_LENGTH

export const sanitizeOCodeInputValue = (value: string, length: number): string =>
  Array.from(value)
    .filter((character) => /^[0-9]$/u.test(character))
    .slice(0, normalizeOCodeInputLength(length))
    .join('')

export const oCodeInputProps = {
  modelValue: {
    type: String,
    default: '',
  },
  length: {
    type: Number,
    default: DEFAULT_CODE_INPUT_LENGTH,
  },
  size: {
    type: String as PropType<OCodeInputSize>,
    default: 'md',
    validator: (value: unknown): value is OCodeInputSize =>
      typeof value === 'string' && oCodeInputSizes.some((size) => size === value),
  },
  disabled: Boolean,
  readonly: Boolean,
  autofocus: Boolean,
  invalid: Boolean,
  ariaLabel: {
    type: String,
    default: 'Verification code',
  },
} as const

export type OCodeInputProps = ExtractPublicPropTypes<typeof oCodeInputProps>

export interface OCodeInputEmits {
  'update:modelValue': [value: string]
  complete: [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

export interface OCodeInputExpose {
  focus: (index?: number) => void
}
