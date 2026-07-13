# Component Visual Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Radio and repair Button icons, host-heading isolation, Empty sizing, Message feedback rhythm, and Dropdown/Select trailing space while preserving every native interaction contract.

**Architecture:** Behavior and public APIs remain in their current component modules. The work changes local Less geometry and the smallest necessary template hooks, then locks the visual contracts with focused Vitest and VitePress Playwright coverage. Alert and Message share visual rhythm but remain independent components; Dropdown and Select share numeric geometry but gain no public base component.

**Tech Stack:** Vue 3.5, TypeScript, Less, `vue-icons-plus/lu`, Reka UI, Floating UI, Vitest, Vue Test Utils, VitePress, Playwright, pnpm.

## Global Constraints

- Use Node.js 24 LTS and pnpm; add no Bun file, script, configuration, or lockfile.
- `packages/ui` remains the only published package and `apps/docs` remains a private consumer.
- Public names remain `O*`, CSS remains `.o-*`, and CSS variables remain `--omg-*`.
- Keep the package Vue-only and ESM-only. Add no runtime dependency.
- Use only `vue-icons-plus/lu` for icons; add no handwritten SVG.
- Do not change Radio, Message, Dropdown, Select, Dialog, Alert, or Empty business behavior.
- Keep Message light surface exactly `#fff`, dark surface exactly `#2d2d2d`, borderless shadow, current service lifecycle, right-side entry, and scale/fade exit.
- Keep logical properties, RTL, 44px coarse-pointer targets, forced-colors behavior, and reduced-motion fallbacks.
- Do not declare or override any VitePress `--vp-*` variable or globally replace `.vp-doc h3`.
- Follow TDD: add the focused failing contract before each implementation and run the narrow test before the full gate.

---

### Task 1: Own Button icon geometry and isolate semantic headings

**Files:**

- Modify: `packages/ui/src/components/button/style/index.less`
- Modify: `packages/ui/src/components/button/__tests__/button.test.ts`
- Modify: `packages/ui/src/components/accordion/style/index.less`
- Modify: `packages/ui/src/components/accordion/__tests__/accordion.test.ts`
- Modify: `packages/ui/src/components/empty/style/index.less`
- Modify: `packages/ui/src/components/empty/__tests__/empty.test.ts`
- Modify: `packages/ui/src/components/card/style/index.less`
- Modify: `packages/ui/src/components/card/__tests__/card.test.ts`

**Interfaces:**

- `--omg-button-icon-size` is internal component geometry, not a new public prop.
- Semantic heading tags remain unchanged; only component-owned selectors become stronger than host prose selectors.
- `OEmpty` becomes a full available-width block surface with `inline-size: 100%`.

- [ ] **Step 1: Add failing source-contract tests**

Extend the existing style-source tests with these contracts:

```ts
expect(buttonStyle).toContain('--omg-button-icon-size: var(--omg-space-4)')
expect(buttonStyle).toMatch(/&__icon\s*>\s*svg[\s\S]*inline-size:\s*100%/u)
expect(buttonStyle).toMatch(/&--lg[\s\S]*--omg-button-icon-size:\s*18px/u)

expect(accordionStyle).toContain('.o-accordion__item > .o-accordion__header')
expect(emptyStyle).toContain('.o-empty__header > .o-empty__title')
expect(cardStyle).toContain('.o-card__copy > .o-card__title')
expect(emptyStyle).toMatch(/\.o-empty\s*\{[\s\S]*inline-size:\s*100%/u)
```

Run:

```bash
pnpm exec vitest run packages/ui/src/components/button packages/ui/src/components/accordion packages/ui/src/components/empty packages/ui/src/components/card
```

Expected: the new assertions fail before Less changes.

- [ ] **Step 2: Implement Button icon sizing**

Add the default token and large override:

```less
.o-button {
  --omg-button-icon-size: var(--omg-space-4);

  &--lg {
    --omg-button-icon-size: 18px;
  }

  &__icon {
    inline-size: var(--omg-button-icon-size);
    block-size: var(--omg-button-icon-size);
  }

  &__icon > svg {
    display: block;
    inline-size: 100%;
    block-size: 100%;
  }
}
```

Do not translate text or branch on language. Keep spinner behavior and icon-only button square sizing intact.

- [ ] **Step 3: Implement host-heading isolation and Empty sizing**

Add structural rules with the exact reset fields:

