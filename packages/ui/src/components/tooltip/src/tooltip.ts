import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

import type { OFloatingPlacement } from '../../../composables/use-floating-panel'

export const oTooltipPlacements = [
  'top',
  'top-start',
  'top-end',
  'right',
  'right-start',
  'right-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
] as const satisfies readonly OFloatingPlacement[]

export type OTooltipPlacement = (typeof oTooltipPlacements)[number]

const isOTooltipPlacement = (value: unknown): value is OTooltipPlacement =>
  typeof value === 'string' && oTooltipPlacements.includes(value as OTooltipPlacement)

export const normalizeOTooltipDelay = (value?: number, fallback = 400): number => {
  if (value === undefined || !Number.isFinite(value)) return fallback
  return Math.max(0, Math.floor(value))
}

export const normalizeOTooltipOffset = (value?: number): number => {
  if (value === undefined || !Number.isFinite(value)) return 8
  return Math.max(0, Math.floor(value))
}

export const oTooltipProps = {
  content: String,
  open: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  disabled: Boolean,
  placement: {
    type: String as PropType<OTooltipPlacement>,
    default: 'top',
    validator: isOTooltipPlacement,
  },
  showDelay: {
    type: Number,
    default: 400,
  },
  hideDelay: {
    type: Number,
    default: 100,
  },
  offset: {
    type: Number,
    default: 8,
  },
  teleported: {
    type: Boolean,
    default: true,
  },
  teleportTo: {
    type: [String, Object] as PropType<string | HTMLElement>,
    default: 'body',
  },
} as const

export type OTooltipProps = ExtractPublicPropTypes<typeof oTooltipProps>

export interface OTooltipEmits {
  'update:open': [open: boolean]
}

export interface OTooltipSlots {
  default?: () => VNodeChild
  content?: () => VNodeChild
}
