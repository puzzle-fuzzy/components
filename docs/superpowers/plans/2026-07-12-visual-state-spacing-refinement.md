# Visual State and Spacing Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine Code Input proportions and focus styling, reduce Avatar Flow to three animated visual states, and expose adjustable Avatar Group overlap.

**Architecture:** Keep all changes inside the existing Vue component boundaries. `OCodeInput` changes only tokenized Less; `OAvatarGroup` converts a public overlap value into one local CSS variable; `OAvatarFlow` replaces business-oriented phases and live announcements with three explicit visual states and CSS-only animation.

**Tech Stack:** Vue 3.5 SFCs, TypeScript 6, Less, Vite 8, Vitest 4, Vue Test Utils, VitePress, Playwright, pnpm 11, Node 24.

## Global Constraints

- The library remains Vue-only, ESM-only, and has no new runtime dependencies.
- Use `O*` components, `.o-*` classes, and `--omg-*` custom properties.
- Do not retain compatibility aliases for the old Avatar Flow phase API.
- Components contain presentation and interaction only; consumers own all business-state mapping.
- Motion must stop under `prefers-reduced-motion: reduce` while visual state remains distinguishable.
- Code Input focus uses border changes only: no visible outline, box-shadow, or glow.
- Preserve all existing Code Input value and keyboard behavior.
- Use pnpm/Node/Vite/Vitest as established by the current UI-library architecture.

---

## File Structure

### Component files

- `packages/ui/src/components/code-input/style/index.less`: rectangular dimensions and border-only focus.
- `packages/ui/src/components/code-input/__tests__/code-input.test.ts`: style contract regression tests.
- `packages/ui/src/components/avatar-group/src/avatar-group.ts`: overlap prop and normalization helper.
- `packages/ui/src/components/avatar-group/src/OAvatarGroup.vue`: scoped overlap CSS variable.
- `packages/ui/src/components/avatar-group/__tests__/avatar-group.test.ts`: overlap normalization/rendering tests.
- `packages/ui/src/components/avatar-flow/src/avatar-flow.ts`: three-state runtime and public types.
- `packages/ui/src/components/avatar-flow/src/OAvatarFlow.vue`: three visual connector variants and image semantics.
- `packages/ui/src/components/avatar-flow/style/index.less`: dot and moving-dash animations.
- `packages/ui/src/components/avatar-flow/__tests__/avatar-flow.test.ts`: state, DOM, CSS, and reduced-motion tests.
- `packages/ui/src/components/avatar-flow/index.ts`: renamed explicit exports.
- `packages/ui/src/index.ts`: renamed root exports.

### Integration and documentation files

- `packages/ui/tests/ssr/ssr.test.ts`
- `scripts/test-package.mjs`
- `apps/docs/examples/avatar-flow/States.vue`
- `apps/docs/examples/avatar-flow/Phases.vue` (delete)
- `apps/docs/docs/components/avatar-flow.md`
- `apps/docs/docs/components/avatar-group.md`
- `apps/docs/docs/components/code-input.md`
- `apps/docs/examples/avatar/Stacking.vue`
- `apps/docs/tests/e2e/components.spec.ts`

No package-manifest subpath change is needed because the component entry paths stay the same.

---

### Task 1: Refine OCodeInput proportions and focus border

**Files:**

- Modify: `packages/ui/src/components/code-input/style/index.less`
- Modify: `packages/ui/src/components/code-input/__tests__/code-input.test.ts`
- Modify: `apps/docs/docs/components/code-input.md`

**Interfaces:**

- Consumes: existing `OCodeInputSize = 'sm' | 'md' | 'lg'`.
- Produces CSS variables: `--omg-code-input-width`, `--omg-code-input-height`.
- Preserves all TypeScript props, emits, exposed methods, and input behavior.

- [ ] **Step 1: Write failing style-contract tests**

Replace the square-size assertion with exact rectangular dimensions and border-only focus checks:

```ts
it('uses rectangular size tokens and a border-only focus indicator', () => {
  expect(codeInputStyles).toContain('--omg-code-input-width: 40px')
  expect(codeInputStyles).toContain('--omg-code-input-height: 48px')
  expect(codeInputStyles).toContain('--omg-code-input-width: 32px')
  expect(codeInputStyles).toContain('--omg-code-input-height: 40px')
  expect(codeInputStyles).toContain('--omg-code-input-width: 48px')
  expect(codeInputStyles).toContain('--omg-code-input-height: 56px')
  expect(codeInputStyles).toContain('border-width: 2px')
  expect(codeInputStyles).toContain('border-color: var(--omg-color-brand)')
  expect(codeInputStyles).toContain('outline: none')
  expect(codeInputStyles).not.toContain('box-shadow')
})

it('keeps an invalid focus border dangerous', () => {
  expect(codeInputStyles).toMatch(
    /\.o-code-input\.is-invalid[\s\S]*\.o-code-input__field:focus[\s\S]*var\(--omg-color-danger\)/u,
  )
})
```

