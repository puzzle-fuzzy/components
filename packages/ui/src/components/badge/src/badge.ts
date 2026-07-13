import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oBadgeTones = ['neutral', 'brand', 'success', 'warning', 'danger'] as const

export type OBadgeTone = (typeof oBadgeTones)[number]

const isOBadgeTone = (value: unknown): value is OBadgeTone =>
  typeof value === 'string' && oBadgeTones.some((tone) => tone === value)

export const normalizeOBadgeMax = (value?: number): number => {
  if (value === undefined || !Number.isFinite(value) || value <= 0) return 99

  return Math.floor(value)
}

export const formatOBadgeValue = (value: string | number, max: number): string => {
  const normalizedMax = normalizeOBadgeMax(max)

  return typeof value === 'number' && value > normalizedMax
    ? `${String(normalizedMax)}+`
    : String(value)
}

export const oBadgeProps = {
  value: [String, Number] as PropType<string | number>,
  max: { type: Number, default: 99 },
  dot: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  showZero: { type: Boolean, default: false },
  tone: {
    type: String as PropType<OBadgeTone>,
    default: 'danger',
    validator: isOBadgeTone,
  },
  ariaLabel: String,
} as const

export type OBadgeProps = ExtractPublicPropTypes<typeof oBadgeProps>

export interface OBadgeSlots {
  default?: () => VNodeChild
}
