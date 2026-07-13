# shadcn-vue Foundation Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add OCard, OEmpty, OAspectRatio, OKbd/OKbdGroup, OSpinner, and OButtonGroup/OButtonGroupText/OButtonGroupSeparator as the first OMG-native translation of useful shadcn-vue foundations.

**Architecture:** Each family follows the existing component directory contract and exposes a compact OMG API instead of copying shadcn-vue's wrapper-heavy registry API. Components are pure Vue 3 plus Less; they use typed props, named slots, logical CSS, `data-slot` hooks, no business state, and no new runtime dependency. Workspace integration remains explicit across root exports, component subpaths, Vite entries, the single stylesheet, SSR, package checks, docs, and E2E.

**Tech Stack:** Vue 3.5, TypeScript 6, Less, Vite 8, Vitest 4, Vue Test Utils, VitePress, Playwright, vue-icons-plus.

## Global Constraints

- Use Node.js 24 LTS and pnpm; do not add Bun files or scripts.
- Public naming is `O*`, CSS is `.o-*`, and variables are `--omg-*`.
- Tailwind, CVA, clsx, and tailwind-merge must not be added.
- Reka UI is not needed in this phase.
- Do not alter existing Image preview, Tabs slider, or existing component visuals.
- Default surfaces avoid unnecessary borders; use Less tokens and preserve dark/RTL/reduced-motion behavior.
- Icons must come from `vue-icons-plus/lu`; do not write inline SVG.
- Every family needs types, styles, tests, root and subpath exports, SSR, package checks, docs, and E2E.
- Run `pnpm verify` before the final commit and push.

---

## File Map

New component directories:

- `packages/ui/src/components/card/`: compact card composition through props and five named slots.
- `packages/ui/src/components/empty/`: compact empty-state composition with optional media and actions.
- `packages/ui/src/components/aspect-ratio/`: native CSS ratio primitive and normalization helper.
- `packages/ui/src/components/kbd/`: semantic key and key-group primitives.
- `packages/ui/src/components/spinner/`: accessible Lucide loading primitive.
- `packages/ui/src/components/button-group/`: group context plus group, text, and separator components.

Workspace integration files:

- `packages/ui/src/index.ts`: root exports and public types.
- `packages/ui/src/styles/index.less`: imports all six new styles.
- `packages/ui/vite.config.ts`: adds six component library entries.
- `packages/ui/package.json`: adds six ESM/type subpath exports and fixes the malformed description text.
- `packages/ui/tests/ssr/ssr.test.ts`: renders every new public component without DOM globals.
- `packages/ui/tests/package/package-contract.test.ts`: checks subpaths, dist files, CSS selectors, and unchanged dependencies.
- `scripts/test-package.mjs`: imports and renders the new components from a packed tarball.
- `apps/docs/docs/.vitepress/config.mts`: source aliases and sidebar links.
- `apps/docs/docs/components/index.md`: changes totals to 36 families/40 components and lists the new families.
- `apps/docs/docs/components/*.md`: six complete API pages.
- `apps/docs/examples/{card,empty,aspect-ratio,kbd,spinner,button-group}/`: two demos per family.
- `apps/docs/tests/e2e/components.spec.ts`: visual, accessibility, RTL, compact, and reduced-motion assertions.

---

### Task 1: OCard and OEmpty

**Files:**

- Create: `packages/ui/src/components/card/src/card.ts`
- Create: `packages/ui/src/components/card/src/OCard.vue`
- Create: `packages/ui/src/components/card/style/index.less`
- Create: `packages/ui/src/components/card/__tests__/card.test.ts`
- Create: `packages/ui/src/components/card/index.ts`
- Create: `packages/ui/src/components/empty/src/empty.ts`
- Create: `packages/ui/src/components/empty/src/OEmpty.vue`
- Create: `packages/ui/src/components/empty/style/index.less`
- Create: `packages/ui/src/components/empty/__tests__/empty.test.ts`
- Create: `packages/ui/src/components/empty/index.ts`

