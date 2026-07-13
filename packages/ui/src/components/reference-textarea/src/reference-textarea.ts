import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

import { oTextareaProps } from '../../textarea'

export interface OReferenceTextareaMedia {
  readonly id: string
  readonly src: string
  readonly previewSrc?: string
  readonly label: string
  readonly alt?: string
}

export interface OReferenceTextareaLabels {
  readonly mediaList: string
  readonly upload: string
  readonly add: string
  readonly remove: (media: OReferenceTextareaMedia, index: number) => string
  readonly mentionList: string
  readonly mentionOption: (media: OReferenceTextareaMedia, index: number, token: string) => string
}

export type OReferenceTextareaLabelOverrides = Partial<OReferenceTextareaLabels>

export const defaultOReferenceTextareaLabels: Readonly<OReferenceTextareaLabels> = {
  mediaList: 'Reference images',
  upload: 'Select reference images',
  add: 'Add reference images',
  remove: (_media, index) => `Remove Image ${String(index + 1)}`,
  mentionList: 'Select a reference image',
  mentionOption: (media, _index, token) => `${token} ${media.label}`,
}

export const resolveOReferenceTextareaLabels = (
  overrides: OReferenceTextareaLabelOverrides = {},
): OReferenceTextareaLabels => ({
  mediaList: overrides.mediaList ?? defaultOReferenceTextareaLabels.mediaList,
  upload: overrides.upload ?? defaultOReferenceTextareaLabels.upload,
  add: overrides.add ?? defaultOReferenceTextareaLabels.add,
  remove: overrides.remove ?? defaultOReferenceTextareaLabels.remove,
  mentionList: overrides.mentionList ?? defaultOReferenceTextareaLabels.mentionList,
  mentionOption: overrides.mentionOption ?? defaultOReferenceTextareaLabels.mentionOption,
})

export const oReferenceTextareaProps = {
  ...oTextareaProps,
  media: {
    type: Array as PropType<readonly OReferenceTextareaMedia[]>,
    default: (): readonly OReferenceTextareaMedia[] => [],
  },
  accept: {
    type: String,
    default: 'image/*',
  },
  multiple: {
    type: Boolean,
    default: true,
  },
  maxCount: Number as PropType<number | undefined>,
  uploadable: {
    type: Boolean,
    default: true,
  },
  removable: {
    type: Boolean,
    default: true,
  },
  teleported: {
    type: Boolean,
    default: true,
  },
  teleportTo: {
    type: [String, Object] as PropType<string | HTMLElement>,
    default: 'body',
  },
  labels: {
    type: Object as PropType<OReferenceTextareaLabelOverrides>,
    default: (): OReferenceTextareaLabelOverrides => ({}),
  },
} as const

export type OReferenceTextareaProps = ExtractPublicPropTypes<typeof oReferenceTextareaProps>

export interface OReferenceTextareaEmits {
  'update:modelValue': [value: string]
  select: [files: File[]]
  remove: [media: OReferenceTextareaMedia, index: number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

export interface OReferenceTextareaMediaSlotProps {
  readonly media: OReferenceTextareaMedia
  readonly index: number
  readonly token: string
}

export interface OReferenceTextareaMentionOptionSlotProps extends OReferenceTextareaMediaSlotProps {
  readonly active: boolean
}

export interface OReferenceTextareaSlots {
  readonly media?: (props: OReferenceTextareaMediaSlotProps) => VNodeChild
  readonly mentionOption?: (props: OReferenceTextareaMentionOptionSlotProps) => VNodeChild
  readonly upload?: () => VNodeChild
}
