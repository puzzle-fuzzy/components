export const oFieldControlVariants = ['soft', 'outline'] as const

export type OFieldControlVariant = (typeof oFieldControlVariants)[number]

export const isOFieldControlVariant = (value: unknown): value is OFieldControlVariant =>
  typeof value === 'string' && oFieldControlVariants.includes(value as OFieldControlVariant)
