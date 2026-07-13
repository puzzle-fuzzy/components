import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

import { oLabelProps, type OLabelProps, type OLabelSlots } from '../../label'

export const oFieldOrientations = ['vertical', 'horizontal', 'responsive'] as const
export const oFieldLegendVariants = ['legend', 'label'] as const

export type OFieldOrientation = (typeof oFieldOrientations)[number]
export type OFieldLegendVariant = (typeof oFieldLegendVariants)[number]
export type OFieldErrorItem = string | { readonly message?: string } | null | undefined

const isStringMember = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && values.includes(value as Value)

export const oFieldProps = {
  orientation: {
    type: String as PropType<OFieldOrientation>,
    default: 'vertical',
    validator: (value: unknown): value is OFieldOrientation =>
      isStringMember(oFieldOrientations, value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
} as const

export const oFieldLabelProps = oLabelProps

export const oFieldErrorProps = {
  errors: {
    type: Array as PropType<readonly OFieldErrorItem[]>,
    default: () => [],
  },
} as const

export const oFieldSetProps = {
  disabled: {
    type: Boolean,
    default: false,
  },
} as const

export const oFieldLegendProps = {
  variant: {
    type: String as PropType<OFieldLegendVariant>,
    default: 'legend',
    validator: (value: unknown): value is OFieldLegendVariant =>
      isStringMember(oFieldLegendVariants, value),
  },
} as const

export type OFieldProps = ExtractPublicPropTypes<typeof oFieldProps>
export type OFieldLabelProps = OLabelProps
export type OFieldErrorProps = ExtractPublicPropTypes<typeof oFieldErrorProps>
export type OFieldSetProps = ExtractPublicPropTypes<typeof oFieldSetProps>
export type OFieldLegendProps = ExtractPublicPropTypes<typeof oFieldLegendProps>

export interface OFieldSlots {
  default?: () => VNodeChild
}

export type OFieldLabelSlots = OLabelSlots
export type OFieldContentSlots = OFieldSlots
export type OFieldTitleSlots = OFieldSlots
export type OFieldDescriptionSlots = OFieldSlots
export type OFieldErrorSlots = OFieldSlots
export type OFieldGroupSlots = OFieldSlots
export type OFieldSetSlots = OFieldSlots
export type OFieldLegendSlots = OFieldSlots
