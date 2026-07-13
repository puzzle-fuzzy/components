import { ref, type ComputedRef, type Ref } from 'vue'

export const normalizeFileSelectionMaxCount = (value: number | undefined): number | undefined => {
  if (value === undefined || value === Number.POSITIVE_INFINITY) return undefined
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.floor(value))
}

export interface UseFileSelectionOptions {
  readonly canSelect: ComputedRef<boolean>
  readonly multiple: ComputedRef<boolean>
  readonly remainingCount: ComputedRef<number>
  readonly onSelect: (files: File[]) => void
}

export interface UseFileSelectionReturn {
  readonly inputElement: Ref<HTMLInputElement | undefined>
  readonly chooseFiles: () => void
  readonly selectFiles: (files: FileList | readonly File[] | null) => void
  readonly handleInputChange: (event: Event) => void
}

export const useFileSelection = (options: UseFileSelectionOptions): UseFileSelectionReturn => {
  const inputElement = ref<HTMLInputElement>()

  const chooseFiles = (): void => {
    if (!options.canSelect.value) return
    inputElement.value?.click()
  }

  const selectFiles = (files: FileList | readonly File[] | null): void => {
    if (!files || !options.canSelect.value) return

    const requestedLimit = options.multiple.value
      ? options.remainingCount.value
      : Math.min(1, options.remainingCount.value)
    const limit = Number.isFinite(requestedLimit)
      ? Math.max(0, Math.floor(requestedLimit))
      : Number.POSITIVE_INFINITY
    const selected = Array.from(files).slice(0, limit)

    if (selected.length > 0) options.onSelect(selected)
  }

  const handleInputChange = (event: Event): void => {
    const input = event.target as HTMLInputElement
    selectFiles(input.files)
    input.value = ''
  }

  return {
    inputElement,
    chooseFiles,
    selectFiles,
    handleInputChange,
  }
}
