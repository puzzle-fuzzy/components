# Form, Scroll, and Icon System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver standardized Lucide icons, reliable file selection, semantic Select virtualization, fixed/auto Textarea sizing, borderless dialogs, and reusable Input, Checkbox, Radio, ConfirmDialog, and FormDialog components.

**Architecture:** Native form elements remain the semantic and interaction source of truth. `vue-virtual-scroller` is enabled only for long fixed-row Select collections, while a shared Less mixin styles real scroll containers. Dialog variants compose existing primitives and emit UI events without owning validation, requests, uploads, or domain workflows.

**Tech Stack:** Vue 3.5, TypeScript 6, Less, vue-icons-plus/lu, vue-virtual-scroller 3, Vite 8, Vitest 4, Vue Test Utils, VitePress, Playwright.

## Global Constraints

- Vue 3 is the only supported framework.
- Built-in icons import only from `vue-icons-plus/lu`; no handwritten template SVG or raw SVG assets.
- Textarea keeps a native `<textarea>` and never uses list virtualization.
- Only Select option collections use `vue-virtual-scroller`; Upload and focus-owned menus stay native.
- Components contain no validation, requests, persistence, upload transport, retry, parser, or domain-confirmation logic.
- Public names use `O*`, CSS uses `.o-*`, and tokens use `--omg-*`.
- Every task preserves controlled-state rejection, SSR safety, accessibility, reduced motion, and package subpath consumption.
- Use pnpm and the repository's existing Vitest/Playwright verification stack.

---

### Task 1: Shared scrolling and icon policy

**Files:**

- Modify: `pnpm-workspace.yaml`
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/src/styles/mixins.less`
- Modify: `packages/ui/src/styles/tokens/semantic.less`
- Modify: `packages/ui/src/components/button/src/OButton.vue`
- Modify: `packages/ui/src/components/button/style/index.less`
- Modify: `packages/ui/src/components/button/__tests__/button.test.ts`
- Modify: `packages/ui/src/components/image/src/OImage.vue`
- Modify: `packages/ui/src/components/image/style/index.less`
- Modify: `packages/ui/src/components/image/__tests__/image.test.ts`
- Modify: `packages/ui/src/components/reference-textarea/src/OReferenceTextarea.vue`
- Modify: `packages/ui/src/components/reference-textarea/style/index.less`
- Modify: `packages/ui/src/components/reference-textarea/__tests__/reference-textarea.test.ts`

**Interfaces:**

- Consumes: existing semantic color and motion tokens.
- Produces: `vue-virtual-scroller@^3.0.4`, `.omg-scrollbar()` mixin, `--omg-color-scrollbar-*` tokens, and standardized component icons.

- [ ] **Step 1: Add failing icon and scrollbar contract tests**

```ts
expect(buttonSource).toContain("import { LuLoader2 } from 'vue-icons-plus/lu'")
expect(imageSource).toContain("import { LuZoomIn } from 'vue-icons-plus/lu'")
expect(referenceSource).toContain("from 'vue-icons-plus/lu'")
expect(sharedMixins).toContain('.omg-scrollbar()')
```

- [ ] **Step 2: Run focused tests and confirm the new contracts fail**

Run: `pnpm exec vitest run packages/ui/src/components/button packages/ui/src/components/image packages/ui/src/components/reference-textarea`

Expected: FAIL because the new icons and scrollbar mixin are not implemented.

- [ ] **Step 3: Add the dependency and shared visual primitives**

```yaml
catalog:
  vue-virtual-scroller: ^3.0.4