**Interfaces:**

- Produces `OCard`, `oCardProps`, `oCardVariants`, `oCardSizes`, `oCardTitleLevels`, `OCardVariant`, `OCardSize`, `OCardTitleLevel`, `OCardProps`, `OCardSlots`.
- Produces `OEmpty`, `oEmptyProps`, `oEmptyMediaVariants`, `oEmptySizes`, `oEmptyTitleLevels`, `OEmptyMediaVariant`, `OEmptySize`, `OEmptyTitleLevel`, `OEmptyProps`, `OEmptySlots`.

- [ ] **Step 1: Write failing contract tests**

  In `card.test.ts`, assert tuples and defaults, validator rejection, conditional header/footer, heading level, all named slots, attrs, long text, `data-slot="card"`, no inline SVG, and a borderless default rule. Use the API:

  ```ts
  const wrapper = mount(OCard, {
    props: { title: 'Project', description: 'Personal UI', titleLevel: 2 },
    slots: { action: '<button>Open</button>', default: 'Body', footer: 'Footer' },
  })
  expect(wrapper.get('h2').text()).toBe('Project')
  expect(wrapper.get('[data-slot="card-action"]').text()).toBe('Open')
  expect(wrapper.get('[data-slot="card-footer"]').text()).toBe('Footer')
  ```

  In `empty.test.ts`, assert tuples/defaults, title levels, optional sections, custom media/title/description/default/actions slots, attrs, no default live-region role, `data-slot="empty"`, and no outer border.

- [ ] **Step 2: Run the focused tests and confirm RED**

  Run `pnpm exec vitest run packages/ui/src/components/card packages/ui/src/components/empty`.

  Expected: FAIL because both component entrypoints do not exist.

- [ ] **Step 3: Implement typed contracts**

  Define exact vocabularies:

  ```ts
  export const oCardVariants = ['surface', 'muted', 'ghost'] as const
  export const oCardSizes = ['sm', 'md'] as const
  export const oCardTitleLevels = [2, 3, 4] as const

  export const oEmptyMediaVariants = ['plain', 'soft'] as const
  export const oEmptySizes = ['sm', 'md'] as const
  export const oEmptyTitleLevels = [2, 3, 4] as const
  ```

  OCard defaults are `variant='surface'`, `size='md'`, `titleLevel=3`. OEmpty defaults are `mediaVariant='plain'`, `size='md'`, `titleLevel=3`. Define slots exactly as the design specification describes and use `ExtractPublicPropTypes`.

- [ ] **Step 4: Implement semantic templates**

  OCard root is an `<article data-slot="card">`; its conditional header uses `data-slot="card-header"`, dynamic `h2/h3/h4`, action at logical end, body `data-slot="card-content"`, and conditional footer. OEmpty root is a `<section data-slot="empty">`; it conditionally renders media/header/content/actions and does not invent `role` or `aria-live`.

- [ ] **Step 5: Implement Less styles**

  Use `surface`, `muted`, and transparent variants without an outer border. Use grid for Card header/action and centered grid for Empty. Add `overflow-wrap:anywhere`, logical properties, a compact container query, and only existing theme tokens. `mediaVariant='soft'` may add a rounded soft background to the media itself.

- [ ] **Step 6: Run focused tests and confirm GREEN**

  Run `pnpm exec vitest run packages/ui/src/components/card packages/ui/src/components/empty`.

  Expected: both suites pass.

- [ ] **Step 7: Commit the family implementation**

  Run `git add packages/ui/src/components/card packages/ui/src/components/empty && git commit -m "feat(ui): add card and empty foundations"`.

### Task 2: OAspectRatio, OKbd, OKbdGroup, and OSpinner

**Files:**

