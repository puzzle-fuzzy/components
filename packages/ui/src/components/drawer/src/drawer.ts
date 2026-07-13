import {
  oDialogCommonProps,
  type ODialogCloseReason,
  type ODialogCloseRequest,
  type ODialogSlots,
} from '../../dialog'
import type { ExtractPublicPropTypes, PropType } from 'vue'

export const oDrawerPlacements = ['start', 'end'] as const

export type ODrawerPlacement = (typeof oDrawerPlacements)[number]

type ODrawerSize = string | number

const defaultDrawerSize = 400

const isDrawerPlacement = (value: unknown): value is ODrawerPlacement =>
  typeof value === 'string' && oDrawerPlacements.some((placement) => placement === value)

export const normalizeODrawerSize = (size: ODrawerSize | undefined): string => {
  if (typeof size === 'number') {
    return Number.isFinite(size) && size > 0
      ? `${String(Math.floor(size))}px`
      : `${String(defaultDrawerSize)}px`
  }

  const normalized = size?.trim()
  return normalized || `${String(defaultDrawerSize)}px`
}

export const oDrawerProps = {
  ...oDialogCommonProps,
  closeAriaLabel: {
    type: String,
    default: 'Close drawer',
  },
  placement: {
    type: String as PropType<ODrawerPlacement>,
    default: 'end',
    validator: isDrawerPlacement,
  },
  size: {
    type: [String, Number] as PropType<ODrawerSize>,
    default: defaultDrawerSize,
  },
} as const

export type ODrawerProps = ExtractPublicPropTypes<typeof oDrawerProps>

export interface ODrawerEmits {
  'update:open': [open: boolean]
  'request-close': [request: ODialogCloseRequest]
  close: [reason: ODialogCloseReason]
  closed: [reason: ODialogCloseReason]
}

export type ODrawerSlots = ODialogSlots