- [ ] **Step 2: Run the focused test and verify failure**

Run `pnpm exec vitest run packages/ui/src/components/code-input`.

Expected: the style-contract cases fail because the current component uses one square size and a visible outline.

- [ ] **Step 3: Split width and height variables**

Replace the root dimensions and size modifiers with:

```less
.o-code-input {
  --omg-code-input-width: 40px;
  --omg-code-input-height: 48px;
  --omg-code-input-gap: var(--omg-space-2);
  --omg-code-input-border-color: var(--omg-color-border);
  --omg-code-input-background: var(--omg-color-surface);
}

.o-code-input__field {
  flex: 0 1 var(--omg-code-input-width);
  min-inline-size: 0;
  inline-size: var(--omg-code-input-width);
  block-size: var(--omg-code-input-height);
}

.o-code-input--sm {
  --omg-code-input-width: 32px;
  --omg-code-input-height: 40px;
  --omg-code-input-gap: var(--omg-space-1);
}

.o-code-input--lg {
  --omg-code-input-width: 48px;
  --omg-code-input-height: 56px;
  --omg-code-input-gap: var(--omg-space-3);
}
```

- [ ] **Step 4: Replace outline focus with border focus**

```less
.o-code-input__field {
  border: 1px solid var(--omg-code-input-border-color);
  transition:
    border-color var(--omg-duration-fast) var(--omg-easing-standard),
    border-width var(--omg-duration-fast) var(--omg-easing-standard);

  &:focus {
    border-width: 2px;
    border-color: var(--omg-color-brand);
    outline: none;
  }
}

.o-code-input.is-invalid .o-code-input__field,
.o-code-input.is-invalid .o-code-input__field:focus {
  border-color: var(--omg-color-danger);
}

@media (prefers-reduced-motion: reduce) {
  .o-code-input__field {
    transition: none;
  }
}
```

Do not add `box-shadow`.

- [ ] **Step 5: Update Code Input documentation**

Add the three width/height pairs and state that focus is represented by a 2px border. Keep the existing API and keyboard sections unchanged.

- [ ] **Step 6: Run focused checks**

Run:

```bash
pnpm exec vitest run packages/ui/src/components/code-input
pnpm --filter @puzzle-fuzzy/ui typecheck
pnpm exec stylelint "packages/ui/src/components/code-input/style/index.less" "packages/ui/src/components/code-input/src/OCodeInput.vue"
```

Expected: all Code Input tests, typecheck, and Stylelint pass.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/code-input apps/docs/docs/components/code-input.md
git commit -m "style: refine verification code fields"
```

---

### Task 2: Add adjustable OAvatarGroup overlap

**Files:**

- Modify: `packages/ui/src/components/avatar-group/src/avatar-group.ts`
- Modify: `packages/ui/src/components/avatar-group/src/OAvatarGroup.vue`
- Modify: `packages/ui/src/components/avatar-group/__tests__/avatar-group.test.ts`
- Modify: `packages/ui/src/components/avatar-group/index.ts`
- Modify: `packages/ui/src/index.ts`
- Modify: `apps/docs/examples/avatar/Stacking.vue`
- Modify: `apps/docs/docs/components/avatar-group.md`

**Interfaces:**

- Produces: `overlap?: number | string` on `OAvatarGroupProps`.
- Produces: `normalizeOAvatarGroupOverlap(value: number | string | undefined): string | undefined`.
- Continues to use `--omg-avatar-group-overlap` as the only group-level style input.

- [ ] **Step 1: Write failing overlap tests**

```ts
it.each([
  [undefined, undefined],
  [12, '12px'],
  [2.5, '2.5px'],
  [-4, '0px'],
  [Number.POSITIVE_INFINITY, undefined],
  ['', undefined],
  ['   ', undefined],
  ['0.75rem', '0.75rem'],
  ['  12px  ', '12px'],
] as const)('normalizes overlap %s to %s', (value, expected) => {
  expect(normalizeOAvatarGroupOverlap(value)).toBe(expected)
})