- Create: `packages/ui/src/components/aspect-ratio/src/aspect-ratio.ts`
- Create: `packages/ui/src/components/aspect-ratio/src/OAspectRatio.vue`
- Create: `packages/ui/src/components/aspect-ratio/style/index.less`
- Create: `packages/ui/src/components/aspect-ratio/__tests__/aspect-ratio.test.ts`
- Create: `packages/ui/src/components/aspect-ratio/index.ts`
- Create: `packages/ui/src/components/kbd/src/kbd.ts`
- Create: `packages/ui/src/components/kbd/src/OKbd.vue`
- Create: `packages/ui/src/components/kbd/src/OKbdGroup.vue`
- Create: `packages/ui/src/components/kbd/style/index.less`
- Create: `packages/ui/src/components/kbd/__tests__/kbd.test.ts`
- Create: `packages/ui/src/components/kbd/index.ts`
- Create: `packages/ui/src/components/spinner/src/spinner.ts`
- Create: `packages/ui/src/components/spinner/src/OSpinner.vue`
- Create: `packages/ui/src/components/spinner/style/index.less`
- Create: `packages/ui/src/components/spinner/__tests__/spinner.test.ts`
- Create: `packages/ui/src/components/spinner/index.ts`

**Interfaces:**

- Produces `OAspectRatio`, `oAspectRatioProps`, `normalizeOAspectRatio`, `OAspectRatioProps`, `OAspectRatioSlots`.
- Produces `OKbd`, `OKbdGroup`, `oKbdProps`, `oKbdSizes`, `oKbdGroupProps`, and their Props/Slots/Size types.
- Produces `OSpinner`, `oSpinnerProps`, `oSpinnerSizes`, and Props/Slots/Size types.

- [ ] **Step 1: Write failing tests**

  Assert `normalizeOAspectRatio(1) === 1` and that zero, negative, NaN, and Infinity return `16 / 9`; assert the component emits `style="--omg-aspect-ratio:1.777..."`, forwards attrs, and adds no visual clipping. Assert OKbd renders a real `kbd`, group renders `span[role=group]`, and aria-label is optional. Assert OSpinner uses a Lucide import, exposes three sizes, renders `role=status` plus `aria-label` normally, renders `aria-hidden=true` without role when decorative, inherits color, and disables animation under reduced motion.

- [ ] **Step 2: Run the focused tests and confirm RED**

  Run `pnpm exec vitest run packages/ui/src/components/aspect-ratio packages/ui/src/components/kbd packages/ui/src/components/spinner`.

  Expected: FAIL because the three entrypoints do not exist.

- [ ] **Step 3: Implement OAspectRatio**

  Use this normalization contract:

  ```ts
  export const DEFAULT_O_ASPECT_RATIO = 16 / 9
  export const normalizeOAspectRatio = (value: number): number =>
    Number.isFinite(value) && value > 0 ? value : DEFAULT_O_ASPECT_RATIO
  ```

  Root markup is `<div class="o-aspect-ratio" data-slot="aspect-ratio">` and the style uses `aspect-ratio: var(--omg-aspect-ratio)`. Do not add `overflow:hidden`, border, radius, or background.

- [ ] **Step 4: Implement OKbd and OKbdGroup**

  Use sizes `['sm','md']`, default `sm`, real `<kbd data-slot="kbd">`, and `<span data-slot="kbd-group" role="group" :aria-label="props.ariaLabel || undefined">`. The group is an inline flex layout; Kbd may use a subtle neutral-soft fill and inset visual highlight but no outer border.

- [ ] **Step 5: Implement OSpinner**

  Import `LuLoader2` from `vue-icons-plus/lu`. Use sizes `['sm','md','lg']`, default `md`, label `Loading`, decorative `false`. Root is a span with `data-slot="spinner"`; normal mode has `role="status"` and `aria-label`, decorative mode has `aria-hidden="true"`. The icon is always decorative. Use `currentColor` and stop the keyframe under `prefers-reduced-motion: reduce`.

