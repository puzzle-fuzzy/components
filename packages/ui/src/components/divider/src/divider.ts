import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oDividerDirections = ['horizontal', 'vertical'] as const
export const oDividerContentPositions = ['left', 'center', 'right'] as const

export type ODividerDirection = (typeof oDividerDirections)[number]
export type ODividerContentPosition = (typeof oDividerContentPositions)[number]

const isAllowedValue = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && values.includes(value as Value)

export const oDividerProps = {
  direction: {
    type: String as PropType<ODividerDirection>,
    default: 'horizontal',
    validator: (value: unknown): value is ODividerDirection =>
      isAllowedValue(oDividerDirections, value),
  },
  dashed: {
    type: Boolean,
    default: false,
  },
  contentPosition: {
    type: String as PropType<ODividerContentPosition>,
    default: 'center',
    validator: (value: unknown): value is ODividerContentPosition =>
      isAllowedValue(oDividerContentPositions, value),
  },
} as const

export type ODividerProps = ExtractPublicPropTypes<typeof oDividerProps>

export interface ODividerSlots {
  default?: () => VNodeChild
}
