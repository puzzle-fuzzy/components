# Upload Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Vue 3 `OUpload` component that supports click selection, drag-and-drop selection, and a visible upload list.

**Architecture:** `OUpload` is a controlled UI component in `packages/ui`; it emits selected native `File[]` values and delegates real upload persistence to consumers. The component owns only transient drag state and uses typed list item data for file names, sizes, progress, state labels, and remove/clear actions.

**Tech Stack:** Vue 3 SFC, TypeScript, Less, Vitest, Vue Test Utils, VitePress docs.

## Global Constraints

- Use Node.js 24 LTS with pnpm.
- `packages/ui` is the only published package.
- Public naming uses `O*` components, `.o-*` classes, and `--omg-*` CSS variables.
- New components must include types, styles, tests, and docs.
- Keep upload networking out of the base UI package.

---

### Task 1: Component Contract And Behavior

**Files:**

- Create: `packages/ui/src/components/upload/src/upload.ts`
- Create: `packages/ui/src/components/upload/src/OUpload.vue`
- Create: `packages/ui/src/components/upload/index.ts`
- Create: `packages/ui/src/components/upload/style/index.less`
- Create: `packages/ui/src/components/upload/__tests__/upload.test.ts`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.less`
- Modify: `packages/ui/vite.config.ts`
- Modify: `packages/ui/package.json`

**Interfaces:**

- Produces: `OUpload`, `OUploadFile`, `OUploadFileState`, `formatOUploadFileSize`, `normalizeOUploadProgress`, `oUploadProps`
- Emits: `select(files: File[])`, `remove(file: OUploadFile)`, `clear()`, `drag-change(active: boolean)`

- [ ] **Step 1: Write failing tests**

Add tests for helper normalization, click selection, drag/drop selection, drag state, file row rendering, remove, clear, disabled behavior, and SSR rendering.

- [ ] **Step 2: Verify red**

Run: `pnpm test -- packages/ui/src/components/upload/__tests__/upload.test.ts`
Expected: fails because the upload component module does not exist.

- [ ] **Step 3: Implement the component**

Create the `upload` component folder following the existing component contract. Use hidden file input for click selection, root dropzone keyboard activation, drag enter/leave/drop handlers, typed file rows, and scoped `.o-upload*` class names.

- [ ] **Step 4: Verify green**

Run: `pnpm test -- packages/ui/src/components/upload/__tests__/upload.test.ts`
Expected: passes.

### Task 2: Documentation And Package Integration

**Files:**

- Create: `apps/docs/examples/upload/Basic.vue`
- Create: `apps/docs/examples/upload/States.vue`
- Create: `apps/docs/docs/components/upload.md`
- Modify: `apps/docs/docs/.vitepress/config.mts`
- Modify: `apps/docs/tests/e2e/components.spec.ts`

**Interfaces:**

- Consumes: `OUpload`, `OUploadFile`
- Produces: docs page `/components/upload`

- [ ] **Step 1: Add docs examples**

Create one interactive example for selecting/dropping files and one static state example for queued/uploading/success/error rows.

- [ ] **Step 2: Add e2e coverage**

Assert the docs page renders, the dropzone is keyboard/click accessible, list rows appear, and no serious accessibility violations exist.

- [ ] **Step 3: Verify docs and package**

Run: `pnpm test -- packages/ui/src/components/upload/__tests__/upload.test.ts`, `pnpm --filter @puzzle-fuzzy/ui typecheck`, and `pnpm docs:build`.
Expected: all pass.

### Task 3: Final Verification

**Files:**

- Verify the full workspace through existing scripts.

- [ ] **Step 1: Run final verification**

Run: `pnpm verify`
Expected: all checks pass.