- [ ] **Step 6: Run focused tests and confirm GREEN**

  Run `pnpm exec vitest run packages/ui/src/components/aspect-ratio packages/ui/src/components/kbd packages/ui/src/components/spinner`.

  Expected: all three suites pass.

- [ ] **Step 7: Commit the family implementation**

  Run `git add packages/ui/src/components/aspect-ratio packages/ui/src/components/kbd packages/ui/src/components/spinner && git commit -m "feat(ui): add layout and status primitives"`.

### Task 3: OButtonGroup Family

**Files:**

- Create: `packages/ui/src/components/button-group/src/button-group.ts`
- Create: `packages/ui/src/components/button-group/src/OButtonGroup.vue`
- Create: `packages/ui/src/components/button-group/src/OButtonGroupText.vue`
- Create: `packages/ui/src/components/button-group/src/OButtonGroupSeparator.vue`
- Create: `packages/ui/src/components/button-group/style/index.less`
- Create: `packages/ui/src/components/button-group/__tests__/button-group.test.ts`
- Create: `packages/ui/src/components/button-group/index.ts`

**Interfaces:**

- Produces `OButtonGroup`, `OButtonGroupText`, `OButtonGroupSeparator`, `oButtonGroupProps`, `oButtonGroupOrientations`, `oButtonGroupTextProps`, all public Props/Slots/Orientation types, and an internal orientation injection key.

- [ ] **Step 1: Write failing tests**

  Assert horizontal/vertical validators and defaults, `attached=true`, optional group aria-label, default slot, Text `span/div` tags, separator orientation inherited through provide/inject, standalone separator fallback to horizontal, separator `aria-hidden=true`, attrs forwarding, and no group-level key handlers. Mount real OButton children and verify their click events still work.

- [ ] **Step 2: Run the focused test and confirm RED**

  Run `pnpm exec vitest run packages/ui/src/components/button-group`.

  Expected: FAIL because the family entrypoint does not exist.

- [ ] **Step 3: Implement types and orientation context**

  Define:

  ```ts
  export const oButtonGroupOrientations = ['horizontal', 'vertical'] as const
  export interface OButtonGroupContext {
    orientation: ComputedRef<OButtonGroupOrientation>
  }
  export const oButtonGroupContextKey: InjectionKey<OButtonGroupContext> = Symbol('OButtonGroup')
  ```

  Group defaults: orientation `horizontal`, attached `true`. Text defaults: tag `span`. Define explicit slot interfaces with `VNodeChild`.

- [ ] **Step 4: Implement templates**

  OButtonGroup uses a neutral `<div role="group">` with `data-slot="button-group"`, `data-orientation`, and `data-attached`. Provide the computed orientation. Text uses `<component :is="props.tag" data-slot="button-group-text">`. Separator uses a span with `data-slot="button-group-separator"`, inherited `data-orientation`, and `aria-hidden="true"`.

- [ ] **Step 5: Implement grouping styles**

  Use inline-flex/flex, logical orientation, `isolation:isolate`, and selectors scoped under `.o-button-group[data-attached='true']`. Merge only adjacent radii for `.o-button`, `.o-input`, `.o-select`, and `.o-dropdown` wrappers. Never remove focus outlines or clip overflow. Text uses neutral-soft background without a separate border. Separator is one physical pixel along the group axis and uses the subtle border token only as its color.

- [ ] **Step 6: Run focused and existing control regressions**

  Run `pnpm exec vitest run packages/ui/src/components/button-group packages/ui/src/components/button packages/ui/src/components/input packages/ui/src/components/select packages/ui/src/components/dropdown`.

  Expected: all suites pass.

- [ ] **Step 7: Commit the family implementation**

  Run `git add packages/ui/src/components/button-group && git commit -m "feat(ui): add button group composition"`.

### Task 4: Publish and SSR Integration

