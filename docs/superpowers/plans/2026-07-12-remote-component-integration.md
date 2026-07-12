# Remote Component Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate `origin/codex/upload-component` into `main`, repair every confirmed standards violation, and publish one verified Vue-only component package.

**Architecture:** Preserve both sides of the branch split: the local Dropdown/Select/AvatarDropdown foundation and the remote Dialog/Image/Tabs/Textarea/ReferenceTextarea/Upload work. Harden modal behavior around a native `<dialog>`, compose Image preview from Dialog, keep text reference rendering consumer-controlled, and extend existing package, naming, SSR, documentation, and browser contracts to all fifteen components.

**Tech Stack:** Vue 3.5, TypeScript, Less, Vite 8, Vitest, Vue Test Utils, VitePress, Playwright, pnpm.

## Global Constraints

- The published package is Vue 3 only and remains ESM-only.
- Use the existing pnpm workspace and Vitest/Playwright verification commands.
- Public components use `O*`, styles use `.o-*`, and tokens use `--omg-*`.
- Built-in and documentation icons import only from `vue-icons-plus/lu`; inline copied SVG is prohibited.
- Components contain reusable UI behavior only; networking, upload persistence, member parsing, routing, and permissions remain consumer concerns.
- WCAG 2.1 AA keyboard, focus, naming, ARIA, SSR/hydration, dark theme, RTL where relevant, and reduced motion are release requirements.
- Do not add `--vp-c-brand-*`, compatibility aliases, CommonJS, UMD, or private-code branches.

---

### Task 1: Merge The Remote Branch Without Dropping Either Component Set

**Files:**

- Merge: `origin/codex/upload-component`
- Resolve: `apps/docs/docs/.vitepress/config.mts`
- Resolve: `packages/ui/package.json`
- Resolve: `packages/ui/src/index.ts`
- Resolve: `packages/ui/src/styles/index.less`
- Resolve: `packages/ui/tests/ssr/ssr.test.ts`
- Resolve: `packages/ui/vite.config.ts`
- Resolve: `scripts/check-naming.mjs`

**Interfaces:**

- Consumes: local nine-component package and remote six-component package.
- Produces: one source tree containing all fifteen explicit component entries and docs routes.

- [ ] **Step 1: Start the no-fast-forward merge**

Run: `git merge --no-ff origin/codex/upload-component`

Expected: seven shared integration files conflict; newly added component folders merge without content conflicts.

- [ ] **Step 2: Resolve every shared file as a union**

Keep these component names in all registries and package entries:

```text
avatar, avatar-dropdown, avatar-flow, avatar-group, button, code-input,
dialog, divider, dropdown, image, reference-textarea, select, tabs,
textarea, upload
```

- [ ] **Step 3: Confirm conflict markers are gone**

Run: `git diff --check && git status --short`

Expected: no conflict markers and no unmerged paths.

### Task 2: Harden Dialog And Reuse It For Image Preview

**Files:**

- Modify: `packages/ui/src/components/dialog/src/ODialog.vue`
- Modify: `packages/ui/src/components/dialog/src/dialog.ts`
- Modify: `packages/ui/src/components/dialog/style/index.less`
- Modify: `packages/ui/src/components/dialog/__tests__/dialog.test.ts`
- Modify: `packages/ui/src/components/image/src/OImage.vue`
- Modify: `packages/ui/src/components/image/src/image.ts`
- Modify: `packages/ui/src/components/image/style/index.less`
- Modify: `packages/ui/src/components/image/__tests__/image.test.ts`

**Interfaces:**

- `ODialog` uses native `showModal()`/`close()` and emits `update:open` plus `close` only for user close requests.
- `ODialog` exposes `title`, `description`, `ariaLabel`, `closeOnMask`, `closeOnEsc`, `showClose`, and `closeAriaLabel`.
- `OImage` keeps `preview` internal visibility but delegates modal focus, Escape, backdrop, and restoration to `ODialog`.

