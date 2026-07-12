# Avatar, Code Input, and Divider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend OMG UI with reusable avatar stacking, a simplified avatar flow, a six-digit verification-code input, and a semantic divider while keeping package, documentation, and quality contracts intact.

**Architecture:** `OAvatar` owns single-avatar behavior and local color overrides; `OAvatarGroup` owns typed collection rendering, overlap, and overflow. `OAvatarFlow` composes those primitives and reduces its connector to an inactive line or three active dots. `OCodeInput` keeps only focus state internally while `v-model` owns the code value, and `ODivider` remains a stateless semantic presentation component.

**Tech Stack:** Vue 3.5 SFCs, TypeScript 6, Less, Vite 8, Vitest 4, Vue Test Utils, VitePress, Playwright, pnpm 11, Node 24.

## Global Constraints

- Vue projects are the only supported consumers.
- The package remains ESM-only and has no runtime dependency other than the Vue peer dependency.
- Use `O*` component names, `.o-*` class names, and `--omg-*` CSS variables.
- Do not add or override `--vp-c-brand-*`; VitePress owns its theme variables.
- Do not add a runtime CSS-in-JS layer or a third-party OTP/form/animation package.
- `OCodeInput` defaults to six numeric positions; countdowns, requests, retries, and remote validation remain outside the component.
- Preserve SSR safety and the supported TypeScript `moduleResolution: "Bundler"` package contract.
- Use pnpm/Node/Vite/Vitest as established by the current architecture; the older repository Bun defaults do not override the approved UI-library toolchain.

---

## File Structure

### Existing files to modify

- `packages/ui/src/components/avatar/src/avatar.ts`: add public avatar customization props.
- `packages/ui/src/components/avatar/src/OAvatar.vue`: apply stacked class and scoped CSS variable overrides.
- `packages/ui/src/components/avatar/style/index.less`: implement adjacent-avatar stacking.
- `packages/ui/src/components/avatar/__tests__/avatar.test.ts`: cover new props without regressing image/status behavior.
- `packages/ui/src/components/avatar-flow/src/OAvatarFlow.vue`: compose `OAvatarGroup` and render the simple connector.
- `packages/ui/src/components/avatar-flow/style/index.less`: remove markers/keyframes and style line/dots.
- `packages/ui/src/components/avatar-flow/__tests__/avatar-flow.test.ts`: replace phase-marker assertions.
- `packages/ui/src/index.ts`: explicitly export every new component and type.
- `packages/ui/src/styles/index.less`: include new component styles once.
- `packages/ui/vite.config.ts`: add new multi-entry build inputs.
- `packages/ui/package.json`: add ESM/type subpath exports.
- `packages/ui/tests/ssr/ssr.test.ts`: render new components without DOM globals.
- `packages/ui/tests/package/package-contract.test.ts`: assert built JS/type entries exist.
- `scripts/check-naming.mjs`: include the new component directories in the naming contract.
- `scripts/test-package.mjs`: exercise all new tarball subpath imports in a real Vue/Vite consumer.
- `apps/docs/docs/.vitepress/config.mts`: add source aliases and sidebar routes.
- `apps/docs/docs/.vitepress/theme/custom.less`: delete the `--vp-c-brand-*` root override only.
- `apps/docs/tests/e2e/components.spec.ts`: smoke-test new docs and interactions.

### New component files

- `packages/ui/src/components/avatar-group/src/avatar-group.ts`
- `packages/ui/src/components/avatar-group/src/OAvatarGroup.vue`
- `packages/ui/src/components/avatar-group/style/index.less`
- `packages/ui/src/components/avatar-group/__tests__/avatar-group.test.ts`
- `packages/ui/src/components/avatar-group/index.ts`
- `packages/ui/src/components/code-input/src/code-input.ts`
- `packages/ui/src/components/code-input/src/OCodeInput.vue`
- `packages/ui/src/components/code-input/style/index.less`
- `packages/ui/src/components/code-input/__tests__/code-input.test.ts`
- `packages/ui/src/components/code-input/index.ts`
- `packages/ui/src/components/divider/src/divider.ts`
- `packages/ui/src/components/divider/src/ODivider.vue`
- `packages/ui/src/components/divider/style/index.less`
- `packages/ui/src/components/divider/__tests__/divider.test.ts`
- `packages/ui/src/components/divider/index.ts`

### New documentation files

- `apps/docs/examples/avatar/Stacking.vue`
- `apps/docs/examples/code-input/Basic.vue`
- `apps/docs/examples/divider/Variants.vue`
- `apps/docs/docs/components/avatar-group.md`
- `apps/docs/docs/components/code-input.md`
- `apps/docs/docs/components/divider.md`

`apps/docs/docs/components/avatar.md` and `apps/docs/docs/components/avatar-flow.md` are modified in place. `OAvatarGroup` receives its own route while reusing the avatar stacking example.

---

### Task 1: Extend OAvatar and add OAvatarGroup

**Files:**

