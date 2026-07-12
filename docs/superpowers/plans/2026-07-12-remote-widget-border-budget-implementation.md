# Remote Widget and Border Budget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the remote Widget work, make `OWidget` a fully tested and publishable personal component, and remove only the four redundant borders approved by the semantic border budget.

**Architecture:** Preserve the remote Widget markup and visual composition while tightening its public contract, visualization semantics, and data normalization. Extend the existing explicit package-entry and naming systems instead of creating parallel infrastructure. Border changes stay selector-specific and are guarded by tests so form, state, focus, separator, Avatar, and Tabs borders remain untouched.

**Tech Stack:** Vue 3.5, TypeScript, Less, `vue-icons-plus/lu`, Vite 8, VitePress, Vitest, Vue Test Utils, Playwright, pnpm.

## Global Constraints

- Vue-only ESM package; no CommonJS, UMD, framework-neutral entry, compatibility alias, or package-manager migration.
- Preserve Widget's 160px × 130px size, 35px radius, frosted glass, highlight, four quadrants, title/value scale, charts, and 4px demo gap.
- Preserve existing Tabs motion and Image Teleport preview architecture.
- Inline SVG remains forbidden except an explicitly marked `data-omg-visualization` data chart.
- Built-in and documentation icons use direct named imports from `vue-icons-plus/lu`.
- Remove only Upload row, Dropdown panel, Select panel, and Widget icon-ring borders.
- Keep all input, focus, error, selected, drag, separator, Tabs, Avatar, outline-button, and reset borders listed in the approved design.
- Shared components contain UI behavior only; no requests, timers, persistence, permissions, routing, or business-state mapping.

---

### Task 1: Merge remote main without losing local contracts

**Files:**

- Merge: `origin/main`
- Resolve: `packages/ui/src/index.ts`
- Inspect: `apps/docs/docs/.vitepress/config.mts`
- Inspect: `packages/ui/src/styles/index.less`
- Inspect: `packages/ui/src/components/upload/style/index.less`

**Interfaces:**

- Consumes: local root exports through OUpload and remote `OWidget` exports.
- Produces: one merged `main` containing both histories and every existing local export plus `OWidget`.

- [ ] **Step 1: Run the merge and confirm the expected conflict**

Run: `git merge --no-edit origin/main`

Expected: one conflict in `packages/ui/src/index.ts`; remote Widget files and Upload border deletion are present.

- [ ] **Step 2: Resolve the root entry explicitly**

Keep the complete local OTextarea block, including normalizers and autosize types, then append the Widget block after Upload:

```ts
export { OWidget, oWidgetChartTypes, oWidgetProps } from './components/widget'
export type { OWidgetChartType, OWidgetProps, OWidgetSlots } from './components/widget'
```

- [ ] **Step 3: Verify merge preservation**

Run: `git diff --check && git status --short`

Expected: no whitespace errors and only the intentional merge resolution remains unmerged or staged.

- [ ] **Step 4: Finish the merge commit**

```bash
git add packages/ui/src/index.ts
git commit --no-edit
git merge-base --is-ancestor origin/main HEAD
```

Expected: the merge commit succeeds and remote `main` is now an ancestor of local `main`.

### Task 2: Complete Widget naming and package publication

**Files:**

