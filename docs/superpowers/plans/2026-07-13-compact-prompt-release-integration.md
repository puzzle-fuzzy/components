# Compact Prompt Release Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the compact field foundation, corrected Message lifecycle, and reference-image Prompt editor across public exports, design records, package contracts, VitePress browser coverage, and the complete release gate, then safely publish `main`.

**Architecture:** Component agents own focused runtime/tests/examples. This plan owns shared files and cross-family evidence: root exports, manifest/design sources, the single Playwright suite, packed consumption, full verification, live visual review, remote reconciliation, final commits, and push. Shared files are edited only after component APIs have settled to avoid parallel conflicts.

**Tech Stack:** Vue 3.5, TypeScript, Less, Vite/VitePress, Vitest, Playwright, axe, pnpm, Git.

## Global Constraints

- Execute only after the three subsystem plans reach passing focused gates:
  - `2026-07-13-compact-control-foundation-implementation.md`
  - `2026-07-13-message-lifecycle-correction-implementation.md`
  - `2026-07-13-reference-image-prompt-input-implementation.md`
- Use Node.js 24 LTS and pnpm. Do not add Bun-specific files or commands.
- Preserve unrelated user changes and protected Image preview, Tabs slider, Upload visuals, Code Input cells, Avatar, Dialog, and Drawer behavior.
- Do not declare or override any VitePress `--vp-*` variable.
- Use Python UTF-8 scripts for temporary repository scans or migrations to avoid PowerShell encoding issues.
- Do not weaken tests, coverage thresholds, naming rules, lint rules, package checks, or accessibility assertions to make the gate pass.
- Work on `main`, reconcile fetched remote work without destructive reset, and push only after `pnpm verify` and visual review pass.

---

### Task 1: Reconcile public root and subpath type contracts

**Files:**

- Modify: `packages/ui/src/index.ts`
- Verify/modify component entries:
  - `packages/ui/src/components/input/index.ts`
  - `packages/ui/src/components/textarea/index.ts`
  - `packages/ui/src/components/select/index.ts`
  - `packages/ui/src/components/reference-textarea/index.ts`
- Modify: `scripts/test-package.mjs`
- Modify: `packages/ui/tests/ssr/ssr.test.ts`
- Verify unchanged publication map:
  - `packages/ui/package.json`
  - `packages/ui/vite.config.ts`

**Expected public additions:**

```ts
// Input
oInputVariants
OInputVariant

// Textarea
oTextareaVariants
OTextareaVariant

// Select
oSelectVariants
OSelectVariant

// Reference Textarea
OReferenceTextareaMedia
OReferenceTextareaLabels
OReferenceTextareaLabelOverrides
OReferenceTextareaMediaSlotProps
OReferenceTextareaMentionOptionSlotProps
reindexOReferenceTextareaTokens
```

Do not export internal `OFieldControlVariant`, `OReferenceTextareaMention`, token detection/insertion helpers, or the file-selection composable from the package root.

- [ ] **Step 1: Add packed-consumer type usage before root edits**

In the generated consumer used by `scripts/test-package.mjs`, import component-specific variant tuples/types from both root and their relevant subpaths. Import the new Reference Textarea media/props/helper from root and its subpath. Use:

```ts
const inputVariant: OInputVariant = 'soft'
const textareaVariant: OTextareaVariant = 'outline'
const selectVariant: OSelectVariant = 'soft'
const referenceVariant: NonNullable<OReferenceTextareaProps['variant']> = 'soft'
const reindexed = reindexOReferenceTextareaTokens('[Image 2]', 0)
void reindexed
```

Render root and subpath components with these props and a typed media array. Run:

```bash
pnpm build
pnpm test:package
```

Expected before any missing export fix: declaration/consumer import failure identifying the exact missing symbol.

- [ ] **Step 2: Add only component-named root exports**

Update existing explicit export blocks. Keep internal shared sources private and preserve component ordering. No package export-map or Vite entry is needed because all four component subpaths already exist.

- [ ] **Step 3: Consolidate SSR coverage**

Ensure SSR renders soft and outline Input/Textarea/Select, controlled `OMessage`, and Reference media/Prompt without opening a floating panel or service host. No test may stub away setup-time DOM errors.

- [ ] **Step 4: Verify build, SSR, and tarball consumption**

```bash
pnpm build
pnpm test:ssr
pnpm test:package
```

Expected: declarations, publint, attw, root/subpath consumer typecheck, real tarball install, and Vite consumer build all pass.

- [ ] **Step 5: Commit public integration**