- Modify: `packages/ui/src/components/avatar/src/avatar.ts`
- Modify: `packages/ui/src/components/avatar/src/OAvatar.vue`
- Modify: `packages/ui/src/components/avatar/style/index.less`
- Modify: `packages/ui/src/components/avatar/__tests__/avatar.test.ts`
- Create: `packages/ui/src/components/avatar-group/src/avatar-group.ts`
- Create: `packages/ui/src/components/avatar-group/src/OAvatarGroup.vue`
- Create: `packages/ui/src/components/avatar-group/style/index.less`
- Create: `packages/ui/src/components/avatar-group/__tests__/avatar-group.test.ts`
- Create: `packages/ui/src/components/avatar-group/index.ts`

**Interfaces:**

- Consumes: `OAvatar`, `OAvatarSize`, and `OAvatarShape` from `packages/ui/src/components/avatar`.
- Produces: `OAvatarGroup`, `oAvatarGroupProps`, `OAvatarGroupProps`, and `OAvatarGroupItem`.
- Produces additions to `OAvatarProps`: `stacked`, `backgroundColor`, and `textColor`.

- [ ] **Step 1: Write failing avatar customization tests**

Append focused cases to `avatar.test.ts`:

```ts
test('applies local fallback colors through OMG CSS variables', () => {
  const wrapper = mount(OAvatar, {
    props: {
      backgroundColor: '#123456',
      name: 'OMG UI',
      textColor: '#ffffff',
    },
  })

  expect(wrapper.attributes('style')).toContain('--omg-avatar-background: #123456')
  expect(wrapper.attributes('style')).toContain('--omg-avatar-color: #ffffff')
})

test('marks an avatar as stackable without changing the default avatar', () => {
  expect(mount(OAvatar, { props: { name: 'One', stacked: true } }).classes()).toContain(
    'o-avatar--stacked',
  )
  expect(mount(OAvatar, { props: { name: 'One' } }).classes()).not.toContain('o-avatar--stacked')
})
```

- [ ] **Step 2: Write failing OAvatarGroup tests**

Create `avatar-group.test.ts` with inherited size/shape, color forwarding, maximum visibility, overflow count, stable item order, reverse styling, and group labeling:

```ts
const items = Object.freeze([
  { id: 'one', name: 'One', backgroundColor: '#111111', textColor: '#ffffff' },
  { id: 'two', name: 'Two' },
  { id: 'three', name: 'Three' },
])

test('renders typed items as stacked avatars', () => {
  const wrapper = mount(OAvatarGroup, {
    props: { items, shape: 'rounded', size: 'sm' },
  })
  const avatars = wrapper.findAllComponents(OAvatar)

  expect(avatars).toHaveLength(3)
  expect(avatars[0].props()).toMatchObject({
    backgroundColor: '#111111',
    name: 'One',
    shape: 'rounded',
    size: 'sm',
    stacked: true,
    textColor: '#ffffff',
  })
})

test('appends an accessible overflow avatar after max visible items', () => {
  const wrapper = mount(OAvatarGroup, {
    props: { ariaLabel: '3 participants', items, max: 2 },
  })

  expect(wrapper.attributes('role')).toBe('group')
  expect(wrapper.attributes('aria-label')).toBe('3 participants')
  expect(wrapper.findAll('[data-avatar-group-role="item"]')).toHaveLength(2)
  expect(wrapper.get('[data-avatar-group-role="overflow"]').text()).toBe('+1')
})
```

- [ ] **Step 3: Run the focused tests and verify failure**

Run:

```bash
pnpm exec vitest run packages/ui/src/components/avatar packages/ui/src/components/avatar-group
```

Expected: avatar tests fail because the new props/class do not exist, and the group suite fails because its files are missing.

- [ ] **Step 4: Implement OAvatar props and rendering**

Add these entries to `oAvatarProps`:

```ts
stacked: Boolean,
backgroundColor: String as PropType<string | undefined>,
textColor: String as PropType<string | undefined>,
```

In `OAvatar.vue`, import `type CSSProperties`, create the scoped style, and bind it:

```ts
const avatarStyle = computed<CSSProperties>(() => ({
  '--omg-avatar-background': props.backgroundColor,
  '--omg-avatar-color': props.textColor,
}))
```

Add `'o-avatar--stacked': props.stacked` to the root class object and `:style="avatarStyle"` to the root element. Add adjacent stacking to `avatar/style/index.less`:

```less
.o-avatar--stacked + .o-avatar--stacked {
  margin-inline-start: calc(var(--omg-avatar-overlap, var(--omg-space-2)) * -1);
}
```

- [ ] **Step 5: Implement the typed OAvatarGroup model**

Create `avatar-group.ts`:

```ts
import type { ExtractPublicPropTypes, PropType } from 'vue'
import { oAvatarShapes, oAvatarSizes, type OAvatarShape, type OAvatarSize } from '../../avatar'

export interface OAvatarGroupItem {
  readonly id: string | number
  readonly name?: string
  readonly src?: string
  readonly initials?: string
  readonly backgroundColor?: string
  readonly textColor?: string
}

export const normalizeOAvatarGroupMax = (value: number | undefined, itemCount: number): number => {
  if (value === undefined || !Number.isFinite(value)) return itemCount
  return Math.max(1, Math.floor(value))
}

export const oAvatarGroupProps = {
  items: {
    type: Array as PropType<readonly OAvatarGroupItem[]>,
    required: true,
  },
  max: Number as PropType<number | undefined>,
  size: {
    type: String as PropType<OAvatarSize>,
    default: 'md',
    validator: (value: unknown): value is OAvatarSize =>
      oAvatarSizes.some((size) => size === value),
  },
  shape: {
    type: String as PropType<OAvatarShape>,
    default: 'circle',
    validator: (value: unknown): value is OAvatarShape =>
      oAvatarShapes.some((shape) => shape === value),
  },
  reverse: Boolean,
  ariaLabel: String as PropType<string | undefined>,
} as const

export type OAvatarGroupProps = ExtractPublicPropTypes<typeof oAvatarGroupProps>
```

