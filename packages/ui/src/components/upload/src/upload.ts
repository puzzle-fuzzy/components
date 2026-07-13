import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

import { normalizeFileSelectionMaxCount } from '../../../composables/use-file-selection'

export const oUploadFileStates = ['queued', 'uploading', 'success', 'error'] as const

export type OUploadFileState = (typeof oUploadFileStates)[number]

export interface OUploadFile {
  readonly id: string
  readonly name: string
  readonly size?: number | undefined
  readonly state?: OUploadFileState | undefined
  readonly progress?: number | undefined
}

export interface OUploadLabels {
  readonly select: string
  readonly description: string
  readonly dragActive: string
  readonly add: string
  readonly clear: string
  readonly list: string
  readonly queued: string
  readonly uploading: (percentage: number | undefined) => string
  readonly success: string
  readonly error: string
  readonly remove: (name: string) => string
  readonly progress: (name: string) => string
}

export type OUploadLabelOverrides = Partial<OUploadLabels>

export const defaultOUploadLabels: Readonly<OUploadLabels> = {
  select: 'Select files',
  description: 'Drag files here, or select from your device',
  dragActive: 'Drop files to select them',
  add: 'Add more files',
  clear: 'Clear',
  list: 'Selected files',
  queued: 'Queued',
  uploading: (percentage) => (percentage === undefined ? 'Uploading' : `${String(percentage)}%`),
  success: 'Complete',
  error: 'Upload failed',
  remove: (name) => `Remove ${name}`,
  progress: (name) => `${name} upload progress`,
}

export const resolveOUploadLabels = (overrides: OUploadLabelOverrides = {}): OUploadLabels => ({
  select: overrides.select ?? defaultOUploadLabels.select,
  description: overrides.description ?? defaultOUploadLabels.description,
  dragActive: overrides.dragActive ?? defaultOUploadLabels.dragActive,
  add: overrides.add ?? defaultOUploadLabels.add,
  clear: overrides.clear ?? defaultOUploadLabels.clear,
  list: overrides.list ?? defaultOUploadLabels.list,
  queued: overrides.queued ?? defaultOUploadLabels.queued,
  uploading: overrides.uploading ?? defaultOUploadLabels.uploading,
  success: overrides.success ?? defaultOUploadLabels.success,
  error: overrides.error ?? defaultOUploadLabels.error,
  remove: overrides.remove ?? defaultOUploadLabels.remove,
  progress: overrides.progress ?? defaultOUploadLabels.progress,
})

export interface OUploadFileSlotProps {
  readonly file: OUploadFile
}

export interface OUploadSlots {
  icon?: () => VNodeChild
  empty?: () => VNodeChild
  file?: (props: OUploadFileSlotProps) => VNodeChild
}

export interface OUploadEmits {
  select: [files: File[]]
  remove: [file: OUploadFile]
  clear: []
  dragChange: [active: boolean]
}

export const normalizeOUploadProgress = (progress: number | undefined): number => {
  if (!Number.isFinite(progress)) return 0
  return Math.min(1, Math.max(0, progress ?? 0))
}

export const resolveOUploadProgress = (file: OUploadFile): number | undefined => {
  const state = file.state ?? 'queued'

  if (state === 'queued') return 0
  if (state === 'success') return 1
  if (!Number.isFinite(file.progress)) return undefined
  return normalizeOUploadProgress(file.progress)
}

export const normalizeOUploadMaxCount = (maxCount: number | undefined): number | undefined => {
  return normalizeFileSelectionMaxCount(maxCount)
}

export const normalizeOUploadListMaxHeight = (
  height: number | string | undefined,
): string | undefined => {
  if (typeof height === 'number') {
    return Number.isFinite(height) && height > 0 ? `${String(Math.floor(height))}px` : undefined
  }

  const value = height?.trim()
  return value ? value : undefined
}

export const formatOUploadFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'

  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'] as const
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  if (unitIndex === 0) return `${String(Math.floor(bytes))} B`

  return `${(bytes / 1024 ** unitIndex).toFixed(1)} ${units[unitIndex]}`
}

export const oUploadProps = {
  files: {
    type: Array as PropType<readonly OUploadFile[]>,
    default: (): readonly OUploadFile[] => [],
  },
  labels: {
    type: Object as PropType<OUploadLabelOverrides>,
    default: (): OUploadLabelOverrides => ({}),
  },
  accept: String as PropType<string | undefined>,
  multiple: Boolean,
  disabled: Boolean,
  maxCount: Number as PropType<number | undefined>,
  listMaxHeight: {
    type: [Number, String] as PropType<number | string>,
    default: 320,
  },
  clearable: Boolean,
} as const

export type OUploadProps = ExtractPublicPropTypes<typeof oUploadProps>

export const getOUploadStateLabel = (
  file: OUploadFile,
  labels: OUploadLabels = defaultOUploadLabels,
): string => {
  const state = file.state ?? 'queued'

  if (state === 'success') return labels.success
  if (state === 'error') return labels.error
  if (state === 'uploading') {
    const progress = resolveOUploadProgress(file)
    return labels.uploading(progress === undefined ? undefined : Math.round(progress * 100))
  }
  return labels.queued
}
