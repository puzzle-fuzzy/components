# Compact Control Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make OMG UI controls compact and host-independent, add the shared `soft | outline` field vocabulary, and repair Select's trailing rail and popup spacing without changing interaction semantics.

**Architecture:** One internal tuple in `packages/ui/src/utils/field-control.ts` is the runtime source of truth for field variants. Input, Textarea, and Select each expose component-named tuples and types, while their existing DOM and behavior stay intact. Input Group owns one clipped surface around nested controls. Button and the remaining interactive families receive explicit OMG typography so VitePress cannot enlarge them.

**Tech Stack:** Vue 3.5, TypeScript, Less, Vitest, Vue Test Utils, VitePress, Playwright, pnpm.

## Global Constraints

- Use Node.js 24 LTS and pnpm; add no Bun file, script, configuration, or lockfile.
- Keep the package Vue-only and ESM-only. Do not add Tailwind, Material, or a new runtime dependency.
- Public component names remain `O*`, CSS remains `.o-*`, and CSS variables remain `--omg-*`.
- Keep `OCodeInput` cell borders unchanged and do not rewrite Image, Tabs, Upload, Message, or Reference Textarea in this plan.
- Keep native keyboard, form, IME, autosize, virtualization, Teleport, and SSR behavior unchanged.
- Use logical CSS properties for RTL and retain 44px coarse-pointer targets.
- Do not declare or override any VitePress `--vp-*` variable.
- Follow TDD: observe the focused test fail before implementing each behavior.

---

### Task 1: Establish the shared field variant contract

**Files:**

- Create: `packages/ui/src/utils/field-control.ts`
- Modify: `packages/ui/src/components/input/src/input.ts`
- Modify: `packages/ui/src/components/textarea/src/textarea.ts`
- Modify: `packages/ui/src/components/select/src/select.ts`
- Modify: `packages/ui/src/components/input/index.ts`
- Modify: `packages/ui/src/components/textarea/index.ts`
- Modify: `packages/ui/src/components/select/index.ts`
- Modify tests:
  - `packages/ui/src/components/input/__tests__/input.test.ts`
  - `packages/ui/src/components/textarea/__tests__/textarea.test.ts`
  - `packages/ui/src/components/select/__tests__/select.test.ts`

**Interfaces:**

```ts
// packages/ui/src/utils/field-control.ts — internal, not re-exported by the package root
export const oFieldControlVariants = ['soft', 'outline'] as const
export type OFieldControlVariant = (typeof oFieldControlVariants)[number]

export const isOFieldControlVariant = (value: unknown): value is OFieldControlVariant =>
  typeof value === 'string' && oFieldControlVariants.includes(value as OFieldControlVariant)
```

Each public component module owns its discoverable vocabulary while consuming the internal source:

```ts
export const oInputVariants = [...oFieldControlVariants] as const
export type OInputVariant = (typeof oInputVariants)[number]

variant: {
  type: String as PropType<OInputVariant>,
  default: 'soft',
  validator: isOFieldControlVariant,
},
```

Repeat the exact pattern as `oTextareaVariants` / `OTextareaVariant` and `oSelectVariants` / `OSelectVariant`. Re-export only the component-named tuple and type from each component `index.ts`; never export `OFieldControlVariant` from the public root.

- [ ] **Step 1: Add failing public-contract tests**

In each focused test, assert the tuple, default, validator, and public type:

```ts
expect(oInputVariants).toEqual(['soft', 'outline'])
expect(oInputProps.variant.default).toBe('soft')
expect(oInputProps.variant.validator?.('soft')).toBe(true)
expect(oInputProps.variant.validator?.('filled')).toBe(false)
const variant: OInputVariant = 'outline'
expect(variant).toBe('outline')
```

Use the component-specific names in Textarea and Select. Run:

```bash
pnpm exec vitest run packages/ui/src/components/input packages/ui/src/components/textarea packages/ui/src/components/select
```

Expected: FAIL because the variant exports and props do not exist.

- [ ] **Step 2: Implement the internal tuple and public component contracts**