- [ ] **Step 6: Implement OAvatarGroup rendering and style**

Create `OAvatarGroup.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { OAvatar } from '../../avatar'
import { normalizeOAvatarGroupMax, oAvatarGroupProps } from './avatar-group'

defineOptions({ name: 'OAvatarGroup' })

const props = defineProps(oAvatarGroupProps)
const visibleItems = computed(() =>
  props.items.slice(0, normalizeOAvatarGroupMax(props.max, props.items.length)),
)
const overflowCount = computed(() => Math.max(0, props.items.length - visibleItems.value.length))
</script>

<template>
  <span
    class="o-avatar-group"
    :class="{ 'o-avatar-group--reverse': props.reverse }"
    role="group"
    :aria-label="props.ariaLabel"
  >
    <OAvatar
      v-for="item in visibleItems"
      :key="item.id"
      data-avatar-group-role="item"
      :src="item.src"
      :alt="item.name"
      :name="item.name"
      :initials="item.initials"
      :background-color="item.backgroundColor"
      :text-color="item.textColor"
      :size="props.size"
      :shape="props.shape"
      stacked
    />

    <OAvatar
      v-if="overflowCount > 0"
      data-avatar-group-role="overflow"
      alt=""
      :size="props.size"
      :shape="props.shape"
      stacked
    >
      <template #fallback>+{{ overflowCount }}</template>
    </OAvatar>
  </span>
</template>
```

Use this explicit entry:

```ts
export { default as OAvatarGroup } from './src/OAvatarGroup.vue'
export { normalizeOAvatarGroupMax, oAvatarGroupProps } from './src/avatar-group'
export type { OAvatarGroupItem, OAvatarGroupProps } from './src/avatar-group'
```

Use this group Less:

```less
.o-avatar-group {
  --omg-avatar-overlap: var(--omg-space-2);

  display: inline-flex;
  align-items: center;
  isolation: isolate;
}

.o-avatar-group > .o-avatar {
  position: relative;
}

.o-avatar-group--reverse {
  flex-direction: row-reverse;
}

.o-avatar-group--reverse > .o-avatar--stacked + .o-avatar--stacked {
  margin-inline-start: 0;
  margin-inline-end: calc(var(--omg-avatar-overlap) * -1);
}
```

- [ ] **Step 7: Run and pass avatar suites**

Run:

```bash
pnpm exec vitest run packages/ui/src/components/avatar packages/ui/src/components/avatar-group
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: all avatar and avatar-group tests pass; Vue typecheck exits 0.

- [ ] **Step 8: Commit the avatar work**

```bash
git add packages/ui/src/components/avatar packages/ui/src/components/avatar-group
git commit -m "feat: add avatar stacking and groups"
```

---

### Task 2: Simplify OAvatarFlow

**Files:**

- Modify: `packages/ui/src/components/avatar-flow/src/OAvatarFlow.vue`
- Modify: `packages/ui/src/components/avatar-flow/style/index.less`
- Modify: `packages/ui/src/components/avatar-flow/__tests__/avatar-flow.test.ts`

**Interfaces:**

- Consumes: `OAvatarGroup`, `OAvatarFlowPeer[]`, and existing `OAvatarFlowPhase`.
- Produces: unchanged public Flow props/types with `.o-avatar-flow__line` for inactive phases and three `.o-avatar-flow__dot` nodes for `transferring`.

- [ ] **Step 1: Replace old marker tests with connector tests**

```ts
test.each(['idle', 'requesting', 'complete', 'error'] as const)(
  'renders a static line for %s',
  (phase) => {
    const wrapper = mountFlow({ phase })
    expect(wrapper.find('.o-avatar-flow__line').exists()).toBe(true)
    expect(wrapper.find('.o-avatar-flow__dots').exists()).toBe(false)
  },
)

test('renders exactly three dots while transferring', () => {
  const wrapper = mountFlow({ phase: 'transferring' })
  expect(wrapper.find('.o-avatar-flow__line').exists()).toBe(false)
  expect(wrapper.findAll('.o-avatar-flow__dot')).toHaveLength(3)
})
```

- [ ] **Step 2: Run the Flow suite and verify failure**

Run `pnpm exec vitest run packages/ui/src/components/avatar-flow`.

Expected: failures reference the legacy marker/particle DOM.

- [ ] **Step 3: Replace the connector and receiver template**

```vue
<span class="o-avatar-flow__connector" :data-active="props.phase === 'transferring'">
  <span v-if="props.phase === 'transferring'" class="o-avatar-flow__dots">
    <span class="o-avatar-flow__dot" />
    <span class="o-avatar-flow__dot" />
    <span class="o-avatar-flow__dot" />
  </span>
  <span v-else class="o-avatar-flow__line" />
