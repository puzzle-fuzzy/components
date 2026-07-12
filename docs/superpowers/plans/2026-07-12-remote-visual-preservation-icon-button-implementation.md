# Remote Visual Preservation and Icon Button Implementation Plan

> **For Codex:** Execute this plan task by task. Keep the remote Tabs and Image visual decisions intact; correctness fixes must not replace their effects.

**Goal:** Merge `origin/main`, restore a self-contained Teleport image preview, add an accessible icon-only Button mode, and record the personal-library design rules that protect user-authored effects.

**Architecture:** `OImage` owns a lightweight Teleport overlay instead of composing `ODialog`. `OButton` extends its existing native-button contract with one `iconOnly` modifier and continues to receive icons through the existing slot. Remote Tabs markup, measurement, and animation remain the visual source of truth.

**Tech Stack:** Vue 3, TypeScript, Less, `vue-icons-plus`, Vitest, Vue Test Utils, VitePress, Playwright, pnpm.

---

## Task 1: Merge the remote visual work

**Files:**

- Merge: `origin/main`
- Inspect: `packages/ui/src/components/tabs/**`
- Resolve: `packages/ui/src/components/image/**`
- Inspect: `apps/docs/examples/{tabs,image}/**`
- Inspect: `apps/docs/docs/components/{tabs,image}.md`

- [ ] Run `git merge --no-edit origin/main` and retain both the local form/icon work and remote commit `8945652`.
- [ ] Preserve the remote Tabs sliding indicator, `slider` and `line` treatments, `fill` mode, examples, and documentation without redesign.
- [ ] Treat remote Image dimensions, dark overlay, absence of a visible close button, and absence of a zoom badge as approved visuals when resolving conflicts.
- [ ] Run `git diff --check` and inspect the merge diff before component edits.
- [ ] Commit only if Git did not create the merge commit automatically.

## Task 2: Lock the Image contract with failing tests

**Files:**

- Modify: `packages/ui/src/components/image/__tests__/image.test.ts`
- Modify: `packages/ui/tests/ssr/components.test.ts`
- Modify: `apps/docs/tests/e2e/components.spec.ts`

- [ ] Add a unit assertion that `OImage.vue` contains `Teleport` and does not import or render `ODialog`.
- [ ] Add interaction tests for opening, dialog semantics, Escape close, backdrop-only close, image-click retention, focus entry, focus restoration, and one event per transition.
- [ ] Remove tests for a close button and `closeAriaLabel`.
- [ ] Update the browser test to use the remote demo heading and close with Escape while proving focus returns to the preview trigger.
- [ ] Keep or add SSR coverage proving the closed Teleport path renders without browser globals.
- [ ] Run `pnpm vitest run packages/ui/src/components/image/__tests__/image.test.ts packages/ui/tests/ssr/components.test.ts` and confirm the new contract fails before implementation.

## Task 3: Make OImage self-contained with Teleport

**Files:**

- Modify: `packages/ui/src/components/image/src/OImage.vue`
- Modify: `packages/ui/src/components/image/src/image.ts`
- Modify: `packages/ui/src/components/image/style/index.less`

- [ ] Remove the `ODialog` and preview-icon imports and remove `closeAriaLabel` from public props.
- [ ] Keep the real image attributes, native preview button, `previewSrc`, fit, load/error forwarding, and disabled behavior.
- [ ] Teleport the preview layer to `body` only while open; give it `role="dialog"`, `aria-modal="true"`, the existing accessible label, and a focusable layer.
- [ ] On open, remember the trigger and focus the preview layer after render. On close, restore trigger focus after render.
- [ ] Close on Escape and backdrop clicks; stop image clicks from closing. Emit `previewOpen` and `previewClose` once per real transition.
- [ ] Preserve the remote 80vw/80dvh image ceiling, 85% dark overlay, mobile sizing, and no visible close control or zoom badge.
- [ ] Run the focused Image and SSR tests until green.

## Task 4: Lock icon-only Button behavior with failing tests

**Files:**