Create the utility, add each prop adjacent to `size` or other visual props, and update component entry exports. Do not change root exports in this task; the release-integration plan adds and validates the new explicit root names after all component contracts settle.

- [ ] **Step 3: Re-run focused tests and typecheck**

```bash
pnpm exec vitest run packages/ui/src/components/input packages/ui/src/components/textarea packages/ui/src/components/select
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: all focused contract tests and Vue typecheck pass.

- [ ] **Step 4: Commit the contract**

```bash
git add packages/ui/src/utils/field-control.ts packages/ui/src/components/input packages/ui/src/components/textarea packages/ui/src/components/select
git commit -m "feat(fields): add shared appearance variants"
```

### Task 2: Apply soft and outline state surfaces to Input and Textarea

**Files:**

- Modify: `packages/ui/src/components/input/src/OInput.vue`
- Modify: `packages/ui/src/components/input/style/index.less`
- Modify: `packages/ui/src/components/input/__tests__/input.test.ts`
- Modify: `packages/ui/src/components/textarea/src/OTextarea.vue`
- Modify: `packages/ui/src/components/textarea/style/index.less`
- Modify: `packages/ui/src/components/textarea/__tests__/textarea.test.ts`

**DOM contract:**

```vue
<span class="o-input" :class="[`o-input--${props.size}`, `o-input--${props.variant}`, ...]">
```

```vue
<div class="o-textarea" :class="[`o-textarea--${props.variant}`, ...]">
```

**CSS state table:**

| State    | Soft                                               | Outline                          |
| -------- | -------------------------------------------------- | -------------------------------- |
| rest     | muted surface, transparent reserved 1px border     | surface, semantic border         |
| hover    | neutral-soft state layer, still transparent border | brand-border hover               |
| focus    | surface, brand border, `0 0 0 2px brand-soft`      | same focus feedback              |
| invalid  | danger border, restrained danger-soft surface      | danger border and normal surface |
| readonly | muted surface, no hover affordance                 | muted surface, semantic border   |
| disabled | muted surface, disabled cursor, current opacity    | same semantic behavior           |

- [ ] **Step 1: Write failing class and state-hook tests**

Add tests named:

- `renders the soft field variant by default and outline on request`
- `keeps invalid readonly and disabled state hooks on both variants`
- `keeps native attrs IME and controlled-value rejection unchanged`

The first test mounts both variants and asserts `o-input--soft` / `o-input--outline`, then the equivalent Textarea classes. Use source checks only for required forced-colors selectors; do not assert browser-computed Less values in jsdom.

- [ ] **Step 2: Add the variant classes without changing event code**

Only edit the root class arrays. Do not duplicate or move native `<input>` / `<textarea>` event handlers.

- [ ] **Step 3: Implement the shared visual state table in Less**

Use these exact variables inside each component root:

```less
--omg-field-background: var(--omg-color-surface-muted);
--omg-field-border-color: transparent;
--omg-field-focus-border: var(--omg-color-brand);
--omg-field-focus-shadow: 0 0 0 2px var(--omg-color-brand-soft);
```

The field surface may set `outline: none`; focus feedback must come from border and shadow. Use `:focus-within` for Input's wrapper and `:focus-visible` for the Textarea field. Invalid focus must keep the danger border. Readonly and disabled selectors must suppress hover changes.

Add a system-color fallback:

```less
@media (forced-colors: active) {
  .o-input__control,
  .o-textarea__field {
    border-color: ButtonText;
  }

  .o-input__control:focus-within,
  .o-textarea__field:focus-visible {
    border-color: Highlight;
    box-shadow: none;
  }
}
```

Retain Textarea's `.omg-scrollbar()`, `resize: none`, fixed/autosize overflow rules, count positioning, and reduced-motion block.

- [ ] **Step 4: Run focused behavior, lint, and style checks**

```bash
pnpm exec vitest run packages/ui/src/components/input packages/ui/src/components/textarea
pnpm exec eslint packages/ui/src/components/input packages/ui/src/components/textarea --max-warnings 0
pnpm exec stylelint "packages/ui/src/components/{input,textarea}/**/*.{vue,less}"
```

Expected: all focused tests and both linters pass.

- [ ] **Step 5: Commit the surfaces**

```bash
git add packages/ui/src/components/input packages/ui/src/components/textarea
git commit -m "style(fields): add soft and outline surfaces"
```

### Task 3: Make Input Group own one coherent field surface

**Files:**

- Modify: `packages/ui/src/components/input-group/style/index.less`
- Modify: `packages/ui/src/components/input-group/__tests__/input-group.test.ts`
- Verify unchanged behavior:
  - `packages/ui/src/components/input-group/src/OInputGroup.vue`
  - `packages/ui/src/components/input-group/src/OInputGroupInput.vue`
  - `packages/ui/src/components/input-group/src/OInputGroupTextarea.vue`

**Architecture:** The group does not add another public variant prop. Nested `OInputGroupInput` and `OInputGroupTextarea` already forward the new field prop. CSS uses `:has(.o-input--outline, .o-textarea--outline)` to select the outline group surface; otherwise the group is soft. If a consumer mixes variants, outline wins and the group still renders one boundary.

- [ ] **Step 1: Write failing group composition tests**

Add tests named:

- `composes default soft children inside one clipped muted surface`
- `uses one outline boundary when a nested field requests outline`
- `keeps focus invalid disabled and nested radii on the group boundary`

Assert rendered child classes and read the Less source for `overflow: clip`, transparent nested borders, outline `:has`, and focus shadow hooks.

- [ ] **Step 2: Implement one clipped surface**

Set `.o-input-group` to a transparent reserved border, muted surface, `overflow: clip`, and the same focus shadow as fields. The outline `:has(...)` selector switches the wrapper to `surface` plus `--omg-color-border`. Nested Input and Textarea surfaces must always have `border: 0`, `border-radius: 0`, `background: transparent`, and `box-shadow: none`; the wrapper owns every outer state.

- [ ] **Step 3: Verify and commit**

```bash
pnpm exec vitest run packages/ui/src/components/input-group
pnpm exec stylelint "packages/ui/src/components/input-group/**/*.{vue,less}"
git add packages/ui/src/components/input-group
git commit -m "style(input-group): unify nested field surfaces"
```

### Task 4: Repair Select's field surface and single trailing rail

**Files:**

- Modify: `packages/ui/src/components/select/src/OSelect.vue`
- Modify: `packages/ui/src/components/select/style/index.less`
- Modify: `packages/ui/src/components/select/__tests__/select.test.ts`

**Geometry contract:**

```text
trigger inline-start padding = 12px
trigger inline-end reservation = 32px
indicator = 16px centered in the same 32px rail
clear action = 24px desktop in that rail
panel padding = 4px
option inline padding = 12px
desktop option min-height = 36px
trigger and option font-size = 14px
```

The chevron and clear action remain siblings in `.o-select__control`; never nest the clear button inside the combobox button.

- [ ] **Step 1: Add failing contract tests**

Add or update tests named:

- `renders soft by default and outline on request`
- `keeps clear as a sibling of the combobox in one trailing rail`
- `replaces the chevron with clear without changing selected text geometry`
- `keeps keyboard clear focus and combobox navigation independent`
- `keeps virtual and normal rows at the same 36px geometry`

The sibling test must assert:

```ts
const trigger = wrapper.get('[role="combobox"]')
const clear = wrapper.get('.o-select__clear')
expect(clear.element.parentElement).toBe(trigger.element.parentElement)
expect(trigger.element.contains(clear.element)).toBe(false)
```

Use a Less-source assertion for `padding-inline: var(--omg-space-3) 32px`, 24px clear size, 12px option padding, 14px text, and coarse-pointer 44px rules.

- [ ] **Step 2: Add the variant class and stable clear hook**

Add `o-select--${props.variant}` to the root classes and `has-clear` only when `clearable && selectedOption && !disabled`. Do not change selection, controlled-open, listbox IDs, Teleport, or virtual-scroller code.

- [ ] **Step 3: Implement the field and rail styles**

Use reserved end padding on every trigger. Absolutely center indicator and clear inside the same logical-end rail. Default desktop behavior:

```less
.o-select__clear {
  opacity: 0;
  pointer-events: none;
}