</span>

<OAvatarGroup
  class="o-avatar-flow__receivers"
  :items="props.receivers"
  :max="maxVisibleReceivers"
  :size="props.size"
  :shape="props.shape"
/>
```

Delete `visibleReceivers` and `overflowCount`; retain normalized max, `hasReceivers`, `role="status"`, `aria-live`, and `data-phase`.

- [ ] **Step 4: Replace complex Flow CSS with line/dot styles**

Keep root/layout/container-query rules and replace phase-marker, particle, animation, and keyframe blocks with:

```less
.o-avatar-flow__connector {
  display: flex;
  flex: 0 0 var(--omg-avatar-flow-connector-size);
  align-items: center;
  justify-content: center;
  min-inline-size: var(--omg-space-5);
  inline-size: var(--omg-avatar-flow-connector-size);
  color: var(--omg-avatar-flow-line);
}

.o-avatar-flow__line {
  inline-size: 100%;
  block-size: 1px;
  background: currentcolor;
}

.o-avatar-flow__dots {
  display: inline-flex;
  align-items: center;
  gap: var(--omg-space-1);
  color: var(--omg-avatar-flow-accent);
}

.o-avatar-flow__dot {
  inline-size: var(--omg-space-1);
  block-size: var(--omg-space-1);
  border-radius: var(--omg-radius-full);
  background: currentcolor;
}
```

- [ ] **Step 5: Run and pass Flow tests**

Run:

```bash
pnpm exec vitest run packages/ui/src/components/avatar-flow
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: Flow tests pass and no removed class is referenced by component source or styles.

- [ ] **Step 6: Commit the simplified Flow**

```bash
git add packages/ui/src/components/avatar-flow
git commit -m "refactor: simplify avatar flow connector"
```

---

### Task 3: Add OCodeInput

**Files:**

- Create: `packages/ui/src/components/code-input/src/code-input.ts`
- Create: `packages/ui/src/components/code-input/src/OCodeInput.vue`
- Create: `packages/ui/src/components/code-input/style/index.less`
- Create: `packages/ui/src/components/code-input/__tests__/code-input.test.ts`
- Create: `packages/ui/src/components/code-input/index.ts`

**Interfaces:**

- Produces: `OCodeInput`, `oCodeInputProps`, `oCodeInputSizes`, `OCodeInputProps`, `OCodeInputSize`, `OCodeInputEmits`, and `OCodeInputExpose`.
- Emits: `update:modelValue`, `complete`, `focus`, and `blur`.

- [ ] **Step 1: Write failing model and interaction tests**

Create tests for defaults, filtering, typing, replacement, Backspace, ArrowLeft/ArrowRight, paste, disabled/readonly, invalid semantics, events, and exposed focus:

```ts
test('defaults to six numeric positions', () => {
  const wrapper = mount(OCodeInput)
  expect(wrapper.findAll('input')).toHaveLength(6)
  expect(wrapper.attributes('role')).toBe('group')
})

test('emits a complete numeric value after a full paste', async () => {
  const wrapper = mount(OCodeInput)
  await wrapper.get('input').trigger('paste', {
    clipboardData: { getData: () => '12a34 56' },
  })

  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['123456'])
  expect(wrapper.emitted('complete')).toEqual([['123456']])
})

test('removes the previous digit when Backspace is pressed in an empty cell', async () => {
  const wrapper = mount(OCodeInput, { props: { modelValue: '12' } })
  const inputs = wrapper.findAll('input')
  await inputs[2].trigger('keydown', { key: 'Backspace' })

  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['1'])
})
```

- [ ] **Step 2: Run the suite and verify missing-component failure**

Run `pnpm exec vitest run packages/ui/src/components/code-input`.

Expected: suite cannot import `OCodeInput`.

- [ ] **Step 3: Define the public code-input contract**

Create `code-input.ts`:

```ts
import type { ExtractPublicPropTypes, PropType } from 'vue'

export const oCodeInputSizes = ['sm', 'md', 'lg'] as const
export type OCodeInputSize = (typeof oCodeInputSizes)[number]

export const sanitizeOCodeInputValue = (value: string, length: number): string =>
  Array.from(value)
    .filter((character) => /^[0-9]$/u.test(character))
    .slice(0, Math.max(1, Math.floor(length)))
    .join('')

export const oCodeInputProps = {
  modelValue: { type: String, default: '' },
  length: { type: Number, default: 6 },
  size: {
    type: String as PropType<OCodeInputSize>,
    default: 'md',
    validator: (value: unknown): value is OCodeInputSize =>
      oCodeInputSizes.some((size) => size === value),
  },
  disabled: Boolean,
  readonly: Boolean,
  autofocus: Boolean,
  invalid: Boolean,
  ariaLabel: { type: String, default: 'Verification code' },
} as const

export type OCodeInputProps = ExtractPublicPropTypes<typeof oCodeInputProps>

export interface OCodeInputEmits {
  'update:modelValue': [value: string]
  complete: [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

export interface OCodeInputExpose {
  focus: (index?: number) => void
}
```

- [ ] **Step 4: Implement controlled value and focus behavior**

