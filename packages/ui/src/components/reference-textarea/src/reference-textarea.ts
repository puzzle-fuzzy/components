import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

import { oTextareaProps } from '../../textarea'

export type OReferenceTextareaReferenceKind = 'text' | 'image'

export interface OReferenceTextareaReference {
  readonly id: string
  readonly label: string
  readonly kind?: OReferenceTextareaReferenceKind
  readonly thumbnailSrc?: string
}

export const oReferenceTextareaProps = {
  ...oTextareaProps,
  references: {
    type: Array as PropType<readonly OReferenceTextareaReference[]>,
    default: () => [] as readonly OReferenceTextareaReference[],
  },
} as const

export type OReferenceTextareaProps = ExtractPublicPropTypes<typeof oReferenceTextareaProps>

export interface OReferenceTextareaEmits {
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

export interface OReferenceTextareaReferenceSlotProps {
  readonly reference: OReferenceTextareaReference
  readonly index: number
}

export interface OReferenceTextareaSlots {
  readonly reference?: (props: OReferenceTextareaReferenceSlotProps) => VNodeChild
}
