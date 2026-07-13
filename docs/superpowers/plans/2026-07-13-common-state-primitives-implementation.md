# Common State Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-ready `OSwitch`, `OTooltip`, `OAlert`, and `OSkeleton` families to OMG UI with complete publication, documentation, SSR, accessibility, and browser contracts.

**Architecture:** Each family remains an independent leaf component. Tooltip alone consumes the existing internal controllable-open and floating-panel composables; the floating helper gains additive orthogonal placement and reactive-offset support while retaining current Select and Dropdown defaults. Shared integration stays explicit in the package, build, style, naming, SSR, and VitePress registries.

**Tech Stack:** Node.js 24 LTS, pnpm, Vue 3, TypeScript, Less, Vite, Vitest, Vue Test Utils, Floating UI, `vue-icons-plus/lu`, VitePress, Playwright, axe.

## Global Constraints

- Use pnpm only; do not add Bun files or scripts.
- Public names use `O*`, `.o-*`, and `--omg-*`.
- Every component remains Vue-only and UI-only.
- Built-in icons come only from `vue-icons-plus/lu`.
- Use opaque surfaces and no decorative outer border.
- Preserve Image's independent Teleport preview and Tabs' current visual effects.
- Do not introduce or modify VitePress `--vp-*` variables.
- Follow the approved design in `docs/superpowers/specs/2026-07-13-common-state-primitives-design.md`.
- Run focused tests first and `pnpm verify` before publication.

## File Map

### Component lanes

- `packages/ui/src/components/switch/*`: native switch contract, behavior, styles, and unit tests.
- `packages/ui/src/components/alert/*`: inline feedback contract, icons, styles, and unit tests.
- `packages/ui/src/components/skeleton/*`: atomic loading placeholder, normalization, styles, and unit tests.
- `packages/ui/src/components/tooltip/*`: cloned trigger, delayed controlled state, floating layer, styles, and unit tests.
- `packages/ui/src/composables/use-floating-panel.ts` and its test: twelve placements, reactive offset, and component-ref resolution.

### Shared publication lane

- `packages/ui/src/index.ts`, `packages/ui/src/styles/index.less`, `packages/ui/vite.config.ts`, `packages/ui/package.json`: root, CSS, build, and subpath exports.
- `scripts/check-naming.mjs`, `scripts/test-package.mjs`, `packages/ui/tests/ssr/ssr.test.ts`, `packages/ui/tests/package/package-contract.test.ts`: naming, SSR, declaration, tarball, and real-consumer contracts.

### Documentation lane

- `apps/docs/docs/components/{switch,tooltip,alert,skeleton}.md`: complete capability and API pages.
- `apps/docs/examples/{switch,tooltip,alert,skeleton}/*.vue`: live examples.
- `apps/docs/docs/.vitepress/config.mts`, overview/home/README files: aliases, navigation, and counts.
- `apps/docs/tests/e2e/components.spec.ts`: keyboard, hover, motion, theme, RTL, compact, and axe checks.
- `DESIGN.md`, `PRODUCT.md`, `.impeccable/design.json`: durable design records.

---

### Task 1: Build OSwitch

**Files:**

- Create: `packages/ui/src/components/switch/src/switch.ts`
- Create: `packages/ui/src/components/switch/src/OSwitch.vue`
- Create: `packages/ui/src/components/switch/style/index.less`
- Create: `packages/ui/src/components/switch/__tests__/switch.test.ts`
- Create: `packages/ui/src/components/switch/index.ts`

**Interfaces:**

- Consumes: Vue native checkbox behavior, `useId`, `LuLoaderCircle`, existing semantic tokens.
- Produces: `OSwitch`, `oSwitchProps`, `oSwitchSizes`, `OSwitchProps`, `OSwitchSize`, `OSwitchEmits`, and `OSwitchSlots`.

- [ ] **Step 1: Write failing public and native-behavior tests**

Create tests that assert this vocabulary and behavior:

```ts
expect(oSwitchSizes).toEqual(['sm', 'md'])
expect(oSwitchProps.size.default).toBe('md')
const wrapper = mount(OSwitch, {
  props: { modelValue: false, label: 'Sync', description: 'Keep files aligned' },
  attrs: { name: 'sync', required: true },
})
expect(wrapper.get('input').attributes()).toMatchObject({
  name: 'sync',
  required: '',
  role: 'switch',
})
await wrapper.get('input').setValue(true)
expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
expect(wrapper.emitted('change')?.[0]?.[0]).toBe(true)
```