```bash
git add packages/ui/src/index.ts packages/ui/src/components/input/index.ts packages/ui/src/components/textarea/index.ts packages/ui/src/components/select/index.ts packages/ui/src/components/reference-textarea/index.ts packages/ui/tests/ssr/ssr.test.ts scripts/test-package.mjs
git commit -m "build(ui): publish compact prompt contracts"
```

### Task 2: Align manifest and durable design sources

**Files:**

- Modify: `packages/ui/component-manifest.json`
- Modify: `packages/ui/README.md`
- Modify: `PRODUCT.md`
- Modify: `DESIGN.md`
- Modify: `.impeccable/design.json`

- [ ] **Step 1: Update existing component records without changing counts**

Record:

- Button default `sm`, size typography 12/14/14, and explicit host-independent type;
- Input/Textarea/Select public `soft | outline` variants, soft default, state table, forced-colors behavior, and Input Group single surface;
- Select's exact 12px start / 32px trailing rail / 24px desktop clear / 4px panel / 12px option / 36px row contract;
- Message service default 3000ms, hover pause false, focus pause mandatory, non-positive persistence, and static `OMessage` distinction;
- Reference Textarea's dedicated image media, exact `[Image n]` mapping, consumer-owned file URLs/removal/reindexing, native textarea mention behavior, and OImage preview composition.

Delete obsolete generic `text | image` reference-list language. Do not change component family/public component counts because no family was added.

- [ ] **Step 2: Preserve personal-library scope**

State that these are UI lifecycle and composition contracts, not business upload, validation, persistence, API, notification store, or prompt-request construction. Keep the project's allowance for personal, opinionated components.

- [ ] **Step 3: Scan forbidden and obsolete sources**

Create a temporary Python UTF-8 scan (do not commit it) that checks all current source/documentation files, excluding `.git`, `node_modules`, `dist`, VitePress build output, and `docs/superpowers`, for:

```text
--vp-c-brand-1
--vp-c-brand-2
--vp-c-brand-3
--vp-c-brand-soft
OReferenceTextareaReferenceKind
thumbnailSrc
```

Expected: no match. Also scan current Vue/TS/Less files for handwritten `<svg`; every changed built-in icon must use `vue-icons-plus/lu`.

- [ ] **Step 4: Commit durable records**

```bash
git add packages/ui/component-manifest.json packages/ui/README.md PRODUCT.md DESIGN.md .impeccable/design.json
git commit -m "docs(ui): record compact prompt standards"
```

### Task 3: Add one cross-family Playwright contract without weakening existing tests

**Files:**

- Modify: `apps/docs/tests/e2e/components.spec.ts`

Use stable roles/labels from capability examples. Keep existing axe helper and current motion helpers.

- [ ] **Step 1: Protect compact Button and DemoBlock typography**

Add `keeps compact controls independent from VitePress typography`. On `/components/button`, assert a default Button computed height is 32px and font-size 12px; explicit md is 38px/14px; explicit lg is 46px/14px. Assert `.omg-docs-demo` has zero border widths and `.omg-docs-demo__content` has 14px font, 1.5 line-height ratio, and 12px gap.

- [ ] **Step 2: Protect field state surfaces in light and dark themes**

Add `shows soft and outline fields with state-led borders`. On Input and Textarea pages:

- soft rest has muted background and transparent border;
- hover changes background without revealing a decorative border;
- focus changes to surface background, non-transparent brand border, and a 2px brand-soft shadow;
- outline rest has a non-transparent semantic border;
- invalid remains danger-led while focused;
- readonly does not adopt hover feedback;
- disabled remains disabled;
- repeat representative soft/focus assertions inside dark theme;
- run serious-axe checks.

Compare computed colors/tokens through page evaluation rather than hard-coding a browser-dependent alpha string when a CSS variable is available.

- [ ] **Step 3: Protect Select geometry and replacement behavior**

Add `keeps Select text and one trailing action rail balanced`:

- selected text begins 12px from trigger's logical start;
- trigger reserves a stable 32px logical-end rail before and after clear visibility;
- selected-text bounding box does not move when hover/focus reveals clear;
- clear and combobox are sibling buttons;
- clear opacity becomes 1 while indicator becomes 0;
- option computed inline padding is 12px, row height is 36px, and text is 14px;
- popup start aligns with trigger in LTR and RTL;
- virtual rows keep 36px geometry;
- keyboard open/select/clear and axe still pass.

Add a separate touch context with `browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } })` and assert trigger/clear targets reach at least 44px without horizontal overflow. Close the context in `finally`.

- [ ] **Step 4: Protect Message default cleanup**

Open a default message, hover it, run axe while visible, and expect both record and empty host to detach within 4500ms without `closeAll()`. Then verify the opt-in focus-pause example remains past duration while its close action has focus and closes after focus leaves. Preserve existing status, stack, solid theme, motion, RTL, and reduced-motion coverage using finite or explicitly persistent examples as appropriate.

