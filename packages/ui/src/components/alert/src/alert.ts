import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oAlertStatuses = ['info', 'success', 'warning', 'error'] as const

export type OAlertStatus = (typeof oAlertStatuses)[number]

const isOAlertStatus = (value: unknown): value is OAlertStatus =>
  typeof value === 'string' && oAlertStatuses.some((status) => status === value)

export const oAlertProps = {
  status: {
    type: String as PropType<OAlertStatus>,
    default: 'info',
    validator: isOAlertStatus,
  },
  title: String,
  description: String,
  closable: {
    type: Boolean,
    default: false,
  },
  showIcon: {
    type: Boolean,
    default: true,
  },
  closeAriaLabel: {
    type: String,
    default: 'Close alert',
  },
} as const

export type OAlertProps = ExtractPublicPropTypes<typeof oAlertProps>

export interface OAlertEmits {
  close: [event: MouseEvent]
}

export interface OAlertSlots {
  icon?: () => VNodeChild
  title?: () => VNodeChild
  default?: () => VNodeChild
  action?: () => VNodeChild
  closeIcon?: () => VNodeChild
}
