import type { ExtractPublicPropTypes, PropType } from 'vue'

export const oImageFits = ['contain', 'cover', 'fill', 'none', 'scale-down'] as const

export type OImageFit = (typeof oImageFits)[number]

const isStringMember = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && (values as readonly string[]).includes(value)

export const oImageProps = {
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  previewSrc: String as PropType<string | undefined>,
  fit: {
    type: String as PropType<OImageFit>,
    default: 'contain',
    validator: (value: unknown): value is OImageFit => isStringMember(oImageFits, value),
  },
  width: [String, Number] as PropType<string | number | undefined>,
  height: [String, Number] as PropType<string | number | undefined>,
  loading: String as PropType<'eager' | 'lazy' | undefined>,
  preview: {
    type: Boolean,
    default: true,
  },
  previewAriaLabel: {
    type: String,
    default: 'Preview image',
  },
  disabled: Boolean,
} as const

export type OImageProps = ExtractPublicPropTypes<typeof oImageProps>

export interface OImageEmits {
  load: [event: Event]
  error: [event: Event]
  previewOpen: []
  previewClose: []
}
