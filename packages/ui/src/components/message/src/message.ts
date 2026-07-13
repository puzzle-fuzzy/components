import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oMessageStatuses = ['info', 'success', 'warning', 'error'] as const

export type OMessageStatus = (typeof oMessageStatuses)[number]

const isOMessageStatus = (value: unknown): value is OMessageStatus =>
  typeof value === 'string' && oMessageStatuses.some((status) => status === value)

export const normalizeOMessageDuration = (value?: number): number => {
  if (value === undefined || !Number.isFinite(value)) return 3000
  if (value <= 0) return 0
  return Math.max(1, Math.floor(value))
}

export const oMessageProps = {
  message: String,
  status: {
    type: String as PropType<OMessageStatus>,
    default: 'info',
    validator: isOMessageStatus,
  },
  closable: {
    type: Boolean,
    default: false,
  },
  closeAriaLabel: {
    type: String,
    default: 'Close message',
  },
} as const

export type OMessageProps = ExtractPublicPropTypes<typeof oMessageProps>

export interface OMessageEmits {
  close: []
}

export interface OMessageSlots {
  icon?: () => VNodeChild
  default?: () => VNodeChild
}

export interface OMessageOptions {
  readonly message: string
  readonly status?: OMessageStatus
  readonly duration?: number
  readonly closable?: boolean
  readonly closeAriaLabel?: string
  readonly pauseOnHover?: boolean
  readonly appendTo?: string | HTMLElement
  readonly onClose?: () => void
}

export interface OMessageHandle {
  close: () => void
}

export type OMessageHelperInput = string | Omit<OMessageOptions, 'status'>

export interface OMessageService {
  (input: string | OMessageOptions): OMessageHandle
  info: (input: OMessageHelperInput) => OMessageHandle
  success: (input: OMessageHelperInput) => OMessageHandle
  warning: (input: OMessageHelperInput) => OMessageHandle
  error: (input: OMessageHelperInput) => OMessageHandle
  closeAll: () => void
}
