import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oAvatarSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
export const oAvatarShapes = ['circle', 'rounded', 'square'] as const
export const oAvatarStatuses = ['online', 'away', 'busy', 'offline'] as const

export type OAvatarSize = (typeof oAvatarSizes)[number]
export type OAvatarShape = (typeof oAvatarShapes)[number]
export type OAvatarStatus = (typeof oAvatarStatuses)[number]

const isStringMember = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && (values as readonly string[]).includes(value)

export const oAvatarProps = {
  src: String as PropType<string | undefined>,
  alt: String as PropType<string | undefined>,
  name: String as PropType<string | undefined>,
  initials: String as PropType<string | undefined>,
  size: {
    type: String as PropType<OAvatarSize>,
    default: 'md',
    validator: (value: unknown): value is OAvatarSize => isStringMember(oAvatarSizes, value),
  },
  shape: {
    type: String as PropType<OAvatarShape>,
    default: 'circle',
    validator: (value: unknown): value is OAvatarShape => isStringMember(oAvatarShapes, value),
  },
  status: {
    type: String as PropType<OAvatarStatus | undefined>,
    validator: (value: unknown): value is OAvatarStatus => isStringMember(oAvatarStatuses, value),
  },
  statusLabel: String as PropType<string | undefined>,
} as const

export type OAvatarProps = ExtractPublicPropTypes<typeof oAvatarProps>

export interface OAvatarFallbackSlotProps {
  initials: string
  hasError: boolean
}

export interface OAvatarSlots {
  fallback?: (props: OAvatarFallbackSlotProps) => VNodeChild
}

export interface OAvatarEmits {
  load: [event: Event]
  error: [event: Event]
}

export interface OAvatarInitialsOptions {
  initials?: string | undefined
  name?: string | undefined
}

interface GraphemeSegment {
  segment: string
}

interface GraphemeSegmenter {
  segment: (value: string) => Iterable<GraphemeSegment>
}

interface GraphemeSegmenterConstructor {
  new (
    locales?: string | readonly string[],
    options?: { granularity: 'grapheme' },
  ): GraphemeSegmenter
}

const splitGraphemes = (value: string): string[] => {
  const Segmenter = (Intl as typeof Intl & { Segmenter?: GraphemeSegmenterConstructor }).Segmenter

  if (Segmenter) {
    return Array.from(
      new Segmenter(undefined, { granularity: 'grapheme' }).segment(value),
      ({ segment }) => segment,
    )
  }

  // Array.from keeps complete Unicode code points when Intl.Segmenter is unavailable.
  return Array.from(value)
}

const MAX_INITIALS_GRAPHEMES = 3

const normalizeInitials = (segments: readonly string[]): string =>
  splitGraphemes(segments.join('').toUpperCase()).slice(0, MAX_INITIALS_GRAPHEMES).join('')

export const getOAvatarInitials = ({ initials, name }: OAvatarInitialsOptions): string => {
  const explicitSegments = splitGraphemes(initials?.trim() ?? '').filter(
    (segment) => !/^\s+$/u.test(segment),
  )

  if (explicitSegments.length > 0) {
    return normalizeInitials(explicitSegments)
  }

  const words = name?.trim().split(/\s+/u).filter(Boolean) ?? []
  const derivedSegments = words
    .slice(0, MAX_INITIALS_GRAPHEMES)
    .flatMap((word) => splitGraphemes(word).slice(0, 1))

  return normalizeInitials(derivedSegments)
}
