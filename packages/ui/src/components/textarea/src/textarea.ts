import type { ExtractPublicPropTypes, PropType } from 'vue'

export interface OTextareaAutosizeOptions {
  readonly minRows?: number
  readonly maxRows?: number
}

export interface OTextareaAutosizeState {
  readonly enabled: boolean
  readonly minRows: number
  readonly maxRows: number | undefined
}

const defaultRows = 4

export const normalizeOTextareaRows = (value: unknown, fallback = defaultRows): number => {
  const normalizedFallback =
    typeof fallback === 'number' && Number.isFinite(fallback) && fallback > 0
      ? Math.max(1, Math.trunc(fallback))
      : defaultRows

  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.max(1, Math.trunc(value))
    : normalizedFallback
}

export const resolveOTextareaAutosize = (
  autosize: boolean | OTextareaAutosizeOptions,
  rows: number,
): OTextareaAutosizeState => {
  const normalizedRows = normalizeOTextareaRows(rows)
  if (!autosize) {
    return { enabled: false, minRows: normalizedRows, maxRows: undefined }
  }

  if (autosize === true) {
    return { enabled: true, minRows: normalizedRows, maxRows: undefined }
  }

  const minRows = normalizeOTextareaRows(autosize.minRows, normalizedRows)
  const maxRows =
    autosize.maxRows === undefined
      ? undefined
      : Math.max(minRows, normalizeOTextareaRows(autosize.maxRows, minRows))

  return { enabled: true, minRows, maxRows }
}

export const oTextareaProps = {
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: String,
  rows: {
    type: Number,
    default: defaultRows,
  },
  autosize: {
    type: [Boolean, Object] as PropType<boolean | OTextareaAutosizeOptions>,
    default: false,
  },
  maxlength: Number as PropType<number | undefined>,
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
