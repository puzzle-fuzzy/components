import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oUploadFileStates = ['queued', 'uploading', 'success', 'error'] as const

export type OUploadFileState = (typeof oUploadFileStates)[number]

export interface OUploadFile {
  id: string
  file: File
  state?: OUploadFileState | undefined
  progress?: number | undefined
}

export interface OUploadFileSlotProps {
  file: OUploadFile
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

export const formatOUploadFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  if (bytes < 1024) return `${String(bytes)} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`
}

export const oUploadProps = {
  files: {
    type: Array as PropType<OUploadFile[]>,
    default: (): OUploadFile[] => [],
  },
  title: {
    type: String,
    default: '点击选择文件',
  },
  description: {
    type: String,
    default: '拖拽文件到这里，或点击选择',
  },
  dragTitle: {
    type: String,
    default: '松开以上传',
  },
  actionText: {
    type: String,
    default: '添加更多文件',
  },
  accept: String as PropType<string | undefined>,
  multiple: Boolean,
  disabled: Boolean,
  maxCount: Number as PropType<number | undefined>,
  empty: Boolean,
  clearable: Boolean,
  ariaLabel: {
    type: String,
    default: 'Select files',
  },
  listLabel: {
    type: String,
    default: 'Selected files',
  },
} as const

export type OUploadProps = ExtractPublicPropTypes<typeof oUploadProps>

export const getOUploadStateLabel = (file: OUploadFile): string => {
  const progress = normalizeOUploadProgress(file.progress)

  if (file.state === 'success') return '已完成'
  if (file.state === 'error') return '上传失败'
  if (file.state === 'uploading') return `${String(Math.round(progress * 100))}%`
  return '等待上传'
}
