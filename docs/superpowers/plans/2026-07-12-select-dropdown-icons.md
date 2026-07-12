# Select, Dropdown, Avatar Dropdown, and Icon System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add accessible `OSelect`, `ODropdown`, and `OAvatarDropdown` components, standardize OMG UI icons on `vue-icons-plus/lu`, and replace the Avatar Flow loading bounce with a scale pulse.

**Architecture:** The three public components share an internal controlled-open composable, a Floating UI positioning composable, and pure disabled-aware collection navigation helpers. `ODropdown` owns menu semantics, `OSelect` owns select-only combobox semantics, and `OAvatarDropdown` composes the unchanged `OAvatar` with `ODropdown`; all public entries remain Vue-only and ESM-only.

**Tech Stack:** Vue 3.5 SFCs, TypeScript 6, Less 4, `@floating-ui/dom` 1.8, `vue-icons-plus` 0.1, Vite 8, Vitest 4, Vue Test Utils, VitePress 1, Playwright, pnpm 11, Node 24.

## Global Constraints

- Vue projects are the only supported consumers; the package remains ESM-only.
- Add `@floating-ui/dom` at `^1.8.0` and `vue-icons-plus` at `^0.1.8` as `@puzzle-fuzzy/ui` runtime dependencies.
- Import every built-in icon from `vue-icons-plus/lu`; do not add raw SVG files, another icon package, or a pass-through `OIcon` component.
- Use `O*` component names, `.o-*` classes, and `--omg-*` custom properties.
- Do not add or override any `--vp-c-brand-*` variable.
- Keep `OAvatar` free of menu props and click behavior; expose the composition as `OAvatarDropdown`.
- `OSelect` is single-select and non-editable; search, multiple selection, tags, groups, remote loading, validation, and virtualization are outside scope.
- `ODropdown` is click-triggered and single-level; hover triggers, context menus, and submenus are outside scope.
- Floating DOM work starts only after mount while a trigger and panel exist; SSR setup must not access browser globals.
- Panel and chevron motion lasts no more than 160ms and is disabled under `prefers-reduced-motion: reduce`.
- Preserve the established pnpm/Node/Vite/Vitest UI-library toolchain.

---

## File Structure

### Shared internal files

- Create `packages/ui/src/composables/use-controllable-open.ts`: controlled/uncontrolled open state.
- Create `packages/ui/src/composables/use-floating-panel.ts`: Floating UI positioning, outside-pointer dismissal, and cleanup.
- Create `packages/ui/src/utils/collection-navigation.ts`: first/last/next enabled item helpers.
- Create `packages/ui/src/composables/__tests__/use-controllable-open.test.ts`.
- Create `packages/ui/src/composables/__tests__/use-floating-panel.test.ts`.
- Create `packages/ui/src/utils/__tests__/collection-navigation.test.ts`.

These directories remain outside `src/components`, so the component naming contract continues to validate only public component folders.

### Public component files

- Create the standard five-file component structure under `packages/ui/src/components/dropdown`.
- Create the standard five-file component structure under `packages/ui/src/components/select`.
- Create the standard five-file component structure under `packages/ui/src/components/avatar-dropdown`.
- Modify `packages/ui/src/components/avatar-flow/style/index.less` and its test for scale-only loading dots.

### Package and quality files

- Modify `pnpm-workspace.yaml`, `packages/ui/package.json`, `apps/docs/package.json`, and `pnpm-lock.yaml`.
- Modify `packages/ui/src/index.ts`, `packages/ui/src/styles/index.less`, and `packages/ui/vite.config.ts`.
- Modify `scripts/check-naming.mjs`, `scripts/test-package.mjs`, and `packages/ui/tests/package/package-contract.test.ts`.
- Modify `packages/ui/tests/ssr/ssr.test.ts`.

### Documentation files

- Create `apps/docs/examples/dropdown/Basic.vue`, `apps/docs/examples/select/Basic.vue`, and `apps/docs/examples/avatar-dropdown/Basic.vue`.
- Create `apps/docs/docs/components/dropdown.md`, `apps/docs/docs/components/select.md`, and `apps/docs/docs/components/avatar-dropdown.md`.
- Modify `apps/docs/docs/.vitepress/config.mts`, `apps/docs/tests/e2e/components.spec.ts`, `apps/docs/docs/components/avatar-flow.md`, and `packages/ui/README.md`.

---

### Task 1: Add dependencies and shared interaction primitives

**Files:**

- Modify: `pnpm-workspace.yaml`
- Modify: `packages/ui/package.json`
- Modify: `apps/docs/package.json`
- Modify: `pnpm-lock.yaml`
- Create: `packages/ui/src/utils/collection-navigation.ts`
- Create: `packages/ui/src/utils/__tests__/collection-navigation.test.ts`
- Create: `packages/ui/src/composables/use-controllable-open.ts`
- Create: `packages/ui/src/composables/__tests__/use-controllable-open.test.ts`
- Create: `packages/ui/src/composables/use-floating-panel.ts`
- Create: `packages/ui/src/composables/__tests__/use-floating-panel.test.ts`

**Interfaces:**

- Produces `OFloatingPlacement = 'bottom-start' | 'bottom-end'`.
- Produces `useControllableOpen(options)` returning `isOpen`, `setOpen`, and `toggle`.
- Produces `useFloatingPanel(options)` returning reference/panel refs, setters, computed styles, resolved placement, and `update`.
- Produces `findFirstEnabledIndex`, `findLastEnabledIndex`, and `findNextEnabledIndex` for readonly item arrays with optional `disabled`.

- [ ] **Step 1: Declare and install the exact runtime dependencies**

Add these catalog entries to `pnpm-workspace.yaml`:

```yaml
catalog:
  '@floating-ui/dom': ^1.8.0
  vue-icons-plus: ^0.1.8
```

Add this block before `peerDependencies` in `packages/ui/package.json`:

```json
"dependencies": {
  "@floating-ui/dom": "catalog:",
  "vue-icons-plus": "catalog:"
}
```

Add the icon package to the docs dependencies because examples import icons directly:

```json
"vue-icons-plus": "catalog:"
```

Run `pnpm install`.

Expected: pnpm resolves `@floating-ui/dom@1.8.x` and `vue-icons-plus@0.1.x` and updates `pnpm-lock.yaml` without changing the package manager.

- [ ] **Step 2: Write failing collection-navigation tests**

Create `collection-navigation.test.ts`:

```ts
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
```

Run `pnpm exec vitest run packages/ui/src/utils`.

Expected: FAIL because the utility does not exist.

- [ ] **Step 3: Implement the pure collection-navigation contract**

Create `collection-navigation.ts`:

```ts
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
```

Run `pnpm exec vitest run packages/ui/src/utils`.

Expected: 3 tests pass.

- [ ] **Step 4: Write failing controlled-open tests**

Create a small test host in `use-controllable-open.test.ts` that exposes the composable:

```ts
import { computed, defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { useControllableOpen } from '../use-controllable-open'

const Host = defineComponent({
  props: { open: Boolean, controlled: Boolean },
  emits: ['update:open'],
  setup(props, { emit, expose }) {
    const api = useControllableOpen({
      open: computed(() => (props.controlled ? props.open : undefined)),
      emit: (event, value) => emit(event, value),
    })
    expose(api)
    return () => h('span', { 'data-open': String(api.isOpen.value) })
  },
})

describe('useControllableOpen', () => {
  it('updates internal state and emits in uncontrolled mode', () => {
    const wrapper = mount(Host)
    ;(wrapper.vm as unknown as { toggle: () => void }).toggle()
    expect(wrapper.attributes('data-open')).toBe('true')
    expect(wrapper.emitted('update:open')).toEqual([[true]])
  })

  it('emits without mutating a controlled value', () => {
    const wrapper = mount(Host, { props: { controlled: true, open: false } })
    ;(wrapper.vm as unknown as { setOpen: (value: boolean) => void }).setOpen(true)
    expect(wrapper.attributes('data-open')).toBe('false')
    expect(wrapper.emitted('update:open')).toEqual([[true]])
  })
})
```

