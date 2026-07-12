import {
  oAvatarShapes,
  oAvatarSizes,
  type OAvatarShape,
  type OAvatarSize,
} from '../../avatar/index'
import type { ExtractPublicPropTypes, PropType } from 'vue'

export const oAvatarFlowPhases = [
  'idle',
  'requesting',
  'transferring',
  'complete',
  'error',
] as const

export type OAvatarFlowPhase = (typeof oAvatarFlowPhases)[number]

export interface OAvatarFlowPeer {
  readonly id: string | number
  readonly name: string
  readonly src?: string
  readonly initials?: string
}

export const oAvatarFlowDefaultMaxVisibleReceivers = 3

export function isOAvatarFlowPhase(value: unknown): value is OAvatarFlowPhase {
  return oAvatarFlowPhases.some((phase) => phase === value)
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
  phase: {
    type: String as PropType<OAvatarFlowPhase>,
    default: 'idle',
    validator: isOAvatarFlowPhase,
  },
  accessibleLabel: {
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
