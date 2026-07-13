import { describe, expect, it } from 'vitest'

import {
  findOReferenceTextareaMention,
  formatOReferenceTextareaToken,
  insertOReferenceTextareaToken,
  reindexOReferenceTextareaTokens,
} from '../src/reference-token'

describe('OReferenceTextarea image tokens', () => {
  it('formats zero-based media positions as one-based Image tokens', () => {
    expect(formatOReferenceTextareaToken(0)).toBe('[Image 1]')
    expect(formatOReferenceTextareaToken(9)).toBe('[Image 10]')
  })

  it('finds only an active @ query at start or after whitespace', () => {
    expect(findOReferenceTextareaMention('@红衣', 3)).toEqual({
      start: 0,
      end: 3,
      query: '红衣',
    })
    expect(findOReferenceTextareaMention('参考 @2', 5)).toEqual({
      start: 3,
      end: 5,
      query: '2',
    })
    expect(findOReferenceTextareaMention('参考 @红衣以后', 6, 8)).toEqual({
      start: 3,
      end: 8,
      query: '红衣',
    })
  })

  it('does not detect a mention across whitespace or another at sign', () => {
    expect(findOReferenceTextareaMention('前缀@红衣', 5)).toBeUndefined()
    expect(findOReferenceTextareaMention('@红衣 描述', 6)).toBeUndefined()
    expect(findOReferenceTextareaMention('@红衣@女性', 6)).toBeUndefined()
  })

  it('replaces only the active range and preserves surrounding prompt text', () => {
    expect(
      insertOReferenceTextareaToken('比较 @红衣 与背景', { start: 3, end: 6, query: '红衣' }, 1),
    ).toEqual({
      value: '比较 [Image 2] 与背景',
      caret: 3 + '[Image 2]'.length,
    })
  })

  it('inserts no space before direct Chinese continuation', () => {
    expect(
      insertOReferenceTextareaToken(
        '@红衣中身着红色旗袍的女性',
        { start: 0, end: 3, query: '红衣' },
        0,
      ),
    ).toEqual({
      value: '[Image 1]中身着红色旗袍的女性',
      caret: '[Image 1]'.length,
    })
  })

  it('removes exact deleted tokens and decrements every later token', () => {
    expect(
      reindexOReferenceTextareaTokens(
        '[Image 1] 保留 [Image 2] 删除 [Image 3] 变二 [Image 12] 变十一',
        1,
      ),
    ).toBe('[Image 1] 保留  删除 [Image 2] 变二 [Image 11] 变十一')
  })

  it('leaves lower malformed and unrelated text unchanged', () => {
    const value = '[Image 1] [image 2] [Image x] [Image 3 [Photo 4]'

    expect(reindexOReferenceTextareaTokens(value, 1)).toBe(value)
    expect(reindexOReferenceTextareaTokens(value, -1)).toBe(value)
    expect(reindexOReferenceTextareaTokens(value, 1.5)).toBe(value)
  })
})
