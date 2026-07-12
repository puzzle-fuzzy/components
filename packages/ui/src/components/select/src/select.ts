import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

import type { OFloatingPlacement } from '../../../composables/use-floating-panel'

export const oSelectSizes = ['sm', 'md', 'lg'] as const
export const oSelectPlacements = [
  'bottom-start',
  'bottom-end',
] as const satisfies readonly OFloatingPlacement[]

export type OSelectValue = string | number
export type OSelectSize = (typeof oSelectSizes)[number]
export type OSelectPlacement = (typeof oSelectPlacements)[number]

export interface OSelectOption {
  readonly value: OSelectValue
  readonly label: string
  readonly disabled?: boolean
}

const isStringMember = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && (values as readonly string[]).includes(value)

export const oSelectProps = {
  modelValue: [String, Number] as PropType<OSelectValue | undefined>,
  options: {
    type: Array as PropType<readonly OSelectOption[]>,
    required: true,
  },
  open: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  placeholder: {
    type: String,
    default: 'Select',
  },
  size: {
    type: String as PropType<OSelectSize>,
    default: 'md',
    validator: (value: unknown): value is OSelectSize => isStringMember(oSelectSizes, value),
  },
  disabled: Boolean,
  teleported: { type: Boolean, default: true },
  teleportTo: {
    type: [String, Object] as PropType<string | HTMLElement>,
    default: 'body',
  },
  clearable: Boolean,
  clearAriaLabel: {
    type: String,
    default: 'Clear selection',
  },
  placement: {
    type: String as PropType<OSelectPlacement>,
    default: 'bottom-start',
    validator: (value: unknown): value is OSelectPlacement =>
      isStringMember(oSelectPlacements, value),
  },
  ariaLabel: String as PropType<string | undefined>,
} as const

export type OSelectProps = ExtractPublicPropTypes<typeof oSelectProps>

export interface OSelectEmits {
  'update:modelValue': [value: OSelectValue | undefined]
  'update:open': [value: boolean]
  change: [value: OSelectValue, option: OSelectOption]
  clear: []
}

export interface OSelectOptionSlotProps {
  option: OSelectOption
  selected: boolean
  active: boolean
}

export interface OSelectSlots {
  option?: (props: OSelectOptionSlotProps) => VNodeChild
  empty?: () => VNodeChild
}