In `OCodeInput.vue`, use:

```ts
const normalizedLength = computed(() =>
  Number.isFinite(props.length) ? Math.max(1, Math.floor(props.length)) : 6,
)
const normalizedValue = computed(() =>
  sanitizeOCodeInputValue(props.modelValue, normalizedLength.value),
)
const digits = computed(() =>
  Array.from({ length: normalizedLength.value }, (_, index) => normalizedValue.value[index] ?? ''),
)
const inputElements = ref<Array<HTMLInputElement | undefined>>([])

const focus = (index = 0): void => {
  const safeIndex = Math.min(Math.max(0, index), normalizedLength.value - 1)
  inputElements.value[safeIndex]?.focus()
  inputElements.value[safeIndex]?.select()
}

const commit = (value: string): void => {
  const normalized = sanitizeOCodeInputValue(value, normalizedLength.value)
  emit('update:modelValue', normalized)
  if (normalized.length === normalizedLength.value) emit('complete', normalized)
}

const setInputElement = (element: unknown, index: number): void => {
  inputElements.value[index] =
    typeof HTMLInputElement !== 'undefined' && element instanceof HTMLInputElement
      ? element
      : undefined
}

const handleInput = (event: Event, index: number): void => {
  if (props.disabled || props.readonly) return

  const input = event.target as HTMLInputElement
  const digit = sanitizeOCodeInputValue(input.value, 1)
  const current = normalizedValue.value
  const targetIndex = Math.min(index, current.length)

  if (!digit) {
    if (targetIndex < current.length) {
      commit(current.slice(0, targetIndex) + current.slice(targetIndex + 1))
    }
    return
  }

  const next = current.slice(0, targetIndex) + digit + current.slice(targetIndex + 1)
  commit(next)
  queueMicrotask(() => focus(Math.min(targetIndex + 1, normalizedLength.value - 1)))
}

const handleKeydown = (event: KeyboardEvent, index: number): void => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    focus(index - 1)
    return
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    focus(index + 1)
    return
  }

  if (event.key !== 'Backspace' || props.disabled || props.readonly) return

  event.preventDefault()
  const current = normalizedValue.value
  if (!current) return
  const removalIndex = digits.value[index] ? index : Math.max(0, index - 1)
  commit(current.slice(0, removalIndex) + current.slice(removalIndex + 1))
  queueMicrotask(() => focus(removalIndex))
}

const handlePaste = (event: ClipboardEvent, index: number): void => {
  if (props.disabled || props.readonly) return

  event.preventDefault()
  const pasted = sanitizeOCodeInputValue(
    event.clipboardData?.getData('text') ?? '',
    normalizedLength.value,
  )
  if (!pasted) return

  const current = normalizedValue.value
  const targetIndex = Math.min(index, current.length)
  const next = current.slice(0, targetIndex) + pasted + current.slice(targetIndex + pasted.length)
  const normalizedNext = sanitizeOCodeInputValue(next, normalizedLength.value)
  commit(normalizedNext)
  queueMicrotask(() => focus(Math.min(normalizedNext.length, normalizedLength.value - 1)))
}
```

Call `focus()` in `onMounted` only when `autofocus` is true and expose it with `defineExpose<OCodeInputExpose>({ focus })`.

- [ ] **Step 5: Render native numeric inputs**

```vue
<div
  class="o-code-input"
  :class="[`o-code-input--${props.size}`, { 'is-invalid': props.invalid }]"
  role="group"
  :aria-label="props.ariaLabel"
>
  <input
    v-for="(_, index) in digits"
    :key="index"
    :ref="(element) => setInputElement(element, index)"
    class="o-code-input__field"
    :value="digits[index]"
    type="text"
    inputmode="numeric"
    pattern="[0-9]*"
    maxlength="1"
    :autocomplete="index === 0 ? 'one-time-code' : 'off'"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :aria-invalid="props.invalid || undefined"
    :aria-label="`${props.ariaLabel} ${index + 1}/${normalizedLength}`"
    @input="handleInput($event, index)"
    @keydown="handleKeydown($event, index)"
    @paste="handlePaste($event, index)"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  />
</div>
```

- [ ] **Step 6: Add focused token-based Less**

Create `code-input/style/index.less`:

```less
.o-code-input {
  --omg-code-input-size: var(--omg-control-height-md);
  --omg-code-input-gap: var(--omg-space-2);

  display: inline-flex;
  max-inline-size: 100%;
  gap: var(--omg-code-input-gap);
}

.o-code-input__field {
  flex: 0 1 var(--omg-code-input-size);
  min-inline-size: 0;
  inline-size: var(--omg-code-input-size);
  block-size: var(--omg-code-input-size);
  box-sizing: border-box;
  border: 1px solid var(--omg-color-border);
  border-radius: var(--omg-radius-md);
  background: var(--omg-color-surface);
  color: var(--omg-color-text);
  font: inherit;
  font-weight: var(--omg-font-weight-bold);
  text-align: center;
}

.o-code-input__field:focus-visible {
  outline: 3px solid var(--omg-color-focus-ring);
  outline-offset: 2px;
}

.o-code-input.is-invalid .o-code-input__field {
  border-color: var(--omg-color-danger);
}

.o-code-input__field:disabled {
  cursor: not-allowed;
  opacity: 0.56;
}

.o-code-input__field[readonly] {
  background: var(--omg-color-surface-muted);
}

.o-code-input--sm {
  --omg-code-input-size: var(--omg-control-height-sm);
  --omg-code-input-gap: var(--omg-space-1);
}

.o-code-input--lg {
  --omg-code-input-size: var(--omg-control-height-lg);
  --omg-code-input-gap: var(--omg-space-3);
}
```