- [ ] **Step 1: Add failing modal regression tests**

Cover deterministic `useId()` output, initial focus, native cancel, rejected controlled close, close-button naming, focus restoration, SSR setup, and Image keyboard activation.

Run: `pnpm exec vitest run packages/ui/src/components/dialog packages/ui/src/components/image`

Expected: the remote implementation fails deterministic hydration, keyboard preview, and modal focus contracts.

- [ ] **Step 2: Implement the native modal contract**

Use this close boundary:

```ts
const requestClose = (): void => {
  emit('update:open', false)
  emit('close')
}
```

Prevent native `cancel` before requesting close so a controlled parent can reject it. Use `useId()` for labels, `LuX` for the close action, semantic tokens for the surface/backdrop, and a shadow within the design system's 8px blur ceiling.

- [ ] **Step 3: Compose Image preview from Dialog**

Render a native button around previewable images, preserve a non-interactive native image otherwise, forward image attributes deliberately, and label the preview with `previewAriaLabel`.

- [ ] **Step 4: Verify focused tests**

Run: `pnpm exec vitest run packages/ui/src/components/dialog packages/ui/src/components/image`

Expected: all Dialog and Image tests pass.

### Task 3: Normalize Textarea And Make ReferenceTextarea Generic

**Files:**

- Modify: `packages/ui/src/components/textarea/src/OTextarea.vue`
- Modify: `packages/ui/src/components/textarea/src/textarea.ts`
- Modify: `packages/ui/src/components/textarea/__tests__/textarea.test.ts`
- Modify: `packages/ui/src/components/reference-textarea/src/OReferenceTextarea.vue`
- Modify: `packages/ui/src/components/reference-textarea/src/reference-textarea.ts`
- Modify: `packages/ui/src/components/reference-textarea/__tests__/reference-textarea.test.ts`

**Interfaces:**

- Both components forward native form attributes to their `<textarea>` while keeping consumer classes on the component root.
- `OReferenceTextarea` consumes controlled visual references instead of parsing member/image markup.

```ts
export interface OReferenceTextareaReference {
  readonly id: string
  readonly label: string
  readonly kind?: 'text' | 'image'
  readonly thumbnailSrc?: string
}
```

- [ ] **Step 1: Replace parser tests with controlled-reference tests**

Cover `references`, reference slot props, duplicate-safe keys, empty state, native attrs, focus/blur emits, count description, disabled, readonly, and invalid semantics.

- [ ] **Step 2: Remove business parsing and implement the generic contract**

Delete `parseOReferenceTextareaReferences` and `referencesChange`. Keep value updates and references as independent controlled inputs.

- [ ] **Step 3: Verify focused tests**

Run: `pnpm exec vitest run packages/ui/src/components/textarea packages/ui/src/components/reference-textarea`

Expected: all textarea tests pass without member/image syntax knowledge in the UI package.

### Task 4: Repair Tabs Roving Focus And Panel Semantics

**Files:**

- Modify: `packages/ui/src/components/tabs/src/OTabs.vue`
- Modify: `packages/ui/src/components/tabs/src/tabs.ts`
- Modify: `packages/ui/src/components/tabs/style/index.less`
- Modify: `packages/ui/src/components/tabs/__tests__/tabs.test.ts`

**Interfaces:**

- `items` is `readonly OTabsItem[]`.
- Invalid, missing, removed, or disabled model values leave the first enabled tab in the tab order.
- Arrow, Home, and End skip disabled tabs and retain focus even while a controlled parent decides whether to accept selection.
- Optional panel content receives `{ item }` and is linked through deterministic tab/panel IDs.

- [ ] **Step 1: Add failing dynamic-collection and ARIA tests**

Cover invalid model values, all-disabled items, reorder/removal, deterministic IDs, `aria-controls`, `aria-labelledby`, keyboard wrap, and controlled rejection.

- [ ] **Step 2: Implement value-based roving focus and tokenized active styling**

