import type { ExtractPublicPropTypes, PropType } from 'vue'

export type OReferenceTextareaReferenceKind = 'member' | 'image'

export interface OReferenceTextareaReference {
  id: string
  kind: OReferenceTextareaReferenceKind
  label: string
  value: string
}

export const oReferenceTextareaProps = {
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: String,
  rows: {
    type: Number,
    default: 4,
  },
  maxlength: Number as PropType<number | undefined>,
  showCount: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  invalid: Boolean,
  ariaLabel: String,
} as const

export type OReferenceTextareaProps = ExtractPublicPropTypes<typeof oReferenceTextareaProps>

export interface OReferenceTextareaEmits {
  'update:modelValue': [value: string]
  referencesChange: [references: OReferenceTextareaReference[]]
}

const memberPattern = /@\[([^\]]+)\]\(member:([^)]+)\)/gu
const imagePattern = /!\[([^\]]+)\]\(image:([^)]+)\)/gu

export const parseOReferenceTextareaReferences = (value: string): OReferenceTextareaReference[] => {
  const references: OReferenceTextareaReference[] = []

  for (const match of value.matchAll(memberPattern)) {
    const label = match[1] ?? ''
    const member = match[2] ?? ''
    references.push({
      id: `member:${member}`,
      kind: 'member',
      label,
      value: member,
    })
  }

  for (const match of value.matchAll(imagePattern)) {
    const label = match[1] ?? ''
    const image = match[2] ?? ''
    references.push({
      id: `image:${image}`,
      kind: 'image',
      label,
      value: image,
    })
  }

  return references
}