The flex basis and `min-inline-size: 0` allow all six fields to shrink inside narrow consumers without introducing a viewport-specific breakpoint.

- [ ] **Step 7: Add explicit exports and pass tests**

```ts
export { default as OCodeInput } from './src/OCodeInput.vue'
export { oCodeInputProps, oCodeInputSizes, sanitizeOCodeInputValue } from './src/code-input'
export type {
  OCodeInputEmits,
  OCodeInputExpose,
  OCodeInputProps,
  OCodeInputSize,
} from './src/code-input'
```

Run:

```bash
pnpm exec vitest run packages/ui/src/components/code-input
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: all code-input tests pass and typecheck exits 0.

- [ ] **Step 8: Commit OCodeInput**

```bash
git add packages/ui/src/components/code-input
git commit -m "feat: add verification code input"
```

---

### Task 4: Add ODivider

**Files:**

- Create: `packages/ui/src/components/divider/src/divider.ts`
- Create: `packages/ui/src/components/divider/src/ODivider.vue`
- Create: `packages/ui/src/components/divider/style/index.less`
- Create: `packages/ui/src/components/divider/__tests__/divider.test.ts`
- Create: `packages/ui/src/components/divider/index.ts`

**Interfaces:**

- Produces: `ODivider`, `oDividerProps`, `oDividerDirections`, `oDividerContentPositions`, `ODividerProps`, `ODividerDirection`, `ODividerContentPosition`, and `ODividerSlots`.

- [ ] **Step 1: Write failing divider tests**

```ts
test('renders a horizontal semantic separator by default', () => {
  const wrapper = mount(ODivider)
  expect(wrapper.attributes()).toMatchObject({
    role: 'separator',
    'aria-orientation': 'horizontal',
  })
  expect(wrapper.classes()).toContain('o-divider--horizontal')
})

test('renders horizontal content in the requested position', () => {
  const wrapper = mount(ODivider, {
    props: { contentPosition: 'left', dashed: true },
    slots: { default: () => 'Details' },
  })
  expect(wrapper.classes()).toEqual(
    expect.arrayContaining(['o-divider--content-left', 'o-divider--dashed']),
  )
  expect(wrapper.get('.o-divider__content').text()).toBe('Details')
})

test('does not render content in vertical mode', () => {
  const wrapper = mount(ODivider, {
    props: { direction: 'vertical' },
    slots: { default: () => 'Ignored' },
  })
  expect(wrapper.attributes('aria-orientation')).toBe('vertical')
  expect(wrapper.find('.o-divider__content').exists()).toBe(false)
})
```

- [ ] **Step 2: Run the suite and verify missing-component failure**

Run `pnpm exec vitest run packages/ui/src/components/divider`.

Expected: suite cannot import `ODivider`.

- [ ] **Step 3: Define props, types, and slots**

```ts
import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oDividerDirections = ['horizontal', 'vertical'] as const
export const oDividerContentPositions = ['left', 'center', 'right'] as const
export type ODividerDirection = (typeof oDividerDirections)[number]
export type ODividerContentPosition = (typeof oDividerContentPositions)[number]

export const oDividerProps = {
  direction: {
    type: String as PropType<ODividerDirection>,
    default: 'horizontal',
    validator: (value: unknown): value is ODividerDirection =>
      oDividerDirections.some((direction) => direction === value),
  },
  dashed: Boolean,
  contentPosition: {
    type: String as PropType<ODividerContentPosition>,
    default: 'center',
    validator: (value: unknown): value is ODividerContentPosition =>
      oDividerContentPositions.some((position) => position === value),
  },
} as const

export type ODividerProps = ExtractPublicPropTypes<typeof oDividerProps>
export interface ODividerSlots {
  default?: () => VNodeChild
}
```

- [ ] **Step 4: Implement semantic rendering**

Create `ODivider.vue`:

```vue
<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { oDividerProps, type ODividerSlots } from './divider'

defineOptions({ name: 'ODivider' })

const props = defineProps(oDividerProps)
const slots = useSlots()
defineSlots<ODividerSlots>()

const hasContent = computed(() => props.direction === 'horizontal' && Boolean(slots.default))
</script>

<template>
  <div
    class="o-divider"
    :class="[
      `o-divider--${props.direction}`,
      `o-divider--content-${props.contentPosition}`,
      {
        'o-divider--dashed': props.dashed,
        'o-divider--with-content': hasContent,
      },
    ]"
    role="separator"
    :aria-orientation="props.direction"
  >
    <span v-if="hasContent" class="o-divider__line" aria-hidden="true" />
    <span v-if="hasContent" class="o-divider__content"><slot /></span>
    <span class="o-divider__line" aria-hidden="true" />
  </div>