it('applies numeric and string overlap through a local CSS variable', async () => {
  const wrapper = mount(OAvatarGroup, { props: { items, overlap: 12 } })

  expect(wrapper.attributes('style')).toContain('--omg-avatar-group-overlap: 12px')
  await wrapper.setProps({ overlap: '0.75rem' })
  expect(wrapper.attributes('style')).toContain('--omg-avatar-group-overlap: 0.75rem')
})

it('does not emit an inline override when overlap is absent or invalid', () => {
  expect(mount(OAvatarGroup, { props: { items } }).attributes('style')).toBeUndefined()
  expect(
    mount(OAvatarGroup, {
      props: { items, overlap: Number.POSITIVE_INFINITY },
    }).attributes('style'),
  ).toBeUndefined()
})
```

- [ ] **Step 2: Run the group suite and verify failure**

Run `pnpm exec vitest run packages/ui/src/components/avatar-group`.

Expected: imports and props fail because overlap does not exist.

- [ ] **Step 3: Define and normalize overlap**

Add to `avatar-group.ts`:

```ts
export type OAvatarGroupOverlap = number | string

export const normalizeOAvatarGroupOverlap = (
  value: OAvatarGroupOverlap | undefined,
): string | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? `${Math.max(0, value)}px` : undefined
  }

  const normalized = value?.trim()
  return normalized || undefined
}
```

Add:

```ts
overlap: [Number, String] as PropType<OAvatarGroupOverlap | undefined>,
```

Export `OAvatarGroupOverlap` and `normalizeOAvatarGroupOverlap` through the component entry and root entry.

- [ ] **Step 4: Bind the local CSS variable**

In `OAvatarGroup.vue`:

```ts
import { computed, type CSSProperties } from 'vue'
import {
  normalizeOAvatarGroupMax,
  normalizeOAvatarGroupOverlap,
  oAvatarGroupProps,
} from './avatar-group'

const groupStyle = computed<CSSProperties>(() => {
  const overlap = normalizeOAvatarGroupOverlap(props.overlap)
  return overlap ? { '--omg-avatar-group-overlap': overlap } : {}
})
```

Bind `:style="groupStyle"` to the root. Vue merges consumer styles with this local variable.

- [ ] **Step 5: Update example and docs**

Demonstrate `:overlap="12"` and `overlap="0.5rem"`. Add the prop and normalization rules to the API table; retain the CSS-variable escape hatch.

- [ ] **Step 6: Run focused checks**

Run:

```bash
pnpm exec vitest run packages/ui/src/components/avatar-group packages/ui/src/components/avatar-flow
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: group and Flow tests pass, proving Flow still composes the same group.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/avatar-group packages/ui/src/index.ts apps/docs/examples/avatar/Stacking.vue apps/docs/docs/components/avatar-group.md
git commit -m "feat: make avatar overlap configurable"
```

---

### Task 3: Replace Avatar Flow phases with three visual states

**Files:**

- Modify: `packages/ui/src/components/avatar-flow/src/avatar-flow.ts`
- Modify: `packages/ui/src/components/avatar-flow/src/OAvatarFlow.vue`
- Modify: `packages/ui/src/components/avatar-flow/style/index.less`
- Modify: `packages/ui/src/components/avatar-flow/__tests__/avatar-flow.test.ts`
- Modify: `packages/ui/src/components/avatar-flow/index.ts`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Deletes: `oAvatarFlowPhases`, `OAvatarFlowPhase`, `phase`, and `accessibleLabel`.
- Produces: `oAvatarFlowStates`, `OAvatarFlowState`, `state`, and `ariaLabel`.
- State vocabulary is exactly `loading | connected | transferring`; default is `connected`.

- [ ] **Step 1: Rewrite failing public-contract tests**

Use:

```ts
it('publishes exactly three visual states', () => {
  expect(oAvatarFlowStates).toEqual(['loading', 'connected', 'transferring'])
  expect(oAvatarFlowProps.state.default).toBe('connected')
  expect(oAvatarFlowProps.state.validator('loading')).toBe(true)
  expect(oAvatarFlowProps.state.validator('idle')).toBe(false)
})