```less
.o-accordion__item > .o-accordion__header,
.o-empty__header > .o-empty__title,
.o-card__copy > .o-card__title {
  margin: 0;
  letter-spacing: normal;
}
```

Keep each selector in its component file and repeat that component's explicit `font-size` and `line-height` so a host `h3` rule cannot win either property. Add `inline-size: 100%` to `.o-empty` without adding a border or wrapper.

- [ ] **Step 4: Run focused tests and style lint**

```bash
pnpm exec vitest run packages/ui/src/components/button packages/ui/src/components/accordion packages/ui/src/components/empty packages/ui/src/components/card
pnpm exec stylelint "packages/ui/src/components/{button,accordion,empty,card}/**/*.{vue,less}"
```

Expected: all focused tests and style lint pass.

- [ ] **Step 5: Commit the geometry foundation**

```bash
git add packages/ui/src/components/button packages/ui/src/components/accordion packages/ui/src/components/empty packages/ui/src/components/card
git commit -m "fix(ui): stabilize icon and heading geometry"
```

### Task 2: Redesign Radio without changing its native contract

**Files:**

- Modify: `packages/ui/src/components/radio/style/index.less`
- Modify: `packages/ui/src/components/radio/__tests__/radio.test.ts`
- Modify: `apps/docs/examples/radio/Basic.vue`
- Modify: `apps/docs/docs/components/radio.md`

**Interfaces:**

- `ORadio`, `ORadioGroup`, their props, native input, provide/inject state, and emitted values do not change.
- Internal style variables: `--omg-radio-accent`, `--omg-radio-state-layer`, and `--omg-radio-state-opacity`.

- [ ] **Step 1: Add failing visual-contract tests**

Keep behavior tests and add source assertions for:

```ts
expect(styleSource).toContain('--omg-radio-accent: var(--omg-color-brand)')
expect(styleSource).toMatch(/inline-size:\s*20px/u)
expect(styleSource).toMatch(/border:\s*2px solid/u)
expect(styleSource).toMatch(/\.o-radio__indicator::before/u)
expect(styleSource).toContain('@media (forced-colors: active)')
```

Run `pnpm exec vitest run packages/ui/src/components/radio` and confirm the new assertions fail.

- [ ] **Step 2: Implement the compact state-layer visual**

Use this geometry:

```less
.o-radio-group {
  gap: var(--omg-space-2);
}

.o-radio-group--horizontal {
  row-gap: var(--omg-space-2);
  column-gap: var(--omg-space-4);
}

.o-radio {
  --omg-radio-accent: var(--omg-color-brand);
  --omg-radio-state-layer: var(--omg-color-brand-soft);

  &__label {
    min-block-size: var(--omg-control-height-sm);
    align-items: center;
  }

  &__indicator {
    position: relative;
    inline-size: 20px;
    block-size: 20px;
    border: 2px solid var(--omg-color-border);
  }

  &__indicator::before {
    position: absolute;
    inset: 50% auto auto 50%;
    inline-size: 36px;
    block-size: 36px;
    border-radius: var(--omg-radius-full);
    background: var(--omg-radio-state-layer);
    content: '';
    opacity: var(--omg-radio-state-opacity, 0);
    transform: translate(-50%, -50%) scale(0.9);
  }

  &__dot {
    inline-size: 10px;
    block-size: 10px;
    background: var(--omg-radio-accent);
  }
}
```

Checked uses the accent for ring and dot. Invalid replaces the accent and state layer with danger roles. Hover, active, and focus-visible change state-layer opacity; disabled suppresses hover. Coarse pointer labels remain at least 44px. Add forced-colors rules for ring, dot, and focus.

- [ ] **Step 3: Expand the documentation example**

Keep the current two groups and add clearly named invalid, long-label, and dark-theme examples. Do not introduce card-radio or segmented APIs.

- [ ] **Step 4: Run Radio tests, typecheck, and lint**

```bash
pnpm exec vitest run packages/ui/src/components/radio
pnpm --filter @puzzle-fuzzy/ui typecheck
pnpm exec stylelint "packages/ui/src/components/radio/**/*.{vue,less}"
```

Expected: native interaction tests and new visual contracts pass.

- [ ] **Step 5: Commit Radio**

```bash
git add packages/ui/src/components/radio apps/docs/examples/radio apps/docs/docs/components/radio.md
git commit -m "style(radio): add compact state-layer design"
```

