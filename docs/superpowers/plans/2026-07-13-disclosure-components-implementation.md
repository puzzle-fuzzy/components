# Disclosure Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add accessible OAccordion and OCollapsible compound families using Reka UI as a private runtime implementation.

**Architecture:** OMG-owned props map explicitly to Reka runtime primitives. Public declarations, styling, icons, events, and state hooks remain local; Reka types must not appear in generated declarations.

**Tech Stack:** Vue 3.5, TypeScript 6, Less, Reka UI 2.10.1, Vitest, vue-icons-plus.

## Global Constraints

- Use pnpm and Node.js 24 LTS; no Bun or Tailwind.
- Import Reka runtime components only inside implementation files.
- Never extend or re-export Reka Props or Emits types.
- Use `vue-icons-plus/lu` for the default Accordion chevron.
- Default items have no divider border.
- Animate only state disclosure and indicator rotation; honor reduced motion.
- Do not modify central dependency, exports, build, docs config, SSR aggregate, or package test files.

---

## File Map

- `packages/ui/src/shared/render.ts`: OMG-owned `ORenderAs` and `ORenderProps`.
- `packages/ui/src/components/accordion/`: four public components.
- `packages/ui/src/components/collapsible/`: three public components.
- `apps/docs/examples/{accordion,collapsible}/`: interaction demos.
- `apps/docs/docs/components/{accordion,collapsible}.md`: API pages.

### Task 1: Shared Render Contract and OCollapsible

**Files:**

- Create: `packages/ui/src/shared/render.ts`
- Create: `packages/ui/src/components/collapsible/src/collapsible.ts`
- Create: `packages/ui/src/components/collapsible/src/OCollapsible.vue`
- Create: `packages/ui/src/components/collapsible/src/OCollapsibleTrigger.vue`
- Create: `packages/ui/src/components/collapsible/src/OCollapsibleContent.vue`
- Create: `packages/ui/src/components/collapsible/style/index.less`
- Create: `packages/ui/src/components/collapsible/__tests__/collapsible.test.ts`
- Create: `packages/ui/src/components/collapsible/index.ts`

**Interfaces:**

- Produces `ORenderAs`, `ORenderProps`, `OCollapsible`, `OCollapsibleTrigger`, `OCollapsibleContent`, public Props/Emits/Slots.

- [ ] **Step 1: Write failing tests**

  Test defaultOpen, controlled open, update emit without parent write-back, disabled, Enter/Space, aria-expanded/controls, forceMount, attrs, asChild composition, and stable state data.

  ```ts
  const wrapper = mount(OCollapsible, {
    props: { open: false },
    slots: {
      default:
        '<OCollapsibleTrigger>Toggle</OCollapsibleTrigger><OCollapsibleContent>Body</OCollapsibleContent>',
    },
    global: { components: { OCollapsibleTrigger, OCollapsibleContent } },
  })
  await wrapper.get('button').trigger('click')
  expect(wrapper.emitted('update:open')?.[0]).toEqual([true])
  expect(wrapper.find('[data-state="open"]').exists()).toBe(false)
  ```

- [ ] **Step 2: Confirm RED**

  Run `pnpm exec vitest run packages/ui/src/components/collapsible`.

  Expected: FAIL because the family does not exist.

- [ ] **Step 3: Implement explicit Reka mapping**

  Define local props with `open?`, `defaultOpen=false`, `disabled=false`, `unmountOnHide=true`, `as='div'`, `asChild=false`; emit only local `update:open`. Trigger defaults to button, Content supports forceMount. Bind props individually.

- [ ] **Step 4: Add disclosure styles and confirm GREEN**

  Bare Trigger has no skin but retains focus-visible. Content uses Reka height variable internally and OMG duration/easing tokens. Under reduced motion set animation duration to 0ms. Run focused tests and expect PASS.

### Task 2: OAccordion

**Files:**

- Create: `packages/ui/src/components/accordion/src/accordion.ts`
- Create: `packages/ui/src/components/accordion/src/OAccordion.vue`
- Create: `packages/ui/src/components/accordion/src/OAccordionItem.vue`
- Create: `packages/ui/src/components/accordion/src/OAccordionTrigger.vue`
- Create: `packages/ui/src/components/accordion/src/OAccordionContent.vue`
- Create: `packages/ui/src/components/accordion/style/index.less`
- Create: `packages/ui/src/components/accordion/__tests__/accordion.test.ts`
- Create: `packages/ui/src/components/accordion/index.ts`

**Interfaces:**

- Produces `OAccordionType`, `OAccordionOrientation`, `OAccordionValue` and four component APIs.
- Consumes local `ORenderProps` from `packages/ui/src/shared/render.ts`.

- [ ] **Step 1: Write failing tests**

  Cover single/multiple, default and controlled values, collapsible, disabled root/item, unique item value, data state, trigger icon slot, default Lucide icon, forceMount, Arrow/Home/End, horizontal RTL and no nested button under asChild.

  ```ts
  const wrapper = mountAccordion({ type: 'multiple', defaultValue: ['one'] })
  expect(wrapper.get('[data-value="one"] button').attributes('aria-expanded')).toBe('true')
  await wrapper.get('[data-value="two"] button').trigger('click')
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['one', 'two']])
  ```

- [ ] **Step 2: Confirm RED**

  Run `pnpm exec vitest run packages/ui/src/components/accordion`.

  Expected: FAIL because the family does not exist.

- [ ] **Step 3: Implement the local public contract**

  Define exact tuple types, bind each prop explicitly to Reka Root/Item/Trigger/Content, forward `update:modelValue`, and add a development warning when single receives array or multiple receives string. Do not import Reka types into `accordion.ts`.

- [ ] **Step 4: Implement visual behavior**

  Trigger is full-width flex, chevron imported from `vue-icons-plus/lu` rotates on open, item has no separator border, Content animates measured height/width and opacity, and all logical properties support RTL.

- [ ] **Step 5: Run focused and declaration checks**

  Run `pnpm exec vitest run packages/ui/src/components/accordion packages/ui/src/components/collapsible && pnpm --filter @puzzle-fuzzy/ui typecheck`.

  Expected: all suites and typecheck pass.

### Task 3: Disclosure Documentation

**Files:**

- Create: `apps/docs/examples/accordion/Single.vue`
- Create: `apps/docs/examples/accordion/Multiple.vue`
- Create: `apps/docs/examples/accordion/HorizontalRtl.vue`
- Create: `apps/docs/examples/collapsible/Basic.vue`
- Create: `apps/docs/examples/collapsible/Controlled.vue`
- Create: `apps/docs/docs/components/accordion.md`
- Create: `apps/docs/docs/components/collapsible.md`

**Interfaces:**

- Demos use only public subpath imports and stable accessible names.

- [ ] **Step 1: Create demos**

  Show Accordion single/collapsible, multiple/disabled, horizontal RTL and custom trigger composition. Show Collapsible bare and OButton asChild, controlled state and disabled state.

- [ ] **Step 2: Document full contracts**

  Document controlled/non-controlled rules, keyboard table, asChild, SSR, RTL, reduced motion, every prop/emit/slot, and UI-only scope.

- [ ] **Step 3: Run local verification**

  Run `pnpm exec vitest run packages/ui/src/components/accordion packages/ui/src/components/collapsible && pnpm --filter @puzzle-fuzzy/ui typecheck`.

  Expected: PASS. Leave all central integration files to the main agent.
