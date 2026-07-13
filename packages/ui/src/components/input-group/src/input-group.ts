import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

import { oButtonProps, type OButtonEmits, type OButtonSlots } from '../../button'
import type { OInputEmits, OInputProps, OInputSlots } from '../../input'
import type { OTextareaEmits, OTextareaProps } from '../../textarea'

export const oInputGroupAddonAligns = [
  'inline-start',
  'inline-end',
  'block-start',
  'block-end',
] as const
export const oInputGroupTextTags = ['span', 'div'] as const

export type OInputGroupAddonAlign = (typeof oInputGroupAddonAligns)[number]
export type OInputGroupTextTag = (typeof oInputGroupTextTags)[number]

const isStringMember = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && values.includes(value as Value)

export const oInputGroupProps = {
  invalid: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  ariaLabel: String as PropType<string | undefined>,
} as const

export const oInputGroupAddonProps = {
  align: {
    type: String as PropType<OInputGroupAddonAlign>,
    default: 'inline-start',
    validator: (value: unknown): value is OInputGroupAddonAlign =>
      isStringMember(oInputGroupAddonAligns, value),
  },
} as const

export const oInputGroupTextProps = {
  tag: {
    type: String as PropType<OInputGroupTextTag>,
    default: 'span',
    validator: (value: unknown): value is OInputGroupTextTag =>
      isStringMember(oInputGroupTextTags, value),
  },
} as const

export const oInputGroupButtonProps = {
  ...oButtonProps,
  size: {
    ...oButtonProps.size,
    default: 'sm',
  },
} as const

export type OInputGroupProps = ExtractPublicPropTypes<typeof oInputGroupProps>
export type OInputGroupAddonProps = ExtractPublicPropTypes<typeof oInputGroupAddonProps>
export type OInputGroupTextProps = ExtractPublicPropTypes<typeof oInputGroupTextProps>
export type OInputGroupButtonProps = ExtractPublicPropTypes<typeof oInputGroupButtonProps>
export type OInputGroupInputProps = OInputProps
export type OInputGroupTextareaProps = OTextareaProps
export type OInputGroupInputEmits = OInputEmits
export type OInputGroupTextareaEmits = OTextareaEmits
export type OInputGroupButtonEmits = OButtonEmits

export interface OInputGroupSlots {
  default?: () => VNodeChild
}

export type OInputGroupAddonSlots = OInputGroupSlots
export type OInputGroupTextSlots = OInputGroupSlots
export type OInputGroupInputSlots = OInputSlots
export type OInputGroupButtonSlots = OButtonSlots