it('uses image semantics without a live region', () => {
  const wrapper = mountFlow({ ariaLabel: 'Loading avatar connection' })

  expect(wrapper.attributes('role')).toBe('img')
  expect(wrapper.attributes('aria-label')).toBe('Loading avatar connection')
  expect(wrapper.attributes('aria-live')).toBeUndefined()
  expect(wrapper.find('.o-avatar-flow__live-status').exists()).toBe(false)
})
```

Replace the connector matrix with:

```ts
it('renders animated dots for loading', () => {
  const wrapper = mountFlow({ state: 'loading' })
  expect(wrapper.attributes('data-state')).toBe('loading')
  expect(wrapper.findAll('.o-avatar-flow__dot')).toHaveLength(3)
  expect(wrapper.find('.o-avatar-flow__line').exists()).toBe(false)
  expect(wrapper.find('.o-avatar-flow__dash-line').exists()).toBe(false)
})

it('renders a static solid line for connected', () => {
  const wrapper = mountFlow({ state: 'connected' })
  expect(wrapper.find('.o-avatar-flow__line').exists()).toBe(true)
  expect(wrapper.find('.o-avatar-flow__dots').exists()).toBe(false)
  expect(wrapper.find('.o-avatar-flow__dash-line').exists()).toBe(false)
})

it('renders a moving dashed line for transferring', () => {
  const wrapper = mountFlow({ state: 'transferring' })
  expect(wrapper.find('.o-avatar-flow__dash-line').exists()).toBe(true)
  expect(wrapper.find('.o-avatar-flow__line').exists()).toBe(false)
  expect(wrapper.find('.o-avatar-flow__dots').exists()).toBe(false)
})
```

- [ ] **Step 2: Run Flow tests and verify failure**

Run `pnpm exec vitest run packages/ui/src/components/avatar-flow`.

Expected: compile/runtime failures reference removed phase names and missing new state DOM.

- [ ] **Step 3: Replace the public type vocabulary**

In `avatar-flow.ts`:

```ts
export const oAvatarFlowStates = ['loading', 'connected', 'transferring'] as const
export type OAvatarFlowState = (typeof oAvatarFlowStates)[number]

export const isOAvatarFlowState = (value: unknown): value is OAvatarFlowState =>
  typeof value === 'string' && oAvatarFlowStates.some((state) => state === value)
```

Replace the props:

```ts
state: {
  type: String as PropType<OAvatarFlowState>,
  default: 'connected',
  validator: isOAvatarFlowState,
},
ariaLabel: {
  type: String,
  required: true,
},
```

Delete all phase helpers and exports rather than aliasing them.

- [ ] **Step 4: Replace Flow semantics and connector DOM**

Root:

```vue
<div
  class="o-avatar-flow"
  :data-state="props.state"
  role="img"
  :aria-label="props.ariaLabel"
>
  <div class="o-avatar-flow__inner" aria-hidden="true">
```

Connector:

```vue
<span class="o-avatar-flow__connector" :data-state="props.state">
  <span v-if="props.state === 'loading'" class="o-avatar-flow__dots">
    <span class="o-avatar-flow__dot" />
    <span class="o-avatar-flow__dot" />
    <span class="o-avatar-flow__dot" />
  </span>
  <span v-else-if="props.state === 'connected'" class="o-avatar-flow__line" />
  <span v-else class="o-avatar-flow__dash-line" />
</span>
```

Delete the hidden live-status node and all live-region attributes.

- [ ] **Step 5: Implement loading and transfer animations**

Add variables:

```less
.o-avatar-flow {
  --omg-avatar-flow-dot-size: var(--omg-space-1);
  --omg-avatar-flow-dot-lift: calc(var(--omg-space-1) * -0.5);
  --omg-avatar-flow-dash-size: 6px;
  --omg-avatar-flow-dash-gap: 4px;
  --omg-avatar-flow-loading-duration: 900ms;
  --omg-avatar-flow-transfer-duration: 700ms;
}
```

Loading:

```less
.o-avatar-flow__dot {
  inline-size: var(--omg-avatar-flow-dot-size);
  block-size: var(--omg-avatar-flow-dot-size);
  border-radius: var(--omg-radius-full);
  background: currentcolor;
  animation: o-avatar-flow-loading var(--omg-avatar-flow-loading-duration)
    var(--omg-easing-standard) infinite;
}

.o-avatar-flow__dot:nth-child(2) {
  animation-delay: -600ms;
}

.o-avatar-flow__dot:nth-child(3) {
  animation-delay: -300ms;
}