### Task 3: Bring Message into Alert's visual rhythm

**Files:**

- Modify: `packages/ui/src/components/message/style/index.less`
- Modify: `packages/ui/src/components/message/__tests__/message.test.ts`
- Modify: `apps/docs/examples/message/Declarative.vue`
- Modify: `apps/docs/docs/components/message.md`

**Interfaces:**

- `OMessage`, `oMessage()`, Message Host, duration, focus pause, hover policy, roles, stacking, and transitions remain unchanged.
- No new title, description, action, or Alert dependency.

- [ ] **Step 1: Add failing Message visual tests**

Assert the style contains a three-column grid, 28px icon tile, 16px icon, 24px close control, 16px close icon, semantic soft status variables, and a coarse-pointer 44px pseudo target. Keep all lifecycle tests unchanged.

Run `pnpm exec vitest run packages/ui/src/components/message` and confirm only the new visual assertions fail.

- [ ] **Step 2: Implement the Alert-aligned surface**

Use local semantic variables and keep the outer surface opaque:

```less
.o-message {
  --omg-message-accent: var(--omg-color-brand);
  --omg-message-icon-background: var(--omg-color-brand-soft);

  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
}

.o-message__icon {
  inline-size: 28px;
  block-size: 28px;
  border-radius: var(--omg-radius-md);
  background: var(--omg-message-icon-background);
  color: var(--omg-message-accent);
}

.o-message__icon > svg {
  inline-size: var(--omg-space-4);
  block-size: var(--omg-space-4);
}

.o-message__content {
  display: grid;
  min-block-size: 28px;
  align-content: center;
  gap: var(--omg-space-1);
}
```

Map success, warning, and error to their existing accent and soft tokens. Set close to 24px/16px. Keep outer background, border, shadow, host width, entry/leave classes, and reduced-motion selectors untouched.

- [ ] **Step 3: Update Message documentation**

Use the declarative example to show one-line, multi-block slot, closable, and long content. Explain that only the icon tile is semantically tinted and the outer surface remains opaque.

- [ ] **Step 4: Run focused Message tests and style lint**

```bash
pnpm exec vitest run packages/ui/src/components/message
pnpm exec stylelint "packages/ui/src/components/message/**/*.{vue,less}"
```

Expected: lifecycle and visual tests pass.

- [ ] **Step 5: Commit Message**

```bash
git add packages/ui/src/components/message apps/docs/examples/message apps/docs/docs/components/message.md
git commit -m "style(message): refine status feedback surface"
```

### Task 4: Balance Dropdown and Select tail geometry

**Files:**

- Modify: `packages/ui/src/components/dropdown/src/ODropdown.vue`
- Modify: `packages/ui/src/components/dropdown/style/index.less`
- Modify: `packages/ui/src/components/dropdown/__tests__/dropdown.test.ts`
- Modify: `packages/ui/src/components/select/style/index.less`
- Modify: `packages/ui/src/components/select/__tests__/select.test.ts`
- Modify: `apps/docs/docs/components/dropdown.md`
- Modify: `apps/docs/docs/components/select.md`

**Interfaces:**

- Dropdown calls `useFloatingPanel({ matchReferenceWidth: true })` so a short menu starts at trigger width and long content may expand it.
- Dropdown adds only an internal trigger class for the indicator rail.
- Select desktop rail is 28px; coarse-pointer rail remains 44px.

- [ ] **Step 1: Add failing layout tests**

Assert Dropdown passes `matchReferenceWidth: true`, renders `o-dropdown__trigger--with-indicator` when requested, and no longer fixes the panel to 160px. Update Select source assertions from 32px to the named 28px rail while preserving 24px clear action and 44px touch rail.

Run:

```bash
pnpm exec vitest run packages/ui/src/components/dropdown packages/ui/src/components/select
```

Expected: new geometry assertions fail.

- [ ] **Step 2: Implement Dropdown trigger and panel sizing**

Add the conditional class:

```vue
<button
  class="o-dropdown__trigger"
  :class="{ 'o-dropdown__trigger--with-indicator': props.showIndicator }"
>
```

Add `matchReferenceWidth: true` to the floating options. Use a 28px absolute tail rail for the indicator, ordinary 12px padding without it, and remove `min-inline-size: 160px` from the panel. Keep viewport max width and content-driven growth.

- [ ] **Step 3: Implement Select's named 28px desktop rail**