Also test readonly, loading, disabled, invalid ARIA, slot labels, generated IDs, controlled-parent rejection, `LuLoaderCircle`, and absence of inline SVG markup.

- [ ] **Step 2: Run the focused test and confirm red**

Run `pnpm exec vitest run packages/ui/src/components/switch/__tests__/switch.test.ts`.

Expected: FAIL because the Switch family does not exist.

- [ ] **Step 3: Implement the exact type contract**

Use this source vocabulary:

```ts
export const oSwitchSizes = ['sm', 'md'] as const
export type OSwitchSize = (typeof oSwitchSizes)[number]

export const oSwitchProps = {
  modelValue: { type: Boolean, default: false },
  size: { type: String as PropType<OSwitchSize>, default: 'md' },
  label: String,
  description: String,
  disabled: Boolean,
  readonly: Boolean,
  loading: Boolean,
  invalid: Boolean,
} as const

export interface OSwitchEmits {
  'update:modelValue': [value: boolean]
  change: [value: boolean, event: Event]
}
```

Define `default` and `description` slots as `() => VNodeChild`.

- [ ] **Step 4: Implement native state synchronization and template**

Follow the Checkbox controlled-state pattern. Bind undeclared attrs to the input, use `role="switch"`, synchronize `checked` after changes, prevent readonly/loading interaction, and render the loading icon only during loading:

```vue
<input
  v-bind="getInputAttrs()"
  ref="inputElement"
  type="checkbox"
  role="switch"
  :checked="props.modelValue"
  :disabled="props.disabled"
/>
<span class="o-switch__track" aria-hidden="true">
  <span class="o-switch__thumb">
    <LuLoaderCircle v-if="props.loading" class="o-switch__spinner" />
  </span>
```

- [ ] **Step 5: Add borderless logical-axis styles**

Implement `sm` and `md` CSS variables, brand/neutral/danger track colors, thumb translation through `--omg-switch-thumb-offset`, RTL reversal, focus ring, 44px coarse target, and reduced-motion removal. The normal track must use `border: 0`.

- [ ] **Step 6: Run tests, typecheck, and commit**

Run:

