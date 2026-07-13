import type { ComputedRef, ExtractPublicPropTypes, InjectionKey, PropType, VNodeChild } from 'vue'

export const oButtonGroupOrientations = ['horizontal', 'vertical'] as const

export type OButtonGroupOrientation = (typeof oButtonGroupOrientations)[number]
export type OButtonGroupTextTag = 'span' | 'div'

const oButtonGroupTextTags = ['span', 'div'] as const
const isStringMember = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && values.includes(value as Value)

export const oButtonGroupProps = {
  orientation: {
    type: String as PropType<OButtonGroupOrientation>,
    default: 'horizontal',
    validator: (value: unknown): value is OButtonGroupOrientation =>
      isStringMember(oButtonGroupOrientations, value),
  },
  attached: {
    type: Boolean,
    default: true,
  },
  ariaLabel: String as PropType<string | undefined>,
} as const

export const oButtonGroupTextProps = {
  tag: {
    type: String as PropType<OButtonGroupTextTag>,
    default: 'span',
    validator: (value: unknown): value is OButtonGroupTextTag =>
      isStringMember(oButtonGroupTextTags, value),
  },
} as const

export type OButtonGroupProps = ExtractPublicPropTypes<typeof oButtonGroupProps>
export type OButtonGroupTextProps = ExtractPublicPropTypes<typeof oButtonGroupTextProps>

export interface OButtonGroupSlots {
  default?: () => VNodeChild
}

export interface OButtonGroupTextSlots {
  default?: () => VNodeChild
}

export interface OButtonGroupContext {
  readonly orientation: ComputedRef<OButtonGroupOrientation>
}

export const oButtonGroupContextKey: InjectionKey<OButtonGroupContext> = Symbol('OButtonGroup')