**Files:**

- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.less`
- Modify: `packages/ui/vite.config.ts`
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/tests/ssr/ssr.test.ts`
- Modify: `packages/ui/tests/package/package-contract.test.ts`
- Modify: `scripts/test-package.mjs`

**Interfaces:**

- Consumes all public symbols from Tasks 1–3.
- Produces root imports and six subpath imports: `./aspect-ratio`, `./button-group`, `./card`, `./empty`, `./kbd`, `./spinner`.

- [ ] **Step 1: Add failing package and SSR expectations**

  Extend `componentSubpaths` and `expectedFiles` with all six entries. Add `.o-aspect-ratio`, `.o-button-group`, `.o-card`, `.o-empty`, `.o-kbd`, and `.o-spinner` CSS checks. Add one SSR test that renders all nine public components and asserts semantic markup (`article`, `section`, `kbd`, `role="group"`, `role="status"`, ratio style) without browser globals. Extend the tarball consumer to import at least one symbol from every new root and subpath API.

- [ ] **Step 2: Run integration tests and confirm RED**

  Run `pnpm exec vitest run packages/ui/tests/ssr packages/ui/tests/package`.

  Expected: FAIL because new exports and dist entries are missing.

- [ ] **Step 3: Wire root, style, Vite, and package entries**

  Export every component, tuple, helper, and public type from `src/index.ts`. Import each style once from `src/styles/index.less`. Add matching `components/<name>/index` Vite entries and package exports. Fix the package description to exactly `OMG UI — a personal Vue 3 component library`. Do not change dependency lists.

- [ ] **Step 4: Build and run integration tests**

  Run `pnpm build && pnpm exec vitest run packages/ui/tests/ssr packages/ui/tests/package`.

  Expected: build succeeds and both suites pass.

- [ ] **Step 5: Run the real package consumer**

  Run `pnpm test:package`.

  Expected: pack, publint, ATTW, tarball content checks, typecheck, and consumer build pass with no source SFC or Bun files.

- [ ] **Step 6: Commit publication integration**

  Run `git add packages/ui scripts/test-package.mjs && git commit -m "feat(ui): publish foundation component entries"`.

### Task 5: VitePress Documentation and Demos

**Files:**

- Create: `apps/docs/docs/components/aspect-ratio.md`
- Create: `apps/docs/docs/components/button-group.md`
- Create: `apps/docs/docs/components/card.md`
- Create: `apps/docs/docs/components/empty.md`
- Create: `apps/docs/docs/components/kbd.md`
- Create: `apps/docs/docs/components/spinner.md`
- Create: `apps/docs/examples/aspect-ratio/Basic.vue`
- Create: `apps/docs/examples/aspect-ratio/Responsive.vue`
- Create: `apps/docs/examples/button-group/Actions.vue`
- Create: `apps/docs/examples/button-group/Controls.vue`
- Create: `apps/docs/examples/card/Basic.vue`
- Create: `apps/docs/examples/card/Variants.vue`
- Create: `apps/docs/examples/empty/Basic.vue`
- Create: `apps/docs/examples/empty/States.vue`
- Create: `apps/docs/examples/kbd/Basic.vue`
- Create: `apps/docs/examples/kbd/Tooltip.vue`
- Create: `apps/docs/examples/spinner/Basic.vue`
- Create: `apps/docs/examples/spinner/Contexts.vue`
- Modify: `apps/docs/docs/.vitepress/config.mts`
- Modify: `apps/docs/docs/components/index.md`

**Interfaces:**

- Consumes all six public subpaths and `@puzzle-fuzzy/ui/styles.css`.
- Produces two labeled DemoBlocks and a complete API reference per family.

- [ ] **Step 1: Add source aliases and sidebar routes**

  Add six regex aliases following existing subpath aliases. Add Card, AspectRatio, Kbd, and ButtonGroup to “基础”; Empty and Spinner to “反馈”. Keep existing ordering and all existing links.