Set:

```less
--omg-select-rail-size: 28px;
```

Center the 16px chevron and 24px clear action in that rail using logical offsets. Do not let clear visibility move `.o-select__value`. Keep the coarse-pointer override at 44px.

- [ ] **Step 4: Update documentation and run focused checks**

Document the compact rail and trigger-width menu rule. Run:

```bash
pnpm exec vitest run packages/ui/src/components/dropdown packages/ui/src/components/select
pnpm exec stylelint "packages/ui/src/components/{dropdown,select}/**/*.{vue,less}"
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: all focused tests pass.

- [ ] **Step 5: Commit popup geometry**

```bash
git add packages/ui/src/components/dropdown packages/ui/src/components/select apps/docs/docs/components/dropdown.md apps/docs/docs/components/select.md
git commit -m "style(popups): balance trailing geometry"
```

### Task 5: Add VitePress regressions and complete release validation

**Files:**

- Modify: `apps/docs/tests/e2e/components.spec.ts`
- Modify when needed for truthful examples:
  - `apps/docs/examples/dialog/Basic.vue`
  - `apps/docs/examples/dialog/Sizes.vue`
  - `apps/docs/examples/empty/Basic.vue`
- Modify design contracts:
  - `DESIGN.md`
  - `.impeccable/design.json`

**Interfaces:** No public API changes. E2E tests consume rendered component classes and computed styles only.

- [ ] **Step 1: Add failing browser regressions**

Add focused tests with these exact outcomes:

- Dialog `sm` icon buttons remain 32px high; direct icon SVG is 16px; icon and text center deviation is at most 0.5px.
- Accordion header margin is `0px`; its first item has no 32px top hole.
- Basic Empty root is wider than 300px on desktop, title margin is `0px`, and description width is wider than 240px.
- Card title margin is `0px` under VitePress.
- Radio indicator is 20px with 2px border; checked/invalid colors agree; focus and 390px targets remain visible.
- Message surfaces stay `rgb(255, 255, 255)` / `rgb(45, 45, 45)`, icon tile is 28px, and close SVG is 16px.
- Dropdown short menu is at least trigger width without a fixed 160px tail; Select and Dropdown desktop rails are 28px and RTL mirrors correctly.

Run focused grep groups first and confirm failure before rebuilding.

- [ ] **Step 2: Update design contracts and examples**

Replace the old 32px Select rail statement with 28px desktop / 44px touch. Add Radio state-layer and Message icon-tile geometry. State explicitly that Button owns slotted SVG size and semantic component headings reset host prose typography. Keep VitePress brand variables untouched.

- [ ] **Step 3: Run focused unit, type, and browser tests**

```bash
pnpm exec vitest run packages/ui/src/components/button packages/ui/src/components/radio packages/ui/src/components/accordion packages/ui/src/components/empty packages/ui/src/components/card packages/ui/src/components/message packages/ui/src/components/dropdown packages/ui/src/components/select
pnpm --filter @puzzle-fuzzy/ui typecheck
pnpm --filter @puzzle-fuzzy/docs typecheck
pnpm docs:build
pnpm --filter @puzzle-fuzzy/docs exec playwright test --grep "Button icon geometry|host heading isolation|Empty usable width|Radio visual states|Message feedback surface|popup trailing geometry"
```

Expected: all focused checks pass.

- [ ] **Step 4: Run the full repository gate**

```bash
pnpm verify
```

Expected: formatting, lint, stylelint, naming, typecheck, 49+ unit files, coverage, build, SSR, package smoke, VitePress build, and the full Playwright suite pass.

- [ ] **Step 5: Perform live visual inspection**

Inspect Button, Radio, Accordion, Empty, Card, Message, Dropdown, Select, and Dialog at the default desktop viewport and 390px width. Verify dark theme, keyboard focus, menu opening, Message entry/exit, and no horizontal overflow. Reset the temporary viewport after inspection.

- [ ] **Step 6: Commit release integration**

```bash
git add apps/docs DESIGN.md .impeccable/design.json
git commit -m "test(docs): lock component visual consistency"
```

- [ ] **Step 7: Synchronize and publish `main`**

```bash
git fetch origin --prune
git merge origin/main
pnpm verify
git push origin main
```

Expected: merge is clean or conflicts are resolved without discarding remote effects; final `main...origin/main` divergence is `0 0` and the worktree is clean.
