import type { AvatarShape, AvatarSize, AvatarTheme } from './avatar'

export type AvatarFlowPhase = 'idle' | 'requesting' | 'transferring' | 'complete' | 'error'

export interface AvatarFlowPeer {
  id: string | number
  name: string
  src?: string
  initials?: string
}

export interface OAvatarFlowProps {
  sender: AvatarFlowPeer
  receivers: AvatarFlowPeer[]
  phase?: AvatarFlowPhase
  accessibleLabel: string
  maxVisibleReceivers?: number
  size?: AvatarSize
  shape?: AvatarShape
  theme?: AvatarTheme
}
