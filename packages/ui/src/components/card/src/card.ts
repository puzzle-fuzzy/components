import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oCardVariants = ['surface', 'muted', 'ghost'] as const
export const oCardSizes = ['sm', 'md'] as const
export const oCardTitleLevels = [2, 3, 4] as const

export type OCardVariant = (typeof oCardVariants)[number]
export type OCardSize = (typeof oCardSizes)[number]
export type OCardTitleLevel = (typeof oCardTitleLevels)[number]

const isStringMember = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && (values as readonly string[]).includes(value)

const isOCardTitleLevel = (value: unknown): value is OCardTitleLevel =>
  typeof value === 'number' && oCardTitleLevels.includes(value as OCardTitleLevel)

export const oCardProps = {
  variant: {
    type: String as PropType<OCardVariant>,
    default: 'surface',
    validator: (value: unknown): value is OCardVariant => isStringMember(oCardVariants, value),
  },
  size: {
    type: String as PropType<OCardSize>,
    default: 'md',
    validator: (value: unknown): value is OCardSize => isStringMember(oCardSizes, value),
  },
  title: String,
  description: String,
  titleLevel: {
    type: Number as PropType<OCardTitleLevel>,
    default: 3,
    validator: isOCardTitleLevel,
  },
} as const

export type OCardProps = ExtractPublicPropTypes<typeof oCardProps>

export interface OCardSlots {
  title?: () => VNodeChild
  description?: () => VNodeChild
  action?: () => VNodeChild
  default?: () => VNodeChild
  footer?: () => VNodeChild
}