```

```less
.omg-scrollbar() {
  scrollbar-color: var(--omg-color-scrollbar-thumb) transparent;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  overscroll-behavior: contain;
}
```

Add `vue-virtual-scroller: "catalog:"` to UI dependencies and define light/dark scrollbar thumb and hover tokens.

- [ ] **Step 4: Replace or add purposeful icons**

Use `LuLoader2` for Button loading, `LuZoomIn` for Image preview, and `LuFileText`/`LuImage` for references without thumbnails. Every decorative icon receives `aria-hidden="true"`; keep existing accessible names and visible status text.

- [ ] **Step 5: Run focused tests, lint, and stylelint**

Run: `pnpm exec vitest run packages/ui/src/components/button packages/ui/src/components/image packages/ui/src/components/reference-textarea`

Run: `pnpm exec eslint packages/ui/src/components/button packages/ui/src/components/image packages/ui/src/components/reference-textarea --max-warnings 0`

Run: `pnpm exec stylelint "packages/ui/src/components/{button,image,reference-textarea}/**/*.{vue,less}"`

Expected: PASS.

### Task 2: Textarea fixed and auto height

**Files:**

- Modify: `packages/ui/src/components/textarea/src/textarea.ts`
- Modify: `packages/ui/src/components/textarea/src/OTextarea.vue`
- Modify: `packages/ui/src/components/textarea/style/index.less`
- Modify: `packages/ui/src/components/textarea/index.ts`
- Modify: `packages/ui/src/components/textarea/__tests__/textarea.test.ts`
- Modify: `packages/ui/src/components/reference-textarea/src/reference-textarea.ts`
- Modify: `packages/ui/src/components/reference-textarea/src/OReferenceTextarea.vue`
- Modify: `packages/ui/src/components/reference-textarea/index.ts`
- Modify: `packages/ui/src/components/reference-textarea/__tests__/reference-textarea.test.ts`
- Modify: `apps/docs/examples/textarea/Basic.vue`
- Modify: `apps/docs/examples/reference-textarea/Basic.vue`
- Modify: `apps/docs/docs/components/textarea.md`
- Modify: `apps/docs/docs/components/reference-textarea.md`

**Interfaces:**

- Consumes: `.omg-scrollbar()` from Task 1.
- Produces: `OTextareaAutosizeOptions`, normalized row helpers, `autosize` Textarea and ReferenceTextarea props.

- [ ] **Step 1: Write failing public-contract and rendering tests**

```ts
const options: OTextareaAutosizeOptions = { minRows: 2, maxRows: 8 }
expect(oTextareaProps.autosize.default).toBe(false)
expect(wrapper.get('textarea').classes()).toContain('o-textarea__field')
expect(textareaStyles).toContain('field-sizing: content')
expect(textareaStyles).toContain('resize: none')
expect(textareaStyles).not.toContain('resize: vertical')
```

Cover fixed `rows`, boolean autosize, clamped autosize, invalid row normalization, IME, controlled rejection, and ReferenceTextarea prop forwarding.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `pnpm exec vitest run packages/ui/src/components/textarea packages/ui/src/components/reference-textarea`

Expected: FAIL because `autosize` does not exist and legacy resize modes remain.

- [ ] **Step 3: Replace the resize contract**

```ts
export interface OTextareaAutosizeOptions {
  readonly minRows?: number
  readonly maxRows?: number
}

