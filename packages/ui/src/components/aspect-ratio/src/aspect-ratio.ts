import type { ExtractPublicPropTypes, VNodeChild } from 'vue'

export const DEFAULT_O_ASPECT_RATIO = 16 / 9

export const normalizeOAspectRatio = (value: number): number =>
  Number.isFinite(value) && value > 0 ? value : DEFAULT_O_ASPECT_RATIO

export const oAspectRatioProps = {
  ratio: {
    type: Number,
    default: DEFAULT_O_ASPECT_RATIO,
  },
} as const

export type OAspectRatioProps = ExtractPublicPropTypes<typeof oAspectRatioProps>

export interface OAspectRatioSlots {
  default?: () => VNodeChild
}