</template>
```

- [ ] **Step 5: Add divider Less and exports**

```less
.o-divider {
  --omg-divider-color: var(--omg-color-border);
  --omg-divider-style: solid;

  box-sizing: border-box;
  color: var(--omg-color-text-muted);
}

.o-divider--horizontal {
  display: flex;
  inline-size: 100%;
  align-items: center;
  gap: var(--omg-space-3);
  margin-block: var(--omg-space-5);
}

.o-divider__line {
  flex: 1;
  border-block-start: 1px var(--omg-divider-style) var(--omg-divider-color);
}

.o-divider--vertical {
  display: inline-flex;
  block-size: 1em;
  margin-inline: var(--omg-space-2);
  border-inline-start: 1px var(--omg-divider-style) var(--omg-divider-color);
  vertical-align: middle;
}

.o-divider--vertical .o-divider__line {
  display: none;
}

.o-divider--dashed {
  --omg-divider-style: dashed;
}

.o-divider--content-left .o-divider__line:first-child,
.o-divider--content-right .o-divider__line:last-child {
  flex-grow: 0;
  flex-basis: var(--omg-space-6);
}
```

Create `divider/index.ts` with explicit value and type exports from `ODivider.vue` and `divider.ts`.

- [ ] **Step 6: Run tests and commit**

Run:

```bash
pnpm exec vitest run packages/ui/src/components/divider
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: divider tests pass and typecheck exits 0.

Commit:

```bash
git add packages/ui/src/components/divider
git commit -m "feat: add divider component"
```

---

### Task 5: Wire public exports, styles, SSR, and package contracts

**Files:**

- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.less`
- Modify: `packages/ui/vite.config.ts`
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/tests/ssr/ssr.test.ts`
- Modify: `packages/ui/tests/package/package-contract.test.ts`
- Modify: `scripts/check-naming.mjs`
- Modify: `scripts/test-package.mjs`

**Interfaces:**

- Consumes: all component entry files created in Tasks 1-4.
- Produces: supported imports from `@puzzle-fuzzy/ui`, `/avatar-group`, `/code-input`, and `/divider`.

- [ ] **Step 1: Expand package-contract tests first**

Add expected files:

```ts
'dist/components/avatar-group/index.js',
'dist/components/avatar-group/index.d.ts',
'dist/components/code-input/index.js',
'dist/components/code-input/index.d.ts',
'dist/components/divider/index.js',
'dist/components/divider/index.d.ts',
```

Add a manifest test asserting `./avatar`, `./avatar-group`, `./avatar-flow`, `./button`, `./code-input`, and `./divider` each provide `types` and `import` and never `require`.

- [ ] **Step 2: Add root exports and style imports**

Explicitly export all values and types in `src/index.ts`. Append:

```less
@import '../components/avatar-group/style/index.less';
@import '../components/code-input/style/index.less';
@import '../components/divider/style/index.less';
```

- [ ] **Step 3: Add Vite entries and package subpaths**

Add:

```ts
'components/avatar-group/index': fromPackageRoot('src/components/avatar-group/index.ts'),
'components/code-input/index': fromPackageRoot('src/components/code-input/index.ts'),
'components/divider/index': fromPackageRoot('src/components/divider/index.ts'),
```

Add matching manifest entries:

```json
"./avatar-group": {
  "types": "./dist/components/avatar-group/index.d.ts",
  "import": "./dist/components/avatar-group/index.js"
},
"./code-input": {
  "types": "./dist/components/code-input/index.d.ts",
  "import": "./dist/components/code-input/index.js"
},
"./divider": {
  "types": "./dist/components/divider/index.d.ts",
  "import": "./dist/components/divider/index.js"
}
```

- [ ] **Step 4: Expand SSR and naming checks**

Render `OAvatarGroup`, `OCodeInput`, and `ODivider` in `ssr.test.ts`; assert group/item markup, six inputs, and separator orientation. Update:

```js
const expectedComponents = [
  'avatar',
  'avatar-flow',
  'avatar-group',
  'button',
  'code-input',
  'divider',
]
```

- [ ] **Step 5: Expand the real-consumer package smoke test**

Add ATTW entrypoints:

```js
'./avatar-group',
'./code-input',
'./divider',
```

In the generated `App.vue`, import each subpath, construct a readonly `OAvatarGroupItem[]`, bind `ref('')` to `OCodeInput`, and render `ODivider`. The generated consumer must prove root and subpath types compile.

- [ ] **Step 6: Run integration checks**

Run:

```bash
pnpm check:naming
pnpm test
pnpm build
pnpm test:ssr
pnpm test:package
```

Expected: naming reports six components; component and SSR tests pass; the build emits every declared entry; package smoke, publint, ATTW, consumer typecheck, and consumer Vite build pass.

- [ ] **Step 7: Commit package integration**

```bash
git add packages/ui/src/index.ts packages/ui/src/styles packages/ui/vite.config.ts packages/ui/package.json packages/ui/tests scripts
git commit -m "build: publish new component entries"
```

---

### Task 6: Update documentation, examples, and browser tests

**Files:**