export const oTextareaProps = {
  modelValue: { type: String, default: '' },
  rows: { type: Number, default: 4 },
  autosize: {
    type: [Boolean, Object] as PropType<boolean | OTextareaAutosizeOptions>,
    default: false,
  },
  // existing text, state, and ARIA props
} as const
```

Remove `resize`, `OTextareaResizeMode`, and `oTextareaResizeModes` from both components and public entries.

- [ ] **Step 4: Implement semantic sizing and scrolling**

Apply `field-sizing: content` only in the autosize class, expose normalized min/max row counts through CSS custom properties, always set `resize: none`, and apply `.omg-scrollbar()` to the native field. Fixed mode uses the native `rows` height and `overflow-y: auto`; bounded auto mode switches to scrolling only after its maximum.

- [ ] **Step 5: Update docs and run verification**

Run: `pnpm exec vitest run packages/ui/src/components/textarea packages/ui/src/components/reference-textarea`

Run: `pnpm --filter @puzzle-fuzzy/ui typecheck`

Run: `pnpm exec stylelint "packages/ui/src/components/{textarea,reference-textarea}/**/*.{vue,less}"`

Expected: PASS.

### Task 3: Reliable Upload selection and bounded native list

**Files:**

- Modify: `packages/ui/src/components/upload/src/upload.ts`
- Modify: `packages/ui/src/components/upload/src/OUpload.vue`
- Modify: `packages/ui/src/components/upload/style/index.less`
- Modify: `packages/ui/src/components/upload/__tests__/upload.test.ts`
- Modify: `apps/docs/examples/upload/Basic.vue`
- Modify: `apps/docs/docs/components/upload.md`
- Modify: `apps/docs/tests/e2e/components.spec.ts`

**Interfaces:**

- Consumes: shared scrollbar mixin and vue-icons-plus icon policy.
- Produces: recursion-free file chooser, `listMaxHeight`, same-file reselection, Upload action/status icons.

- [ ] **Step 1: Write failing file-chooser regression tests**

```ts
const input = wrapper.get<HTMLInputElement>('input[type="file"]')
expect(input.element.parentElement).not.toBe(wrapper.get('.o-upload__dropzone').element)
await wrapper.get('.o-upload__dropzone').trigger('click')
expect(inputClick).toHaveBeenCalledOnce()
```

Add a test that dispatches the generated input click with bubbling and proves it does not call `input.click()` recursively. Add a same-file double-selection test and an E2E `setInputFiles` assertion that the controlled docs list displays the selected name.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `pnpm exec vitest run packages/ui/src/components/upload`

Expected: FAIL because the input is nested inside the dropzone.

- [ ] **Step 3: Restructure native selection**

Move the native input outside the click target, assign an SSR-safe ID, associate the empty state through a label, add defensive `@click.stop`, and retain explicit `input.click()` only for the “Add more files” button. Keep `input.value = ''` after change.

- [ ] **Step 4: Add bounded scrolling and icons**

```ts
listMaxHeight: {
  type: [Number, String] as PropType<number | string>,
  default: 320,
}
```

Use a CSS custom property for max height, keep all list items mounted, apply `.omg-scrollbar()`, and render `LuPlus`, `LuTrash2`, `LuClock3`, `LuLoader2`, `LuCheckCircle2`, and `LuAlertCircle` while retaining status text.

- [ ] **Step 5: Remove restrictive docs accept filters and verify**

Run: `pnpm exec vitest run packages/ui/src/components/upload`

Run: `pnpm --filter @puzzle-fuzzy/ui typecheck`

Expected: PASS.

### Task 4: Select large-list virtualization

**Files:**

- Modify: `packages/ui/src/components/select/src/select.ts`
- Modify: `packages/ui/src/components/select/src/OSelect.vue`
- Modify: `packages/ui/src/components/select/style/index.less`
- Modify: `packages/ui/src/components/select/__tests__/select.test.ts`
- Modify: `apps/docs/examples/select/Basic.vue`
- Modify: `apps/docs/docs/components/select.md`
- Modify: `apps/docs/tests/e2e/components.spec.ts`

**Interfaces:**

- Consumes: `RecycleScroller` and `vue-virtual-scroller/index.css` from Task 1 dependency.
- Produces: `virtual`, `virtualThreshold`, `virtualListHeight`, normalized helpers, and scroll-to-active behavior.

- [ ] **Step 1: Write failing virtual and native branch tests**

```ts
expect(oSelectProps.virtual.default).toBe(true)
expect(oSelectProps.virtualThreshold.default).toBe(100)
expect(oSelectProps.virtualListHeight.default).toBe(288)
expect(wrapper.findComponent({ name: 'RecycleScroller' }).exists()).toBe(true)
```

Mock `RecycleScroller` in unit tests and cover below-threshold native rendering, opt-out, SSR prerender props, Home/End, disabled options, `aria-setsize`, and `aria-posinset`.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `pnpm exec vitest run packages/ui/src/components/select`

Expected: FAIL because virtualization props and rendering do not exist.

- [ ] **Step 3: Add normalized virtualization props**

```ts
virtual: { type: Boolean, default: true },
virtualThreshold: { type: Number, default: 100 },
virtualListHeight: { type: Number, default: 288 },
```

Normalize threshold to a positive integer and height to a positive finite pixel value.

- [ ] **Step 4: Implement RecycleScroller branch**

Use fixed 36px rows, `buffer=200`, `prerender=8`, a stable value/index key resolver, and a fixed viewport height. Before exposing a distant active option through `aria-activedescendant`, call `scrollToItem(index, { align: 'nearest' })` and wait for rendering. Keep the current `v-for` path for small collections.

- [ ] **Step 5: Add docs and E2E long-list coverage**

Create a 500-option example, open it, navigate to End, assert the selected option is rendered and active, and assert the DOM contains substantially fewer than 500 options.

- [ ] **Step 6: Run focused verification**

Run: `pnpm exec vitest run packages/ui/src/components/select`

Run: `pnpm --filter @puzzle-fuzzy/ui typecheck`

Expected: PASS.

### Task 5: OInput

**Files:**

- Create: `packages/ui/src/components/input/src/input.ts`
- Create: `packages/ui/src/components/input/src/OInput.vue`
- Create: `packages/ui/src/components/input/style/index.less`
- Create: `packages/ui/src/components/input/__tests__/input.test.ts`
- Create: `packages/ui/src/components/input/index.ts`
- Create: `apps/docs/examples/input/Basic.vue`
- Create: `apps/docs/docs/components/input.md`

**Interfaces:**

- Consumes: existing control tokens and vue-icons-plus/lu.
- Produces: `OInput`, `OInputProps`, `OInputEmits`, `OInputSlots`, `OInputType`, `OInputSize`.

- [ ] **Step 1: Write the complete failing component contract**

```ts
export const oInputTypes = ['text', 'password', 'email', 'search', 'tel', 'url'] as const
export const oInputSizes = ['sm', 'md', 'lg'] as const