- [ ] **Step 2: Build representative demos**

  Demos must cover: Card title/description/action/footer plus surface/muted/ghost; Empty media/actions/long dark content; 16:9 image and 1:1 responsive custom content; single and grouped Kbd plus Tooltip composition; Spinner sizes/standalone status/decorative button icon; ButtonGroup horizontal/vertical/RTL and compositions with OButton, OInput, OSelect, and ODropdown. Demo-local CSS uses only `.demo-*` names and `--omg-*` tokens, never `--vp-*`.

- [ ] **Step 3: Write full API pages**

  Each page documents root and subpath imports, all Props and Slots, attrs forwarding, accessibility semantics, SSR behavior, dark/RTL/reduced-motion behavior where relevant, and UI-only non-goals. Every page includes at least two DemoBlocks with exact labels used by E2E.

- [ ] **Step 4: Update the component overview**

  Change the overview sentence to `36 个组件族、40 个公开 Vue 组件` and add all six families in their sidebar categories. Preserve personal components and the common conventions section.

- [ ] **Step 5: Build docs**

  Run `pnpm docs:build`.

  Expected: VitePress builds every new route with no unresolved imports, `--vp-*` override, or hydration warning.

- [ ] **Step 6: Commit docs**

  Run `git add apps/docs && git commit -m "docs: showcase foundation component families"`.

### Task 6: Browser Coverage and Final Verification

**Files:**

- Modify: `apps/docs/tests/e2e/components.spec.ts`

**Interfaces:**

- Consumes the exact DemoBlock labels and accessible names created in Task 5.
- Produces Playwright regression coverage for every new family.

- [ ] **Step 1: Add E2E assertions**

  Add focused tests that verify: Card outer borders are 0 and action is at logical top-end; Empty has no default live region and wraps at 320px; AspectRatio actual dimensions match 16:9 and 1:1; Kbd exposes native semantic nodes and group labels; Spinner status/decorative modes and reduced-motion animation; ButtonGroup orientation, attached radius, RTL layout, preserved child focus, Select/Dropdown operation, and no clipped focus ring. Run the existing axe helper on every page.

- [ ] **Step 2: Run the new browser cases**

  Run `pnpm test:e2e`.

  Expected: all existing and new Playwright cases pass in Chromium.

- [ ] **Step 3: Run formatting and targeted checks**

  Run `pnpm format && pnpm check`.

  Expected: Prettier writes only intended source/docs files; lint, stylelint, naming, typecheck, and coverage pass.

- [ ] **Step 4: Run the complete release gate**

  Run `pnpm verify`.

  Expected: format check, lint, naming, typecheck, coverage, library build, SSR, package checks, docs build, and E2E all pass.

- [ ] **Step 5: Review workspace and commit**

  Run `git diff --check && git status --short`. Inspect every changed file; exclude `.vitepress/cache`, `.vitepress/dist`, coverage, tarballs, and temporary files. Then run `git add apps/docs/tests/e2e/components.spec.ts && git commit -m "test: cover foundation component experiences"`.

- [ ] **Step 6: Synchronize and push main**

  Run `git fetch origin && git rebase origin/main && pnpm verify && git push origin main`.

  Expected: rebase succeeds without changing user-owned effects, the repeated verification passes, and `origin/main` advances to the final commit.

---

## Self-Review Results

- Spec coverage: all first-phase APIs, no-Tailwind/no-Reka boundaries, reduced borders, Lucide icons, SSR, packaging, docs, E2E, and push are assigned to tasks.
- Placeholder scan: no placeholder marker or unspecified implementation step remains.
- Type consistency: every public symbol listed in Tasks 1–3 is consumed by the integration task; subpath names match directory names and the spec.
- Scope boundary: the master spec intentionally keeps Reka and later shadcn-vue families for subsequent independently testable phases.