Run `pnpm exec vitest run packages/ui/src/composables/__tests__/use-controllable-open.test.ts`.

Expected: FAIL because the composable does not exist.

- [ ] **Step 5: Implement controlled and uncontrolled open state**

Create `use-controllable-open.ts`:

```ts
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
```

Run the focused composable test again.

Expected: both controlled and uncontrolled tests pass.

- [ ] **Step 6: Write failing Floating UI lifecycle tests**

In `use-floating-panel.test.ts`, mock the official library and verify middleware plus cleanup:

```ts
import { computed, defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const stopAutoUpdate = vi.fn()
  return {
    stopAutoUpdate,
    autoUpdate: vi.fn((_reference, _floating, update: () => void) => {
      update()
      return stopAutoUpdate
    }),
    computePosition: vi.fn(async () => ({ x: 12, y: 24, placement: 'bottom-end' })),
    flip: vi.fn((options?: unknown) => ({ name: 'flip', options })),
    offset: vi.fn((options?: unknown) => ({ name: 'offset', options })),
    shift: vi.fn((options?: unknown) => ({ name: 'shift', options })),
    size: vi.fn((options?: unknown) => ({ name: 'size', options })),
  }
})

vi.mock('@floating-ui/dom', () => ({
  autoUpdate: mocks.autoUpdate,
  computePosition: mocks.computePosition,
  flip: mocks.flip,
  offset: mocks.offset,
  shift: mocks.shift,
  size: mocks.size,
}))

import { useFloatingPanel } from '../use-floating-panel'

afterEach(() => vi.clearAllMocks())

const Host = defineComponent({
  setup() {
    const open = ref(false)
    const dismissed = ref(0)
    const floating = useFloatingPanel({
      isOpen: computed(() => open.value),
      placement: computed(() => 'bottom-start' as const),
      matchReferenceWidth: true,
      onDismiss: () => (dismissed.value += 1),
    })
    return {
      dismissed,
      floating,
      open,
      setHostOpen: (value: boolean) => (open.value = value),
    }
  },
  render() {
    return h('div', [
      h('button', { ref: this.floating.setReferenceElement }, 'trigger'),
      this.open ? h('div', { ref: this.floating.setFloatingElement }, 'panel') : null,
    ])
  },
})

describe('useFloatingPanel', () => {
  it('starts only while open and cleans up when closed', async () => {
    const wrapper = mount(Host)
    expect(mocks.autoUpdate).not.toHaveBeenCalled()
    wrapper.vm.setHostOpen(true)
    await wrapper.vm.$nextTick()
    expect(mocks.autoUpdate).toHaveBeenCalledTimes(1)
    expect(mocks.computePosition).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.any(HTMLElement),
      expect.objectContaining({ placement: 'bottom-start', strategy: 'fixed' }),
    )
    expect(mocks.offset).toHaveBeenCalledWith(6)
    expect(mocks.flip).toHaveBeenCalledWith({ padding: 8 })
    expect(mocks.shift).toHaveBeenCalledWith({ padding: 8 })
    expect(mocks.size).toHaveBeenCalledWith(expect.objectContaining({ padding: 8 }))
    wrapper.vm.setHostOpen(false)
    await wrapper.vm.$nextTick()
    expect(mocks.stopAutoUpdate).toHaveBeenCalledTimes(1)
  })

  it('dismisses only when pointerdown is outside both elements', async () => {
    const wrapper = mount(Host)
    wrapper.vm.setHostOpen(true)
    await wrapper.vm.$nextTick()
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    expect(wrapper.vm.dismissed).toBe(1)
  })
})
```

Run `pnpm exec vitest run packages/ui/src/composables/__tests__/use-floating-panel.test.ts`.

Expected: FAIL because the positioning composable does not exist.

- [ ] **Step 7: Implement SSR-safe Floating UI positioning and dismissal**

Create `use-floating-panel.ts` with this public internal contract and lifecycle:

```ts
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
  type Placement,
} from '@floating-ui/dom'
import { computed, shallowRef, watch, type ComputedRef, type CSSProperties } from 'vue'

export type OFloatingPlacement = 'bottom-start' | 'bottom-end'

export interface UseFloatingPanelOptions {
  readonly isOpen: ComputedRef<boolean>
  readonly placement: ComputedRef<OFloatingPlacement>
  readonly matchReferenceWidth?: boolean
  readonly onDismiss: () => void
}

export const useFloatingPanel = (options: UseFloatingPanelOptions) => {
  const referenceElement = shallowRef<HTMLElement | null>(null)
  const floatingElement = shallowRef<HTMLElement | null>(null)
  const x = shallowRef(0)
  const y = shallowRef(0)
  const ready = shallowRef(false)
  const resolvedPlacement = shallowRef<Placement>(options.placement.value)

  const update = async (): Promise<void> => {
    const reference = referenceElement.value
    const floating = floatingElement.value
    if (!reference || !floating) return

    const result = await computePosition(reference, floating, {
      placement: options.placement.value,
      strategy: 'fixed',
      middleware: [
        offset(6),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        size({
          padding: 8,
          apply({ availableHeight, elements, rects }) {
            elements.floating.style.maxHeight = `${Math.max(0, availableHeight)}px`
            elements.floating.style.minWidth = options.matchReferenceWidth
              ? `${rects.reference.width}px`
              : ''
          },
        }),
      ],
    })

    x.value = result.x
    y.value = result.y
    resolvedPlacement.value = result.placement
    ready.value = true
  }

  watch(
    [options.isOpen, referenceElement, floatingElement, options.placement],
    ([open, reference, floating], _previous, onCleanup) => {
      ready.value = false
      if (!open || !reference || !floating) return

      const stop = autoUpdate(reference, floating, () => void update())
      const onPointerDown = (event: PointerEvent): void => {
        const target = event.target
        if (!(target instanceof Node)) return
        if (!reference.contains(target) && !floating.contains(target)) options.onDismiss()
      }
      document.addEventListener('pointerdown', onPointerDown, true)
      onCleanup(() => {
        stop()
        document.removeEventListener('pointerdown', onPointerDown, true)
      })
    },
    { flush: 'post' },
  )

  const floatingStyle = computed<CSSProperties>(() => ({
    position: 'fixed',
    left: `${x.value}px`,
    top: `${y.value}px`,
    visibility: ready.value ? undefined : 'hidden',
  }))

  return {
    referenceElement,
    floatingElement,
    floatingStyle,
    resolvedPlacement,
    setReferenceElement: (element: HTMLElement | null) => (referenceElement.value = element),
    setFloatingElement: (element: HTMLElement | null) => (floatingElement.value = element),
    update,
  }
}
```

Run:

