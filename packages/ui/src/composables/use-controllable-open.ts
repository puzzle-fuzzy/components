import { computed, ref, type ComputedRef } from 'vue'

export interface UseControllableOpenOptions {
  readonly open: ComputedRef<boolean | undefined>
  readonly emit: (event: 'update:open', value: boolean) => void
}

export interface UseControllableOpenReturn {
  readonly isOpen: ComputedRef<boolean>
  setOpen: (value: boolean) => void
  toggle: () => void
}

export const useControllableOpen = (
  options: UseControllableOpenOptions,
): UseControllableOpenReturn => {
  const internalOpen = ref(false)
  const isControlled = computed(() => options.open.value !== undefined)
  const isOpen = computed(() => options.open.value ?? internalOpen.value)

  const setOpen = (value: boolean): void => {
    if (!isControlled.value) internalOpen.value = value
    options.emit('update:open', value)
  }

  return {
    isOpen,
    setOpen,
    toggle: () => setOpen(!isOpen.value),
  }
}