export interface OInputEmits {
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  clear: []
}
```

Tests cover attrs/listener forwarding, IME, controlled rollback, prefix/suffix slots, clear focus, password visibility, disabled/read-only/invalid, and SSR.

- [ ] **Step 2: Run the test and confirm module-not-found failure**

Run: `pnpm exec vitest run packages/ui/src/components/input`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the native controlled input**

Use `inheritAttrs: false`, bind attrs to the real `<input>`, restore rejected values after `nextTick`, defer composition commits, and implement clear/password buttons with `LuX`, `LuEye`, and `LuEyeOff`. Do not parse numbers, debounce, or format values.

- [ ] **Step 4: Implement styles and docs**

Share control heights, radius, focus ring, invalid border, disabled opacity, logical properties, 32px icon buttons, 44px coarse-pointer targets, and reduced motion.

- [ ] **Step 5: Run focused tests, typecheck, lint, and stylelint**

Run: `pnpm exec vitest run packages/ui/src/components/input`

Expected: PASS.

### Task 6: OCheckbox

**Files:**

- Create: `packages/ui/src/components/checkbox/src/checkbox.ts`
- Create: `packages/ui/src/components/checkbox/src/OCheckbox.vue`
- Create: `packages/ui/src/components/checkbox/style/index.less`
- Create: `packages/ui/src/components/checkbox/__tests__/checkbox.test.ts`
- Create: `packages/ui/src/components/checkbox/index.ts`
- Create: `apps/docs/examples/checkbox/Basic.vue`
- Create: `apps/docs/docs/components/checkbox.md`

**Interfaces:**

- Produces: boolean controlled checkbox with default label slot and mixed-state support.

- [ ] **Step 1: Write failing native checkbox tests**

```ts
const props: OCheckboxProps = { modelValue: true, indeterminate: false }
const emits: OCheckboxEmits = {
  'update:modelValue': [false],
  change: [false, new Event('change')],
}
```

Cover generated label/input association, Space behavior, DOM `indeterminate`, `aria-checked="mixed"`, controlled rejection, disabled, invalid, and SSR.

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm exec vitest run packages/ui/src/components/checkbox`

- [ ] **Step 3: Implement native input and visual mirror**

