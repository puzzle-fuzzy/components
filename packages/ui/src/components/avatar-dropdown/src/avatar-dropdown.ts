import { oAvatarProps, type OAvatarFallbackSlotProps } from '../../avatar'
import {
  oDropdownProps,
  oDropdownPlacements,
  type ODropdownItem,
  type ODropdownPlacement,
  type ODropdownValue,
} from '../../dropdown'
import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

const isAvatarDropdownPlacement = (value: unknown): value is ODropdownPlacement =>
  typeof value === 'string' && oDropdownPlacements.some((placement) => placement === value)

export const oAvatarDropdownProps = {
  ...oAvatarProps,
  items: {
    type: Array as PropType<readonly ODropdownItem[]>,
    required: true,
  },
  open: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  disabled: Boolean,
  teleported: oDropdownProps.teleported,
  teleportTo: oDropdownProps.teleportTo,
  placement: {
    type: String as PropType<ODropdownPlacement>,
    default: 'bottom-start',
    validator: isAvatarDropdownPlacement,
  },
  ariaLabel: {
    type: String,
    required: true,
  },
  showIndicator: {
    type: Boolean,
    default: true,
  },
} as const

export type OAvatarDropdownProps = ExtractPublicPropTypes<typeof oAvatarDropdownProps>

export interface OAvatarDropdownEmits {
  'update:open': [value: boolean]
  select: [value: ODropdownValue, item: ODropdownItem]
  load: [event: Event]
  error: [event: Event]
}

export interface OAvatarDropdownSlots {
  fallback?: (props: OAvatarFallbackSlotProps) => VNodeChild
  item?: (props: { item: ODropdownItem }) => VNodeChild
  empty?: () => VNodeChild
}