```bash
pnpm exec vitest run packages/ui/src/utils packages/ui/src/composables
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: all shared primitive tests and typecheck pass. If the test environment has no `PointerEvent`, construct `new MouseEvent('pointerdown')`; production code remains typed for `PointerEvent`.

- [ ] **Step 8: Commit the shared foundation**

```bash
git add pnpm-workspace.yaml packages/ui/package.json apps/docs/package.json pnpm-lock.yaml packages/ui/src/composables packages/ui/src/utils
git commit -m "feat: add shared floating interaction foundation"
```

---

### Task 2: Implement ODropdown

**Files:**

- Create: `packages/ui/src/components/dropdown/src/dropdown.ts`
- Create: `packages/ui/src/components/dropdown/src/ODropdown.vue`
- Create: `packages/ui/src/components/dropdown/style/index.less`
- Create: `packages/ui/src/components/dropdown/__tests__/dropdown.test.ts`
- Create: `packages/ui/src/components/dropdown/index.ts`

**Interfaces:**

- Consumes `useControllableOpen`, `useFloatingPanel`, collection navigation, and `LuChevronDown`.
- Produces `ODropdown`, `ODropdownItem`, `ODropdownValue`, `ODropdownTone`, `ODropdownPlacement`, props, emits, and slots.
- Trigger slot content is always wrapped by the component's native button; callers pass non-interactive content.

- [ ] **Step 1: Write the public type model and failing behavior tests**

Create `dropdown.ts`:

```ts
import type { Component, ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'
import type { OFloatingPlacement } from '../../../composables/use-floating-panel'

export type ODropdownValue = string | number
export type ODropdownTone = 'default' | 'danger'
export type ODropdownPlacement = OFloatingPlacement

export interface ODropdownItem {
  readonly value: ODropdownValue
  readonly label: string
  readonly icon?: Component
  readonly disabled?: boolean
  readonly tone?: ODropdownTone
  readonly dividerBefore?: boolean
}

export const oDropdownProps = {
  items: { type: Array as PropType<readonly ODropdownItem[]>, required: true },
  open: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  disabled: Boolean,
  placement: {
    type: String as PropType<ODropdownPlacement>,
    default: 'bottom-start',
  },
  triggerAriaLabel: String as PropType<string | undefined>,
  showIndicator: { type: Boolean, default: true },
} as const

export type ODropdownProps = ExtractPublicPropTypes<typeof oDropdownProps>

export interface ODropdownEmits {
  'update:open': [value: boolean]
  select: [value: ODropdownValue, item: ODropdownItem]
}

export interface ODropdownSlots {
  trigger?: (props: { open: boolean }) => VNodeChild
  item?: (props: { item: ODropdownItem }) => VNodeChild
  empty?: () => VNodeChild
}
```

Write tests that mount three items (`Profile`, disabled `Billing`, danger `Sign out`) and assert:

```ts
expect(wrapper.get('.o-dropdown__trigger').attributes()).toMatchObject({
  'aria-haspopup': 'menu',
  'aria-expanded': 'false',
})
await wrapper.get('.o-dropdown__trigger').trigger('click')
expect(document.body.querySelector('[role="menu"]')).not.toBeNull()
expect(document.body.querySelectorAll('[role="menuitem"]')).toHaveLength(3)
```

Add exact cases for `ArrowDown`, `ArrowUp`, `Home`, `End`, `Enter`, Space, `Escape`, Tab, outside `pointerdown`, disabled items, `dividerBefore`, danger class, empty slot, controlled `open`, selection payload, focus return, trigger slot props, item slot, indicator visibility, and icon rendering.

Run `pnpm exec vitest run packages/ui/src/components/dropdown`.

Expected: FAIL because the SFC and entry do not exist.

- [ ] **Step 2: Implement menu state, focus, and Floating UI composition**

Create `ODropdown.vue` using this state machine:

```ts
const props = defineProps(oDropdownProps)
const emit = defineEmits<ODropdownEmits>()
defineSlots<ODropdownSlots>()

const triggerElement = shallowRef<HTMLButtonElement | null>(null)
const itemElements = shallowRef<(HTMLButtonElement | null)[]>([])
const activeIndex = ref(-1)
const menuId = `o-dropdown-${useId()}`
const { isOpen, setOpen, toggle } = useControllableOpen({
  open: computed(() => props.open),
  emit: (event, value) => emit(event, value),
})
const floating = useFloatingPanel({
  isOpen,
  placement: computed(() => props.placement),
  onDismiss: () => setOpen(false),
})

const setTriggerElement = (element: Element | null): void => {
  const trigger = element as HTMLButtonElement | null
  triggerElement.value = trigger
  floating.setReferenceElement(trigger)
}

const setItemElement = (element: Element | null, index: number): void => {
  itemElements.value[index] = element as HTMLButtonElement | null
}

const focusItem = async (index: number): Promise<void> => {
  activeIndex.value = index
  await nextTick()
  itemElements.value[index]?.focus()
}

const openFromKeyboard = async (direction: -1 | 1): Promise<void> => {
  if (props.disabled) return
  setOpen(true)
  const index =
    direction === 1 ? findFirstEnabledIndex(props.items) : findLastEnabledIndex(props.items)
  if (index >= 0) await focusItem(index)
}

const close = async (restoreFocus: boolean): Promise<void> => {
  setOpen(false)
  activeIndex.value = -1
  if (restoreFocus) {
    await nextTick()
    triggerElement.value?.focus()
  }
}

const selectItem = async (item: ODropdownItem): Promise<void> => {
  if (item.disabled) return
  emit('select', item.value, item)
  await close(true)
}
```

Implement trigger key handling for ArrowDown, ArrowUp, Escape, and Tab, and panel key handling for ArrowDown, ArrowUp, Home, End, Enter, Space, Escape, and Tab with the shared navigation helpers. Prevent default for menu navigation and selection keys; do not prevent Tab. Reset item refs before each render and ignore disabled selections.

- [ ] **Step 3: Implement the semantic teleported template**

Use this DOM contract:

```vue
<div class="o-dropdown" :data-open="isOpen || undefined">
  <button
    :ref="setTriggerElement"
    class="o-dropdown__trigger"
    type="button"
    :disabled="props.disabled"
    aria-haspopup="menu"
    :aria-expanded="String(isOpen)"
    :aria-controls="isOpen ? menuId : undefined"
    :aria-label="props.triggerAriaLabel"
    @click="toggle"
    @keydown="handleTriggerKeydown"
  >
    <span class="o-dropdown__trigger-content"><slot name="trigger" :open="isOpen" /></span>
    <LuChevronDown
      v-if="props.showIndicator"
      class="o-dropdown__indicator"
      aria-hidden="true"
    />
  </button>

  <Teleport to="body">
    <Transition name="o-dropdown-panel">
      <div
        v-if="isOpen"
        :id="menuId"
        :ref="floating.setFloatingElement"
        class="o-dropdown__panel"
        :style="floating.floatingStyle.value"
        role="menu"
        @keydown="handleMenuKeydown"
      >
        <button
          v-for="(item, index) in props.items"
          :key="item.value"
          :ref="(element) => setItemElement(element as Element | null, index)"
          class="o-dropdown__item"
          :class="[`o-dropdown__item--${item.tone ?? 'default'}`, { 'o-dropdown__item--divided': item.dividerBefore }]"
          type="button"
          role="menuitem"
          :disabled="item.disabled"
          :tabindex="activeIndex === index ? 0 : -1"
          @click="selectItem(item)"
        >
          <component :is="item.icon" v-if="item.icon" class="o-dropdown__item-icon" aria-hidden="true" />
          <span class="o-dropdown__item-label"><slot name="item" :item="item">{{ item.label }}</slot></span>
        </button>
        <div v-if="props.items.length === 0" class="o-dropdown__empty"><slot name="empty" /></div>
      </div>
    </Transition>
  </Teleport>
</div>
```

Keep the rendered classes and ARIA contract exact.

- [ ] **Step 4: Add tokenized menu and motion styles**

Create `dropdown/style/index.less` with:

```less
.o-dropdown {
  display: inline-flex;
}

.o-dropdown__trigger {
  display: inline-flex;
  min-block-size: var(--omg-control-height-md);
  align-items: center;
  gap: var(--omg-space-1);
  padding: 0 var(--omg-space-3);
  border: 1px solid var(--omg-color-border);
  border-radius: var(--omg-radius-md);
  background: var(--omg-color-surface);
  color: var(--omg-color-text);
  cursor: pointer;
}

.o-dropdown__trigger:focus-visible {
  border-color: var(--omg-color-focus-ring);
  outline: 2px solid var(--omg-color-focus-ring);
  outline-offset: 2px;
}

.o-dropdown__indicator {
  inline-size: 1em;
  block-size: 1em;
  transition: transform var(--omg-duration-fast) var(--omg-easing-standard);
}
.o-dropdown[data-open] .o-dropdown__indicator {
  transform: rotate(180deg);
}

.o-dropdown__panel {
  z-index: 1000;
  min-inline-size: 160px;
  overflow: auto;
  padding: var(--omg-space-1);
  border: 1px solid var(--omg-color-border);
  border-radius: var(--omg-radius-md);
  background: var(--omg-color-surface);
  box-shadow: var(--omg-shadow-sm);
  color: var(--omg-color-text);
  transform-origin: top;
}

.o-dropdown__item {
  display: flex;
  min-block-size: 36px;
  inline-size: 100%;
  align-items: center;
  gap: var(--omg-space-2);
  padding: 0 var(--omg-space-2);
  border: 0;
  border-radius: var(--omg-radius-sm);
  background: transparent;
  color: inherit;
  text-align: start;
}

.o-dropdown__item:hover:not(:disabled),
.o-dropdown__item:focus-visible {
  background: var(--omg-color-neutral-soft);
  outline: none;
}
.o-dropdown__item--danger {
  color: var(--omg-color-danger);
}
.o-dropdown__item--divided {
  margin-block-start: var(--omg-space-1);
  border-block-start: 1px solid var(--omg-color-border-subtle);
  border-radius: 0 0 var(--omg-radius-sm) var(--omg-radius-sm);
}
.o-dropdown__item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.o-dropdown-panel-enter-active,
.o-dropdown-panel-leave-active {
  transition:
    opacity var(--omg-duration-fast) var(--omg-easing-standard),
    transform var(--omg-duration-fast) var(--omg-easing-standard);
}
.o-dropdown-panel-enter-from,
.o-dropdown-panel-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .o-dropdown__indicator,
  .o-dropdown-panel-enter-active,
  .o-dropdown-panel-leave-active {
    transition: none;
  }
}
```

Add disabled trigger and empty styles using only OMG tokens; keep icon color as `currentcolor`.

- [ ] **Step 5: Add the explicit entry and pass focused checks**

Create `dropdown/index.ts`:

```ts
export { default as ODropdown } from './src/ODropdown.vue'
export { oDropdownProps } from './src/dropdown'
export type {
  ODropdownEmits,
  ODropdownItem,
  ODropdownPlacement,
  ODropdownProps,
  ODropdownSlots,
  ODropdownTone,
  ODropdownValue,
} from './src/dropdown'
```

Run:

```bash
pnpm exec vitest run packages/ui/src/components/dropdown
pnpm --filter @puzzle-fuzzy/ui typecheck
pnpm exec stylelint "packages/ui/src/components/dropdown/**/*.{vue,less}"
```

Expected: all Dropdown tests, typecheck, and Stylelint pass.

- [ ] **Step 6: Commit ODropdown**

```bash
git add packages/ui/src/components/dropdown
git commit -m "feat: add accessible dropdown menu"
```

---

### Task 3: Implement OSelect

**Files:**

- Create: `packages/ui/src/components/select/src/select.ts`
- Create: `packages/ui/src/components/select/src/OSelect.vue`
- Create: `packages/ui/src/components/select/style/index.less`
- Create: `packages/ui/src/components/select/__tests__/select.test.ts`
- Create: `packages/ui/src/components/select/index.ts`

**Interfaces:**

- Consumes the shared open/floating/navigation primitives and `LuCheck`, `LuChevronDown`, and `LuX`.
- Produces `OSelect`, `OSelectValue`, `OSelectOption`, `OSelectSize`, `OSelectPlacement`, props, emits, and slots.
- Keeps DOM focus on the combobox trigger and exposes the active option through `aria-activedescendant`.

- [ ] **Step 1: Define the public Select model**

Create `select.ts`:

```ts
import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'
import type { OFloatingPlacement } from '../../../composables/use-floating-panel'