.o-select.has-clear:hover .o-select__clear,
.o-select.has-clear:focus-within .o-select__clear {
  opacity: 1;
  pointer-events: auto;
}

.o-select.has-clear:hover .o-select__indicator,
.o-select.has-clear:focus-within .o-select__indicator {
  opacity: 0;
}
```

Under `(hover: none), (pointer: coarse)`, always show clear and hide the indicator when available. Keep clear keyboard-focusable even while visually hidden. Use opacity/color transitions only; no width or padding transition may move the label. Open state uses the same focus border and brand-soft shadow as Input/Textarea. Add forced-colors system boundaries.

- [ ] **Step 4: Verify behavior and styles**

```bash
pnpm exec vitest run packages/ui/src/components/select/__tests__/select.test.ts
pnpm exec eslint packages/ui/src/components/select --max-warnings 0
pnpm exec stylelint "packages/ui/src/components/select/**/*.{vue,less}"
```

Expected: Select keyboard, controlled open, clear, normal list, virtual list, Teleport, and variant tests pass.

- [ ] **Step 5: Commit Select**

```bash
git add packages/ui/src/components/select
git commit -m "fix(select): balance field and menu spacing"
```

### Task 5: Make Button and interactive typography compact and host-independent

**Files:**

- Modify: `packages/ui/src/components/button/src/button.ts`
- Modify: `packages/ui/src/components/button/style/index.less`
- Modify: `packages/ui/src/components/button/__tests__/button.test.ts`
- Modify styles:
  - `packages/ui/src/components/accordion/style/index.less`
  - `packages/ui/src/components/checkbox/style/index.less`
  - `packages/ui/src/components/dropdown/style/index.less`
  - `packages/ui/src/components/popover/style/index.less`
  - `packages/ui/src/components/radio/style/index.less`
  - `packages/ui/src/components/switch/style/index.less`

**Button contract:**

```text
default size = sm
sm = 32px / 12px
md = 38px / 14px
lg = 46px / 14px
```

- [ ] **Step 1: Write failing Button default and typography tests**

Assert `oButtonProps.size.default === 'sm'`, default class `o-button--sm`, and exact Less tokens for all three size classes. Add a source contract asserting all seven named interactive family styles contain an explicit OMG font-size token.

- [ ] **Step 2: Change the default and add explicit sizes**

Change only the public default in `button.ts`. In Less define `--omg-button-font-size`, apply it to `.o-button`, use `--omg-font-size-sm` for `sm`, and `--omg-font-size-md` for `md` and `lg`. Font family continues to inherit.

- [ ] **Step 3: Normalize related component typography**

Use `var(--omg-font-size-md)` for ordinary interactive copy and `var(--omg-font-size-sm)` only for dense metadata/compact helper copy. Do not change component heights, motion, colors, or DOM.

- [ ] **Step 4: Verify and commit**

```bash
pnpm exec vitest run packages/ui/src/components/button
pnpm exec stylelint "packages/ui/src/components/{button,accordion,checkbox,dropdown,popover,radio,switch}/**/*.{vue,less}"
pnpm --filter @puzzle-fuzzy/ui typecheck
git add packages/ui/src/components/button packages/ui/src/components/accordion/style packages/ui/src/components/checkbox/style packages/ui/src/components/dropdown/style packages/ui/src/components/popover/style packages/ui/src/components/radio/style packages/ui/src/components/switch/style
git commit -m "style(controls): normalize compact typography"
```

### Task 6: Update VitePress capability pages and the neutral demo shell

**Files:**

- Modify: `apps/docs/docs/.vitepress/theme/custom.less`
- Modify examples:
  - `apps/docs/examples/button/Variants.vue`
  - `apps/docs/examples/button/States.vue`
  - `apps/docs/examples/input/Basic.vue`
  - `apps/docs/examples/textarea/Basic.vue`
  - `apps/docs/examples/select/Basic.vue`
  - `apps/docs/examples/input-group/Inline.vue`
  - `apps/docs/examples/input-group/Block.vue`
  - `apps/docs/examples/input-group/Textarea.vue`
- Modify pages:
  - `apps/docs/docs/components/button.md`
  - `apps/docs/docs/components/input.md`
  - `apps/docs/docs/components/textarea.md`
  - `apps/docs/docs/components/select.md`
  - `apps/docs/docs/components/input-group.md`

**Demo shell contract:**

```less
.omg-docs-demo {
  border: 0;
}

