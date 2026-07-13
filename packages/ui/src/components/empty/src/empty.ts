import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oEmptyMediaVariants = ['plain', 'soft'] as const
export const oEmptySizes = ['sm', 'md'] as const
export const oEmptyTitleLevels = [2, 3, 4] as const

export type OEmptyMediaVariant = (typeof oEmptyMediaVariants)[number]
export type OEmptySize = (typeof oEmptySizes)[number]
export type OEmptyTitleLevel = (typeof oEmptyTitleLevels)[number]

const isStringMember = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && (values as readonly string[]).includes(value)

const isOEmptyTitleLevel = (value: unknown): value is OEmptyTitleLevel =>
  typeof value === 'number' && oEmptyTitleLevels.includes(value as OEmptyTitleLevel)

export const oEmptyProps = {
  mediaVariant: {
    type: String as PropType<OEmptyMediaVariant>,
    default: 'plain',
    validator: (value: unknown): value is OEmptyMediaVariant =>
      isStringMember(oEmptyMediaVariants, value),
  },
  size: {
    type: String as PropType<OEmptySize>,
    default: 'md',
    validator: (value: unknown): value is OEmptySize => isStringMember(oEmptySizes, value),
  },
  title: String,
  description: String,
  titleLevel: {
    type: Number as PropType<OEmptyTitleLevel>,
    default: 3,
    validator: isOEmptyTitleLevel,
  },
} as const

export type OEmptyProps = ExtractPublicPropTypes<typeof oEmptyProps>

export interface OEmptySlots {
  media?: () => VNodeChild
  title?: () => VNodeChild
  description?: () => VNodeChild
  default?: () => VNodeChild
  actions?: () => VNodeChild
}