export type OSelectValue = string | number
export type OSelectSize = 'sm' | 'md' | 'lg'
export type OSelectPlacement = OFloatingPlacement

export interface OSelectOption {
  readonly value: OSelectValue
  readonly label: string
  readonly disabled?: boolean
}

export const oSelectProps = {
  modelValue: [String, Number] as PropType<OSelectValue | undefined>,
  options: { type: Array as PropType<readonly OSelectOption[]>, required: true },
  open: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  placeholder: { type: String, default: 'Select' },
  size: { type: String as PropType<OSelectSize>, default: 'md' },
  disabled: Boolean,
  clearable: Boolean,
  clearAriaLabel: { type: String, default: 'Clear selection' },
  placement: { type: String as PropType<OSelectPlacement>, default: 'bottom-start' },
  ariaLabel: String as PropType<string | undefined>,
} as const

export type OSelectProps = ExtractPublicPropTypes<typeof oSelectProps>

export interface OSelectEmits {
  'update:modelValue': [value: OSelectValue | undefined]
  'update:open': [value: boolean]
  change: [value: OSelectValue, option: OSelectOption]
  clear: []
}

export interface OSelectSlots {
  option?: (props: { option: OSelectOption; selected: boolean; active: boolean }) => VNodeChild
  empty?: () => VNodeChild
}
```

Add validators for `size` and `placement` from exported readonly arrays so invalid runtime values warn consistently with existing components.

- [ ] **Step 2: Write failing combobox behavior tests**

Use options `Alpha`, disabled `Beta`, and numeric-valued `Gamma`. Assert the initial trigger exactly:

```ts
const trigger = wrapper.get('[role="combobox"]')
expect(trigger.attributes('aria-haspopup')).toBe('listbox')
expect(trigger.attributes('aria-expanded')).toBe('false')
expect(trigger.text()).toContain('Select')
```

Add exact tests for:

- string and number model values and selected label;
- `ArrowDown`/`ArrowUp` opening and wrapping while skipping disabled options;
- `Home`/`End`, Enter, Space, Escape, and Tab;
- trigger focus staying on the combobox while `aria-activedescendant` changes;
- `role="listbox"`, option IDs, `role="option"`, `aria-selected`, and `aria-disabled`;
- click selection emitting `update:modelValue`, `change`, and `update:open`;
- clear button emitting `update:modelValue: undefined` and `clear` without opening;
- clear and trigger being sibling buttons;
- empty slot and default empty panel;
- disabled component behavior;
- controlled open behavior;
- outside-pointer dismissal;
- option slot props;
- all three icons resolving from mocked `vue-icons-plus/lu` exports.

Run `pnpm exec vitest run packages/ui/src/components/select`.

Expected: FAIL because OSelect is not implemented.

- [ ] **Step 3: Implement select state and keyboard navigation**

In `OSelect.vue`, use these computed values and actions:

```ts
const selectedIndex = computed(() =>
  props.options.findIndex((option) => Object.is(option.value, props.modelValue)),
)
const selectedOption = computed(() => props.options[selectedIndex.value])
const activeIndex = ref(-1)
const activeOptionId = computed(() =>
  isOpen.value && activeIndex.value >= 0 ? `${listboxId}-option-${activeIndex.value}` : undefined,
)

const setTriggerElement = (element: Element | null): void => {
  const trigger = element as HTMLButtonElement | null
  triggerElement.value = trigger
  floating.setReferenceElement(trigger)
}

const openAt = (index: number): void => {
  if (props.disabled) return
  activeIndex.value = index
  setOpen(true)
}

const selectOption = (option: OSelectOption): void => {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  emit('change', option.value, option)
  setOpen(false)
  triggerElement.value?.focus()
}

