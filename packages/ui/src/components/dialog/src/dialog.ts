import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oDialogCloseReasons = [
  'close-button',
  'mask',
  'escape',
  'slot',
  'native',
  'programmatic',
] as const

export type ODialogCloseReason = (typeof oDialogCloseReasons)[number]
export type ODialogWidth = string | number

const defaultDialogWidth = 520

export const normalizeODialogWidth = (width: ODialogWidth | undefined): string => {
  if (typeof width === 'number') {
    return Number.isFinite(width) && width > 0
      ? `${String(Math.floor(width))}px`
      : `${String(defaultDialogWidth)}px`
  }

  const normalized = width?.trim()
  return normalized || `${String(defaultDialogWidth)}px`
}

export const oDialogCommonProps = {
  open: { type: Boolean, default: false },
  title: String,
  description: String,
  closeOnMask: { type: Boolean, default: true },
  closeOnEsc: { type: Boolean, default: true },
  showClose: { type: Boolean, default: true },
  closeAriaLabel: { type: String, default: 'Close dialog' },
  ariaLabel: String,
} as const

export const oDialogProps = {
  ...oDialogCommonProps,
  width: {
    type: [String, Number] as PropType<ODialogWidth>,
    default: defaultDialogWidth,
  },
  fullscreen: { type: Boolean, default: false },
  destroyOnClose: { type: Boolean, default: false },
  initialFocus: String,
} as const

export type ODialogProps = ExtractPublicPropTypes<typeof oDialogProps>

export interface ODialogCloseRequest {
  readonly reason: Exclude<ODialogCloseReason, 'programmatic'>
  readonly originalEvent?: Event
}

export interface ODialogEmits {
  'update:open': [open: boolean]
  'request-close': [request: ODialogCloseRequest]
  open: []
  opened: []
  close: [reason: ODialogCloseReason]
  closed: [reason: ODialogCloseReason]
}

export interface ODialogSlotProps {
  readonly close: () => void
  readonly titleId: string
  readonly descriptionId: string
}

export interface ODialogSlots {
  header?: (props: ODialogSlotProps) => VNodeChild
  title?: (props: ODialogSlotProps) => VNodeChild
  description?: (props: ODialogSlotProps) => VNodeChild
  default?: (props: ODialogSlotProps) => VNodeChild
  footer?: (props: ODialogSlotProps) => VNodeChild
  closeIcon?: () => VNodeChild
}