- Modify: `scripts/check-naming.mjs`
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/vite.config.ts`
- Modify: `packages/ui/tests/package/package-contract.test.ts`
- Modify: `scripts/test-package.mjs`

**Interfaces:**

- Consumes: `packages/ui/src/components/widget/index.ts`.
- Produces: root and `@puzzle-fuzzy/ui/widget` imports with emitted JS and declarations.

- [ ] **Step 1: Add failing package and naming expectations**

Add `widget` to `expectedComponents`, `./widget` to the manifest-contract subpath array, and these files to package expectations:

```ts
'dist/components/widget/index.js',
'dist/components/widget/index.d.ts',
```

Run: `pnpm check:naming && pnpm build && pnpm test:package`

Expected before implementation: naming rejects Widget's SVG, and the Widget subpath/build files are missing.

- [ ] **Step 2: Add the narrow visualization exception**

Mark both Widget chart SVG roots with `data-omg-visualization`. In `check-naming.mjs`, inspect each opening SVG tag and report only unmarked SVG:

```js
for (const match of templateSource.matchAll(/<svg\b[^>]*>/giu)) {
  if (!/\bdata-omg-visualization(?:\s|=|>)/iu.test(match[0])) {
    errors.push('inline SVG is not allowed: ' + relative(repositoryRoot, file))
  }
}
```

- [ ] **Step 3: Emit and export the Widget subpath**

Add this manifest export and Vite entry:

```json
"./widget": {
  "types": "./dist/components/widget/index.d.ts",
  "import": "./dist/components/widget/index.js"
}
```

```ts
'components/widget/index': fromPackageRoot('src/components/widget/index.ts'),
```

- [ ] **Step 4: Extend real package consumption**

Add `./widget` to the attw list. Import both root and subpath Widget in the generated consumer and render each with title, value, chart data, and a chart label.

- [ ] **Step 5: Verify publication**

Run: `pnpm check:naming && pnpm build && pnpm test:package`

Expected: naming passes for 21 components; Widget JS/declarations exist; publint, attw, and consumer build pass.

### Task 3: Harden OWidget without changing its visual identity

**Files:**

- Modify: `packages/ui/src/components/widget/src/widget.ts`
- Modify: `packages/ui/src/components/widget/src/OWidget.vue`
- Modify: `packages/ui/src/components/widget/__tests__/widget.test.ts`

**Interfaces:**

- Consumes: `oWidgetChartTypes = ['line', 'activity'] as const` and `LuBarChart3`.
- Produces: `chartData?: readonly number[]`, `chartAriaLabel?: string`, and `OWidgetSlots` returning `VNodeChild`.

- [ ] **Step 1: Write failing public-contract and behavior tests**

Cover:

```ts
const props: OWidgetProps = {
  title: '活跃程度',
  value: 8,
  chartData: [1, 0, 1] as const,
  chartAriaLabel: '最近两周活跃趋势',
}
```

Assert named charts expose `role="img"` and `aria-label`; unnamed charts are `aria-hidden`; non-finite line points never produce `NaN` or `Infinity`; activity renders at most 14 circles; both chart SVG roots have `data-omg-visualization`.

Run: `pnpm exec vitest run packages/ui/src/components/widget/__tests__/widget.test.ts`

Expected: new contract tests fail against the remote implementation.

- [ ] **Step 2: Align prop and slot types**

```ts
import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

chartData: {
  type: Array as PropType<readonly number[]>,
  default: (): readonly number[] => [],
},
chartAriaLabel: String,