const clear = (event: MouseEvent): void => {
  event.stopPropagation()
  emit('update:modelValue', undefined)
  emit('clear')
  triggerElement.value?.focus()
}
```

For keydown:

```ts
switch (event.key) {
  case 'ArrowDown':
  case 'ArrowUp': {
    event.preventDefault()
    const direction = event.key === 'ArrowDown' ? 1 : -1
    const next = isOpen.value
      ? findNextEnabledIndex(props.options, activeIndex.value, direction)
      : direction === 1
        ? findFirstEnabledIndex(props.options)
        : findLastEnabledIndex(props.options)
    openAt(next)
    break
  }
  case 'Home':
  case 'End':
    if (isOpen.value) {
      event.preventDefault()
      activeIndex.value =
        event.key === 'Home'
          ? findFirstEnabledIndex(props.options)
          : findLastEnabledIndex(props.options)
    }
    break
  case 'Enter':
  case ' ':
    event.preventDefault()
    if (isOpen.value && activeIndex.value >= 0) {
      const option = props.options[activeIndex.value]
      if (option) selectOption(option)
    } else {
      openAt(
        selectedIndex.value >= 0 && !selectedOption.value?.disabled
          ? selectedIndex.value
          : findFirstEnabledIndex(props.options),
      )
    }
    break
  case 'Escape':
    if (isOpen.value) {
      event.preventDefault()
      setOpen(false)
    }
    break
  case 'Tab':
    if (isOpen.value) setOpen(false)
}
```

When `open` changes externally to true, initialize the active index to the enabled selected option or the first enabled option. Do not move DOM focus into the listbox.

- [ ] **Step 4: Implement sibling clear/trigger DOM and teleported listbox**

The control must render this hierarchy:

```vue
<div class="o-select" :class="`o-select--${props.size}`" :data-open="isOpen || undefined">
  <div class="o-select__control">
    <button
      :id="comboboxId"
      :ref="setTriggerElement"
      class="o-select__trigger"
      type="button"
      role="combobox"
      :disabled="props.disabled"
      aria-haspopup="listbox"
      :aria-label="props.ariaLabel"
      :aria-expanded="String(isOpen)"
      :aria-controls="isOpen ? listboxId : undefined"
      :aria-activedescendant="activeOptionId"
      @click="handleTriggerClick"
      @keydown="handleKeydown"
    >
      <span class="o-select__value" :class="{ 'o-select__value--placeholder': !selectedOption }">
        {{ selectedOption?.label ?? props.placeholder }}
      </span>
      <LuChevronDown class="o-select__indicator" aria-hidden="true" />
    </button>
    <button
      v-if="props.clearable && selectedOption && !props.disabled"
      class="o-select__clear"
      type="button"
      :aria-label="props.clearAriaLabel"
      @click="clear"
    >
      <LuX aria-hidden="true" />
    </button>
  </div>

  <Teleport to="body">
    <Transition name="o-select-panel">
      <div
        v-if="isOpen"
        :id="listboxId"
        :ref="floating.setFloatingElement"
        class="o-select__panel"
        :style="floating.floatingStyle.value"
        role="listbox"
      >
        <div
          v-for="(option, index) in props.options"
          :id="`${listboxId}-option-${index}`"
          :key="option.value"
          class="o-select__option"
          :class="{ 'is-active': activeIndex === index, 'is-selected': selectedIndex === index, 'is-disabled': option.disabled }"
          role="option"
          :aria-selected="String(selectedIndex === index)"
          :aria-disabled="option.disabled || undefined"
          @pointerdown.prevent
          @click="selectOption(option)"
        >
          <span><slot name="option" :option="option" :selected="selectedIndex === index" :active="activeIndex === index">{{ option.label }}</slot></span>
          <LuCheck v-if="selectedIndex === index" class="o-select__check" aria-hidden="true" />
        </div>
        <div v-if="props.options.length === 0" class="o-select__empty"><slot name="empty" /></div>
      </div>
    </Transition>
  </Teleport>
</div>
```

Pass `matchReferenceWidth: true` to `useFloatingPanel`; the `setTriggerElement` callback above keeps the focus ref and Floating UI reference synchronized.

- [ ] **Step 5: Add Select styles and reduced motion**

Use size tokens:

```less
.o-select {
  --omg-select-height: var(--omg-control-height-md);
  position: relative;
  display: inline-flex;
  min-inline-size: 180px;
}
.o-select--sm {
  --omg-select-height: var(--omg-control-height-sm);
}
.o-select--lg {
  --omg-select-height: var(--omg-control-height-lg);
}
.o-select__control {
  position: relative;
  inline-size: 100%;
}
.o-select__trigger {
  display: flex;
  block-size: var(--omg-select-height);
  inline-size: 100%;
  align-items: center;
  justify-content: space-between;
  gap: var(--omg-space-2);
  padding: 0 var(--omg-space-3);
  border: 1px solid var(--omg-color-border);
  border-radius: var(--omg-radius-md);
  background: var(--omg-color-surface);
  color: var(--omg-color-text);
  text-align: start;
}
.o-select__control:has(.o-select__clear) .o-select__trigger {
  padding-inline-end: calc(var(--omg-space-6) + var(--omg-space-3));
}
.o-select__clear {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-end: var(--omg-space-3);
  display: grid;
  place-items: center;
  inline-size: var(--omg-space-5);
  block-size: var(--omg-space-5);
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--omg-color-text-muted);
  transform: translateY(-50%);
}
.o-select__value--placeholder {
  color: var(--omg-color-text-muted);
}
.o-select__indicator {
  flex: none;
  transition: transform var(--omg-duration-fast) var(--omg-easing-standard);
}
.o-select[data-open] .o-select__indicator {
  transform: rotate(180deg);
}
.o-select__panel {
  z-index: 1000;
  overflow: auto;
  padding: var(--omg-space-1);
  border: 1px solid var(--omg-color-border);
  border-radius: var(--omg-radius-md);
  background: var(--omg-color-surface);
  box-shadow: var(--omg-shadow-sm);
  color: var(--omg-color-text);
}
.o-select__option {
  display: flex;
  min-block-size: 36px;
  align-items: center;
  justify-content: space-between;
  gap: var(--omg-space-2);
  padding: 0 var(--omg-space-2);
  border-radius: var(--omg-radius-sm);
  cursor: pointer;
}
.o-select__option.is-active {
  background: var(--omg-color-neutral-soft);
}
.o-select__option.is-selected {
  color: var(--omg-color-brand);
}
.o-select__option.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

Reuse the same 160ms opacity/scale transition pattern as Dropdown under `o-select-panel-*`. Disable panel and chevron transitions under reduced motion. Add focus-visible and disabled styles with OMG tokens.

- [ ] **Step 6: Add explicit exports and pass focused checks**

Create `select/index.ts` with explicit value/type exports for every interface and readonly validation array.

Run:

```bash
pnpm exec vitest run packages/ui/src/components/select
pnpm --filter @puzzle-fuzzy/ui typecheck
pnpm exec stylelint "packages/ui/src/components/select/**/*.{vue,less}"
```

Expected: Select tests pass, no nested-button markup exists, and all type/style checks exit 0.

- [ ] **Step 7: Commit OSelect**

```bash
git add packages/ui/src/components/select
git commit -m "feat: add accessible single select"
```

---

### Task 4: Implement OAvatarDropdown and change Avatar Flow loading motion

**Files:**

- Create: `packages/ui/src/components/avatar-dropdown/src/avatar-dropdown.ts`
- Create: `packages/ui/src/components/avatar-dropdown/src/OAvatarDropdown.vue`
- Create: `packages/ui/src/components/avatar-dropdown/style/index.less`
- Create: `packages/ui/src/components/avatar-dropdown/__tests__/avatar-dropdown.test.ts`
- Create: `packages/ui/src/components/avatar-dropdown/index.ts`
- Modify: `packages/ui/src/components/avatar-flow/style/index.less`
- Modify: `packages/ui/src/components/avatar-flow/__tests__/avatar-flow.test.ts`

**Interfaces:**

- Consumes all `oAvatarProps` plus `ODropdown` menu props/types.
- Produces `OAvatarDropdown` with required `ariaLabel`, selection/open events, forwarded avatar load/error events, and fallback/item/empty slots.
- Preserves every existing `OAvatar` prop and all three `OAvatarFlow` state names.

