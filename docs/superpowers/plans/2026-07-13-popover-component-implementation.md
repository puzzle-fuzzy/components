# Popover Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a composable, teleported, accessible OPopover family with local public types and OMG visual context synchronization.

**Architecture:** Reka UI supplies positioning, dismiss, focus, and modal behavior. OMG wrappers bind a local stable API and reuse a shared floating-context utility so Teleport content inherits local OMG variables, theme, direction, and language.

**Tech Stack:** Vue 3.5, TypeScript 6, Less, Reka UI 2.10.1, Vitest, Vue Test Utils.

## Global Constraints

- Use pnpm and Node.js 24 LTS; no Bun or Tailwind.
- Do not expose Reka or Floating UI types in source declarations.
- Popover has an opaque surface, one shadow, and no border.
- Use `--omg-z-index-dropdown`; never modify `--vp-*`.
- Preserve existing Select, Dropdown, Tooltip, Image, and other floating visuals.
- Do not edit central dependency, exports, build, docs config, SSR aggregate, or package test files.

---

## File Map

- `packages/ui/src/composables/use-floating-context.ts`: reusable context mirror extracted without changing existing public behavior.
- `packages/ui/src/components/popover/`: four public Popover components and local event/reference types.
- `apps/docs/examples/popover/`: basic, controlled, positioning, modal/form demos.
- `apps/docs/docs/components/popover.md`: complete API documentation.

### Task 1: Reusable Floating Context Utility

**Files:**

- Create: `packages/ui/src/composables/use-floating-context.ts`
- Modify: `packages/ui/src/composables/use-floating-panel.ts`
- Test: `packages/ui/src/composables/__tests__/use-floating-context.test.ts`

**Interfaces:**

- Produces an internal `syncFloatingContext(reference: HTMLElement, floating: HTMLElement): () => void` that mirrors divergent `--omg-*`, local theme markers, lang and dir and returns cleanup.
- Existing `use-floating-panel.ts` consumes the extracted utility with no public API change.

- [ ] **Step 1: Write failing context tests**

  Test local `--omg-*`, `data-theme`/class theme marker, lang and dir mirroring, mutation updates, unchanged inherited values omission, and cleanup.

- [ ] **Step 2: Confirm RED**

  Run `pnpm exec vitest run packages/ui/src/composables/__tests__/use-floating-context.test.ts`.

  Expected: FAIL because the utility does not exist.

- [ ] **Step 3: Extract without changing behavior**

  Move the existing private synchronization logic from `use-floating-panel.ts` into the new internal module. Keep the old composable signature and call site intact.

- [ ] **Step 4: Run floating regressions**

  Run `pnpm exec vitest run packages/ui/src/composables packages/ui/src/components/select packages/ui/src/components/dropdown packages/ui/src/components/tooltip`.

  Expected: all existing behavior and new utility tests pass.

### Task 2: OPopover Family

**Files:**

- Create: `packages/ui/src/components/popover/src/popover.ts`
- Create: `packages/ui/src/components/popover/src/popover-context.ts`
- Create: `packages/ui/src/components/popover/src/OPopover.vue`
- Create: `packages/ui/src/components/popover/src/OPopoverTrigger.vue`
- Create: `packages/ui/src/components/popover/src/OPopoverAnchor.vue`
- Create: `packages/ui/src/components/popover/src/OPopoverContent.vue`
- Create: `packages/ui/src/components/popover/style/index.less`
- Create: `packages/ui/src/components/popover/__tests__/popover.test.ts`
- Create: `packages/ui/src/components/popover/index.ts`

**Interfaces:**

- Produces four components and OMG-owned side, align, sticky, position strategy, virtual reference, outside event, Props/Emits/Slots types.
- Consumes local `ORenderProps` and `syncFloatingContext`.

- [ ] **Step 1: Write failing behavior tests**

  Cover default/controlled open, update emit without write-back, asChild OButton, anchor, side/align offsets, teleported false, body/custom target, Escape, outside pointer/focus, cancelable events, open/close autofocus, focus restoration, modal state and context mirroring.

  ```ts
  const wrapper = mountPopover({ open: false, teleported: false })
  await wrapper.get('[data-slot="popover-trigger"]').trigger('click')
  expect(wrapper.emitted('update:open')?.[0]).toEqual([true])
  expect(wrapper.find('[data-slot="popover-content"]').exists()).toBe(false)
  ```

- [ ] **Step 2: Confirm RED**

  Run `pnpm exec vitest run packages/ui/src/components/popover`.

  Expected: FAIL because the family does not exist.

- [ ] **Step 3: Define local types**

  Use local unions for side/align/sticky/strategy. Define `OPopoverVirtualElement` around `getBoundingClientRect` and local `CustomEvent<{ originalEvent: PointerEvent | FocusEvent }>` event aliases. Never reference Reka interfaces in exported types.

- [ ] **Step 4: Implement explicit wrappers**

  Root binds open/defaultOpen/modal and emits update. Trigger and Anchor register their actual reference element in local context. Content uses Reka Portal with `disabled=!teleported`, binds each positioning prop, forwards every cancelable event, and calls `syncFloatingContext` after both reference/content elements exist.

- [ ] **Step 5: Implement restrained styles**

  Content uses opaque background, existing radius, one shadow, padding and dropdown z-index with `border:0`. Animate opacity, scale and 2–4px side-aware translation; disable motion under reduced preference. Do not impose fixed width.

- [ ] **Step 6: Run focused regressions**

  Run `pnpm exec vitest run packages/ui/src/components/popover packages/ui/src/components/select packages/ui/src/components/dropdown packages/ui/src/components/tooltip && pnpm --filter @puzzle-fuzzy/ui typecheck`.

  Expected: all suites and typecheck pass.

### Task 3: Popover Documentation

**Files:**

- Create: `apps/docs/examples/popover/Basic.vue`
- Create: `apps/docs/examples/popover/Controlled.vue`
- Create: `apps/docs/examples/popover/Placement.vue`
- Create: `apps/docs/examples/popover/Form.vue`
- Create: `apps/docs/examples/popover/Modal.vue`
- Create: `apps/docs/docs/components/popover.md`

**Interfaces:**

- Demos expose stable accessible names for browser tests and use public subpath imports.

- [ ] **Step 1: Build representative demos**

  Show OButton asChild trigger, controlled state, all sides/alignments, local dark/theme variable context, small form content, modal focus, custom target and inline testing mode.

- [ ] **Step 2: Write complete API docs**

  Document every prop/event/slot, preventDefault behavior, focus restoration, modal distinction, Teleport/SSR, local theme synchronization and borderless appearance.

- [ ] **Step 3: Run local verification**

  Run `pnpm exec vitest run packages/ui/src/components/popover packages/ui/src/composables && pnpm --filter @puzzle-fuzzy/ui typecheck`.

  Expected: PASS. Leave central integration to the main agent.

