# Dialog Textarea Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `ODialog`, `OTextarea`, `OReferenceTextarea`, and `OTabs` to OMG UI.

**Architecture:** Each component is a separate Vue 3 SFC under `packages/ui/src/components/*`, with local typed props/emits, isolated Less, focused Vitest coverage, VitePress docs, SSR coverage, package exports, and naming-contract entries. `OReferenceTextarea` composes textarea-like behavior with parsed reference previews rather than making base `OTextarea` rich-text aware.

**Tech Stack:** Vue 3 SFC, TypeScript, Less, Vitest, Vue Test Utils, VitePress, Playwright.

## Global Constraints

- Use Node.js 24 LTS with pnpm.
- `packages/ui` is the only published package.
- Public naming uses `O*` components, `.o-*` classes, and `--omg-*` CSS variables.
- New components must include types, styles, tests, and docs.
- Keep components UI-only; no network, persistence, or app-specific transfer behavior.

---

### Task 1: Behavior Tests

**Files:**

- Create: `packages/ui/src/components/dialog/__tests__/dialog.test.ts`
- Create: `packages/ui/src/components/textarea/__tests__/textarea.test.ts`
- Create: `packages/ui/src/components/reference-textarea/__tests__/reference-textarea.test.ts`
- Create: `packages/ui/src/components/tabs/__tests__/tabs.test.ts`

**Interfaces:**

- Produces failing tests for `ODialog`, `OTextarea`, `OReferenceTextarea`, and `OTabs`.

- [ ] **Step 1: Write failing tests**

Cover dialog open/close/mask/Escape/events, textarea v-model/count/states, reference parsing and preview chips, and tabs selection/keyboard/indicator variants.

- [ ] **Step 2: Verify red**

Run: `pnpm test -- packages/ui/src/components/dialog/__tests__/dialog.test.ts packages/ui/src/components/textarea/__tests__/textarea.test.ts packages/ui/src/components/reference-textarea/__tests__/reference-textarea.test.ts packages/ui/src/components/tabs/__tests__/tabs.test.ts`
Expected: fails because modules do not exist.

### Task 2: Component Implementations

**Files:**

- Create component `src`, `index.ts`, and `style/index.less` files for `dialog`, `textarea`, `reference-textarea`, and `tabs`.
- Modify `packages/ui/src/index.ts`
- Modify `packages/ui/src/styles/index.less`
- Modify `packages/ui/vite.config.ts`
- Modify `packages/ui/package.json`
- Modify `packages/ui/tests/ssr/ssr.test.ts`
- Modify `scripts/check-naming.mjs`

**Interfaces:**

- Produces `ODialog`, `OTextarea`, `OReferenceTextarea`, `OTabs` and their public types.

- [ ] **Step 1: Implement minimal green components**

Build the components to satisfy the tests and existing naming/style contracts.

- [ ] **Step 2: Verify focused green**

Run the focused test command from Task 1 plus `pnpm --filter @puzzle-fuzzy/ui typecheck`.
Expected: pass.

### Task 3: Documentation And E2E

**Files:**

- Create docs pages and examples for dialog, textarea, reference-textarea, and tabs.
- Modify `apps/docs/docs/.vitepress/config.mts`
- Modify `apps/docs/tests/e2e/components.spec.ts`

**Interfaces:**

- Produces docs routes under `/components/dialog`, `/components/textarea`, `/components/reference-textarea`, and `/components/tabs`.

- [ ] **Step 1: Add examples and docs**

Create compact examples that demonstrate the expected behavior and API.

- [ ] **Step 2: Add e2e coverage**

Assert pages render and core interactions work in the built docs.

### Task 4: Final Verification

- [ ] **Step 1: Run final verification**

Run: `pnpm verify`
Expected: all checks pass.
