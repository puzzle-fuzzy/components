import type { Component, ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

import type { OFloatingPlacement } from '../../../composables/use-floating-panel'

export type ODropdownValue = string | number
export type ODropdownTone = 'default' | 'danger'
export const oDropdownPlacements = [
  'bottom-start',
  'bottom-end',
] as const satisfies readonly OFloatingPlacement[]
export type ODropdownPlacement = (typeof oDropdownPlacements)[number]

const isODropdownPlacement = (value: unknown): value is ODropdownPlacement =>
  typeof value === 'string' && oDropdownPlacements.includes(value as ODropdownPlacement)

export interface ODropdownItem {
  readonly value: ODropdownValue
  readonly label: string
  readonly icon?: Component
  readonly disabled?: boolean
  readonly tone?: ODropdownTone
  readonly dividerBefore?: boolean
}

export const oDropdownProps = {
  items: { type: Array as PropType<readonly ODropdownItem[]>, required: true },
  open: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  disabled: Boolean,
  teleported: { type: Boolean, default: true },
  teleportTo: {
    type: [String, Object] as PropType<string | HTMLElement>,
    default: 'body',
  },
  placement: {
    type: String as PropType<ODropdownPlacement>,
    default: 'bottom-start',
    validator: isODropdownPlacement,
  },
  triggerAriaLabel: String as PropType<string | undefined>,
  showIndicator: { type: Boolean, default: true },
} as const

export type ODropdownProps = ExtractPublicPropTypes<typeof oDropdownProps>

export interface ODropdownEmits {
  'update:open': [value: boolean]
  select: [value: ODropdownValue, item: ODropdownItem]
}

export interface ODropdownSlots {
  trigger?: (props: { open: boolean }) => VNodeChild
  item?: (props: { item: ODropdownItem }) => VNodeChild
  empty?: () => VNodeChild
}
