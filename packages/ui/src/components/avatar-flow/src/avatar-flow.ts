import {
  oAvatarShapes,
  oAvatarSizes,
  type OAvatarShape,
  type OAvatarSize,
} from '../../avatar/index'
import type { ExtractPublicPropTypes, PropType } from 'vue'

export const oAvatarFlowStates = ['loading', 'connected', 'transferring'] as const

export type OAvatarFlowState = (typeof oAvatarFlowStates)[number]

export interface OAvatarFlowPeer {
  readonly id: string | number
  readonly name: string
  readonly src?: string
  readonly initials?: string
}

export const oAvatarFlowDefaultMaxVisibleReceivers = 3

export function isOAvatarFlowState(value: unknown): value is OAvatarFlowState {
  return typeof value === 'string' && oAvatarFlowStates.some((state) => state === value)
}

export function normalizeOAvatarFlowMaxVisibleReceivers(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return oAvatarFlowDefaultMaxVisibleReceivers
  }

  return Math.max(1, Math.floor(value))
}

export const oAvatarFlowProps = {
  sender: {
    type: Object as PropType<OAvatarFlowPeer>,
    required: true,
  },
  receivers: {
    type: Array as PropType<readonly OAvatarFlowPeer[]>,
    required: true,
  },
  state: {
    type: String as PropType<OAvatarFlowState>,
    default: 'connected',
    validator: isOAvatarFlowState,
  },
  ariaLabel: {
    type: String,
    required: true,
  },
  maxVisibleReceivers: {
    type: Number,
    default: oAvatarFlowDefaultMaxVisibleReceivers,
  },
  size: {
    type: String as PropType<OAvatarSize>,
    default: 'md',
    validator: (value: unknown): value is OAvatarSize =>
      oAvatarSizes.some((size) => size === value),
  },
  shape: {
    type: String as PropType<OAvatarShape>,
    default: 'circle',
    validator: (value: unknown): value is OAvatarShape =>
      oAvatarShapes.some((shape) => shape === value),
  },
} as const

export type OAvatarFlowProps = ExtractPublicPropTypes<typeof oAvatarFlowProps>
