import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oTagTones = ['neutral', 'brand', 'success', 'warning', 'danger'] as const
export const oTagVariants = ['soft', 'solid'] as const
export const oTagSizes = ['sm', 'md'] as const

export type OTagTone = (typeof oTagTones)[number]
export type OTagVariant = (typeof oTagVariants)[number]
export type OTagSize = (typeof oTagSizes)[number]

const includes = <Value extends string>(values: readonly Value[], value: unknown): value is Value =>
  typeof value === 'string' && values.some((candidate) => candidate === value)

export const oTagProps = {
  tone: {
    type: String as PropType<OTagTone>,
    default: 'neutral',
    validator: (value: unknown): value is OTagTone => includes(oTagTones, value),
  },
  variant: {
    type: String as PropType<OTagVariant>,
    default: 'soft',
    validator: (value: unknown): value is OTagVariant => includes(oTagVariants, value),
  },
  size: {
    type: String as PropType<OTagSize>,
    default: 'md',
    validator: (value: unknown): value is OTagSize => includes(oTagSizes, value),
  },
  closable: {
    type: Boolean,
    default: false,
  },
  closeAriaLabel: {
    type: String,
    default: 'Close tag',
  },
} as const

export type OTagProps = ExtractPublicPropTypes<typeof oTagProps>

export interface OTagEmits {
  close: [event: MouseEvent]
}

export interface OTagSlots {
  icon?: () => VNodeChild
  default?: () => VNodeChild
  closeIcon?: () => VNodeChild
}
