import { oAvatarShapes, oAvatarSizes, type OAvatarShape, type OAvatarSize } from '../../avatar'
import type { ExtractPublicPropTypes, PropType } from 'vue'

export interface OAvatarGroupItem {
  readonly id: string | number
  readonly name?: string
  readonly src?: string
  readonly initials?: string
  readonly backgroundColor?: string
  readonly textColor?: string
}

export type OAvatarGroupOverlap = number | string

export const normalizeOAvatarGroupMax = (value: number | undefined, itemCount: number): number => {
  if (value === undefined || !Number.isFinite(value)) return itemCount
  return Math.max(1, Math.floor(value))
}

export const normalizeOAvatarGroupOverlap = (
  value: OAvatarGroupOverlap | undefined,
): string | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? `${Math.max(0, value)}px` : undefined
  }

  const normalized = value?.trim()
  return normalized || undefined
}

export const oAvatarGroupProps = {
  items: {
    type: Array as PropType<readonly OAvatarGroupItem[]>,
    required: true,
  },
  max: Number as PropType<number | undefined>,
  size: {
    type: String as PropType<OAvatarSize>,
    default: 'md',
    validator: (value: unknown): value is OAvatarSize =>
      oAvatarSizes.some((size) => size === value),
  },
  shape: {
    type: String as PropType<OAvatarShape>,
    default: 'circle',
    validator: (value: unknown): value is OAvatarShape =>
      oAvatarShapes.some((shape) => shape === value),
  },
  reverse: Boolean,
  overlap: [Number, String] as PropType<OAvatarGroupOverlap | undefined>,
  ariaLabel: String as PropType<string | undefined>,
} as const

export type OAvatarGroupProps = ExtractPublicPropTypes<typeof oAvatarGroupProps>