- Modify: `packages/ui/src/components/button/__tests__/button.test.ts`
- Modify: `apps/docs/tests/e2e/components.spec.ts`

- [ ] Extend the public-prop type fixture with `iconOnly`.
- [ ] Assert the modifier class is opt-in and existing buttons remain unchanged.
- [ ] Assert the icon slot stays decorative, default-slot text stays present for the accessible name, and native `aria-label` remains supported.
- [ ] Assert loading still replaces the icon and disabled/loading click guards are unchanged.
- [ ] Add browser assertions that `sm`, `md`, and `lg` icon buttons are square at the existing control heights and expose accessible names.
- [ ] Run `pnpm vitest run packages/ui/src/components/button/__tests__/button.test.ts` and confirm the new contract fails before implementation.

## Task 5: Add the OButton icon-only mode

**Files:**

- Modify: `packages/ui/src/components/button/src/button.ts`
- Modify: `packages/ui/src/components/button/src/OButton.vue`
- Modify: `packages/ui/src/components/button/style/index.less`

- [ ] Add `iconOnly: { type: Boolean, default: false }` without adding an icon registry or separate component.
- [ ] Add `o-button--icon-only` while preserving every existing size, tone, variant, type, loading, disabled, slot, and click behavior.
- [ ] Set inline and block size to `--omg-button-height`, collapse padding and gap, and keep the existing radius and interaction effects.
- [ ] Apply the shared visually-hidden mixin to default-slot content only in icon-only mode so slot text remains the accessible name.
- [ ] Run the focused Button tests until green.

## Task 6: Update demos, documentation, and personal-library rules

**Files:**

- Create: `apps/docs/examples/button/IconButtons.vue`
- Modify: `apps/docs/docs/components/button.md`
- Modify: `apps/docs/docs/components/image.md`
- Modify: `packages/ui/README.md`
- Modify: `DESIGN.md`
- Modify: `.impeccable/design.json`

- [ ] Add icon-button examples using direct named imports from `vue-icons-plus/lu`, including slot-text and native-label naming patterns.
- [ ] Document `iconOnly`, square sizing, loading behavior, and the accessible-name requirement.
- [ ] Document Image as a self-contained Teleport preview instead of a Dialog composition and remove the obsolete close-label API.
- [ ] Record that approved personal effects and specialized high-frequency components are valid product intent; standards protect maintainability rather than enforcing generic market primitives.
- [ ] Update icon guidance so Image is not described as having a preview icon and icon-only controls are allowed when named.

## Task 7: Preserve Tabs and fix only nonvisual merge defects

**Files:**

- Modify if needed: `packages/ui/src/components/tabs/src/OTabs.vue`
- Modify if needed: `packages/ui/src/components/tabs/style/index.less`
- Modify: `packages/ui/src/components/tabs/__tests__/tabs.test.ts`
- Modify if needed: `tests/setup.ts`
- Format: `apps/docs/examples/tabs/Basic.vue`

- [ ] Add or retain a safe `ResizeObserver` test/runtime guard without changing indicator measurement when the API exists.
- [ ] Add a behavior test proving the indicator adopts the active tab width and translated offset.
- [ ] Fix only formatting, specificity order, and invalid-token issues reported by lint tools; preserve animation geometry and timing.
- [ ] Run `pnpm vitest run packages/ui/src/components/tabs/__tests__/tabs.test.ts` and `pnpm lint:styles`.

## Task 8: Full verification and handoff

**Files:**

- Review: all changed files

- [ ] Run `pnpm format` and review that it did not alter unrelated user work.
- [ ] Run `pnpm check`.
- [ ] Run `pnpm build`.
- [ ] Run `pnpm test:ssr`.
- [ ] Run `pnpm test:package`.
- [ ] Run `pnpm test:e2e`.
- [ ] Inspect the Button, Image, and Tabs examples in the built docs or browser and confirm the approved visuals.
- [ ] Run `git diff --check`, review `git status`, and create one intentional implementation commit on `main`.
- [ ] Report the merge result, verification evidence, commit hash, and whether local `main` is ahead of `origin/main`; do not push unless separately requested.
