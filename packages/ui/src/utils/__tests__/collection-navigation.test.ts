import { describe, expect, it } from 'vitest'
import {
  findFirstEnabledIndex,
  findLastEnabledIndex,
  findNextEnabledIndex,
} from '../collection-navigation'

const items = [{ disabled: true }, {}, { disabled: true }, {}] as const

describe('collection navigation', () => {
  it('finds first and last enabled items', () => {
    expect(findFirstEnabledIndex(items)).toBe(1)
    expect(findLastEnabledIndex(items)).toBe(3)
    expect(findFirstEnabledIndex([{ disabled: true }])).toBe(-1)
    expect(findLastEnabledIndex([])).toBe(-1)
  })

  it('skips disabled items and wraps in both directions', () => {
    expect(findNextEnabledIndex(items, 1, 1)).toBe(3)
    expect(findNextEnabledIndex(items, 3, 1)).toBe(1)
    expect(findNextEnabledIndex(items, 1, -1)).toBe(3)
    expect(findNextEnabledIndex(items, -1, 1)).toBe(1)
    expect(findNextEnabledIndex(items, -1, -1)).toBe(3)
  })

  it('returns minus one when no enabled item exists', () => {
    expect(findNextEnabledIndex([], 0, 1)).toBe(-1)
    expect(findNextEnabledIndex([{ disabled: true }], 0, -1)).toBe(-1)
  })
})
