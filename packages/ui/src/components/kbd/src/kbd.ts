import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oKbdSizes = ['sm', 'md'] as const

export type OKbdSize = (typeof oKbdSizes)[number]

const isOKbdSize = (value: unknown): value is OKbdSize =>
  typeof value === 'string' && oKbdSizes.includes(value as OKbdSize)

export const oKbdProps = {
  size: {
    type: String as PropType<OKbdSize>,
    default: 'sm',
    validator: isOKbdSize,
  },
} as const

export const oKbdGroupProps = {
  ariaLabel: {
    type: String as PropType<string | undefined>,
  },
} as const

export type OKbdProps = ExtractPublicPropTypes<typeof oKbdProps>
export type OKbdGroupProps = ExtractPublicPropTypes<typeof oKbdGroupProps>

export interface OKbdSlots {
  default?: () => VNodeChild
}

export interface OKbdGroupSlots {
  default?: () => VNodeChild
}