Avoid an index-only indicator as the state source; derive selection by stable item value and make active presentation work in both LTR and RTL.

- [ ] **Step 3: Verify focused tests**

Run: `pnpm exec vitest run packages/ui/src/components/tabs`

Expected: all Tabs tests pass.

### Task 5: Normalize Upload Selection, Icons, And List Semantics

**Files:**

- Modify: `packages/ui/src/components/upload/src/OUpload.vue`
- Modify: `packages/ui/src/components/upload/src/upload.ts`
- Modify: `packages/ui/src/components/upload/style/index.less`
- Modify: `packages/ui/src/components/upload/__tests__/upload.test.ts`

**Interfaces:**

- `files` is controlled and readonly; selection emits native `File[]` without performing uploads.
- `multiple=false` limits both picker and drop selections to one file.
- `maxCount` is normalized to a non-negative integer for picker and drop paths.
- Visible labels and state text are configurable; default icons use `LuUpload`, `LuFile`, and `LuX`.
- The selected file collection uses list/listitem semantics; progress values match visual states.

- [ ] **Step 1: Add failing drop and accessibility regressions**

Cover single-file drop limiting, `maxCount`, disabled drag reset, list semantics, state progress, configurable labels, kebab-case `drag-change`, and the absence of inline SVG.

- [ ] **Step 2: Implement the minimal UI-only behavior**

Keep drag state local and emit only `select`, `remove`, `clear`, and `drag-change`; do not add requests, retries, persistence, or validation policy.

- [ ] **Step 3: Verify focused tests**

Run: `pnpm exec vitest run packages/ui/src/components/upload`

Expected: all Upload tests pass.

### Task 6: Complete Package, Docs, SSR, And Browser Contracts

**Files:**

- Modify: `packages/ui/tests/package/package-contract.test.ts`
- Modify: `scripts/test-package.mjs`
- Modify: `packages/ui/tests/ssr/ssr.test.ts`
- Modify: `scripts/check-naming.mjs`
- Modify: `packages/ui/README.md`
- Modify: `README.md`
- Modify: `DESIGN.md`
- Modify: `.impeccable/design.json`
- Modify: `apps/docs/docs/components/*.md`
- Modify: `apps/docs/examples/**`
- Modify: `apps/docs/tests/e2e/components.spec.ts`

**Interfaces:**

- Produces explicit root and subpath exports for all fifteen components.
- Produces source-mode and built-package documentation routes for all components.
- Produces package smoke imports from every new subpath.

- [ ] **Step 1: Extend package and naming contracts**

Add all six remote subpaths to package tarball verification and the generated Vue consumer. Extend the icon checker to reject inline `<svg>` in component SFCs.

- [ ] **Step 2: Extend SSR and hydration coverage**

Render every component without browser globals and hydrate controlled-open Dialog/Image states without duplicate overlays or ID mismatch.

- [ ] **Step 3: Update docs and design context**

Document UI-only boundaries, keyboard tables, slots/events, native dialog behavior, controlled references, and no-network Upload behavior. Preserve the Precision Workbench tokens and VitePress isolation.

- [ ] **Step 4: Run focused browser checks**

Verify Dialog focus/Escape/restoration, Image keyboard preview, Tabs keyboard navigation, Upload selection, textareas, dark theme, reduced motion, and axe coverage including top-layer/modal content.

### Task 7: Verify, Commit, Merge To Main, And Push

**Files:**

- Verify the complete workspace and Git history.

- [ ] **Step 1: Run the release gate**

Run: `pnpm verify`

Expected: formatting, ESLint, Stylelint, naming, typecheck, unit coverage, build, SSR, package tarball, and Playwright all pass.

- [ ] **Step 2: Commit the integration repairs**

Run: `git add -- . && git commit -m "fix: standardize remote component integration"`

- [ ] **Step 3: Confirm main and push**

Run: `git branch --show-current && git status --short && git push origin main`

Expected: current branch is `main`, worktree is clean, and `origin/main` advances to the verified integration commit.
