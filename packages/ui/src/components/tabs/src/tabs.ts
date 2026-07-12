import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oTabsVariants = ['slider', 'line'] as const

export type OTabsVariant = (typeof oTabsVariants)[number]

export interface OTabsItem {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean | undefined
}

const isStringMember = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && (values as readonly string[]).includes(value)

export const oTabsProps = {
  modelValue: {
    type: String,
    required: true,
  },
  items: {
    type: Array as PropType<readonly OTabsItem[]>,
    default: (): readonly OTabsItem[] => [],
  },
  variant: {
    type: String as PropType<OTabsVariant>,
    default: 'slider',
    validator: (value: unknown): value is OTabsVariant => isStringMember(oTabsVariants, value),
  },
  ariaLabel: {
    type: String,
    default: 'Tabs',
  },
} as const

export type OTabsProps = ExtractPublicPropTypes<typeof oTabsProps>

export interface OTabsEmits {
  'update:modelValue': [value: string]
  change: [value: string]
}

export interface OTabsPanelSlotProps {
  item: OTabsItem
  selected: boolean
}

export interface OTabsSlots {
  default?: (props: OTabsPanelSlotProps) => VNodeChild
}