export interface OWidgetSlots {
  icon?: () => VNodeChild
  chart?: () => VNodeChild
}
```

- [ ] **Step 3: Normalize chart geometry**

Create finite line points without spread min/max, and create `activityPoints` from `props.chartData.slice(0, 14)`. Render conditions use normalized collections, not raw array length.

- [ ] **Step 4: Add chart semantics**

Both default SVG charts receive:

```vue
data-omg-visualization :role="props.chartAriaLabel ? 'img' : undefined"
:aria-label="props.chartAriaLabel" :aria-hidden="props.chartAriaLabel ? undefined : 'true'"
```

- [ ] **Step 5: Verify focused behavior**

Run: `pnpm exec vitest run packages/ui/src/components/widget/__tests__/widget.test.ts`

Expected: all Widget tests pass with no warnings or invalid SVG geometry.

### Task 4: Apply the approved semantic border budget

**Files:**

- Modify: `packages/ui/src/components/widget/style/index.less`
- Preserve remote: `packages/ui/src/components/upload/style/index.less`
- Modify: `packages/ui/src/components/dropdown/style/index.less`
- Modify: `packages/ui/src/components/select/style/index.less`
- Modify: `packages/ui/src/components/widget/__tests__/widget.test.ts`
- Modify: `packages/ui/src/components/dropdown/__tests__/dropdown.test.ts`
- Modify: `packages/ui/src/components/select/__tests__/select.test.ts`

**Interfaces:**

- Consumes: existing semantic surfaces and `--omg-shadow-sm`.
- Produces: exactly four borderless visual layers while protected borders remain unchanged.

- [ ] **Step 1: Write selector-scoped style assertions**

Extract each selector block and assert:

```ts
expect(widgetIconBlock).not.toMatch(/\bborder\s*:/u)
expect(widgetIconBlock).toContain('background:')
expect(dropdownPanelBlock).not.toMatch(/\bborder\s*:/u)
expect(selectPanelBlock).not.toMatch(/\bborder\s*:/u)
```

Also assert Dropdown/Select triggers retain their 1px borders and Upload dropzone retains its 2px dashed border.

- [ ] **Step 2: Remove only the approved borders**

Keep the remote Upload row deletion. Remove the panel borders from Dropdown and Select. Replace Widget icon ring with:

```less
background: color-mix(in srgb, var(--omg-color-text) 6%, transparent);
```

Retain its padding and `border-radius: 50%`.

- [ ] **Step 3: Add fixed-card overflow resilience**

Give title, value, and chart cells `min-inline-size: 0`; title and value text use overflow clipping/ellipsis where necessary. Remove the ineffective title `align-items` declaration. Keep all normal-example geometry unchanged.

- [ ] **Step 4: Run focused style validation**

Run:

```bash
pnpm exec vitest run packages/ui/src/components/widget/__tests__/widget.test.ts packages/ui/src/components/dropdown/__tests__/dropdown.test.ts packages/ui/src/components/select/__tests__/select.test.ts
pnpm exec stylelint packages/ui/src/components/widget/style/index.less packages/ui/src/components/dropdown/style/index.less packages/ui/src/components/select/style/index.less packages/ui/src/components/upload/style/index.less
```

Expected: focused tests and Stylelint pass; no protected selector changed.

### Task 5: Complete docs, design records, SSR, and browser coverage

**Files:**

- Modify: `apps/docs/docs/components/widget.md`
- Modify: `apps/docs/examples/widget/Basic.vue`
- Modify: `apps/docs/tests/e2e/components.spec.ts`
- Modify: `packages/ui/tests/ssr/ssr.test.ts`
- Modify: `packages/ui/README.md`
- Modify: `PRODUCT.md`
- Modify: `DESIGN.md`
- Modify: `.impeccable/design.json`

**Interfaces:**

- Consumes: final `OWidget` public API and approved border budget.
- Produces: accurate documentation and regression coverage for personal visuals.

- [ ] **Step 1: Correct Widget documentation**

Document `160 × 130`, `35px`, `chartAriaLabel`, readonly data, 14-point activity maximum, decorative-chart fallback, and Lucide icon slots. Remove emoji from the feature list without changing the six demos.

- [ ] **Step 2: Add SSR coverage**

Render Widget with two instances and assert stable unique gradient IDs, visible title/value, `role="img"` for a named chart, and no DOM-global failure.

- [ ] **Step 3: Add browser coverage**

On `/components/widget`, assert heading visibility, 160px × 130px geometry, 35px radius, zero Widget/icon border widths, non-transparent tonal icon background, visible line/activity charts, readable content, and no serious accessibility violations.

- [ ] **Step 4: Record the design rule**

Add Widget to the public README and design records. State the border budget exactly: prefer surface, spacing, or one elevation layer for cards/list rows/floating panels; borders require input, state, focus, separation, or irreplaceable hierarchy.

- [ ] **Step 5: Verify docs and SSR**

Run: `pnpm test:ssr && pnpm docs:build && pnpm --filter @puzzle-fuzzy/docs exec playwright test --grep "Widget"`

Expected: SSR, docs build, and Widget browser test pass.

### Task 6: Full verification and final commit

**Files:**

- Review: every changed file

**Interfaces:**

- Consumes: Tasks 1–5.
- Produces: a clean local `main` containing remote history and one intentional standards-fix commit.

- [ ] **Step 1: Format and inspect scope**

Run: `pnpm format && git diff --check && git diff --stat`

Expected: no whitespace errors and no unrelated component redesign.

- [ ] **Step 2: Run the full project gate**

Run: `pnpm check && pnpm build && pnpm test:ssr && pnpm test:package && pnpm test:e2e`

Expected: formatting, ESLint, Stylelint, naming, typecheck, 21-component coverage, build, SSR, package, docs, and all Playwright tests pass.

- [ ] **Step 3: Review protected visuals**

Confirm Widget protected styles, Tabs indicator styles, Image preview styles, Avatar borders, form-control borders, and Upload dropzone are unchanged except the four approved removals.

- [ ] **Step 4: Commit the integration fixes**

```bash
git add --all
git commit -m "feat: integrate widget with semantic border budget"
```

- [ ] **Step 5: Report repository state**

Run: `git status --short --branch && git rev-list --left-right --count origin/main...HEAD`

Expected: clean `main`, zero commits behind remote, and local commits ahead. Do not push unless separately requested.
