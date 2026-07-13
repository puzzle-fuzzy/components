import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oButtonVariants = ['solid', 'soft', 'outline', 'ghost'] as const
export const oButtonSizes = ['sm', 'md', 'lg'] as const
export const oButtonTones = ['brand', 'neutral', 'danger'] as const
export const oButtonNativeTypes = ['button', 'submit', 'reset'] as const

export type OButtonVariant = (typeof oButtonVariants)[number]
export type OButtonSize = (typeof oButtonSizes)[number]
export type OButtonTone = (typeof oButtonTones)[number]
export type OButtonNativeType = (typeof oButtonNativeTypes)[number]

const isAllowedValue = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && values.includes(value as Value)

export const oButtonProps = {
  variant: {
    type: String as PropType<OButtonVariant>,
    default: 'solid',
    validator: (value: unknown): value is OButtonVariant => isAllowedValue(oButtonVariants, value),
  },
  size: {
    type: String as PropType<OButtonSize>,
    default: 'sm',
    validator: (value: unknown): value is OButtonSize => isAllowedValue(oButtonSizes, value),
  },
  tone: {
    type: String as PropType<OButtonTone>,
    default: 'brand',
    validator: (value: unknown): value is OButtonTone => isAllowedValue(oButtonTones, value),
  },
  type: {
    type: String as PropType<OButtonNativeType>,
    default: 'button',
    validator: (value: unknown): value is OButtonNativeType =>
      isAllowedValue(oButtonNativeTypes, value),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  iconOnly: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
} as const

export type OButtonProps = ExtractPublicPropTypes<typeof oButtonProps>

export interface OButtonSlots {
  default?: () => VNodeChild
  icon?: () => VNodeChild
}

export interface OButtonEmits {
  click: [event: MouseEvent]
}
