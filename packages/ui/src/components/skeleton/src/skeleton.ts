import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oSkeletonVariants = ['text', 'rect', 'circle'] as const

export type OSkeletonVariant = (typeof oSkeletonVariants)[number]

const isOSkeletonVariant = (value: unknown): value is OSkeletonVariant =>
  typeof value === 'string' && oSkeletonVariants.includes(value as OSkeletonVariant)

export const normalizeOSkeletonDimension = (
  value: string | number | undefined,
): string | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? `${Math.floor(value)}px` : undefined
  }

  const normalized = value?.trim()
  return normalized || undefined
}

export const normalizeOSkeletonLines = (value: number): number =>
  Math.min(12, Math.max(1, Number.isFinite(value) ? Math.floor(value) : 1))

export const oSkeletonProps = {
  loading: {
    type: Boolean,
    default: true,
  },
  animated: {
    type: Boolean,
    default: true,
  },
  variant: {
    type: String as PropType<OSkeletonVariant>,
    default: 'text',
    validator: isOSkeletonVariant,
  },
  width: [String, Number] as PropType<string | number | undefined>,
  height: [String, Number] as PropType<string | number | undefined>,
  lines: {
    type: Number,
    default: 1,
  },
} as const

export type OSkeletonProps = ExtractPublicPropTypes<typeof oSkeletonProps>

export interface OSkeletonSlots {
  default?: () => VNodeChild
}
