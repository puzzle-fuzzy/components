# Composition Form Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add OLabel, the nine-component OField family, and the six-component OInputGroup family without duplicating existing input behavior.

**Architecture:** Native semantic elements and explicit compound components provide the public structure. OInputGroupInput, OInputGroupTextarea, and OInputGroupButton delegate to OInput, OTextarea, and OButton; shared Less gives the group one visual input boundary.

**Tech Stack:** Vue 3.5, TypeScript 6, Less, Vitest, Vue Test Utils, vue-icons-plus.

## Global Constraints

- Use Node.js 24 LTS and pnpm; do not add Bun files.
- Public names use `O*`, CSS uses `.o-*`, variables use `--omg-*`.
- Do not add Tailwind or Reka UI to these native form families.
- Do not alter OInput/OTextarea controlled value, IME, autosize, resize suppression, or scroll behavior.
- Root Field surfaces have no border; InputGroup owns exactly one border.
- Focused InputGroup changes border color and does not add outline or glow.
- Use TDD and run focused tests before touching central exports or documentation.

---

## File Map

- `packages/ui/src/components/label/`: native label contract.
- `packages/ui/src/components/field/`: nine public field composition components and one internal context module.
- `packages/ui/src/components/input-group/`: six public group components delegating to existing controls.
- `apps/docs/examples/{label,field,input-group}/`: complete behavior demos.
- `apps/docs/docs/components/{label,field,input-group}.md`: public API pages.

### Task 1: OLabel

**Files:**

- Create: `packages/ui/src/components/label/src/label.ts`
- Create: `packages/ui/src/components/label/src/OLabel.vue`
- Create: `packages/ui/src/components/label/style/index.less`
- Create: `packages/ui/src/components/label/__tests__/label.test.ts`
- Create: `packages/ui/src/components/label/index.ts`

**Interfaces:**

- Produces `OLabel`, `oLabelProps`, `OLabelProps`, `OLabelSlots`.

- [ ] **Step 1: Write the failing tests**

  Assert a real label, `for`, disabled/required data states, attrs/listeners, required marker `aria-hidden=true`, and click association with input/checkbox.

  ```ts
  const wrapper = mount(
    {
      components: { OLabel },
      template: '<div><OLabel for="name" required>Name</OLabel><input id="name"></div>',
    },
    { attachTo: document.body },
  )
  expect(wrapper.get('label').attributes('for')).toBe('name')
  expect(wrapper.get('[data-slot="label-required"]').attributes('aria-hidden')).toBe('true')
  ```

- [ ] **Step 2: Confirm RED**

  Run `pnpm exec vitest run packages/ui/src/components/label`.

  Expected: FAIL because the entrypoint does not exist.

- [ ] **Step 3: Implement the native contract**

  Use `for?: string`, `disabled?: boolean`, and `required?: boolean`; output `<label class="o-label" data-slot="label">`. Do not prevent native label clicks.

- [ ] **Step 4: Add restrained styles and confirm GREEN**

  Use inherited typography, muted disabled color, and a danger-colored required mark with no border. Run the focused command again and expect PASS.

### Task 2: OField Compound Family

**Files:**

- Create: `packages/ui/src/components/field/src/field.ts`
- Create: `packages/ui/src/components/field/src/field-context.ts`
- Create: `packages/ui/src/components/field/src/OField.vue`
- Create: `packages/ui/src/components/field/src/OFieldLabel.vue`
- Create: `packages/ui/src/components/field/src/OFieldContent.vue`
- Create: `packages/ui/src/components/field/src/OFieldTitle.vue`
- Create: `packages/ui/src/components/field/src/OFieldDescription.vue`
- Create: `packages/ui/src/components/field/src/OFieldError.vue`
- Create: `packages/ui/src/components/field/src/OFieldGroup.vue`
- Create: `packages/ui/src/components/field/src/OFieldSet.vue`
- Create: `packages/ui/src/components/field/src/OFieldLegend.vue`
- Create: `packages/ui/src/components/field/style/index.less`
- Create: `packages/ui/src/components/field/__tests__/field.test.ts`
- Create: `packages/ui/src/components/field/index.ts`

**Interfaces:**

- Produces all nine components, `oFieldProps`, `oFieldOrientations`, `oFieldErrorProps`, `oFieldLegendProps`, and public Props/Slots union types.
- Internal context shape is `{ disabled: ComputedRef<boolean>; invalid: ComputedRef<boolean>; required: ComputedRef<boolean> }` and is declared once in `field-context.ts`.

- [ ] **Step 1: Write failing compound tests**

  Test vertical/horizontal/responsive validators, data state propagation, real `label`, `fieldset`, and `legend`, attrs forwarding, title/content/description slots, error role, empty error omission, filtering and deduplication.

  ```ts
  const wrapper = mount(OFieldError, {
    props: { errors: ['Required', { message: 'Required' }, undefined, { message: 'Too short' }] },
  })
  expect(wrapper.findAll('li').map((node) => node.text())).toEqual(['Required', 'Too short'])
  expect(wrapper.attributes('role')).toBe('alert')
  ```

- [ ] **Step 2: Confirm RED**

  Run `pnpm exec vitest run packages/ui/src/components/field`.

  Expected: FAIL because the family does not exist.