.omg-docs-demo__content {
  gap: var(--omg-space-3);
  font-size: var(--omg-font-size-md);
  line-height: 1.5;
}

.omg-example-stack {
  gap: var(--omg-space-4);
}
```

- [ ] **Step 1: Update demos to reveal, not hide, the public defaults**

Default Button demonstrations omit `size` and therefore show the new 32px/12px contract. Size demonstrations explicitly render `sm`, `md`, and `lg`. Input/Textarea/Select pages each show default soft and explicit `variant="outline"`, plus invalid, readonly, disabled, light, and dark states. Select also shows clearable selected, empty, long-label, disabled-option, RTL, and virtualized cases without adding permanent business state.

- [ ] **Step 2: Update API tables and design prose**

Document each new component-specific variant type/default. Explain that soft reserves a transparent 1px boundary and becomes bordered only for state feedback; outline is the always-visible alternative. Document Select's single trailing rail and clear replacement.

- [ ] **Step 3: Normalize the demo shell**

Remove only the decorative DemoBlock border. Keep the quiet background, 12px radius, current mobile padding, code-block overflow behavior, and VitePress layout. Do not add any `:root` block or any `--vp-c-brand-*` declaration.

- [ ] **Step 4: Build and commit docs**

```bash
pnpm --filter @puzzle-fuzzy/docs typecheck
pnpm docs:build
git add apps/docs/docs/.vitepress/theme/custom.less apps/docs/examples/button apps/docs/examples/input apps/docs/examples/textarea apps/docs/examples/select apps/docs/examples/input-group apps/docs/docs/components/button.md apps/docs/docs/components/input.md apps/docs/docs/components/textarea.md apps/docs/docs/components/select.md apps/docs/docs/components/input-group.md
git commit -m "docs(fields): demonstrate compact soft controls"
```

### Task 7: Focused foundation gate

- [ ] **Step 1: Format the touched files**

```bash
pnpm exec prettier packages/ui/src/utils/field-control.ts packages/ui/src/components/button packages/ui/src/components/input packages/ui/src/components/textarea packages/ui/src/components/select packages/ui/src/components/input-group apps/docs/docs/.vitepress/theme/custom.less apps/docs/examples/button apps/docs/examples/input apps/docs/examples/textarea apps/docs/examples/select apps/docs/examples/input-group apps/docs/docs/components/button.md apps/docs/docs/components/input.md apps/docs/docs/components/textarea.md apps/docs/docs/components/select.md apps/docs/docs/components/input-group.md --write
```

- [ ] **Step 2: Run the subsystem gate**

```bash
pnpm exec vitest run packages/ui/src/components/button packages/ui/src/components/input packages/ui/src/components/textarea packages/ui/src/components/select packages/ui/src/components/input-group
pnpm lint
pnpm lint:styles
pnpm typecheck
pnpm docs:build
```

Expected: all focused tests, lint, styles, workspace types, library build, and docs build pass.

- [ ] **Step 3: Review protected scope**

Confirm with `git diff --check` and `git diff --stat` that no Code Input, Image preview, Tabs slider, Upload behavior, Message service, VitePress brand variable, package manager, or dependency file changed. Browser and package-wide integration are completed by `2026-07-13-compact-prompt-release-integration.md`.
