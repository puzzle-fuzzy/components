# Image Preview Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `OImage` Vue component with click-to-open fullscreen preview, black mask, and mask-click close behavior.

**Architecture:** `OImage` is a small presentational component in `packages/ui` that renders a native image and owns only its preview visibility. The preview is a fixed-position overlay with dialog semantics, closed by mask click or Escape.

**Tech Stack:** Vue 3 SFC, TypeScript, Less, Vitest, Vue Test Utils, VitePress docs.

## Global Constraints

- Use Node.js 24 LTS with pnpm.
- `packages/ui` is the only published package.
- Public naming uses `O*` components, `.o-*` classes, and `--omg-*` CSS variables.
- New components must include types, styles, tests, and docs.
- Do not add network, gallery, or image processing behavior.

---

### Task 1: Component Contract And Behavior

**Files:**

- Create: `packages/ui/src/components/image/src/image.ts`
- Create: `packages/ui/src/components/image/src/OImage.vue`
- Create: `packages/ui/src/components/image/index.ts`
- Create: `packages/ui/src/components/image/style/index.less`
- Create: `packages/ui/src/components/image/__tests__/image.test.ts`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.less`
- Modify: `packages/ui/vite.config.ts`
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/tests/ssr/ssr.test.ts`
- Modify: `scripts/check-naming.mjs`

**Interfaces:**

- Produces: `OImage`, `OImageFit`, `OImageProps`, `OImageEmits`, `oImageFits`, `oImageProps`
- Emits: `load(event)`, `error(event)`, `previewOpen()`, `previewClose()`

- [ ] **Step 1: Write failing tests**

Add tests for public props/types, image rendering, load/error events, preview open on click, preview source override, mask click close, Escape close, disabled preview, and SSR rendering.

- [ ] **Step 2: Verify red**

Run: `pnpm test -- packages/ui/src/components/image/__tests__/image.test.ts`
Expected: fails because the image component module does not exist.

- [ ] **Step 3: Implement the component**

Create the component folder following existing library conventions. Render a native image, expose optional preview behavior, use a fixed black overlay with dialog semantics, and keep all classes under `.o-image`.

- [ ] **Step 4: Verify green**

Run: `pnpm test -- packages/ui/src/components/image/__tests__/image.test.ts`
Expected: passes.

### Task 2: Documentation And E2E

**Files:**

- Create: `apps/docs/examples/image/Basic.vue`
- Create: `apps/docs/docs/components/image.md`
- Modify: `apps/docs/docs/.vitepress/config.mts`
- Modify: `apps/docs/tests/e2e/components.spec.ts`

**Interfaces:**

- Consumes: `OImage`
- Produces: docs page `/components/image`

- [ ] **Step 1: Add docs example**

Create a basic image demo showing click preview and document the black mask close behavior.

- [ ] **Step 2: Add e2e coverage**

Assert the docs page renders, clicking the image opens the preview, and clicking the mask closes it.

- [ ] **Step 3: Verify docs and package**

Run: `pnpm test -- packages/ui/src/components/image/__tests__/image.test.ts`, `pnpm --filter @puzzle-fuzzy/ui typecheck`, and `pnpm docs:build`.
Expected: all pass.

### Task 3: Final Verification

- [ ] **Step 1: Run final verification**

Run: `pnpm verify`
Expected: all checks pass.
