export interface OReferenceTextareaMention {
  readonly start: number
  readonly end: number
  readonly query: string
}

export interface OReferenceTextareaInsertion {
  readonly value: string
  readonly caret: number
}

const clampOffset = (value: number, length: number): number => {
  if (!Number.isFinite(value)) return 0
  return Math.min(length, Math.max(0, Math.floor(value)))
}

export const formatOReferenceTextareaToken = (index: number): string =>
  `[Image ${String(index + 1)}]`

export const findOReferenceTextareaMention = (
  value: string,
  selectionStart: number,
  selectionEnd = selectionStart,
): OReferenceTextareaMention | undefined => {
  const startOffset = clampOffset(selectionStart, value.length)
  const endOffset = Math.max(startOffset, clampOffset(selectionEnd, value.length))
  const prefix = value.slice(0, startOffset)
  const mentionStart = prefix.lastIndexOf('@')

  if (mentionStart < 0) return undefined
  if (mentionStart > 0 && !/\s/u.test(prefix.charAt(mentionStart - 1))) return undefined

  const query = prefix.slice(mentionStart + 1)
  if (/[\s@]/u.test(query)) return undefined

  return {
    start: mentionStart,
    end: endOffset,
    query,
  }
}

export const insertOReferenceTextareaToken = (
  value: string,
  mention: OReferenceTextareaMention,
  mediaIndex: number,
): OReferenceTextareaInsertion => {
  const token = formatOReferenceTextareaToken(mediaIndex)
  const start = clampOffset(mention.start, value.length)
  const end = Math.max(start, clampOffset(mention.end, value.length))

  return {
    value: `${value.slice(0, start)}${token}${value.slice(end)}`,
    caret: start + token.length,
  }
}

export const reindexOReferenceTextareaTokens = (value: string, removedIndex: number): string => {
  if (!Number.isInteger(removedIndex) || removedIndex < 0) return value

  const removedNumber = removedIndex + 1

  return value.replace(/\[Image ([1-9]\d*)\]/gu, (token, rawNumber: string) => {
    const tokenNumber = Number(rawNumber)
    if (!Number.isSafeInteger(tokenNumber)) return token
    if (tokenNumber === removedNumber) return ''
    if (tokenNumber > removedNumber) return `[Image ${String(tokenNumber - 1)}]`
    return token
  })
}
