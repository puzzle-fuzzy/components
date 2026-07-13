import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

import type { ORenderAs, ORenderProps } from '../../../shared/render'

export const oPopoverSides = ['top', 'right', 'bottom', 'left'] as const
export const oPopoverAlignments = ['start', 'center', 'end'] as const
export const oPopoverStickyBehaviors = ['partial', 'always'] as const
export const oPopoverPositionStrategies = ['absolute', 'fixed'] as const

export type OPopoverSide = (typeof oPopoverSides)[number]
export type OPopoverAlign = (typeof oPopoverAlignments)[number]
export type OPopoverSticky = (typeof oPopoverStickyBehaviors)[number]
export type OPopoverPositionStrategy = (typeof oPopoverPositionStrategies)[number]
export type OPopoverCollisionPadding = number | Partial<Record<OPopoverSide, number>>

export interface OPopoverVirtualElement {
  readonly contextElement?: HTMLElement
  getBoundingClientRect: () => DOMRect
  getClientRects?: () => DOMRectList
}

export type OPopoverPointerDownOutsideEvent = CustomEvent<{
  readonly originalEvent: PointerEvent
}>
export type OPopoverFocusOutsideEvent = CustomEvent<{
  readonly originalEvent: FocusEvent
}>
export type OPopoverInteractOutsideEvent =
  OPopoverPointerDownOutsideEvent | OPopoverFocusOutsideEvent

const isAllowedValue = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && values.includes(value as Value)

const oPopoverRenderProps = {
  as: {
    type: [String, Object, Function] as PropType<ORenderAs>,
    default: undefined,
  },
  asChild: Boolean,
} as const satisfies Record<keyof ORenderProps, unknown>

export const oPopoverProps = {
  open: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  defaultOpen: Boolean,
  modal: Boolean,
} as const

export const oPopoverTriggerProps = {
  ...oPopoverRenderProps,
  as: {
    ...oPopoverRenderProps.as,
    default: 'button',
  },
} as const

export const oPopoverAnchorProps = {
  ...oPopoverRenderProps,
  as: {
    ...oPopoverRenderProps.as,
    default: 'div',
  },
  reference: {
    type: Object as PropType<HTMLElement | OPopoverVirtualElement>,
    default: undefined,
  },
} as const

export const oPopoverContentProps = {
  ...oPopoverRenderProps,
  as: {
    ...oPopoverRenderProps.as,
    default: 'div',
  },
  side: {
    type: String as PropType<OPopoverSide>,
    default: 'bottom',
    validator: (value: unknown): value is OPopoverSide => isAllowedValue(oPopoverSides, value),
  },
  align: {
    type: String as PropType<OPopoverAlign>,
    default: 'center',
    validator: (value: unknown): value is OPopoverAlign =>
      isAllowedValue(oPopoverAlignments, value),
  },
  sideOffset: {
    type: Number,
    default: 8,
  },
  alignOffset: {
    type: Number,
    default: 0,
  },
  avoidCollisions: {
    type: Boolean,
    default: true,
  },
  collisionPadding: {
    type: [Number, Object] as PropType<OPopoverCollisionPadding>,
    default: 8,
  },
  sticky: {
    type: String as PropType<OPopoverSticky>,
    default: 'partial',
    validator: (value: unknown): value is OPopoverSticky =>
      isAllowedValue(oPopoverStickyBehaviors, value),
  },
  hideWhenDetached: Boolean,
  positionStrategy: {
    type: String as PropType<OPopoverPositionStrategy>,
    default: 'absolute',
    validator: (value: unknown): value is OPopoverPositionStrategy =>
      isAllowedValue(oPopoverPositionStrategies, value),
  },
  teleported: {
    type: Boolean,
    default: true,
  },
  teleportTo: {
    type: [String, Object] as PropType<string | HTMLElement>,
    default: 'body',
  },
  forceMount: Boolean,
} as const

export type OPopoverProps = ExtractPublicPropTypes<typeof oPopoverProps>
export type OPopoverTriggerProps = ExtractPublicPropTypes<typeof oPopoverTriggerProps>
export type OPopoverAnchorProps = ExtractPublicPropTypes<typeof oPopoverAnchorProps>
export type OPopoverContentProps = ExtractPublicPropTypes<typeof oPopoverContentProps>

export interface OPopoverEmits {
  'update:open': [open: boolean]
}

export interface OPopoverContentEmits {
  escapeKeyDown: [event: KeyboardEvent]
  pointerDownOutside: [event: OPopoverPointerDownOutsideEvent]
  focusOutside: [event: OPopoverFocusOutsideEvent]
  interactOutside: [event: OPopoverInteractOutsideEvent]
  openAutoFocus: [event: Event]
  closeAutoFocus: [event: Event]
}

export interface OPopoverSlotProps {
  readonly open: boolean
  readonly close: () => void
}

export interface OPopoverSlots {
  default?: (props: OPopoverSlotProps) => VNodeChild
}

export interface OPopoverTriggerSlots {
  default?: () => VNodeChild
}

export interface OPopoverAnchorSlots {
  default?: () => VNodeChild
}

export interface OPopoverContentSlots {
  default?: () => VNodeChild
}