```text
pnpm exec vitest run packages/ui/src/components/switch/__tests__/switch.test.ts
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: PASS. Commit with `feat(switch): add native boolean control`.

---

### Task 2: Build OAlert

**Files:**

- Create: `packages/ui/src/components/alert/src/alert.ts`
- Create: `packages/ui/src/components/alert/src/OAlert.vue`
- Create: `packages/ui/src/components/alert/style/index.less`
- Create: `packages/ui/src/components/alert/__tests__/alert.test.ts`
- Create: `packages/ui/src/components/alert/index.ts`

**Interfaces:**

- Consumes: `LuInfo`, `LuCircleCheck`, `LuTriangleAlert`, `LuCircleX`, `LuX`, semantic soft-surface tokens.
- Produces: `OAlert`, `oAlertProps`, `oAlertStatuses`, `OAlertProps`, `OAlertStatus`, `OAlertEmits`, and `OAlertSlots`.

- [ ] **Step 1: Write failing vocabulary, icon, slot, and close-intent tests**

Assert:

```ts
expect(oAlertStatuses).toEqual(['info', 'success', 'warning', 'error'])
const wrapper = mount(OAlert, {
  props: { status: 'warning', title: 'Review', description: 'Check the values', closable: true },
  slots: { action: '<button type="button">Inspect</button>' },
})
expect(wrapper.classes()).toContain('o-alert--warning')
expect(wrapper.get('.o-alert__close').attributes('type')).toBe('button')
expect(wrapper.attributes('role')).toBeUndefined()
await wrapper.get('.o-alert__close').trigger('click')
expect(wrapper.emitted('close')).toHaveLength(1)
expect(wrapper.exists()).toBe(true)
```

Also cover all fallback icons, custom icon/title/body/close slots, inherited `role` and `aria-live`, long text markup, and no handwritten `<svg>` source.

- [ ] **Step 2: Run focused tests and confirm red**

Run `pnpm exec vitest run packages/ui/src/components/alert/__tests__/alert.test.ts`.

Expected: FAIL because the Alert family does not exist.

- [ ] **Step 3: Implement types and static feedback template**

Define the status tuple, `status='info'`, title, description, `closable=false`, `showIcon=true`, and `closeAriaLabel='Close alert'`. Render slots without managing visibility. Select fallback icons with a typed status-to-component record and mark status/close glyphs decorative.

- [ ] **Step 4: Add the borderless responsive soft-surface styles**

Use a three-column icon/content/control layout with action below or beside content when space permits. At compact widths move action below the copy. Each status uses a semantic soft background and strong icon color. Set `border: 0`, wrap long text with `overflow-wrap: anywhere`, and keep a 44px coarse close hit target.

- [ ] **Step 5: Run tests, typecheck, and commit**

Run the Alert test and UI typecheck. Expected: PASS. Commit with `feat(alert): add persistent inline feedback`.

---

### Task 3: Build OSkeleton

**Files:**

- Create: `packages/ui/src/components/skeleton/src/skeleton.ts`
- Create: `packages/ui/src/components/skeleton/src/OSkeleton.vue`
- Create: `packages/ui/src/components/skeleton/style/index.less`
- Create: `packages/ui/src/components/skeleton/__tests__/skeleton.test.ts`
- Create: `packages/ui/src/components/skeleton/index.ts`

**Interfaces:**

- Consumes: Vue computed styles and existing surface/radius/motion tokens.
- Produces: `OSkeleton`, `oSkeletonProps`, `oSkeletonVariants`, `normalizeOSkeletonDimension`, `normalizeOSkeletonLines`, and matching public types.

- [ ] **Step 1: Write failing normalization and rendering tests**

Cover these exact helper expectations:

```ts
expect(oSkeletonVariants).toEqual(['text', 'rect', 'circle'])
expect(normalizeOSkeletonDimension(40.8)).toBe('40px')
expect(normalizeOSkeletonDimension(' min(100%, 32rem) ')).toBe('min(100%, 32rem)')
expect(normalizeOSkeletonDimension(0)).toBeUndefined()
expect(normalizeOSkeletonLines(0)).toBe(1)
expect(normalizeOSkeletonLines(99)).toBe(12)
```

Mount text with three lines, circle and rect defaults, explicit width/height, `animated=false`, `loading=false` resolved content, and `aria-hidden=true` placeholder nodes.

- [ ] **Step 2: Run focused tests and confirm red**

Run `pnpm exec vitest run packages/ui/src/components/skeleton/__tests__/skeleton.test.ts`.

Expected: FAIL because the Skeleton family does not exist.

- [ ] **Step 3: Implement type and normalization helpers**

Use:

```ts
export const oSkeletonVariants = ['text', 'rect', 'circle'] as const
export const normalizeOSkeletonDimension = (value: string | number | undefined) => {
  if (typeof value === 'number')
    return Number.isFinite(value) && value > 0 ? `${Math.floor(value)}px` : undefined
  const normalized = value?.trim()
  return normalized || undefined
}
export const normalizeOSkeletonLines = (value: number): number =>
  Math.min(12, Math.max(1, Number.isFinite(value) ? Math.floor(value) : 1))
