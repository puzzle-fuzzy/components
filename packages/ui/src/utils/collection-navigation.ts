export interface NavigableCollectionItem {
  readonly disabled?: boolean
}

export type CollectionNavigationDirection = -1 | 1

export const findFirstEnabledIndex = <Item extends NavigableCollectionItem>(
  items: readonly Item[],
): number => items.findIndex((item) => !item.disabled)

export const findLastEnabledIndex = <Item extends NavigableCollectionItem>(
  items: readonly Item[],
): number => {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (!items[index]?.disabled) return index
  }

  return -1
}

export const findNextEnabledIndex = <Item extends NavigableCollectionItem>(
  items: readonly Item[],
  currentIndex: number,
  direction: CollectionNavigationDirection,
): number => {
  if (items.length === 0) return -1
  if (currentIndex < 0 || currentIndex >= items.length) {
    return direction === 1 ? findFirstEnabledIndex(items) : findLastEnabledIndex(items)
  }

  for (let step = 1; step <= items.length; step += 1) {
    const index = (currentIndex + direction * step + items.length) % items.length
    if (!items[index]?.disabled) return index
  }

  return -1
}
