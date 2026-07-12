import type { OMessageStatus } from './message'

export type OMessagePauseSource = 'hover' | 'focus'

export interface OMessageHostRecord {
  readonly id: string
  readonly message: string
  readonly status: OMessageStatus
  readonly closable: boolean
  readonly closeAriaLabel: string
}

export interface OMessageHostEmits {
  requestClose: [id: string]
  pause: [id: string, source: OMessagePauseSource]
  resume: [id: string, source: OMessagePauseSource]
  afterLeave: [id: string]
}
