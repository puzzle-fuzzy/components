import type { ExtractPublicPropTypes, InjectionKey, PropType, VNodeChild } from 'vue'

import type { ORenderAs } from '../../../shared/render'

export const oAccordionTypes = ['single', 'multiple'] as const
export const oAccordionOrientations = ['vertical', 'horizontal'] as const
export const oAccordionDirections = ['ltr', 'rtl'] as const

export type OAccordionType = (typeof oAccordionTypes)[number]
export type OAccordionOrientation = (typeof oAccordionOrientations)[number]
export type OAccordionDirection = (typeof oAccordionDirections)[number]
export type OAccordionValue = string | string[] | undefined

const isStringMember = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && values.includes(value as Value)

export const oAccordionProps = {
  type: {
    type: String as PropType<OAccordionType>,
    default: 'single',
    validator: (value: unknown): value is OAccordionType => isStringMember(oAccordionTypes, value),
  },
  modelValue: {
    type: [String, Array] as PropType<OAccordionValue>,
    default: undefined,
  },
  defaultValue: {
    type: [String, Array] as PropType<OAccordionValue>,
    default: undefined,
  },
  collapsible: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  orientation: {
    type: String as PropType<OAccordionOrientation>,
    default: 'vertical',
    validator: (value: unknown): value is OAccordionOrientation =>
      isStringMember(oAccordionOrientations, value),
  },
  dir: {
    type: String as PropType<OAccordionDirection | undefined>,
    default: undefined,
    validator: (value: unknown): value is OAccordionDirection =>
      isStringMember(oAccordionDirections, value),
  },
  unmountOnHide: {
    type: Boolean,
    default: true,
  },
  as: {
    type: [String, Object] as PropType<ORenderAs>,
    default: 'div',
  },
  asChild: {
    type: Boolean,
    default: false,
  },
} as const

export const oAccordionItemProps = {
  value: {
    type: String,
    required: true,
    validator: (value: unknown): value is string => typeof value === 'string' && value.length > 0,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  as: {
    type: [String, Object] as PropType<ORenderAs>,
    default: 'div',
  },
  asChild: {
    type: Boolean,
    default: false,
  },
} as const

export const oAccordionTriggerProps = {
  as: {
    type: [String, Object] as PropType<ORenderAs>,
    default: 'button',
  },
  asChild: {
    type: Boolean,
    default: false,
  },
} as const

export const oAccordionContentProps = {
  forceMount: {
    type: Boolean,
    default: false,
  },
  as: {
    type: [String, Object] as PropType<ORenderAs>,
    default: 'div',
  },
  asChild: {
    type: Boolean,
    default: false,
  },
} as const

export type OAccordionProps = ExtractPublicPropTypes<typeof oAccordionProps>
export type OAccordionItemProps = ExtractPublicPropTypes<typeof oAccordionItemProps>
export type OAccordionTriggerProps = ExtractPublicPropTypes<typeof oAccordionTriggerProps>
export type OAccordionContentProps = ExtractPublicPropTypes<typeof oAccordionContentProps>

export interface OAccordionEmits {
  'update:modelValue': [value: OAccordionValue]
}

export interface OAccordionSlotProps {
  modelValue: OAccordionValue
}

export interface OAccordionSlots {
  default?: (props: OAccordionSlotProps) => VNodeChild
}

export interface OAccordionItemSlotProps {
  open: boolean
}

export interface OAccordionItemSlots {
  default?: (props: OAccordionItemSlotProps) => VNodeChild
}

export interface OAccordionTriggerSlots {
  default?: () => VNodeChild
  icon?: () => VNodeChild
}

export interface OAccordionContentSlots {
  default?: () => VNodeChild
}

export interface OAccordionItemContext {
  contentId: string
}

export const oAccordionItemContextKey: InjectionKey<OAccordionItemContext> =
  Symbol('OAccordionItem')
