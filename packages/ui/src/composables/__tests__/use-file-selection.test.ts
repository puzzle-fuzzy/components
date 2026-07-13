import { computed, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { normalizeFileSelectionMaxCount, useFileSelection } from '../use-file-selection'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useFileSelection', () => {
  it('opens the registered input only while selection is allowed', () => {
    const canSelect = ref(true)
    const click = vi.fn()
    const selection = useFileSelection({
      canSelect: computed(() => canSelect.value),
      multiple: computed(() => true),
      remainingCount: computed(() => Number.POSITIVE_INFINITY),
      onSelect: vi.fn(),
    })

    selection.inputElement.value = { click } as unknown as HTMLInputElement
    selection.chooseFiles()
    canSelect.value = false
    selection.chooseFiles()

    expect(click).toHaveBeenCalledOnce()
  })

  it('limits picker and drop files by multiple and remaining count', () => {
    const multiple = ref(false)
    const remainingCount = ref(3)
    const onSelect = vi.fn()
    const selection = useFileSelection({
      canSelect: computed(() => true),
      multiple: computed(() => multiple.value),
      remainingCount: computed(() => remainingCount.value),
      onSelect,
    })
    const files = [
      new File(['one'], 'one.png', { type: 'image/png' }),
      new File(['two'], 'two.png', { type: 'image/png' }),
      new File(['three'], 'three.png', { type: 'image/png' }),
    ]

    selection.selectFiles(files)
    expect(onSelect).toHaveBeenLastCalledWith([files[0]])

    multiple.value = true
    remainingCount.value = 2
    selection.selectFiles(files)
    expect(onSelect).toHaveBeenLastCalledWith(files.slice(0, 2))
  })

  it('resets the input after every change for same-file reselection', () => {
    const onSelect = vi.fn()
    const selection = useFileSelection({
      canSelect: computed(() => false),
      multiple: computed(() => true),
      remainingCount: computed(() => 2),
      onSelect,
    })
    const input = {
      files: [new File(['one'], 'one.png', { type: 'image/png' })],
      value: 'selected-file',
    } as unknown as HTMLInputElement

    selection.handleInputChange({ target: input } as unknown as Event)

    expect(onSelect).not.toHaveBeenCalled()
    expect(input.value).toBe('')
  })

  it('does not access DOM globals during setup', () => {
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('File', undefined)
    vi.stubGlobal('URL', undefined)

    expect(() =>
      useFileSelection({
        canSelect: computed(() => true),
        multiple: computed(() => true),
        remainingCount: computed(() => 1),
        onSelect: vi.fn(),
      }),
    ).not.toThrow()
  })

  it('normalizes invalid maximum counts to zero instead of unlimited', () => {
    expect(normalizeFileSelectionMaxCount(undefined)).toBeUndefined()
    expect(normalizeFileSelectionMaxCount(Number.POSITIVE_INFINITY)).toBeUndefined()
    expect(normalizeFileSelectionMaxCount(Number.NaN)).toBe(0)
    expect(normalizeFileSelectionMaxCount(Number.NEGATIVE_INFINITY)).toBe(0)
    expect(normalizeFileSelectionMaxCount(-1)).toBe(0)
    expect(normalizeFileSelectionMaxCount(2.9)).toBe(2)
  })
})