Use a real checkbox, `useId`, `LuCheck`, and `LuMinus`. Synchronize the non-attribute `indeterminate` property on mount and updates. Emit only UI state.

- [ ] **Step 4: Add styles/docs and verify**

Run: `pnpm exec vitest run packages/ui/src/components/checkbox`

Expected: PASS.

### Task 7: ORadio and ORadioGroup

**Files:**

- Create: `packages/ui/src/components/radio/src/radio.ts`
- Create: `packages/ui/src/components/radio/src/radio-context.ts`
- Create: `packages/ui/src/components/radio/src/ORadio.vue`
- Create: `packages/ui/src/components/radio/src/ORadioGroup.vue`
- Create: `packages/ui/src/components/radio/style/index.less`
- Create: `packages/ui/src/components/radio/__tests__/radio.test.ts`
- Create: `packages/ui/src/components/radio/index.ts`
- Create: `apps/docs/examples/radio/Basic.vue`
- Create: `apps/docs/docs/components/radio.md`

**Interfaces:**

- Produces: `ORadio`, `ORadioGroup`, `ORadioValue = string | number`, group orientation, shared SSR-safe name, and typed slots/emits.

- [ ] **Step 1: Write failing standalone and group tests**

```ts
export type ORadioValue = string | number
export type ORadioGroupOrientation = 'horizontal' | 'vertical'
```

Cover standalone updates, group-provided model/name/disabled/invalid state, slotted radios, controlled rejection, duplicate labels, native name sharing, and SSR IDs.

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm exec vitest run packages/ui/src/components/radio`

- [ ] **Step 3: Implement provide/inject composition**

Group provides computed model, name, disabled, invalid, and a select callback. Radio prefers group state when present and otherwise emits its own update. Keep a real radio input and CSS selection dot.

- [ ] **Step 4: Add responsive styles/docs and verify**

Run: `pnpm exec vitest run packages/ui/src/components/radio`

Expected: PASS.

### Task 8: Borderless Dialog, OConfirmDialog, and OFormDialog

**Files:**

- Modify: `packages/ui/src/styles/tokens/semantic.less`
- Modify: `packages/ui/src/components/dialog/style/index.less`
- Modify: `packages/ui/src/components/dialog/__tests__/dialog.test.ts`
- Create: `packages/ui/src/components/confirm-dialog/src/confirm-dialog.ts`
- Create: `packages/ui/src/components/confirm-dialog/src/OConfirmDialog.vue`
- Create: `packages/ui/src/components/confirm-dialog/style/index.less`
- Create: `packages/ui/src/components/confirm-dialog/__tests__/confirm-dialog.test.ts`
- Create: `packages/ui/src/components/confirm-dialog/index.ts`
- Create: `packages/ui/src/components/form-dialog/src/form-dialog.ts`
- Create: `packages/ui/src/components/form-dialog/src/OFormDialog.vue`
- Create: `packages/ui/src/components/form-dialog/style/index.less`
- Create: `packages/ui/src/components/form-dialog/__tests__/form-dialog.test.ts`
- Create: `packages/ui/src/components/form-dialog/index.ts`
- Create: `apps/docs/examples/confirm-dialog/Basic.vue`
- Create: `apps/docs/examples/form-dialog/Basic.vue`
- Create: `apps/docs/docs/components/confirm-dialog.md`
- Create: `apps/docs/docs/components/form-dialog.md`

**Interfaces:**

- Consumes: `ODialog`, `OButton`, form controls, and `LuTriangleAlert`.
- Produces: UI-only confirm and form dialog compositions.

- [ ] **Step 1: Write failing visual and behavior tests**

```ts
expect(dialogStyles).toMatch(/\.o-dialog\s*\{[^}]*border:\s*0/su)
expect(confirmWrapper.emitted('confirm')).toEqual([[expect.any(MouseEvent)]])
expect(confirmWrapper.props('open')).toBe(true)
expect(formWrapper.get('form').attributes('id')).toBeTruthy()
expect(formWrapper.emitted('submit')).toEqual([[expect.any(SubmitEvent)]])
```

Cover cancel, Escape/mask updates, controlled rejection, loading/disabled buttons, safe initial focus, native form association, required validation behavior, slots, SSR, and source icon contracts.

- [ ] **Step 2: Run and confirm failures**

Run: `pnpm exec vitest run packages/ui/src/components/dialog packages/ui/src/components/confirm-dialog packages/ui/src/components/form-dialog`

- [ ] **Step 3: Remove Dialog border and strengthen elevation**

Set `border: 0`, add `--omg-shadow-dialog`, and expose a local `--omg-dialog-max-inline-size` variable so ConfirmDialog can use 420px without adding a width prop.

- [ ] **Step 4: Implement OConfirmDialog**

Compose `ODialog` and `OButton`. Confirm emits without closing; cancel requests close and emits cancel. Danger tone shows `LuTriangleAlert`; neutral confirmation has no forced decoration.

- [ ] **Step 5: Implement OFormDialog**

Render a native form around the body slot, generate an SSR-safe form ID, connect the footer submit button through its `form` attribute, prevent native navigation, and emit the raw `SubmitEvent`. Do not serialize or validate consumer data.

- [ ] **Step 6: Add docs and focused verification**

Run: `pnpm exec vitest run packages/ui/src/components/dialog packages/ui/src/components/confirm-dialog packages/ui/src/components/form-dialog`

Expected: PASS.

### Task 9: Package integration, docs navigation, SSR, and E2E

**Files:**

- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.less`
- Modify: `packages/ui/vite.config.ts`
- Modify: `packages/ui/package.json`
- Modify: `scripts/check-naming.mjs`
- Modify: `scripts/test-package.mjs`
- Modify: `packages/ui/tests/package/package-contract.test.ts`
- Modify: `packages/ui/tests/ssr/ssr.test.ts`
- Modify: `apps/docs/docs/.vitepress/config.mts`
- Modify: `apps/docs/tests/e2e/components.spec.ts`
- Modify: `README.md`
- Modify: `packages/ui/README.md`
- Modify: `DESIGN.md`
- Modify: `.impeccable/design.json`

