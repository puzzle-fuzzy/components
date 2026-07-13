import type { ExtractPublicPropTypes, InjectionKey, PropType, Ref, VNodeChild } from 'vue'

import type { ORenderAs } from '../../../shared/render'

export const oCollapsibleProps = {
  open: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  defaultOpen: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
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

export const oCollapsibleTriggerProps = {
  as: {
    type: [String, Object] as PropType<ORenderAs>,
    default: 'button',
  },
  asChild: {
    type: Boolean,
    default: false,
  },
} as const

export const oCollapsibleContentProps = {
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

export type OCollapsibleProps = ExtractPublicPropTypes<typeof oCollapsibleProps>
export type OCollapsibleTriggerProps = ExtractPublicPropTypes<typeof oCollapsibleTriggerProps>
export type OCollapsibleContentProps = ExtractPublicPropTypes<typeof oCollapsibleContentProps>

export interface OCollapsibleEmits {
  'update:open': [value: boolean]
}

export interface OCollapsibleSlotProps {
  open: boolean
}

export interface OCollapsibleSlots {
  default?: (props: OCollapsibleSlotProps) => VNodeChild
}

export interface OCollapsibleTriggerSlots {
  default?: () => VNodeChild
}

export interface OCollapsibleContentSlots {
  default?: () => VNodeChild
}

export interface OCollapsibleContext {
  contentId: string
  open: Readonly<Ref<boolean>>
}

export const oCollapsibleContextKey: InjectionKey<OCollapsibleContext> = Symbol('OCollapsible')