- [ ] **Step 5: Protect Reference Prompt behavior**

Assert media above Prompt, no old below-reference list, `@` listbox focus retention, ArrowDown to second media, Enter insertion of exact `[Image 2]`, direct Chinese continuation, real `setInputFiles`, same-file reselection, middle removal/reindexing, independent OImage preview and Escape focus restoration, readonly/disabled/maxCount/dark/narrow states, and axe.

- [ ] **Step 6: Run affected browser tests**

```bash
pnpm docs:build
pnpm --filter @puzzle-fuzzy/docs exec playwright test --grep "compact controls|soft and outline|Select text|Message|image-referenced prompts|Reference Textarea"
```

Expected: every affected visual, interaction, responsive, theme, and accessibility test passes with no permanent service host left between cases.

- [ ] **Step 7: Commit cross-family browser coverage**

```bash
git add apps/docs/tests/e2e/components.spec.ts
git commit -m "test(ui): cover compact prompt interactions"
```

### Task 4: Run static consistency and full canonical verification

- [ ] **Step 1: Format the full changed scope**

```bash
pnpm format
```

- [ ] **Step 2: Inspect repository scope using Git and Python**

Run separately:

```bash
git diff --check
git status --short --branch
git diff --stat origin/main...HEAD
```

Use a Python UTF-8 script to list changed files and fail if it finds `bun.lock`, Bun scripts/config, a VitePress brand-variable declaration, handwritten SVG in changed component source, or edits to protected components not justified by one of the three plans.

- [ ] **Step 3: Run the canonical release gate**

```bash
pnpm verify
```

Expected expansion and result:

- Prettier check passes;
- ESLint and Stylelint pass with zero warnings;
- naming/docs contract passes;
- workspace typecheck passes;
- Vitest coverage passes thresholds;
- library build passes;
- SSR passes;
- publint, attw, packed root/subpath consumer typecheck/build pass;
- VitePress build and every Playwright/axe test pass.

- [ ] **Step 4: Fix root causes and rerun the narrowest failing gate**

If a command fails, fix implementation or test determinism without weakening the accepted contract. Run the narrowest failed command until green, then rerun `pnpm verify` from the beginning. Do not report completion from a partial gate.

### Task 5: Perform live visual review in the in-app browser

**Required skill:** Use `browser:control-in-app-browser` for this task and read its `SKILL.md` before controlling the browser.

- [ ] **Step 1: Start the VitePress development server**

Run `pnpm docs:dev` in a yielded terminal cell. Keep user-visible updates at intervals shorter than 60 seconds. Read the terminal output to obtain the actual local URL.

- [ ] **Step 2: Review affected pages at desktop width**

Open Button, Input, Textarea, Select, Input Group, Message, and Reference Textarea. Exercise focus, hover, clear, open, keyboard selection, message expiry, upload picker, `@` insertion, removal, image preview, readonly, disabled, and dark examples. Capture screenshots only as temporary QA artifacts unless a failing visual needs documentation.

- [ ] **Step 3: Review narrow and RTL states**

At approximately 390px verify no page overflow, media strip readability, touch-size controls, and Select/mention popup alignment. Review existing RTL Select example. Confirm no large VitePress-inherited text, excessive right padding, unnecessary border, stale message host, or reference list below Prompt remains.

- [ ] **Step 4: Stop the dev server and record evidence**

Terminate only the server cell started in Step 1. Record routes/actions checked and any fixes made in the final handoff; do not commit temporary screenshots or browser state.

### Task 6: Reconcile remote `main`, commit the final verified state, and push

- [ ] **Step 1: Fetch remote without mutating local work**

```bash
git fetch origin
git status --short --branch
git rev-list --left-right --count origin/main...HEAD
```

Expected before reconciliation: clean worktree. If remote is ahead, inspect its commits and changed files, merge `origin/main` into local `main` non-destructively, resolve conflicts by preserving both compliant remote work and this implementation, then rerun the relevant focused tests and full `pnpm verify`.

- [ ] **Step 2: Create a final integration commit only if changes remain**

```bash
git add --all
git commit -m "feat(ui): deliver compact prompt workflow"
```

Skip the commit if all work is already captured by intentional task commits. Never create an empty commit.

- [ ] **Step 3: Push verified main**

```bash
git push origin main
```

Expected: push succeeds without force. Then run:

```bash
git status --short --branch
git rev-list --left-right --count origin/main...HEAD
```

Expected final state: clean `main`, `0 0` divergence from `origin/main`.
