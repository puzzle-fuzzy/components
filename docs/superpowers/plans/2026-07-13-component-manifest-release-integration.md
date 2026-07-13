# Component Manifest and Release Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the six new families through one component manifest, stable package boundaries, complete SSR/package/docs/E2E coverage, and a verified main-branch release.

**Architecture:** A checked-in JSON manifest becomes the structural index for all 42 component families. Existing explicit public exports and style imports remain reviewable, while checks assert exact agreement and selected tooling derives entries/routes from the manifest.

**Tech Stack:** Node.js 24, pnpm, Vue 3.5, Vite 8, Vitest, VitePress, Playwright, Reka UI 2.10.1.

## Global Constraints

- Use Python for temporary audits/migrations; avoid PowerShell text processing.
- Use pnpm only; never add Bun files.
- Central integration belongs to the main agent to avoid parallel conflicts.
- Do not modify existing approved visuals.
- No generated file may dirty the worktree after build or verify.
- Final gate is `pnpm verify`, then synchronize and push `main`.

---

## File Map

- `packages/ui/component-manifest.json`: structural component index.
- `scripts/component-manifest.mjs`: parser/validation helpers.
- `scripts/check-naming.mjs`: exact-set checks.
- `pnpm-workspace.yaml`, `packages/ui/package.json`, `packages/ui/vite.config.ts`: Reka and build boundaries.
- `packages/ui/src/index.ts`, `packages/ui/src/styles/index.less`: explicit public API/style integration.
- `packages/ui/tests/{ssr,package}/`: runtime and publication contracts.
- `scripts/test-package.mjs`: tarball and ATTW consumer.
- `apps/docs/docs/.vitepress/config.mts`, component overview, E2E: documentation integration.

### Task 1: Component Manifest Guard

**Files:**

- Create: `packages/ui/component-manifest.json`
- Create: `scripts/component-manifest.mjs`
- Modify: `scripts/check-naming.mjs`
- Test: existing `pnpm check:naming` plus focused Node assertions in the check.

**Interfaces:**

- Exports `readComponentManifest(root)`, `flattenComponentManifest(manifest)`, and exact-set assertion helpers.
- Each entry contains `slug`, `label`, and `category`; slugs are unique and kebab-case.

- [ ] **Step 1: Capture all 42 families**

  Use a Python read-only script to compare current component directories, docs files, sidebar paths and package subpaths. Create manifest schema version 1 with the existing 36 families plus label, field, input-group, accordion, collapsible and popover.

- [ ] **Step 2: Add failing exact-set checks**

  Make `check-naming.mjs` reject missing or extra source directories, docs pages, package exports, Vite entries, root component exports and style imports. Error messages list sorted differences.

- [ ] **Step 3: Derive safe structural lists**

  Use the manifest for Vite entries, VitePress source aliases/sidebar data where practical, Playwright route smoke and ATTW entrypoints. Do not generate or rewrite files during build.

- [ ] **Step 4: Confirm guard**

  Run `pnpm check:naming`.

  Expected: it initially reports only not-yet-integrated new families; after Task 3 it passes.

### Task 2: Dependency Boundary

**Files:**