- Modify: `apps/docs/docs/.vitepress/config.mts`
- Modify: `apps/docs/docs/.vitepress/theme/custom.less`
- Modify: `apps/docs/docs/components/avatar.md`
- Modify: `apps/docs/docs/components/avatar-flow.md`
- Create: `apps/docs/docs/components/avatar-group.md`
- Create: `apps/docs/docs/components/code-input.md`
- Create: `apps/docs/docs/components/divider.md`
- Create: `apps/docs/examples/avatar/Stacking.vue`
- Modify: `apps/docs/examples/avatar-flow/Phases.vue`
- Create: `apps/docs/examples/code-input/Basic.vue`
- Create: `apps/docs/examples/divider/Variants.vue`
- Modify: `apps/docs/tests/e2e/components.spec.ts`

**Interfaces:**

- Consumes: published component APIs and styles.
- Produces: navigable docs and E2E coverage without VitePress brand-variable overrides.

- [ ] **Step 1: Remove only the VitePress brand override**

Delete:

```less
:root {
  --vp-c-brand-1: #1d4ed8;
  --vp-c-brand-2: #1e40af;
  --vp-c-brand-3: #1e3a8a;
  --vp-c-brand-soft: rgb(29 78 216 / 12%);
}
```

Keep docs-only use of VitePress layout variables such as `--vp-c-divider`; never declare another `--vp-c-brand-*`.

- [ ] **Step 2: Add aliases and navigation**

Add source-mode aliases for `/avatar-group`, `/code-input`, and `/divider`, then add sidebar entries and routes for Avatar Group, Code Input, and Divider. Preserve Chinese UTF-8 text.

- [ ] **Step 3: Add focused Vue examples**

`avatar/Stacking.vue` renders adjacent `OAvatar stacked` items and an `OAvatarGroup`, with custom colors and `+N`.

`code-input/Basic.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { OCodeInput } from '@puzzle-fuzzy/ui'

const code = ref('')
const completedCode = ref('')
</script>

<template>
  <div class="omg-example-stack">
    <OCodeInput v-model="code" aria-label="六位验证码" @complete="completedCode = $event" />
    <span>当前值：{{ code || '未输入' }}</span>
    <span v-if="completedCode">已完成：{{ completedCode }}</span>
  </div>
</template>
```

`divider/Variants.vue` demonstrates plain, labeled, dashed, left/center/right content, and vertical dividers. Update Flow examples to show the static line and three-dot active connector.

- [ ] **Step 4: Update component API pages**

Document every prop, event, slot, default, CSS variable, accessibility requirement, and import path across the three new component pages. Replace Flow’s visual-state explanation with: `transferring` shows three dots; other phases show the static line while live text remains authoritative.

- [ ] **Step 5: Update Playwright checks**

Add tests that navigate to all routes including `/components/avatar-group`, verify group overflow, verify exactly three Flow dots only while transferring, paste `123456` into `OCodeInput`, verify six visible digits and completion text, and verify horizontal/vertical divider semantics. Read the docs custom stylesheet and assert it contains no `--vp-c-brand-1` declaration.

- [ ] **Step 6: Build and run docs**

Run:

```bash
pnpm docs:build
pnpm test:e2e
```

Expected: VitePress builds all routes and Playwright passes every docs/component test.

- [ ] **Step 7: Commit docs**

```bash
git add apps/docs
git commit -m "docs: document avatar code input and divider"
```

---

### Task 7: Full quality gate and final cleanup

**Files:**

- Modify only files reported by formatting, lint, typecheck, tests, or package validation.

**Interfaces:**

- Consumes: the completed library and docs.
- Produces: a clean worktree-ready implementation satisfying all repository gates.

- [ ] **Step 1: Scan for forbidden and legacy names**

Run `rg -n -- '--vp-c-brand-|o-avatar-flow__phase-marker|o-avatar-flow__particle' packages apps scripts`.

Expected: no source declaration of `--vp-c-brand-*` and no legacy Flow class. Historical design documents may describe the removed names.

- [ ] **Step 2: Format and inspect the diff**

Run:

```bash
pnpm format
git diff --check
git status --short
```

Expected: no whitespace errors and only planned files are modified.

- [ ] **Step 3: Run the complete verification pipeline**

Run `pnpm verify`.

Expected:

- Prettier, ESLint, Stylelint, and naming checks pass.
- Vue/TypeScript typecheck passes.
- Component coverage meets the configured thresholds.
- Library build and declarations pass.
- SSR, package contract, publint, ATTW, temporary consumer, VitePress build, and Playwright pass.

- [ ] **Step 4: Review the packed artifact**

Run:

```bash
pnpm --dir packages/ui pack --pack-destination .tmp-package-review
```

Confirm the tarball contains root JS/types, `styles.css`, and all six component subpaths (`button`, `avatar`, `avatar-group`, `avatar-flow`, `code-input`, `divider`) with no `.vue`, tests, source, lockfiles, or sourcemaps. Remove only the verified repository-local `.tmp-package-review` directory afterward.

- [ ] **Step 5: Commit verification-only fixes**

If checks changed files:

```bash
git add -A
git commit -m "chore: finalize component quality checks"
```

Do not create an empty commit.

- [ ] **Step 6: Report final evidence**

Record the final `pnpm verify` result, test count, coverage summary, package file count, branch status, and commit list. Do not push unless the user has authorized pushing this new batch.