@keyframes o-avatar-flow-loading {
  0%,
  60%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }

  30% {
    opacity: 1;
    transform: translateY(var(--omg-avatar-flow-dot-lift));
  }
}
```

Transfer:

```less
.o-avatar-flow__dash-line {
  inline-size: 100%;
  block-size: 1px;
  background-image: repeating-linear-gradient(
    to right,
    currentcolor 0 var(--omg-avatar-flow-dash-size),
    transparent var(--omg-avatar-flow-dash-size)
      calc(var(--omg-avatar-flow-dash-size) + var(--omg-avatar-flow-dash-gap))
  );
  background-position: 0 0;
  animation: o-avatar-flow-transfer var(--omg-avatar-flow-transfer-duration) linear infinite;
}

@keyframes o-avatar-flow-transfer {
  to {
    background-position: calc(var(--omg-avatar-flow-dash-size) + var(--omg-avatar-flow-dash-gap)) 0;
  }
}
```

Reduced motion:

```less
@media (prefers-reduced-motion: reduce) {
  .o-avatar-flow__dot,
  .o-avatar-flow__dash-line {
    animation: none;
  }

  .o-avatar-flow__dot {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 6: Export only new state names**

`avatar-flow/index.ts`:

```ts
export { default as OAvatarFlow } from './src/OAvatarFlow.vue'
export { oAvatarFlowProps, oAvatarFlowStates } from './src/avatar-flow'
export type { OAvatarFlowPeer, OAvatarFlowProps, OAvatarFlowState } from './src/avatar-flow'
```

Mirror these explicit names in `packages/ui/src/index.ts`.

- [ ] **Step 7: Run focused checks**

Run:

```bash
pnpm exec vitest run packages/ui/src/components/avatar-flow
pnpm --filter @puzzle-fuzzy/ui typecheck
pnpm exec stylelint "packages/ui/src/components/avatar-flow/style/index.less" "packages/ui/src/components/avatar-flow/src/OAvatarFlow.vue"
```

Expected: Flow tests and typecheck pass; styles contain both keyframes and a reduced-motion override.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/avatar-flow packages/ui/src/index.ts
git commit -m "refactor: reduce avatar flow to visual states"
```

---

### Task 4: Update SSR, package consumer, docs, and browser behavior

**Files:**

- Modify: `packages/ui/tests/ssr/ssr.test.ts`
- Modify: `scripts/test-package.mjs`
- Create: `apps/docs/examples/avatar-flow/States.vue`
- Delete: `apps/docs/examples/avatar-flow/Phases.vue`
- Modify: `apps/docs/docs/components/avatar-flow.md`
- Modify: `apps/docs/tests/e2e/components.spec.ts`

**Interfaces:**

- Consumes: `state`, `ariaLabel`, `oAvatarFlowStates`, and `OAvatarFlowState`.
- Produces: public examples and contract tests with no reference to phase or live status.

- [ ] **Step 1: Update SSR expectations**

Render:

```ts
h(OAvatarFlow, {
  ariaLabel: 'Transferring between avatars',
  receivers,
  sender,
  state: 'transferring',
})
```

Assert:

```ts
expect(html).toContain('role="img"')
expect(html).toContain('aria-label="Transferring between avatars"')
expect(html).toContain('data-state="transferring"')
expect(html).toContain('o-avatar-flow__dash-line')
expect(html).not.toContain('aria-live')
```

- [ ] **Step 2: Update the real package consumer**

In the generated `App.vue`, replace:

```vue
<OAvatarFlow
  accessible-label="Package consumer smoke test"
  :receivers="receivers"
  :sender="sender"
/>
```

with:

```vue
<OAvatarFlow
  aria-label="Package consumer smoke test"
  :receivers="receivers"
  :sender="sender"
  state="transferring"
/>
```

Keep the same ATTW entrypoint; no manifest change is required.

- [ ] **Step 3: Replace the phase example with a state example**

Create `States.vue`:

```vue
<script setup lang="ts">
import { OAvatarFlow, type OAvatarFlowPeer, type OAvatarFlowState } from '@puzzle-fuzzy/ui'

const sender: OAvatarFlowPeer = { id: 'sender', name: 'OMG UI' }
const receivers: readonly OAvatarFlowPeer[] = [
  { id: 'vue', name: 'Vue' },
  { id: 'docs', name: 'Docs' },
  { id: 'tests', name: 'Tests' },
  { id: 'build', name: 'Build' },
]

const states: readonly { state: OAvatarFlowState; label: string }[] = [
  { state: 'loading', label: '加载视觉状态' },
  { state: 'connected', label: '连接视觉状态' },
  { state: 'transferring', label: '传输视觉状态' },
]
</script>

<template>
  <div class="omg-example-stack">
    <OAvatarFlow
      v-for="item in states"
      :key="item.state"
      :aria-label="item.label"
      :receivers="receivers"
      :sender="sender"
      :state="item.state"
    />
  </div>
</template>
```

Delete `Phases.vue`.

- [ ] **Step 4: Rewrite Flow documentation**

Document exactly three visual states:

- `loading`: animated dots;
- `connected`: static solid line;
- `transferring`: moving dashed line.

Update usage to `state="transferring"` and `aria-label`. Remove the five-stage table, `accessibleLabel`, live-region guidance, and all business-state wording.

- [ ] **Step 5: Update Playwright animation tests**

Normal-motion test:

```ts
await page.goto('/components/avatar-flow')

const loading = page.locator('.o-avatar-flow[data-state="loading"]')
const connected = page.locator('.o-avatar-flow[data-state="connected"]')
const transferring = page.locator('.o-avatar-flow[data-state="transferring"]')

await expect(loading.locator('.o-avatar-flow__dot')).toHaveCount(3)
await expect(loading.locator('.o-avatar-flow__dot').first()).not.toHaveCSS('animation-name', 'none')
await expect(connected.locator('.o-avatar-flow__line')).toBeVisible()
await expect(transferring.locator('.o-avatar-flow__dash-line')).not.toHaveCSS(
  'animation-name',
  'none',
)
```

Reduced-motion test:

```ts
await page.emulateMedia({ reducedMotion: 'reduce' })
await page.goto('/components/avatar-flow')
await expect(page.locator('.o-avatar-flow__dot').first()).toHaveCSS('animation-name', 'none')
await expect(page.locator('.o-avatar-flow__dash-line')).toHaveCSS('animation-name', 'none')
```

Continue running axe against the docs demo.

- [ ] **Step 6: Run integration checks**

Run:

```bash
pnpm test:ssr
pnpm test:package
pnpm docs:build
pnpm --filter @puzzle-fuzzy/docs test:e2e
```

Expected: SSR, tarball consumer, VitePress, animation checks, reduced motion, and axe pass.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/tests/ssr/ssr.test.ts scripts/test-package.mjs apps/docs
git commit -m "docs: update visual state examples"
```

---

### Task 5: Run the complete quality gate and publish-ready review

**Files:**

- Modify only files reported by formatting, linting, typing, tests, or package verification.

**Interfaces:**

- Consumes: completed visual-state, spacing, and Code Input changes.
- Produces: a clean branch with verified source, docs, and package artifacts.

- [ ] **Step 1: Scan for stale API names**

Run:

```bash
rg -n "OAvatarFlowPhase|oAvatarFlowPhases|accessibleLabel|data-phase|phase=" packages apps scripts
```

Expected: no Avatar Flow source, test, docs, or generated-consumer reference remains. Historical design and plan documents are outside this command’s scope.

- [ ] **Step 2: Scan focus and animation contracts**

Run:

```bash
rg -n "box-shadow|outline:" packages/ui/src/components/code-input
rg -n "o-avatar-flow-loading|o-avatar-flow-transfer|prefers-reduced-motion" packages/ui/src/components/avatar-flow
```

Expected: Code Input contains only `outline: none` and no box-shadow; Flow contains two keyframes and the reduced-motion override.

- [ ] **Step 3: Format and inspect**

Run:

```bash
pnpm format
git diff --check
git status --short
```

Expected: no whitespace errors and only planned files are modified.

- [ ] **Step 4: Run the complete verification pipeline**

Run `pnpm verify`.

Expected:

- Prettier, ESLint, Stylelint, naming, and both workspace typechecks pass.
- All component tests meet configured coverage thresholds.
- Build, declarations, SSR, package contract, publint, ATTW, and temporary Vue/Vite consumer pass.
- VitePress and all Playwright/axe checks pass.

- [ ] **Step 5: Review artifact and commit any verification fixes**

Use the successful `pnpm test:package` output to confirm all six subpaths, root JS/types, and `styles.css` remain in the tarball, with no source/tests/maps. If verification changed files:

```bash
git add -A
git commit -m "chore: finalize visual state refinements"
```

Do not create an empty commit.

- [ ] **Step 6: Report**

Report the final test counts, coverage, package file count, commit list, and whether the branch is ahead of `origin/main`. Do not push without explicit user authorization.