```

Define loading, animated, variant, width, height, and lines props plus one default slot.

- [ ] **Step 4: Implement placeholder/resolved rendering and styles**

Render the default slot only when not loading. Text renders normalized line spans; rect/circle render one shape. Apply defaults through component CSS variables and use `aria-hidden="true"`. Add a muted background-position sweep, shorter final text line, variant radii, and static reduced-motion behavior.

- [ ] **Step 5: Run tests, typecheck, and commit**

Run the Skeleton test and UI typecheck. Expected: PASS. Commit with `feat(skeleton): add loading placeholder primitive`.

---

### Task 4: Extend floating infrastructure and build OTooltip

**Files:**

- Modify: `packages/ui/src/composables/use-floating-panel.ts`
- Modify: `packages/ui/src/composables/__tests__/use-floating-panel.test.ts`
- Create: `packages/ui/src/components/tooltip/src/tooltip.ts`
- Create: `packages/ui/src/components/tooltip/src/OTooltip.vue`
- Create: `packages/ui/src/components/tooltip/style/index.less`
- Create: `packages/ui/src/components/tooltip/__tests__/tooltip.test.ts`
- Create: `packages/ui/src/components/tooltip/index.ts`

**Interfaces:**

- Consumes: `useControllableOpen`, `useFloatingPanel`, Floating UI, Vue `cloneVNode`, `Teleport`, `Transition`, `useId`.
- Produces: `OTooltip`, `oTooltipProps`, `oTooltipPlacements`, public Tooltip types, and additive internal floating placement/offset support.

- [ ] **Step 1: Write failing additive floating-helper tests**

Mock `computePosition` and verify a `top-end` placement and reactive `8px` offset are forwarded. Verify component refs resolve through `$el`, while existing bottom-start behavior still defaults to `6px` and `matchReferenceWidth` remains unchanged.

- [ ] **Step 2: Implement additive floating helper support**

Expand `OFloatingPlacement` to the twelve values from the design. Add `offset?: ComputedRef<number>` to options, alias Floating UI's helper as `floatingOffset`, and use `floatingOffset(options.offset?.value ?? 6)`. Watch the optional offset. Resolve `ComponentPublicInstance` references with:

```ts
const resolveElement = (value: Element | ComponentPublicInstance | null): HTMLElement | null => {
  if (value instanceof HTMLElement) return value
  const element = value?.$el
  return element instanceof HTMLElement ? element : null
}
```

- [ ] **Step 3: Write failing Tooltip contract and interaction tests**

Use fake timers to cover 400ms hover show, 100ms hide, immediate focus, Escape, stale timer cancellation, disabled state, controlled rejection, Teleport off/on, stable tooltip ID, visible-only `aria-describedby`, single cloned trigger, content slot, and dev warning for invalid roots.

- [ ] **Step 4: Implement Tooltip props and timer state**

Define the twelve placements and props from the design. Normalize delay and offset to finite non-negative values. Use `useControllableOpen`. Store a timer generation and clear timer on every new request, disabled transition, and unmount. Focus opens immediately; hover uses show delay; leave/blur uses hide delay; Escape requests closed.

- [ ] **Step 5: Clone the single trigger and render the floating description**

Filter comments and empty text from the default slot. Clone the first meaningful VNode with merged `ref`, `aria-describedby`, pointer/focus handlers, and Escape handler. Preserve the original VNode ref by calling `cloneVNode(node, additions, true)`. Render:

```vue
<Teleport :disabled="!props.teleported" :to="props.teleportTo">
  <Transition name="o-tooltip">
    <div
      v-if="isOpen"
      :id="tooltipId"
      ref="setFloatingElement"
      class="o-tooltip"
      role="tooltip"
      :data-placement="resolvedPlacement"
      :style="floatingStyle"
    >
      <slot name="content">{{ props.content }}</slot>
    </div>
  </Transition>
</Teleport>
```

- [ ] **Step 6: Add inverse borderless placement-aware styles**

Use an opaque inverse surface, inverse text, compact shadow, maximum width 240px, 12px typography, `pointer-events:none`, and no border. Each resolved side receives a 2px entry translation toward its trigger. Reduced-motion removes the transition and transform.

- [ ] **Step 7: Run focused compatibility tests and commit**

Run:

```text
pnpm exec vitest run packages/ui/src/composables/__tests__/use-floating-panel.test.ts packages/ui/src/components/tooltip/__tests__/tooltip.test.ts packages/ui/src/components/dropdown/__tests__/dropdown.test.ts packages/ui/src/components/select/__tests__/select.test.ts
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: PASS. Commit with `feat(tooltip): add accessible floating descriptions`.

---

### Task 5: Publish all four families

**Files:**

- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.less`
- Modify: `packages/ui/vite.config.ts`
- Modify: `packages/ui/package.json`
- Modify: `scripts/check-naming.mjs`
- Modify: `packages/ui/tests/ssr/ssr.test.ts`
- Modify: `packages/ui/tests/package/package-contract.test.ts`
- Modify: `scripts/test-package.mjs`

**Interfaces:**

- Consumes: four component subpath indexes.
- Produces: typed root/subpath imports, CSS aggregation, built JS/declarations, package exports, SSR proof, and real consumer proof.

- [ ] **Step 1: Add failing package, naming, and SSR expectations**

Add all four family names to the expected registries. Import root and subpath components/types/helpers in the package contract and tarball consumer. SSR-render each component with meaningful props. Run `pnpm check:naming`, `pnpm test:ssr`, and `pnpm test:package`; expect failures for missing shared entries.

- [ ] **Step 2: Add root, CSS, build, and package exports**

Add explicit root exports, four Less imports, four Vite entries, and four package subpaths. Add `./switch`, `./tooltip`, `./alert`, and `./skeleton` to attw. Keep alphabetic grouping consistent with the current file style.

- [ ] **Step 3: Complete real consumer and contract coverage**

The generated consumer must render root and subpath instances and type-check public literals/helpers. Package-contract tests must assert JS and declaration files for every subpath and ensure the tarball excludes source Vue/TS/test files.

- [ ] **Step 4: Run publication checks and commit**

Run `pnpm check:naming && pnpm build && pnpm test:ssr && pnpm test:package`. Expected: PASS. Commit with `feat(ui): publish common state primitives`.

---

### Task 6: Document and browser-test every capability

**Files:**

- Create: `apps/docs/docs/components/switch.md`
- Create: `apps/docs/docs/components/tooltip.md`
- Create: `apps/docs/docs/components/alert.md`
- Create: `apps/docs/docs/components/skeleton.md`
- Create: `apps/docs/examples/switch/Basic.vue`
- Create: `apps/docs/examples/switch/States.vue`
- Create: `apps/docs/examples/tooltip/Basic.vue`
- Create: `apps/docs/examples/tooltip/Behavior.vue`
- Create: `apps/docs/examples/alert/Basic.vue`
- Create: `apps/docs/examples/alert/Closable.vue`
- Create: `apps/docs/examples/skeleton/Basic.vue`
- Create: `apps/docs/examples/skeleton/Content.vue`
- Modify: `apps/docs/docs/.vitepress/config.mts`
- Modify: `apps/docs/docs/components/index.md`
- Modify: `apps/docs/docs/index.md`
- Modify: `README.md`
- Modify: `packages/ui/README.md`
- Modify: `apps/docs/tests/e2e/components.spec.ts`

**Interfaces:**

- Consumes: published root and subpath APIs.
- Produces: complete copyable examples, API references, navigation, accurate counts, axe and browser behavior proof.

- [ ] **Step 1: Add aliases, navigation, counts, and empty page tests**

Register four source aliases and new sidebar items. Reorganize groups without changing existing routes. Update counts to 30 families and 31 public Vue components. Add Playwright page headings and named demo regions before writing examples; run the focused cases and expect route/content failures.

- [ ] **Step 2: Write eight live examples**

Implement the exact capability coverage from the design: Switch native/controlled states; Tooltip direction/timing/controlled/theme scenarios; Alert status/slots/controlled close; Skeleton variants/composition/loading switch. Examples may own demo state but must not move business logic into the library.

- [ ] **Step 3: Write four complete component pages**

Each page includes root/subpath import examples, Props, Events, Slots, ARIA, keyboard behavior, SSR, controlled behavior where applicable, UI-only boundaries, icon policy, dark/RTL/reduced-motion notes, and the two DemoBlocks.

- [ ] **Step 4: Add focused browser contracts**

Add tests for the exact Switch, Tooltip, Alert, and Skeleton behaviors listed in the design. Every page receives an axe scan. Assert no outer border on Tooltip and Alert, logical RTL movement for Switch, and zero animation duration or static background position in reduced motion.

- [ ] **Step 5: Run docs build and focused Playwright tests, then commit**

Run `pnpm docs:build` followed by Playwright grep for `Switch|Tooltip|Alert|Skeleton`. Expected: PASS. Commit with `docs: showcase common state primitives`.

---

### Task 7: Record architecture, verify, visually inspect, and publish

**Files:**

- Modify: `DESIGN.md`
- Modify: `PRODUCT.md`
- Modify: `.impeccable/design.json`

**Interfaces:**

- Consumes: completed components and docs.
- Produces: durable repository guidance, full verification evidence, and synchronized remote `main`.

- [ ] **Step 1: Record stable contracts**

Document the four UI-only boundaries, Tooltip versus future Popover, border budget, new component counts, icon policy, and explicit registry maintenance. Keep Image and Tabs invariants explicit.

- [ ] **Step 2: Run focused unit and browser suites**

Run all four unit files, floating helper tests, Select/Dropdown regression tests, SSR, package tests, and focused Playwright cases. Expected: PASS.

- [ ] **Step 3: Run full verification**

Run `pnpm verify`. Expected: formatting, lint, stylelint, naming, typecheck, coverage, build, SSR, package, publint, attw, tarball consumer, docs build, Playwright, and axe all PASS.

- [ ] **Step 4: Perform visual QA**

Open the four VitePress pages at desktop and 320px compact viewport. Inspect light/dark surfaces, long text, focus rings, RTL Switch movement, Tooltip placement, Alert wrapping, Skeleton composition, and reduced motion. Fix any contrast, overflow, clipping, or decorative-border regression and rerun affected tests.

- [ ] **Step 5: Commit records and visual fixes**

Commit with `docs: record common state primitive contracts` and a separate focused fix commit when visual QA changes runtime code.

- [ ] **Step 6: Synchronize and push main**

Fetch `origin`. If `origin/main` has remote-only commits, merge them without discarding either side and rerun `pnpm verify`. Push local `main`, then assert `git rev-parse HEAD` equals `git ls-remote origin refs/heads/main`. The worktree must finish clean.