- [ ] **Step 3: Implement types and context**

  Define `oFieldOrientations = ['vertical','horizontal','responsive'] as const`, defaults `vertical/false/false/false`, and computed parent-or-own state. Expose only OMG types.

- [ ] **Step 4: Implement semantic components**

  `OField` and `OFieldContent` are divs; `OFieldLabel` delegates to OLabel; `OFieldTitle` is a div; Description is a p; Group is a div; Set is a fieldset; Legend is a legend. Error renders one text node or a ul and only sets `role=alert` when content exists.

- [ ] **Step 5: Implement layout styles**

  Use grid, logical properties, `container-type:inline-size` on Group, and a container query for responsive orientation. All Field surfaces remain transparent and borderless. Add overflow wrapping and muted/error text tokens.

- [ ] **Step 6: Confirm GREEN**

  Run `pnpm exec vitest run packages/ui/src/components/label packages/ui/src/components/field`.

  Expected: all tests pass.

### Task 3: OInputGroup Compound Family

**Files:**

- Create: `packages/ui/src/components/input-group/src/input-group.ts`
- Create: `packages/ui/src/components/input-group/src/OInputGroup.vue`
- Create: `packages/ui/src/components/input-group/src/OInputGroupAddon.vue`
- Create: `packages/ui/src/components/input-group/src/OInputGroupInput.vue`
- Create: `packages/ui/src/components/input-group/src/OInputGroupTextarea.vue`
- Create: `packages/ui/src/components/input-group/src/OInputGroupButton.vue`
- Create: `packages/ui/src/components/input-group/src/OInputGroupText.vue`
- Create: `packages/ui/src/components/input-group/style/index.less`
- Create: `packages/ui/src/components/input-group/__tests__/input-group.test.ts`
- Create: `packages/ui/src/components/input-group/index.ts`

**Interfaces:**

- Input and Textarea wrappers forward the existing public Props/Emits/Slots instead of implementing a second model.
- Produces `OInputGroupAddonAlign = 'inline-start' | 'inline-end' | 'block-start' | 'block-end'`.

- [ ] **Step 1: Write failing composition tests**

  Cover all align values, attrs, prefix/suffix text, Input and Textarea v-model/IME behavior, Button click, addon blank-area focus, interactive-descendant exclusion, disabled focus exclusion, and root focus/invalid classes.

  ```ts
  await wrapper.get('[data-slot="input-group-addon"]').trigger('click')
  expect(document.activeElement).toBe(wrapper.get('input').element)
  await wrapper.get('[data-slot="input-group-button"]').trigger('click')
  expect(document.activeElement).not.toBe(wrapper.get('textarea').element)
  ```

- [ ] **Step 2: Confirm RED**

  Run `pnpm exec vitest run packages/ui/src/components/input-group`.

  Expected: FAIL because the family does not exist.

- [ ] **Step 3: Implement delegation wrappers**

  Wrap OInput/OTextarea/OButton directly, forward attrs and listeners, and preserve named slots. Add only group-specific `data-slot` and classes. Addon uses `closest('button,a,input,textarea,select,[role="button"]')` to avoid stealing interactive clicks.

- [ ] **Step 4: Implement the single-border style**

  Root uses flex/wrap and one existing input border token. Neutralize nested control borders, radii, background, shadow, and focus decoration only under `.o-input-group`. Use `:focus-within` and `:has([aria-invalid='true'])`; block addons use full width without separators.

- [ ] **Step 5: Run regressions and confirm GREEN**

  Run `pnpm exec vitest run packages/ui/src/components/input-group packages/ui/src/components/input packages/ui/src/components/textarea packages/ui/src/components/button`.

  Expected: all suites pass, including composition and controlled-value tests.

### Task 4: Form Documentation

**Files:**

- Create: `apps/docs/examples/label/Basic.vue`
- Create: `apps/docs/examples/label/States.vue`
- Create: `apps/docs/examples/field/Controls.vue`
- Create: `apps/docs/examples/field/Layout.vue`
- Create: `apps/docs/examples/field/Errors.vue`
- Create: `apps/docs/examples/input-group/Inline.vue`
- Create: `apps/docs/examples/input-group/Block.vue`
- Create: `apps/docs/examples/input-group/Textarea.vue`
- Create: `apps/docs/docs/components/label.md`
- Create: `apps/docs/docs/components/field.md`
- Create: `apps/docs/docs/components/input-group.md`

**Interfaces:**

- Docs use public subpath imports only and expose stable labels for E2E.

- [ ] **Step 1: Create complete demos**

  Field demos include OInput, OTextarea, OCheckbox, ORadio, OSwitch, vertical/horizontal/responsive, required, disabled, description and error. InputGroup demos include Lucide icon, text, OButton, four addon positions, and textarea.

- [ ] **Step 2: Write API pages**

  Document every public component, prop, emit, slot, accessibility responsibility, SSR behavior, and the rule that Field does not validate data. Do not use `--vp-*` variables.

- [ ] **Step 3: Run local verification**

  Run `pnpm --filter @puzzle-fuzzy/ui typecheck && pnpm exec vitest run packages/ui/src/components/label packages/ui/src/components/field packages/ui/src/components/input-group`.

  Expected: typecheck and focused suites pass. Do not edit central config, package exports, sidebar, overview, SSR aggregate, package tests, or E2E in this task.
