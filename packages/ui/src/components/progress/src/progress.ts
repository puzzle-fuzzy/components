import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oProgressStatuses = ['normal', 'success', 'warning', 'error'] as const
export const oProgressSizes = ['sm', 'md'] as const

export type OProgressStatus = (typeof oProgressStatuses)[number]
export type OProgressSize = (typeof oProgressSizes)[number]

const isStringMember = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && (values as readonly string[]).includes(value)

export const normalizeOProgressValue = (value?: number): number | undefined =>
  value === undefined || !Number.isFinite(value) ? undefined : Math.min(100, Math.max(0, value))

export const oProgressProps = {
  value: Number as PropType<number | undefined>,
  status: {
    type: String as PropType<OProgressStatus>,
    default: 'normal',
    validator: (value: unknown): value is OProgressStatus =>
      isStringMember(oProgressStatuses, value),
  },
  size: {
    type: String as PropType<OProgressSize>,
    default: 'md',
    validator: (value: unknown): value is OProgressSize => isStringMember(oProgressSizes, value),
  },
  showLabel: {
    type: Boolean,
    default: false,
  },
  label: String as PropType<string | undefined>,
  ariaLabel: String as PropType<string | undefined>,
} as const

export type OProgressProps = ExtractPublicPropTypes<typeof oProgressProps>

export interface OProgressLabelSlotProps {
  readonly value: number | undefined
  readonly indeterminate: boolean
  readonly status: OProgressStatus
}

export interface OProgressSlots {
  label?: (props: OProgressLabelSlotProps) => VNodeChild
}