**Interfaces:**

- Consumes: all component public entries from Tasks 1–8.
- Produces: root exports, subpaths, build entries, docs routes, naming contract for 20 components, package consumer coverage, SSR and browser verification.

- [ ] **Step 1: Add failing package-contract expectations**

```ts
const newSubpaths = ['./input', './checkbox', './radio', './confirm-dialog', './form-dialog']
for (const subpath of newSubpaths) expect(packageJson.exports).toHaveProperty(subpath)
```

Add packed-consumer imports and renders for every new root/subpath component, plus public Select/Textarea/Upload contract usage.

- [ ] **Step 2: Run package and naming tests and confirm failure**

Run: `pnpm check:naming`

Run: `pnpm test:package`

Expected: FAIL because shared entries and subpaths are missing.

- [ ] **Step 3: Integrate entries and docs**

Add explicit root/type exports, style imports, Vite entries, package exports, aliases, sidebar routes, component lists, and design-system documentation. Update naming expectations from 15 to 20 component directories while keeping SVG/icon checks.

- [ ] **Step 4: Expand SSR and E2E coverage**

SSR-render all new components and long virtual Select prerendering. E2E-cover real Upload selection, fixed/auto Textarea height, Input clear/password, Checkbox/Radio keyboard use, Confirm/Form Dialog focus and submission, long Select DOM windowing, reduced motion, and axe serious violations.

- [ ] **Step 5: Run focused integration gates**

Run: `pnpm check:naming`

Run: `pnpm test:ssr`

Run: `pnpm test:package`

Expected: PASS.

- [ ] **Step 6: Run the complete repository gate**

Run: `pnpm verify`

Expected: formatting, ESLint, Stylelint, naming, typecheck, coverage, build, SSR, packed consumer, publint/ATTW, VitePress build, Playwright, and axe all PASS.

- [ ] **Step 7: Commit and push**

```bash
git add --all
git commit -m "feat: add form dialog and virtual scroll system"
git fetch origin --prune
git push origin main
```