- Modify: `pnpm-workspace.yaml`
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/vite.config.ts`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Catalog exposes `reka-ui: ^2.10.1`; UI package consumes `reka-ui: catalog:`.

- [ ] **Step 1: Add Reka through pnpm**

  Modify catalog/package JSON with `apply_patch`, then run `pnpm install --lockfile-only`.

- [ ] **Step 2: Externalize the runtime**

  Update Rollup external to match exact `vue`, exact `reka-ui`, and `reka-ui/` subpaths. Do not externalize unrelated packages.

- [ ] **Step 3: Confirm dependency resolution**

  Run `pnpm install --frozen-lockfile && pnpm --filter @puzzle-fuzzy/ui typecheck` after component implementation is present.

  Expected: pnpm resolves Reka 2.10.1 and typecheck passes.

### Task 3: Publish All Six Families

**Files:**

- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.less`
- Modify: `packages/ui/vite.config.ts`
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/tests/ssr/ssr.test.ts`
- Modify: `packages/ui/tests/package/package-contract.test.ts`
- Modify: `scripts/test-package.mjs`

**Interfaces:**

- Produces root imports and subpaths `./label`, `./field`, `./input-group`, `./accordion`, `./collapsible`, `./popover`.

- [ ] **Step 1: Add failing SSR/package assertions**

  Assert all 27 components render, semantic elements/closed-open states are correct, and Popover inline/teleported SSR does not throw. Add six subpaths and CSS selectors to the package contract.

- [ ] **Step 2: Wire explicit public entries**

  Export all components and local public types, import each family style once, add package export maps and Vite entries. Do not expose internal context or Reka types.

- [ ] **Step 3: Add declaration and bundle guards**

  Recursively reject `reka-ui` text in `dist/**/*.d.ts`; require bare Reka imports in applicable JS; reject known inline Reka root implementation markers. Add root/Button-only and Accordion subpath consumer builds.

- [ ] **Step 4: Build and test publication**

  Run `pnpm build && pnpm test:ssr && pnpm test:package`.

  Expected: build, SSR, publint, ATTW, tarball typecheck and Vue consumer build pass.

### Task 4: Docs Navigation, Overview, Browser Coverage

**Files:**

- Modify: `apps/docs/docs/.vitepress/config.mts`
- Modify: `apps/docs/docs/components/index.md`
- Modify: `apps/docs/tests/e2e/components.spec.ts`

**Interfaces:**

- Docs total becomes exactly `42 个组件族、67 个公开 Vue 组件`.

- [ ] **Step 1: Integrate routes and overview**

  Add six aliases and sidebar entries in logical categories and list every new public component. Never override VitePress brand variables.

- [ ] **Step 2: Add route, axe, interaction and visual assertions**

  Test Label clicks; Field semantics; InputGroup focus/single border; Accordion keyboard/RTL; Collapsible aria-expanded; Popover Escape/outside/focus restoration/modal/custom target; dark, narrow and reduced-motion states. Assert Accordion items and Popover have no border.

- [ ] **Step 3: Build and run E2E**

  Run `pnpm test:e2e`.

  Expected: VitePress build and all Chromium tests pass with no hydration or axe failures.

### Task 5: Final Release Gate

**Files:** all intended files from the four phase plans.

**Interfaces:** verified main branch synchronized with origin.

- [ ] **Step 1: Format and inspect**

  Run `pnpm format`, then `git diff --check` and inspect `git status --short`. Remove only phase-owned generated output; preserve user changes.

- [ ] **Step 2: Run complete verification**

  Run `pnpm verify`.

  Expected: formatting, lint, stylelint, naming, typecheck, coverage, build, SSR, package consumption, docs and E2E all pass.

- [ ] **Step 3: Audit public boundary**

  Use a Python script to count 42 component families and 67 public Vue exports, scan d.ts for Reka leakage, scan SVG markup, and confirm no Bun files or `--vp-*` overrides were added.

- [ ] **Step 4: Commit and synchronize**

  Commit logical batches, run `git fetch origin`, inspect divergence, rebase onto `origin/main` if safe, rerun `pnpm verify`, then `git push origin main`.

  Expected: origin/main advances and the worktree is clean.

---

## Self-Review Results

- Spec coverage: all 27 public components, manifest, dependency boundaries, visual constraints, SSR, package consumption, docs and E2E have explicit tasks.
- Placeholder scan: no deferred or unspecified implementation marker remains.
- Type consistency: component names, six subpaths, 42-family total and 67-component total match the approved design.
- Execution selection: the user previously selected multi-agent execution, so the recommended subagent-driven path is used without another prompt.