- [ ] **Step 1: Define the Avatar Dropdown composition contract**

Create `avatar-dropdown.ts`:

```ts
import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'
import { oAvatarProps, type OAvatarFallbackSlotProps } from '../../avatar'
import type { ODropdownItem, ODropdownPlacement, ODropdownValue } from '../../dropdown'

export const oAvatarDropdownProps = {
  ...oAvatarProps,
  items: { type: Array as PropType<readonly ODropdownItem[]>, required: true },
  open: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  disabled: Boolean,
  placement: { type: String as PropType<ODropdownPlacement>, default: 'bottom-start' },
  ariaLabel: { type: String, required: true },
  showIndicator: { type: Boolean, default: true },
} as const

export type OAvatarDropdownProps = ExtractPublicPropTypes<typeof oAvatarDropdownProps>

export interface OAvatarDropdownEmits {
  'update:open': [value: boolean]
  select: [value: ODropdownValue, item: ODropdownItem]
  load: [event: Event]
  error: [event: Event]
}

export interface OAvatarDropdownSlots {
  fallback?: (props: OAvatarFallbackSlotProps) => VNodeChild
  item?: (props: { item: ODropdownItem }) => VNodeChild
  empty?: () => VNodeChild
}
```

- [ ] **Step 2: Write failing composition and event-forwarding tests**

Assert that:

```ts
expect(oAvatarDropdownProps.ariaLabel.required).toBe(true)
expect(oAvatarDropdownProps.size.default).toBe('md')
expect(wrapper.get('.o-dropdown__trigger').attributes('aria-label')).toBe('Open account menu')
expect(wrapper.getComponent(OAvatar).props()).toMatchObject({
  backgroundColor: '#1d4ed8',
  name: 'Yxswy',
  shape: 'rounded',
  status: 'online',
  textColor: '#ffffff',
})
```

Add cases for menu `select`, controlled and uncontrolled `update:open`, avatar `load`/`error`, fallback/item/empty slots, disabled state, placement, and `showIndicator: false`. Confirm the base `oAvatarProps` still has no `items`, `open`, or `disabled` property.

Run `pnpm exec vitest run packages/ui/src/components/avatar-dropdown packages/ui/src/components/avatar`.

Expected: Avatar Dropdown tests fail while base Avatar tests remain green.

- [ ] **Step 3: Implement OAvatarDropdown as a thin composition**

Create `OAvatarDropdown.vue`:

```vue
<script setup lang="ts">
import { OAvatar } from '../../avatar'
import { ODropdown } from '../../dropdown'
import {
  oAvatarDropdownProps,
  type OAvatarDropdownEmits,
  type OAvatarDropdownSlots,
} from './avatar-dropdown'

defineOptions({ name: 'OAvatarDropdown' })
const props = defineProps(oAvatarDropdownProps)
const emit = defineEmits<OAvatarDropdownEmits>()
defineSlots<OAvatarDropdownSlots>()
</script>

<template>
  <ODropdown
    class="o-avatar-dropdown"
    :items="props.items"
    :open="props.open"
    :disabled="props.disabled"
    :placement="props.placement"
    :trigger-aria-label="props.ariaLabel"
    :show-indicator="props.showIndicator"
    @update:open="emit('update:open', $event)"
    @select="(value, item) => emit('select', value, item)"
  >
    <template #trigger>
      <OAvatar
        :src="props.src"
        :alt="props.alt"
        :name="props.name"
        :initials="props.initials"
        :size="props.size"
        :shape="props.shape"
        :status="props.status"
        :status-label="props.statusLabel"
        :stacked="props.stacked"
        :background-color="props.backgroundColor"
        :text-color="props.textColor"
        @load="emit('load', $event)"
        @error="emit('error', $event)"
      >
        <template v-if="$slots.fallback" #fallback="slotProps"
          ><slot name="fallback" v-bind="slotProps"
        /></template>
      </OAvatar>
    </template>
    <template v-if="$slots.item" #item="slotProps"
      ><slot name="item" v-bind="slotProps"
    /></template>
    <template v-if="$slots.empty" #empty><slot name="empty" /></template>
  </ODropdown>
</template>
```

The Dropdown trigger owns the interactive button. Do not add click listeners or menu props to `OAvatar.vue`.

- [ ] **Step 4: Add Avatar Dropdown shell styles and entry**

Style only the trigger shell:

```less
.o-avatar-dropdown .o-dropdown__trigger {
  min-block-size: auto;
  padding: var(--omg-space-1);
  border-color: transparent;
  border-radius: var(--omg-radius-full);
  background: transparent;
}

.o-avatar-dropdown .o-dropdown__trigger:hover:not(:disabled) {
  background: var(--omg-color-neutral-soft);
}
```

Do not override `.o-avatar__image`, fallback colors, status, size, or shape. Create `avatar-dropdown/index.ts` with explicit exports for component, props, emits, props type, and slots.

- [ ] **Step 5: Write the Flow CSS regression first**

Extend `avatar-flow.test.ts`:

```ts
expect(avatarFlowStyles).not.toContain('--omg-avatar-flow-dot-lift')
expect(avatarFlowStyles).not.toContain('translateY')
expect(avatarFlowStyles).toContain('transform: scale(0.7)')
expect(avatarFlowStyles).toContain('transform: scale(1)')
```

Run `pnpm exec vitest run packages/ui/src/components/avatar-flow`.

Expected: FAIL on the old lift variable and translate transform.

- [ ] **Step 6: Replace vertical movement with scale-only motion**

Delete `--omg-avatar-flow-dot-lift`. Replace the loading keyframes with:

```less
@keyframes o-avatar-flow-loading {
  0%,
  60%,
  100% {
    opacity: 0.35;
    transform: scale(0.7);
  }

  30% {
    opacity: 1;
    transform: scale(1);
  }
}
```

Retain the 900ms duration, the `-600ms`/`-300ms` delays, `will-change`, and reduced-motion fallback.

- [ ] **Step 7: Run focused composition and motion checks**

```bash
pnpm exec vitest run packages/ui/src/components/avatar packages/ui/src/components/avatar-dropdown packages/ui/src/components/avatar-flow
pnpm --filter @puzzle-fuzzy/ui typecheck
pnpm exec stylelint "packages/ui/src/components/{avatar-dropdown,avatar-flow}/**/*.{vue,less}"
```

Expected: all suites and checks pass; Flow CSS contains no vertical transform.

- [ ] **Step 8: Commit the composition and motion update**

```bash
git add packages/ui/src/components/avatar-dropdown packages/ui/src/components/avatar-flow
git commit -m "feat: add avatar dropdown and refine flow motion"
```

---

### Task 5: Wire public exports, builds, package contracts, and icon rules

**Files:**

- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.less`
- Modify: `packages/ui/vite.config.ts`
- Modify: `packages/ui/package.json`
- Modify: `scripts/check-naming.mjs`
- Modify: `scripts/test-package.mjs`
- Modify: `packages/ui/tests/package/package-contract.test.ts`

**Interfaces:**

- Produces root exports and subpaths `./dropdown`, `./select`, and `./avatar-dropdown`.
- Expands the naming contract from six to nine public component directories.
- Proves that a clean temporary Vue/Vite consumer can typecheck and bundle every new entry.

- [ ] **Step 1: Add explicit root and style exports**

In `packages/ui/src/index.ts`, add explicit value/type export blocks for all symbols from the three component entries. In `styles/index.less`, import:

```less
@import '../components/dropdown/style/index.less';
@import '../components/select/style/index.less';
@import '../components/avatar-dropdown/style/index.less';
```

Keep each style imported once and retain existing component order.

- [ ] **Step 2: Add Vite entries and ESM package subpaths**

Add to the Vite entry object:

```ts
'components/avatar-dropdown/index': fromPackageRoot('src/components/avatar-dropdown/index.ts'),
'components/dropdown/index': fromPackageRoot('src/components/dropdown/index.ts'),
'components/select/index': fromPackageRoot('src/components/select/index.ts'),
```

Add package exports:

```json
"./avatar-dropdown": {
  "types": "./dist/components/avatar-dropdown/index.d.ts",
  "import": "./dist/components/avatar-dropdown/index.js"
},
"./dropdown": {
  "types": "./dist/components/dropdown/index.d.ts",
  "import": "./dist/components/dropdown/index.js"
},
"./select": {
  "types": "./dist/components/select/index.d.ts",
  "import": "./dist/components/select/index.js"
}
```

Do not add CommonJS conditions.

- [ ] **Step 3: Expand naming and package contract tests before building**

Set `expectedComponents` to exactly:

```js
;[
  'avatar',
  'avatar-dropdown',
  'avatar-flow',
  'avatar-group',
  'button',
  'code-input',
  'divider',
  'dropdown',
  'select',
]
```

Add the three subpaths and their six `dist/components/*/index.{js,d.ts}` files to the package contract test. Add an assertion that dependencies contain the exact two catalog-resolved packages while peer dependencies remain `{ vue: '^3.5.0' }`.

Run:

```bash
pnpm check:naming
pnpm exec vitest run packages/ui/tests/package
```

Expected: naming passes for 9 components; the package contract fails until a new build emits entries.

- [ ] **Step 4: Extend the real tarball consumer**

Add `./avatar-dropdown`, `./dropdown`, and `./select` to ATTW entrypoints. Add imports to the generated `App.vue`:

```ts
import { OAvatarDropdown } from '@puzzle-fuzzy/ui/avatar-dropdown'
import { ODropdown, type ODropdownItem } from '@puzzle-fuzzy/ui/dropdown'
import { OSelect, type OSelectOption, type OSelectValue } from '@puzzle-fuzzy/ui/select'

const menuItems: readonly ODropdownItem[] = [{ value: 'profile', label: 'Profile' }]
const selectOptions: readonly OSelectOption[] = [{ value: 1, label: 'One' }]
const selected = ref<OSelectValue>()
```

Add smoke markup:

```vue
<ODropdown
  :items="menuItems"
  trigger-aria-label="Package menu"
><template #trigger>Menu</template></ODropdown>
<OSelect v-model="selected" aria-label="Package select" :options="selectOptions" />
<OAvatarDropdown ariaLabel="Package avatar menu" :items="menuItems" name="Avatar" />
```

This proves root dependency bundling, subpath types, and SFC templates in an isolated consumer.

- [ ] **Step 5: Enforce the single icon source**

Add `relative` to the existing `node:path` import and add this source audit to `scripts/check-naming.mjs`:

```js
const uiSourceRoot = resolve(repositoryRoot, 'packages/ui/src')
const docsExamplesRoot = resolve(repositoryRoot, 'apps/docs/examples')
const forbiddenIconPackages = ['lucide-vue-next', '@heroicons', '@fortawesome', '@iconify']

const collectFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const path = resolve(directory, entry.name)
      return entry.isDirectory() ? collectFiles(path) : [path]
    }),
  )
  return files.flat()
}

for (const root of [uiSourceRoot, docsExamplesRoot]) {
  for (const file of await collectFiles(root)) {
    if (file.endsWith('.svg') && file.startsWith(uiSourceRoot)) {
      errors.push('raw SVG is not allowed: ' + relative(repositoryRoot, file))
      continue
    }
    if (!/\.(?:ts|vue)$/u.test(file)) continue

    const source = await readFile(file, 'utf8')
    for (const match of source.matchAll(/from\s+['"]([^'"]+)['"]/gu)) {
      const importSource = match[1]
      if (!importSource) continue
      if (importSource.startsWith('vue-icons-plus') && importSource !== 'vue-icons-plus/lu') {
        errors.push('unsupported vue-icons-plus entry in ' + relative(repositoryRoot, file))
      }
      if (forbiddenIconPackages.some((name) => importSource.startsWith(name))) {
        errors.push('unsupported icon package in ' + relative(repositoryRoot, file))
      }
    }
  }
}
```

Expected accepted imports:

```ts
import { LuCheck, LuChevronDown, LuX } from 'vue-icons-plus/lu'
```

Expected rejected import:

```ts
import { LuCheck } from 'vue-icons-plus'
```

Add a unit/source assertion in one new component suite so the rule is covered even if the naming script is not invoked directly.

- [ ] **Step 6: Build and validate package metadata**

Run:

```bash
pnpm build
pnpm exec vitest run packages/ui/tests/package
pnpm test:package
```

Expected: nine public component entries build; package contract, publint strict, ATTW ESM profile, temporary consumer typecheck, and temporary consumer Vite build all pass.

- [ ] **Step 7: Commit package integration**

```bash
git add packages/ui/src/index.ts packages/ui/src/styles/index.less packages/ui/vite.config.ts packages/ui/package.json packages/ui/tests/package scripts/check-naming.mjs scripts/test-package.mjs
git commit -m "build: publish select and dropdown entries"
```

---

### Task 6: Add SSR coverage

**Files:**

- Modify: `packages/ui/tests/ssr/ssr.test.ts`

**Interfaces:**

- Verifies `ODropdown`, `OSelect`, `OAvatarDropdown`, and the modified `OAvatarFlow` render without browser globals.
- Uses closed panels for default rendering and an explicitly open Select case to exercise Teleport output safely.

- [ ] **Step 1: Add imports and deterministic fixtures**

Import all three components and their item/option types. Define:

```ts
const dropdownItems: readonly ODropdownItem[] = [{ value: 'profile', label: 'Profile' }]
const selectOptions: readonly OSelectOption[] = [{ value: 1, label: 'One' }]
```

- [ ] **Step 2: Add three SSR tests**

Use these assertions:

```ts
test('renders ODropdown without DOM globals', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(
          ODropdown,
          { items: dropdownItems, triggerAriaLabel: 'Account menu' },
          {
            trigger: () => 'Account',
          },
        ),
    }),
  )
  expect(html).toContain('aria-haspopup="menu"')
  expect(html).toContain('aria-expanded="false"')
})

test('renders OSelect without DOM globals', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () => h(OSelect, { ariaLabel: 'Number', modelValue: 1, options: selectOptions }),
    }),
  )
  expect(html).toContain('role="combobox"')
  expect(html).toContain('One')
})

test('renders OAvatarDropdown without DOM globals', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(OAvatarDropdown, { ariaLabel: 'Avatar menu', items: dropdownItems, name: 'OMG UI' }),
    }),
  )
  expect(html).toContain('aria-label="Avatar menu"')
  expect(html).toContain('class="o-avatar')
})
```

Keep the existing Flow SSR test and add a source-style assertion in its unit suite rather than reading CSS in SSR.

- [ ] **Step 3: Run SSR and type checks**

Run:

```bash
pnpm test:ssr
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: 9 SSR tests pass and no setup path accesses `document`, `window`, or DOM constructors.

- [ ] **Step 4: Commit SSR coverage**

```bash
git add packages/ui/tests/ssr/ssr.test.ts
git commit -m "test: cover floating components in ssr"
```

---

### Task 7: Add VitePress documentation and interaction examples

**Files:**

- Create: `apps/docs/examples/dropdown/Basic.vue`
- Create: `apps/docs/examples/select/Basic.vue`
- Create: `apps/docs/examples/avatar-dropdown/Basic.vue`
- Create: `apps/docs/docs/components/dropdown.md`
- Create: `apps/docs/docs/components/select.md`
- Create: `apps/docs/docs/components/avatar-dropdown.md`
- Modify: `apps/docs/docs/.vitepress/config.mts`
- Modify: `apps/docs/docs/components/avatar-flow.md`
- Modify: `packages/ui/README.md`

**Interfaces:**

- Examples remain presentation-only: local refs demonstrate component state but contain no request, auth, routing, or remote business logic.
- Docs import menu icons only from `vue-icons-plus/lu`.

- [ ] **Step 1: Create an interactive Dropdown example**

Use `LuLogOut`, `LuSettings`, and `LuUser` from `vue-icons-plus/lu`, a readonly typed item array, and local `selectedLabel` text. Render a text trigger plus an empty-menu instance. Ensure the danger item uses `tone: 'danger'` and `dividerBefore: true`.

- [ ] **Step 2: Create an interactive Select example**

Use `ref<OSelectValue>()`, three options with one disabled option, a clearable medium Select, and a second `bottom-end` Select. Render the selected label as demo feedback. Keep option labels generic and local.

- [ ] **Step 3: Create an Avatar Dropdown example**

Use the same typed menu model and icons, then render:

```vue
<OAvatarDropdown
  v-model:open="open"
  ariaLabel="打开头像菜单"
  background-color="#1d4ed8"
  text-color="#ffffff"
  :items="items"
  name="Yxswy"
  status="online"
  @select="(_, item) => (selectedLabel = item.label)"
/>
```

Use `v-bind="{ ariaLabel: '打开头像菜单' }"` if Vue template casing/typechecking interprets the required camelCase prop as a native attribute.

- [ ] **Step 4: Write complete API and accessibility pages**

Each page must include:

- introduction and live DemoBlock;
- package-root and subpath import examples;
- full props table with exact defaults;
- events and slot tables;
- keyboard behavior table;
- ARIA model and focus behavior;
- controlled/uncontrolled open example;
- explicit non-goals for Select or Dropdown;
- icon rule linking all custom item icons to `vue-icons-plus/lu`.

Update Avatar Flow wording from “依次浮动” to “依次缩放” and state that the dots never translate vertically.

- [ ] **Step 5: Register source aliases and sidebar routes**

Add source aliases for all three subpaths when `OMG_UI_DOCS_SOURCE=1`, then add sidebar items:

```ts
{ text: 'Avatar Dropdown 头像下拉', link: '/components/avatar-dropdown' },
{ text: 'Dropdown 下拉菜单', link: '/components/dropdown' },
{ text: 'Select 选择器', link: '/components/select' },
```

Do not modify VitePress brand variables.

- [ ] **Step 6: Update the package README**

Expand the component list and add a compact import example for root and subpath imports. Document `vue-icons-plus/lu` as the sole icon source for built-in and documentation icons.

- [ ] **Step 7: Build and typecheck docs**

Run:

```bash
pnpm --filter @puzzle-fuzzy/docs typecheck
pnpm docs:build
```

Expected: VitePress builds all nine component routes from the built package without unresolved Teleport or icon imports.

- [ ] **Step 8: Commit documentation**

```bash
git add apps/docs packages/ui/README.md
git commit -m "docs: add select and dropdown guides"
```

---

### Task 8: Add browser accessibility and motion coverage

**Files:**

- Modify: `apps/docs/tests/e2e/components.spec.ts`

**Interfaces:**

- Covers real browser focus, Teleport positioning, outside dismissal, keyboard selection, theme rendering, reduced motion, and axe checks.

- [ ] **Step 1: Add Dropdown browser coverage**

First extend the axe helper to accept every teleported surface being tested:

```ts
const expectNoSeriousAccessibilityViolations = async (
  page: Page,
  includes: readonly string[] = ['.omg-docs-demo'],
) => {
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  for (const selector of includes) builder = builder.include(selector)
  const results = await builder.analyze()
  const violations = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  )
  expect(violations).toEqual([])
}
```

Navigate to `/components/dropdown`, click the named trigger, assert a visible menu, press ArrowDown across a disabled item, select with Enter, reopen and close with outside click, then reopen and close with Escape. Assert focus returns to the trigger after Escape and selection. Run `expectNoSeriousAccessibilityViolations(page, ['.omg-docs-demo', '.o-dropdown__panel'])` while the menu is open.

- [ ] **Step 2: Add Select browser coverage**

Navigate to `/components/select`, focus the combobox, press ArrowDown twice to skip the disabled option, assert `aria-activedescendant`, select with Enter, assert demo output, use the clear button, and assert the placeholder returns. Confirm the teleported panel bounding box stays inside the viewport:

```ts
const box = await page.getByRole('listbox').boundingBox()
expect(box).not.toBeNull()
expect(box!.x).toBeGreaterThanOrEqual(0)
expect(box!.y).toBeGreaterThanOrEqual(0)
expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height)
```

Run `expectNoSeriousAccessibilityViolations(page, ['.omg-docs-demo', '.o-select__panel'])` after the panel opens.

- [ ] **Step 3: Add Avatar Dropdown browser coverage**

Navigate to `/components/avatar-dropdown`, open the named avatar trigger, assert the avatar remains visible inside the trigger, choose one menu item, and assert local demo feedback. Verify both light and dark themed demo containers render the trigger and menu surface with visible borders. Reopen and run `expectNoSeriousAccessibilityViolations(page, ['.omg-docs-demo', '.o-dropdown__panel'])`.

- [ ] **Step 4: Strengthen Flow and reduced-motion assertions**

For the loading dot, pause its animation at 0ms and 270ms, read its transform matrix, and assert the horizontal/vertical translation components remain zero while scale increases. Under reduced motion, assert Dropdown/Select panel transition duration and all chevron transition durations resolve to `0s`.

- [ ] **Step 5: Run E2E tests**

Run `pnpm test:e2e`.

Expected: all existing tests plus new Dropdown, Select, Avatar Dropdown, and scale-only Flow cases pass in Chromium with no serious/critical axe violations.

- [ ] **Step 6: Commit browser coverage**

```bash
git add apps/docs/tests/e2e/components.spec.ts
git commit -m "test: cover select and dropdown interactions"
```

---

### Task 9: Final repository verification and review

**Files:**

- Review all files changed by Tasks 1–8.

**Interfaces:**

- Produces a clean, publishable nine-component Vue package with passing unit, SSR, package, docs, and browser checks.

- [ ] **Step 1: Format all changed files**

Run `pnpm format`.

Expected: Prettier updates only formatting; no generated `dist`, coverage, or VitePress output is staged unless already tracked by repository policy.

- [ ] **Step 2: Run targeted source audits**

Run:

```bash
rg -n -F "from 'vue-icons-plus'" packages/ui/src apps/docs/examples
rg -n -F 'from "vue-icons-plus"' packages/ui/src apps/docs/examples
rg -n "lucide-vue-next|@heroicons|@fortawesome|@iconify" packages/ui/src apps/docs/examples
rg -n "translateY|dot-lift" packages/ui/src/components/avatar-flow
rg -n -- "--vp-c-brand-" apps/docs/docs/.vitepress/theme
git diff --check
```

Expected: every source search returns no matches; `git diff --check` exits 0.

- [ ] **Step 3: Run the complete quality gate**

Run `pnpm verify`.

Expected:

- formatting, ESLint, Stylelint, naming, and Vue/TypeScript checks pass;
- unit coverage remains above 90% statements/functions/lines and 85% branches;
- all nine component entries build;
- SSR tests pass;
- package contract, publint, ATTW, and isolated Vue/Vite consumer pass;
- VitePress build and Playwright/axe checks pass.

- [ ] **Step 4: Inspect the final package and worktree**

Run:

```bash
git status --short
git diff --stat HEAD~8..HEAD
```

Verify no `.tgz`, coverage directory, VitePress dist, temporary consumer, lockfile from another package manager, raw SVG, or source map is newly tracked.

- [ ] **Step 5: Commit any verification-only corrections**

If formatting or quality checks changed tracked source, stage only those exact source/test/doc files and commit:

```bash
git commit -m "chore: finalize select and dropdown quality"
```

If verification made no tracked correction, do not create an empty commit.
