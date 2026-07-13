import type { ExtractPublicPropTypes, PropType } from 'vue'

export const oSpinnerSizes = ['sm', 'md', 'lg'] as const

export type OSpinnerSize = (typeof oSpinnerSizes)[number]

const isOSpinnerSize = (value: unknown): value is OSpinnerSize =>
  typeof value === 'string' && oSpinnerSizes.includes(value as OSpinnerSize)

export const oSpinnerProps = {
  size: {
    type: String as PropType<OSpinnerSize>,
    default: 'md',
    validator: isOSpinnerSize,
  },
  label: {
    type: String,
    default: 'Loading',
  },
  decorative: {
    type: Boolean,
    default: false,
  },
} as const

export type OSpinnerProps = ExtractPublicPropTypes<typeof oSpinnerProps>
export type OSpinnerSlots = Readonly<Record<string, never>>
