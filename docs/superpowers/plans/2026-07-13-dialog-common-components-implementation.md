# Dialog Refresh and Common Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `ODialog` around a precise native lifecycle and add fully published `OTag`, `OBadge`, and `OProgress` component families.

**Architecture:** `ODialog` remains a controlled native `<dialog>` but separates close intent from accepted close lifecycle, relies on native modal focus containment, and keeps an internal presence phase for entry/exit motion. `OConfirmDialog`, `OFormDialog`, and `ODrawer` consume only the shared modal prop subset. Tag, Badge, and Progress remain independent leaf components with explicit runtime vocabularies and no business-state coupling.

**Tech Stack:** Node.js 24 LTS, pnpm, Vue 3 SFCs, TypeScript, Less, Vite, Vitest, `@vue/test-utils`, VitePress, Playwright, axe, `vue-icons-plus/lu`.

## Global Constraints

- Use Node.js 24 LTS and pnpm; do not add Bun scripts, configuration, or lockfiles.
- `packages/ui` is the only published package; `apps/docs` remains a private VitePress consumer.
- Public names use `O*`, `.o-*`, and `--omg-*`; every new family follows the complete component directory contract.
- Use `vue-icons-plus/lu` for icons; do not add handwritten SVG or a second icon dependency.
- Do not add a dependency or modify `pnpm-lock.yaml` for this release.
- Preserve native `<dialog>` and the independent `OImage` `Teleport + preview layer` implementation.
- Keep components UI-only: no request mapping, Promise guard, dirty-form policy, route handling, or automatic business status inference.
- Prefer semantic surface, spacing, and shadow over decorative borders; Dialog, Tag, Badge, and Progress defaults remain borderless.
- Support SSR, keyboard use, accessible names, RTL, dark theme, compact viewports, and `prefers-reduced-motion`.
- Do not declare or modify any VitePress `--vp-*` variable.
- Final publication requires a fresh `origin` fetch, merge of an advanced `origin/main` when necessary, `pnpm verify`, push to `origin/main`, and remote SHA confirmation.

---

## File and Responsibility Map

### Dialog lane

- `packages/ui/src/components/dialog/src/dialog.ts`: common/Dialog-only props, close reasons, event and slot types, width normalization.
- `packages/ui/src/components/dialog/src/ODialog.vue`: native lifecycle, controlled close requests, lazy presence, accessible IDs, initial focus, mask gesture, lifecycle emissions.
- `packages/ui/src/components/dialog/style/index.less`: centered/fullscreen geometry, scrolling, mobile footer, top-layer motion, reduced motion.
- `packages/ui/src/components/dialog/__tests__/dialog.test.ts`: contract, lifecycle, naming, focus, mounting, gesture, SSR, and style assertions.
- `packages/ui/src/components/dialog/index.ts`: explicit Dialog subpath exports.
- `packages/ui/src/components/confirm-dialog/*`, `form-dialog/*`, `drawer/*`: migrate to shared modal props and lifecycle forwarding without changing their specialized visuals.

### New leaf-component lanes

- `packages/ui/src/components/tag/*`: compact semantic label and consumer-controlled close affordance.
- `packages/ui/src/components/badge/*`: dot/count/text normalization and logical overlay positioning.
- `packages/ui/src/components/progress/*`: determinate/indeterminate progress semantics and transform-driven visuals.

### Shared publication lane

- `packages/ui/src/index.ts`, `packages/ui/src/styles/index.less`, `packages/ui/vite.config.ts`, `packages/ui/package.json`: root, style, build, and subpath exports.
- `packages/ui/tests/ssr/ssr.test.ts`, `packages/ui/tests/package/package-contract.test.ts`, `scripts/test-package.mjs`, `scripts/check-naming.mjs`: server and publication contracts.

### Documentation lane

- `apps/docs/docs/components/{dialog,tag,badge,progress}.md`: capability and API pages.
- `apps/docs/examples/{dialog,tag,badge,progress}/*.vue`: focused live examples.
- `apps/docs/docs/.vitepress/config.mts`, `apps/docs/docs/components/index.md`, `apps/docs/docs/index.md`, `README.md`, `packages/ui/README.md`: aliases, navigation, counts, imports, and architecture corrections.
- `apps/docs/tests/e2e/components.spec.ts`: interaction, motion, focus, responsive, RTL/theme, and axe coverage.
- `DESIGN.md`, `.impeccable/design.json`, `PRODUCT.md`: durable design and product boundaries.

---

---

### Task 1: Rebuild the Dialog contract, lifecycle, and motion

**Files:**

- Modify: `packages/ui/src/components/dialog/src/dialog.ts`
- Modify: `packages/ui/src/components/dialog/src/ODialog.vue`
- Modify: `packages/ui/src/components/dialog/style/index.less`
- Modify: `packages/ui/src/components/dialog/__tests__/dialog.test.ts`
- Modify: `packages/ui/src/components/dialog/index.ts`

**Interfaces:**

- Consumes: Vue native `<dialog>`, existing OMG semantic tokens, `LuX`.
- Produces: `oDialogCommonProps`, `oDialogProps`, `normalizeODialogWidth`, `oDialogCloseReasons`, `ODialogCloseReason`, `ODialogCloseRequest`, lifecycle emits, and `ODialogSlotProps`.

- [ ] **Step 1: Replace the old type-only assertions with failing contract tests**

Add these exact expectations to `dialog.test.ts` before changing the implementation:

```ts
it('defines explicit width, lifecycle, close-reason, and slot contracts', () => {
  const props: ODialogProps = {
    open: true,
    width: 'min(92vw, 42rem)',
    fullscreen: false,
    destroyOnClose: true,
    initialFocus: '#dialog-primary-field',
  }
  const request: ODialogCloseRequest = { reason: 'mask', originalEvent: new MouseEvent('click') }
  const emits: ODialogEmits = {
    'update:open': [false],
    'request-close': [request],
    open: [],
    opened: [],
    close: ['mask'],
    closed: ['mask'],
  }
  const slotProps: ODialogSlotProps = {
    close: () => undefined,
    titleId: 'dialog-title',
    descriptionId: 'dialog-description',
  }

  expect(oDialogCloseReasons).toEqual([
    'close-button',
    'mask',
    'escape',
    'slot',
    'native',
    'programmatic',
  ])
  expect(oDialogProps.width.default).toBe(520)
  expect(oDialogProps.fullscreen.default).toBe(false)
  expect(oDialogProps.destroyOnClose.default).toBe(false)
  expect(props.destroyOnClose).toBe(true)
  expect(emits.close).toEqual(['mask'])
  expect(slotProps.titleId).toBe('dialog-title')
})

it.each([
  [undefined, '520px'],
  [640, '640px'],
  [640.9, '640px'],
  [0, '520px'],
  [Number.NaN, '520px'],
  [' min(92vw, 42rem) ', 'min(92vw, 42rem)'],
  ['   ', '520px'],
] as const)('normalizes Dialog width %s to %s', (value, expected) => {
  expect(normalizeODialogWidth(value)).toBe(expected)
})
```

Update imports to use only explicit exports from `../index`.

- [ ] **Step 2: Run the Dialog test and confirm the contract is red**

Run:

```bash
pnpm exec vitest run packages/ui/src/components/dialog/__tests__/dialog.test.ts
```

Expected: failure because `oDialogCommonProps`, close reasons, width props, normalizer, and lifecycle types do not exist.

- [ ] **Step 3: Implement the exact public vocabulary in `dialog.ts`**

Use this contract as the source of truth:

```ts
import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oDialogCloseReasons = [
  'close-button',
  'mask',
  'escape',
  'slot',
  'native',
  'programmatic',
] as const

export type ODialogCloseReason = (typeof oDialogCloseReasons)[number]
export type ODialogWidth = string | number

const defaultDialogWidth = 520

export const normalizeODialogWidth = (width: ODialogWidth | undefined): string => {
  if (typeof width === 'number') {
    return Number.isFinite(width) && width > 0
      ? `${String(Math.floor(width))}px`
      : `${String(defaultDialogWidth)}px`
  }

  const normalized = width?.trim()
  return normalized || `${String(defaultDialogWidth)}px`
}

export const oDialogCommonProps = {
  open: { type: Boolean, default: false },
  title: String,
  description: String,
  closeOnMask: { type: Boolean, default: true },
  closeOnEsc: { type: Boolean, default: true },
  showClose: { type: Boolean, default: true },
  closeAriaLabel: { type: String, default: 'Close dialog' },
  ariaLabel: String,
} as const

export const oDialogProps = {
  ...oDialogCommonProps,
  width: {
    type: [String, Number] as PropType<ODialogWidth>,
    default: defaultDialogWidth,
  },
  fullscreen: { type: Boolean, default: false },
  destroyOnClose: { type: Boolean, default: false },
  initialFocus: String,
} as const

export type ODialogProps = ExtractPublicPropTypes<typeof oDialogProps>

export interface ODialogCloseRequest {
  readonly reason: Exclude<ODialogCloseReason, 'programmatic'>
  readonly originalEvent?: Event
}

export interface ODialogEmits {
  'update:open': [open: boolean]
  'request-close': [request: ODialogCloseRequest]
  open: []
  opened: []
  close: [reason: ODialogCloseReason]
  closed: [reason: ODialogCloseReason]
}

export interface ODialogSlotProps {
  readonly close: () => void
  readonly titleId: string
  readonly descriptionId: string
}

export interface ODialogSlots {
  header?: (props: ODialogSlotProps) => VNodeChild
  title?: (props: ODialogSlotProps) => VNodeChild
  description?: (props: ODialogSlotProps) => VNodeChild
  default?: (props: ODialogSlotProps) => VNodeChild
  footer?: (props: ODialogSlotProps) => VNodeChild
  closeIcon?: () => VNodeChild
}
```

- [ ] **Step 4: Add failing lifecycle, mounting, focus, naming, and gesture tests**

Keep the existing native `showModal`/`close` stubs, then add these concrete cases:

```ts
it('separates rejected close requests from accepted close lifecycle', async () => {
  const wrapper = mount(ODialog, {
    attachTo: document.body,
    props: { open: true, title: 'Settings' },
  })
  await nextTick()

  await wrapper.get('.o-dialog__close').trigger('click')
  expect(wrapper.emitted('request-close')?.[0]?.[0]).toMatchObject({
    reason: 'close-button',
  })
  expect(wrapper.emitted('update:open')).toEqual([[false]])
  expect(wrapper.emitted('close')).toBeUndefined()
  expect(wrapper.get('dialog').attributes('open')).toBeDefined()

  await wrapper.setProps({ open: false })
  await flushDialogAnimations(wrapper)
  expect(wrapper.emitted('close')).toEqual([['close-button']])
  expect(wrapper.emitted('closed')).toEqual([['close-button']])
})

it('uses programmatic reason when an old request was rejected', async () => {
  const wrapper = mount(ODialog, {
    attachTo: document.body,
    props: { open: true, title: 'Settings' },
  })
  await nextTick()
  await wrapper.get('.o-dialog__close').trigger('click')
  await nextTick()
  await wrapper.setProps({ open: false })
  await flushDialogAnimations(wrapper)
  expect(wrapper.emitted('close')).toEqual([['programmatic']])
})

it('mounts lazily, preserves content, and destroys only after closed', async () => {
  const wrapper = mount(ODialog, {
    attachTo: document.body,
    props: { title: 'Lazy', destroyOnClose: true },
    slots: { default: '<input aria-label="Lazy field" value="kept" />' },
  })
  expect(wrapper.find('[aria-label="Lazy field"]').exists()).toBe(false)
  await wrapper.setProps({ open: true })
  await flushDialogAnimations(wrapper)
  expect(wrapper.get('[aria-label="Lazy field"]').exists()).toBe(true)
  await wrapper.setProps({ open: false })
  expect(wrapper.get('[aria-label="Lazy field"]').exists()).toBe(true)
  await flushDialogAnimations(wrapper)
  expect(wrapper.find('[aria-label="Lazy field"]').exists()).toBe(false)
})

it('focuses initialFocus and falls back safely for invalid selectors', async () => {
  const wrapper = mount(ODialog, {
    attachTo: document.body,
    props: { open: true, title: 'Focus', initialFocus: '[' },
    slots: { default: '<input autofocus id="primary-field" /><button type="button">Done</button>' },
  })
  await expect(nextTick()).resolves.toBeUndefined()
  expect(document.activeElement).toBe(wrapper.get('#primary-field').element)
})

it('does not close after a drag starts inside and ends on the backdrop', async () => {
  const wrapper = mount(ODialog, {
    attachTo: document.body,
    props: { open: true, title: 'Gesture' },
    slots: { default: '<button class="inside" type="button">Inside</button>' },
  })
  const dialog = wrapper.get('dialog')
  mockDialogBounds(dialog.element)
  await wrapper.get('.inside').trigger('pointerdown', { clientX: 200, clientY: 200 })
  dialog.element.dispatchEvent(
    new PointerEvent('pointerup', { bubbles: true, clientX: 20, clientY: 20 }),
  )
  expect(wrapper.emitted('request-close')).toBeUndefined()
})

it('warns when a Dialog has no accessible name or a custom header misses titleId', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  const unnamed = mount(ODialog, { props: { open: true } })
  await nextTick()
  expect(warn).toHaveBeenCalledWith(
    '[OMG UI][ODialog] Provide ariaLabel, title, a title slot, or titleId in header.',
  )

  warn.mockClear()
  const custom = mount(ODialog, {
    props: { open: true },
    slots: { header: '<h2>Missing id</h2>' },
  })
  await nextTick()
  expect(warn).toHaveBeenCalledOnce()
  unnamed.unmount()
  custom.unmount()
})
```

Also add explicit state-machine cases for:

- an initial `open=true` mount calling `showModal()` once and emitting exactly `open`, then `opened`;
- duplicate close gestures in one update cycle emitting one request with the first reason;
- unexpected native `close` accepted by the parent emitting `request-close → close → closed` once, and rejected native close reopening without accepted lifecycle events;
- strict `open → opened → close → closed` ordering;
- `open → false → true` while a controlled animation `finished` promise is pending, proving the stale generation cannot close or emit `closed`;
- default `destroyOnClose=false` preserving an edited field across a complete close/reopen cycle.

Define this local flush helper in every modal test file that needs lifecycle completion:

```ts
const flushDialogAnimations = async (): Promise<void> => {
  await nextTick()
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  await nextTick()
}
```

Stub `getAnimations()` to return an empty list for immediate lifecycle cases and explicit controllable `finished` promises for motion-order cases. Define `mockDialogBounds()` with the existing `100..400 x 100..300` rectangle. Add a source assertion that `ODialog.vue` no longer contains `focusableSelector`, a manual Tab handler, or `@keydown`.

- [ ] **Step 5: Implement lifecycle state and controlled request functions in `ODialog.vue`**

Use one explicit phase and transition generation:

```ts
type DialogPhase = 'closed' | 'opening' | 'open' | 'closing'

const dialogElement = shallowRef<HTMLDialogElement | null>(null)
const phase = shallowRef<DialogPhase>('closed')
const rendered = shallowRef(props.open)
const pendingReason = shallowRef<ODialogCloseReason>()
let transitionGeneration = 0
let internalNativeClose = false

const requestClose = (
  reason: Exclude<ODialogCloseReason, 'programmatic'>,
  originalEvent?: Event,
): void => {
  if (!props.open || phase.value === 'closing' || pendingReason.value !== undefined) return
  const request: ODialogCloseRequest = originalEvent ? { reason, originalEvent } : { reason }
  pendingReason.value = reason
  emit('request-close', request)
  emit('update:open', false)
  const capturedReason = reason
  void nextTick(() => {
    if (props.open && pendingReason.value === capturedReason) pendingReason.value = undefined
  })
}

const waitForOwnMotion = async (dialog: HTMLDialogElement): Promise<void> => {
  await nextTick()
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  const animations =
    dialog.getAnimations?.().filter(({ effect }) => {
      const target = effect instanceof KeyframeEffect ? effect.target : undefined
      return target === dialog || target === dialog.ownerDocument.documentElement
    }) ?? []
  await Promise.allSettled(animations.map(({ finished }) => finished))
}

const beginOpen = async (): Promise<void> => {
  const dialog = dialogElement.value
  if (!dialog || !props.open) return
  const generation = ++transitionGeneration
  rendered.value = true
  phase.value = 'opening'
  await nextTick()
  if (!dialog.open) dialog.showModal()
  emit('open')
  focusInitialTarget(dialog)
  await waitForOwnMotion(dialog)
  if (generation !== transitionGeneration || !props.open) return
  phase.value = 'open'
  emit('opened')
}

const beginClose = async (): Promise<void> => {
  const dialog = dialogElement.value
  if (!dialog || props.open) return
  if (!dialog.open) {
    phase.value = 'closed'
    if (props.destroyOnClose) rendered.value = false
    return
  }
  const generation = ++transitionGeneration
  const reason = pendingReason.value ?? 'programmatic'
  pendingReason.value = undefined
  phase.value = 'closing'
  emit('close', reason)
  await waitForOwnMotion(dialog)
  if (generation !== transitionGeneration || props.open) return
  internalNativeClose = true
  dialog.close()
  internalNativeClose = false
  phase.value = 'closed'
  if (props.destroyOnClose) rendered.value = false
  await nextTick()
  emit('closed', reason)
}
```

Implement `focusInitialTarget()` by catching selector errors, requiring `dialog.contains(target)`, and otherwise leaving native autofocus unchanged. Synchronize initial and later state with:

```ts
onMounted(() => {
  if (props.open) void beginOpen()
})

watch(
  () => props.open,
  (open) => {
    if (open) void beginOpen()
    else void beginClose()
  },
  { flush: 'post' },
)
```

On a rapid reopen, increment the generation, keep the native Dialog open, set phase back to `opening`, and finish through `beginOpen()`.

Track pointer-down outside status on the native Dialog. A pointer-up requests `mask` only when both events target the Dialog itself and both coordinate pairs lie outside its surface rectangle. `cancel` prevents the native action and requests `escape` only when enabled. The close button requests `close-button`; slot props expose `close: () => requestClose('slot')`.

On an unexpected native `close` event while `internalNativeClose=false`, store `native` as the pending reason, emit a `native` request, and emit `update:open=false`. On the next post-flush, call `beginOpen()` and clear the pending reason if the parent still supplies true. If the parent accepts, increment the generation, emit `close('native')`, set phase to closed, apply `destroyOnClose`, and emit `closed('native')` after the render flush. This native finalization branch must not call `beginClose()` or depend on `dialog.open`, because the browser has already closed it. Both branches are covered by the native-close tests above.

- [ ] **Step 6: Implement the accessible template and dev warning**

The native element must bind these exact state hooks:

```vue
<dialog
  v-bind="$attrs"
  ref="dialogElement"
  class="o-dialog"
  :class="{ 'o-dialog--fullscreen': props.fullscreen }"
  :data-state="phase"
  :style="dialogStyle"
  :aria-label="labelledBy ? undefined : props.ariaLabel"
  :aria-labelledby="labelledBy"
  :aria-describedby="describedBy"
  @cancel="handleCancel"
  @close="handleNativeClose"
  @pointerdown="handlePointerDown"
  @pointerup="handlePointerUp"
>
```

`dialogStyle` sets `--omg-dialog-inline-size: normalizeODialogWidth(props.width)`. Render header/body/footer only when `rendered=true`. Keep the close button outside the consumer header content. Render title and description slots in component-owned elements carrying their IDs. Pass the same `slotProps` object to every public slot. The close icon slot falls back to `<LuX aria-hidden="true" />`.

In development, warn once per instance with this exact prefix when the Dialog lacks a naming source or when a header slot fails to render `titleId` inside the Dialog:

```ts
console.warn('[OMG UI][ODialog] Provide ariaLabel, title, a title slot, or titleId in header.')
```

- [ ] **Step 7: Replace Dialog geometry and add native top-layer motion**

Use these exact motion targets in `style/index.less`:

```less
.o-dialog {
  --omg-dialog-inline-size: 520px;

  width: min(calc(100vw - (var(--omg-space-4) * 2)), var(--omg-dialog-inline-size));
  max-width: calc(100vw - (var(--omg-space-4) * 2));
  max-height: calc(100dvh - (var(--omg-space-4) * 2));
  border: 0;
  opacity: 0;
  transform: translateY(6px) scale(0.98);
  transition:
    opacity 160ms cubic-bezier(0.25, 1, 0.5, 1),
    transform 160ms cubic-bezier(0.25, 1, 0.5, 1),
    display 160ms allow-discrete,
    overlay 160ms allow-discrete;
}

.o-dialog[open][data-state='opening'],
.o-dialog[open][data-state='open'] {
  opacity: 1;
  transform: none;
  transition-duration: 220ms, 220ms, 220ms, 220ms;
}

.o-dialog::backdrop {
  opacity: 0;
  transition:
    opacity 140ms cubic-bezier(0.25, 1, 0.5, 1),
    display 160ms allow-discrete,
    overlay 160ms allow-discrete;
}

.o-dialog[open][data-state='opening']::backdrop,
.o-dialog[open][data-state='open']::backdrop {
  opacity: 1;
  transition-duration: 180ms, 180ms, 180ms;
}

@starting-style {
  .o-dialog[open][data-state='opening'] {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }

  .o-dialog[open][data-state='opening']::backdrop {
    opacity: 0;
  }
}
```

Keep header/footer fixed in the surface and body as the only scroll area. Add `padding-bottom: max(var(--omg-space-5), env(safe-area-inset-bottom))` to the footer. In fullscreen mode, the header additionally uses `padding-block-start: max(var(--omg-space-5), env(safe-area-inset-top))`; header and footer use logical inline padding with `max(var(--omg-space-5), env(safe-area-inset-left/right))`. At `width <= 480px`, allow footer wrapping and let action buttons grow. Fullscreen uses `width/max-width/height/max-height: 100vw/100vw/100dvh/100dvh`, zero margin, and zero radius. Reduced motion sets all surface/backdrop transitions to none.

- [ ] **Step 8: Export the new Dialog contract explicitly**

`dialog/index.ts` exports `ODialog`, runtime props/reasons/normalizer, and every public Dialog type. Export `oDialogCommonProps` only from this subpath; do not add it to `packages/ui/src/index.ts`.

- [ ] **Step 9: Run focused Dialog checks**

Run:

```bash
pnpm exec vitest run packages/ui/src/components/dialog/__tests__/dialog.test.ts
pnpm --filter @puzzle-fuzzy/ui typecheck
pnpm exec eslint packages/ui/src/components/dialog
pnpm exec stylelint "packages/ui/src/components/dialog/**/*.{vue,less}"
```

Expected: all Dialog tests, typecheck, ESLint, and Stylelint pass.

- [ ] **Step 10: Commit the Dialog rewrite**

```bash
git add packages/ui/src/components/dialog
git commit -m "refactor(dialog): rebuild native modal lifecycle"
```

---

### Task 2: Migrate Confirm Dialog, Form Dialog, and Drawer

**Files:**

- Modify: `packages/ui/src/components/confirm-dialog/src/confirm-dialog.ts`
- Modify: `packages/ui/src/components/confirm-dialog/src/OConfirmDialog.vue`
- Modify: `packages/ui/src/components/confirm-dialog/__tests__/confirm-dialog.test.ts`
- Modify: `packages/ui/src/components/form-dialog/src/form-dialog.ts`
- Modify: `packages/ui/src/components/form-dialog/src/OFormDialog.vue`
- Modify: `packages/ui/src/components/form-dialog/__tests__/form-dialog.test.ts`
- Modify: `packages/ui/src/components/drawer/src/drawer.ts`
- Modify: `packages/ui/src/components/drawer/src/ODrawer.vue`
- Modify: `packages/ui/src/components/drawer/__tests__/drawer.test.ts`

**Interfaces:**

- Consumes: `oDialogCommonProps`, `ODialogCloseReason`, `ODialogCloseRequest`, `ODialogSlotProps` from `@puzzle-fuzzy/ui/dialog`.
- Produces: specialized components without leaked `width`, `fullscreen`, `destroyOnClose`, or `initialFocus` props.

- [ ] **Step 1: Write failing downstream type and event tests**

In each test file, prove the specialized prop object does not contain Dialog-only view props and prove lifecycle forwarding:

```ts
expect('width' in oConfirmDialogProps).toBe(false)
expect('fullscreen' in oConfirmDialogProps).toBe(false)
expect('destroyOnClose' in oFormDialogProps).toBe(false)
expect('initialFocus' in oDrawerProps).toBe(false)
```

Add a mounted close-button request assertion to Drawer:

```ts
await wrapper.get('.o-dialog__close').trigger('click')
expect(wrapper.emitted('request-close')?.[0]?.[0]).toMatchObject({
  reason: 'close-button',
})
expect(wrapper.emitted('close')).toBeUndefined()
await wrapper.setProps({ open: false })
await flushDialogAnimations()
expect(wrapper.emitted('close')).toEqual([['close-button']])
expect(wrapper.emitted('closed')).toEqual([['close-button']])
```

For Confirm/Form cancel, assert `cancel` fires first and the nested Dialog produces a `slot` close request.

- [ ] **Step 2: Run the four modal suites and confirm migration failures**

```bash
pnpm exec vitest run \
  packages/ui/src/components/dialog/__tests__/dialog.test.ts \
  packages/ui/src/components/confirm-dialog/__tests__/confirm-dialog.test.ts \
  packages/ui/src/components/form-dialog/__tests__/form-dialog.test.ts \
  packages/ui/src/components/drawer/__tests__/drawer.test.ts
```

Expected: Confirm/Form/Drawer fail because they still spread `oDialogProps` and treat `close` as request intent.

- [ ] **Step 3: Replace downstream prop spreading and event types**

Change each prop source to import and spread `oDialogCommonProps`. Keep component-specific close label defaults by overriding `closeAriaLabel` after the spread.

Add this lifecycle surface to each specialized emit interface in addition to its existing events:

```ts
'request-close': [request: ODialogCloseRequest]
close: [reason: ODialogCloseReason]
closed: [reason: ODialogCloseReason]
```

Import the two Dialog lifecycle types with `import type`.

- [ ] **Step 4: Forward lifecycle events and slot close methods**

Each composition forwards native Dialog lifecycle explicitly:

```vue
@request-close="emit('request-close', $event)" @close="emit('close', $event)"
@closed="emit('closed', $event)"
```

Use footer slot props for safe cancellation:

```vue
<template #footer="{ close }">
  <OButton
    class="o-confirm-dialog__cancel"
    variant="outline"
    tone="neutral"
    autofocus
    @click="
      (event) => {
        emit('cancel', event)
        close()
      }
    "
  >
    {{ props.cancelLabel }}
  </OButton>
  <!-- existing confirm button remains consumer-controlled -->
</template>
```

Apply the same pattern to Form Dialog. Drawer explicitly forwards every slot declared by `ODrawerSlots`: `title`, `description`, `header`, `default`, `footer`, and `closeIcon`. Forward the complete Dialog slot-prop object wherever that slot receives props, so custom Drawer headers can apply `titleId` and all slots remain aligned with the public type.

- [ ] **Step 5: Protect Drawer motion from Dialog scale motion**

In Drawer Less, keep its existing transform declarations more specific than Dialog and explicitly target all presence states:

```less
.o-dialog.o-drawer[open][data-state='opening'],
.o-dialog.o-drawer[open][data-state='open'] {
  opacity: 1;
  transform: none;
}

.o-dialog.o-drawer[open][data-state='closing'] {
  opacity: 0;
  transform: translate3d(var(--omg-drawer-closed-translate), 0, 0);
}
```

Retain start/end, RTL, directional shadows, `100dvh`, body-only scrolling, and `max-width:100vw`. Update Drawer transition waiting tests to the shared `data-state` lifecycle.

- [ ] **Step 6: Run downstream regression checks**

```bash
pnpm exec vitest run \
  packages/ui/src/components/dialog/__tests__/dialog.test.ts \
  packages/ui/src/components/confirm-dialog/__tests__/confirm-dialog.test.ts \
  packages/ui/src/components/form-dialog/__tests__/form-dialog.test.ts \
  packages/ui/src/components/drawer/__tests__/drawer.test.ts
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: every modal suite passes; Confirm and Form keep safe cancel autofocus; Drawer keeps directional motion.

- [ ] **Step 7: Commit downstream migration**

```bash
git add packages/ui/src/components/confirm-dialog packages/ui/src/components/form-dialog packages/ui/src/components/drawer
git commit -m "refactor(ui): align modal compositions with dialog lifecycle"
```

---

### Task 3: Add OTag

**Files:**

- Create: `packages/ui/src/components/tag/src/tag.ts`
- Create: `packages/ui/src/components/tag/src/OTag.vue`
- Create: `packages/ui/src/components/tag/style/index.less`
- Create: `packages/ui/src/components/tag/__tests__/tag.test.ts`
- Create: `packages/ui/src/components/tag/index.ts`
- Modify: `packages/ui/src/styles/tokens/primitives.less`
- Modify: `packages/ui/src/styles/tokens/semantic.less`

**Interfaces:**

- Consumes: OMG semantic tokens and `LuX`.
- Produces: `OTag`, `oTagProps`, `oTagTones`, `oTagVariants`, `oTagSizes`, and explicit Tag types.

- [ ] **Step 1: Create the failing Tag contract and behavior tests**

Create `tag.test.ts` with these core cases:

```ts
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import {
  OTag,
  oTagProps,
  oTagSizes,
  oTagTones,
  oTagVariants,
  type OTagEmits,
  type OTagProps,
  type OTagSlots,
} from '../index'

describe('OTag', () => {
  it('keeps runtime and public types aligned', () => {
    const props: OTagProps = {
      tone: 'success',
      variant: 'solid',
      size: 'sm',
      closable: true,
      closeAriaLabel: '移除已完成标签',
    }
    const emits: OTagEmits = { close: [new MouseEvent('click')] }
    const slots: OTagSlots = {
      icon: () => h('span', 'I'),
      default: () => '已完成',
      closeIcon: () => h('span', 'X'),
    }

    expect(oTagTones).toEqual(['neutral', 'brand', 'success', 'warning', 'danger'])
    expect(oTagVariants).toEqual(['soft', 'solid'])
    expect(oTagSizes).toEqual(['sm', 'md'])
    expect(oTagProps.tone.default).toBe('neutral')
    expect(oTagProps.variant.default).toBe('soft')
    expect(oTagProps.size.default).toBe('md')
    expect(props.closable).toBe(true)
    expect(emits.close[0]).toBeInstanceOf(MouseEvent)
    expect(slots.default?.()).toBe('已完成')
  })

  it('renders semantic classes, slots, and a named non-submit close button', async () => {
    const wrapper = mount(OTag, {
      props: {
        tone: 'warning',
        variant: 'soft',
        size: 'sm',
        closable: true,
        closeAriaLabel: '移除警告标签',
      },
      slots: {
        icon: '<span data-test="icon">!</span>',
        default: '待确认',
      },
    })
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-tag--warning', 'o-tag--soft', 'o-tag--sm']),
    )
    expect(wrapper.get('.o-tag__icon').attributes('aria-hidden')).toBe('true')
    const close = wrapper.get('button.o-tag__close')
    expect(close.attributes()).toMatchObject({
      type: 'button',
      'aria-label': '移除警告标签',
    })
    await close.trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.text()).toContain('待确认')
  })
})
```

Add source assertions that the template imports from `vue-icons-plus/lu`, contains no inline `<svg>`, the Less surface has `border: 0`, the visible close target is at least `24px`, and `@media (pointer: coarse)` provides a `44px` pseudo-element hit area without changing tag height.

- [ ] **Step 2: Run the Tag test and confirm the family is absent**

```bash
pnpm exec vitest run packages/ui/src/components/tag/__tests__/tag.test.ts
```

Expected: failure because the Tag directory and exports do not exist.

- [ ] **Step 3: Implement `tag.ts` exactly**

```ts
import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oTagTones = ['neutral', 'brand', 'success', 'warning', 'danger'] as const
export const oTagVariants = ['soft', 'solid'] as const
export const oTagSizes = ['sm', 'md'] as const

export type OTagTone = (typeof oTagTones)[number]
export type OTagVariant = (typeof oTagVariants)[number]
export type OTagSize = (typeof oTagSizes)[number]

const includes = <Value extends string>(values: readonly Value[], value: unknown): value is Value =>
  typeof value === 'string' && values.some((candidate) => candidate === value)

export const oTagProps = {
  tone: {
    type: String as PropType<OTagTone>,
    default: 'neutral',
    validator: (value: unknown) => includes(oTagTones, value),
  },
  variant: {
    type: String as PropType<OTagVariant>,
    default: 'soft',
    validator: (value: unknown) => includes(oTagVariants, value),
  },
  size: {
    type: String as PropType<OTagSize>,
    default: 'md',
    validator: (value: unknown) => includes(oTagSizes, value),
  },
  closable: { type: Boolean, default: false },
  closeAriaLabel: { type: String, default: 'Close tag' },
} as const

export type OTagProps = ExtractPublicPropTypes<typeof oTagProps>

export interface OTagEmits {
  close: [event: MouseEvent]
}

export interface OTagSlots {
  icon?: () => VNodeChild
  default?: () => VNodeChild
  closeIcon?: () => VNodeChild
}
```

- [ ] **Step 4: Implement the Tag SFC**

Use one root `<span class="o-tag">`, three modifier classes, a decorative icon wrapper, a truncating content wrapper, and an optional native button:

```vue
<script setup lang="ts">
import { LuX } from 'vue-icons-plus/lu'

import { oTagProps, type OTagEmits, type OTagSlots } from './tag'

defineOptions({ name: 'OTag' })
const props = defineProps(oTagProps)
const emit = defineEmits<OTagEmits>()
defineSlots<OTagSlots>()
</script>

<template>
  <span
    class="o-tag"
    :class="[`o-tag--${props.tone}`, `o-tag--${props.variant}`, `o-tag--${props.size}`]"
  >
    <span v-if="$slots.icon" class="o-tag__icon" aria-hidden="true"><slot name="icon" /></span>
    <span class="o-tag__content"><slot /></span>
    <button
      v-if="props.closable"
      class="o-tag__close"
      type="button"
      :aria-label="props.closeAriaLabel"
      @click="emit('close', $event)"
    >
      <slot name="closeIcon"><LuX aria-hidden="true" /></slot>
    </button>
  </span>
</template>
```

- [ ] **Step 5: Implement borderless Tag styles**

Use heights `24px` and `30px`, horizontal padding `8px` and `10px`, radius `var(--omg-radius-full)`, inherited font, `max-width:100%`, and ellipsis on `.o-tag__content`. Add `@green-800: #085d3a`, `@amber-800: #93370d`, and `@amber-700: #b54708` to `primitives.less`, then add independent soft-background, soft-foreground, and solid-foreground roles in `semantic.less`:

```less
// light
--omg-color-neutral-soft-text: @slate-700;
--omg-color-brand-soft-text: @blue-600;
--omg-color-success-soft: fade(@green-700, 12%);
--omg-color-success-soft-text: @green-800;
--omg-color-on-success: @white;
--omg-color-warning-soft: fade(@amber-600, 14%);
--omg-color-warning-soft-text: @amber-800;
--omg-color-on-warning: #2a1600;
--omg-color-danger-soft-text: @red-700;

// dark
--omg-color-neutral-soft-text: @slate-50;
--omg-color-brand-soft-text: @blue-200;
--omg-color-success-soft: fade(@green-300, 16%);
--omg-color-success-soft-text: @green-300;
--omg-color-on-success: #071a10;
--omg-color-warning-soft: fade(@amber-300, 18%);
--omg-color-warning-soft-text: @amber-300;
--omg-color-on-warning: #241500;
--omg-color-danger-soft-text: @red-200;
```

Soft variants use the matching `*-soft` background with the independent `*-soft-text` foreground. Solid variants use the semantic tone with its `on-*` value. The close button is `24px`, transparent, borderless, and uses the local focus ring. Under `@media (pointer: coarse)`, an absolutely positioned `::before` expands its hit area to `44px` while the visible control and tag geometry remain unchanged.

- [ ] **Step 6: Create explicit Tag exports and run checks**

`tag/index.ts` exports the component, runtime vocabularies/props, and all public types without `export *`.

Run:

```bash
pnpm exec vitest run packages/ui/src/components/tag/__tests__/tag.test.ts
pnpm --filter @puzzle-fuzzy/ui typecheck
pnpm exec eslint packages/ui/src/components/tag
pnpm exec stylelint "packages/ui/src/components/tag/**/*.{vue,less}"
```

Expected: all checks pass.

- [ ] **Step 7: Commit Tag**

```bash
git add packages/ui/src/components/tag packages/ui/src/styles/tokens/primitives.less packages/ui/src/styles/tokens/semantic.less
git commit -m "feat(ui): add tag component"
```

---

### Task 4: Add OBadge

**Files:**

- Create: `packages/ui/src/components/badge/src/badge.ts`
- Create: `packages/ui/src/components/badge/src/OBadge.vue`
- Create: `packages/ui/src/components/badge/style/index.less`
- Create: `packages/ui/src/components/badge/__tests__/badge.test.ts`
- Create: `packages/ui/src/components/badge/index.ts`

**Interfaces:**

- Consumes: OMG semantic tones and logical direction.
- Produces: `OBadge`, normalizers, tone vocabulary, props, slots, and public types.

- [ ] **Step 1: Write failing Badge normalization and rendering tests**

Create these cases:

```ts
it.each([
  [undefined, 99],
  [120.9, 120],
  [0, 99],
  [-2, 99],
  [Number.NaN, 99],
] as const)('normalizes max %s to %s', (value, expected) => {
  expect(normalizeOBadgeMax(value)).toBe(expected)
})

it.each([
  [{ value: 120, max: 99 }, '99+'],
  [{ value: 120, max: 0 }, '99+'],
  [{ value: 120, max: Number.NaN }, '99+'],
  [{ value: 4, max: 99 }, '4'],
  [{ value: 'NEW', max: 99 }, 'NEW'],
] as const)('formats badge content', (input, expected) => {
  expect(formatOBadgeValue(input.value, input.max)).toBe(expected)
})

it('supports content composition, logical marker classes, and readable count text', () => {
  const wrapper = mount(OBadge, {
    props: { value: 120, max: 99, tone: 'danger', ariaLabel: '120 条未读消息' },
    slots: { default: '<button type="button">收件箱</button>' },
  })
  expect(wrapper.classes()).toContain('o-badge--with-content')
  expect(wrapper.get('.o-badge__marker').text()).toBe('99+')
  expect(wrapper.get('.o-badge__marker').attributes()).toMatchObject({
    role: 'img',
    'aria-label': '120 条未读消息',
  })
})

it('hides zero by default and treats an unnamed dot as decorative', async () => {
  const zero = mount(OBadge, { props: { value: 0 } })
  expect(zero.find('.o-badge__marker').exists()).toBe(false)
  await zero.setProps({ showZero: true })
  expect(zero.get('.o-badge__marker').text()).toBe('0')

  const dot = mount(OBadge, { props: { dot: true } })
  expect(dot.get('.o-badge__marker').attributes('aria-hidden')).toBe('true')
})
```

Add RTL source/style assertions for logical inset properties and no decorative border.

- [ ] **Step 2: Run the Badge test and confirm failure**

```bash
pnpm exec vitest run packages/ui/src/components/badge/__tests__/badge.test.ts
```

Expected: failure because Badge exports do not exist.

- [ ] **Step 3: Implement the Badge contract and helpers**

```ts
import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oBadgeTones = ['neutral', 'brand', 'success', 'warning', 'danger'] as const
export type OBadgeTone = (typeof oBadgeTones)[number]

export const normalizeOBadgeMax = (value?: number): number => {
  if (value === undefined || !Number.isFinite(value) || value <= 0) return 99
  return Math.floor(value)
}

export const formatOBadgeValue = (value: string | number, max: number): string => {
  const normalizedMax = normalizeOBadgeMax(max)
  return typeof value === 'number' && value > normalizedMax
    ? `${String(normalizedMax)}+`
    : String(value)
}

export const oBadgeProps = {
  value: [String, Number] as PropType<string | number>,
  max: { type: Number, default: 99 },
  dot: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  showZero: { type: Boolean, default: false },
  tone: {
    type: String as PropType<OBadgeTone>,
    default: 'danger',
    validator: (value: unknown) =>
      typeof value === 'string' && oBadgeTones.some((tone) => tone === value),
  },
  ariaLabel: String,
} as const

export type OBadgeProps = ExtractPublicPropTypes<typeof oBadgeProps>

export interface OBadgeSlots {
  default?: () => VNodeChild
}
```

- [ ] **Step 4: Implement Badge rendering**

Use `useSlots()` to determine content presence. Compute visibility exactly as follows, then compute normalized max and formatted marker text:

```ts
const visible = computed(() => {
  if (props.hidden) return false
  if (props.dot) return true
  if (props.value === undefined) return false
  return props.showZero || props.value !== 0
})
```

Render:

```vue
<span class="o-badge" :class="[{ 'o-badge--with-content': hasContent }, `o-badge--${props.tone}`]">
  <slot />
  <sup
    v-if="visible"
    class="o-badge__marker"
    :class="{ 'o-badge__marker--dot': props.dot }"
    :role="props.ariaLabel ? 'img' : undefined"
    :aria-label="props.ariaLabel"
    :aria-hidden="props.dot && !props.ariaLabel ? 'true' : undefined"
  >
    {{ props.dot ? '' : markerText }}
  </sup>
</span>
```

- [ ] **Step 5: Implement logical borderless Badge styles**

The wrapper is `position:relative; display:inline-flex; vertical-align:middle`. With content, marker uses `position:absolute; inset-block-start:0; inset-inline-end:0; transform:translate(50%,-50%)`; add an RTL selector that reverses only the physical X translation. Standalone markers remain in flow. A dot is `8px`; text/count markers use minimum `18px`, compact padding, tabular numerals, semantic solid color, full radius, and a small structural shadow. Do not use border or outline as decoration.

- [ ] **Step 6: Export and verify Badge**

Create explicit `badge/index.ts` exports, then run:

```bash
pnpm exec vitest run packages/ui/src/components/badge/__tests__/badge.test.ts
pnpm --filter @puzzle-fuzzy/ui typecheck
pnpm exec eslint packages/ui/src/components/badge
pnpm exec stylelint "packages/ui/src/components/badge/**/*.{vue,less}"
```

Expected: all checks pass.

- [ ] **Step 7: Commit Badge**

```bash
git add packages/ui/src/components/badge
git commit -m "feat(ui): add badge component"
```

---

### Task 5: Add OProgress

**Files:**

- Create: `packages/ui/src/components/progress/src/progress.ts`
- Create: `packages/ui/src/components/progress/src/OProgress.vue`
- Create: `packages/ui/src/components/progress/style/index.less`
- Create: `packages/ui/src/components/progress/__tests__/progress.test.ts`
- Create: `packages/ui/src/components/progress/index.ts`

**Interfaces:**

- Consumes: OMG status colors, RTL direction, and reduced-motion media query.
- Produces: `OProgress`, value normalizer, status/size vocabularies, slot props, and public types.

- [ ] **Step 1: Write failing progress contract and semantics tests**

```ts
it.each([
  [undefined, undefined],
  [Number.NaN, undefined],
  [-20, 0],
  [42.8, 42.8],
  [140, 100],
] as const)('normalizes progress value %s to %s', (value, expected) => {
  expect(normalizeOProgressValue(value)).toBe(expected)
})

it('renders determinate progress without inferring success', () => {
  const wrapper = mount(OProgress, {
    props: { value: 100, ariaLabel: '文件处理进度', showLabel: true },
  })
  expect(wrapper.attributes()).toMatchObject({
    role: 'progressbar',
    'aria-label': '文件处理进度',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    'aria-valuenow': '100',
  })
  expect(wrapper.classes()).toContain('o-progress--normal')
  expect(wrapper.get('.o-progress__label').text()).toBe('100%')
  expect(wrapper.get('.o-progress__fill').attributes('style')).toContain('--o-progress-value: 1')
})

it('renders indeterminate semantics and custom label slot props', () => {
  const wrapper = mount(OProgress, {
    props: { status: 'warning', showLabel: true, ariaLabel: '同步状态' },
    slots: {
      label: ({ indeterminate, status }: OProgressLabelSlotProps) =>
        `${String(indeterminate)}:${status}`,
    },
  })
  expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
  expect(wrapper.classes()).toContain('o-progress--indeterminate')
  expect(wrapper.get('.o-progress__label').text()).toBe('true:warning')
})

it('uses the visible default label as its accessible name', () => {
  const wrapper = mount(OProgress, { props: { value: 68, showLabel: true } })
  const label = wrapper.get('.o-progress__label')
  expect(wrapper.attributes('aria-labelledby')).toBe(label.attributes('id'))
  expect(label.text()).toBe('68%')
})

it('warns when a custom label slot has no explicit accessible name', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  const wrapper = mount(OProgress, {
    props: { showLabel: true },
    slots: { label: () => '自定义阶段' },
  })
  expect(warn).toHaveBeenCalledOnce()
  expect(wrapper.attributes('aria-label')).toBe('Progress')
})
```

Add source assertions for no inline SVG, no width transition, transform-origin RTL rules, indeterminate keyframes, and reduced-motion static fallback.

- [ ] **Step 2: Run the Progress test and confirm failure**

```bash
pnpm exec vitest run packages/ui/src/components/progress/__tests__/progress.test.ts
```

Expected: failure because Progress does not exist.

- [ ] **Step 3: Implement Progress contract and normalization**

```ts
import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oProgressStatuses = ['normal', 'success', 'warning', 'error'] as const
export const oProgressSizes = ['sm', 'md'] as const

export type OProgressStatus = (typeof oProgressStatuses)[number]
export type OProgressSize = (typeof oProgressSizes)[number]

export const normalizeOProgressValue = (value?: number): number | undefined =>
  value === undefined || !Number.isFinite(value) ? undefined : Math.min(100, Math.max(0, value))

export const oProgressProps = {
  value: Number,
  status: {
    type: String as PropType<OProgressStatus>,
    default: 'normal',
    validator: (value: unknown) =>
      typeof value === 'string' && oProgressStatuses.some((status) => status === value),
  },
  size: {
    type: String as PropType<OProgressSize>,
    default: 'md',
    validator: (value: unknown) =>
      typeof value === 'string' && oProgressSizes.some((size) => size === value),
  },
  showLabel: { type: Boolean, default: false },
  label: String,
  ariaLabel: String,
} as const

export type OProgressProps = ExtractPublicPropTypes<typeof oProgressProps>

export interface OProgressLabelSlotProps {
  readonly value: number | undefined
  readonly indeterminate: boolean
  readonly status: OProgressStatus
}

export interface OProgressSlots {
  label?: (props: OProgressLabelSlotProps) => VNodeChild
}
```

- [ ] **Step 4: Implement Progress rendering and semantics**

Compute normalized value, indeterminate state, rounded default label, slot props, accessible-name bindings, and fill style. Create `labelId` with Vue's `useId()`. Naming precedence is: explicit `ariaLabel`; string `label`; the rendered default percentage through `aria-labelledby`; otherwise the fallback `aria-label="Progress"`. If the `label` slot exists without `ariaLabel`, emit one concise development warning because arbitrary VNodes cannot be converted safely into an accessible name:

```vue
<div
  class="o-progress"
  :class="[
    `o-progress--${props.status}`,
    `o-progress--${props.size}`,
    { 'o-progress--indeterminate': indeterminate },
  ]"
  role="progressbar"
  :aria-label="resolvedAriaLabel"
  :aria-labelledby="labelledBy"
  aria-valuemin="0"
  aria-valuemax="100"
  :aria-valuenow="indeterminate ? undefined : normalizedValue"
>
  <div class="o-progress__track" aria-hidden="true">
    <span class="o-progress__fill" :style="fillStyle" />
  </div>
  <span v-if="props.showLabel" :id="usesRenderedLabel ? labelId : undefined" class="o-progress__label">
    <slot name="label" v-bind="labelSlotProps">{{ visibleLabel }}</slot>
  </span>
</div>
```

`fillStyle` is a computed `CSSProperties & Partial<Record<'--o-progress-value', number>>` containing the normalized fraction only when determinate. Do not set success automatically at `100`. `visibleLabel` is `props.label`, otherwise the rounded percentage when determinate, otherwise an empty string; indeterminate consumers that show a label supply `label` or the label slot. `usesRenderedLabel` is true only when the default percentage is visibly rendered and neither `ariaLabel`, `label`, nor a custom label slot overrides it.

- [ ] **Step 5: Implement transform-based Progress styles**

Use a grid root with a track and optional compact label. Track heights are `4px` and `8px`; track background is `--omg-color-neutral-soft`; fill uses `transform:scaleX(var(--o-progress-value, 0))`, `transform-origin:left center`, and a normal-duration transform transition. `:dir(rtl)` changes origin to right. Map status colors to brand/success/warning/danger. Indeterminate uses a 35% fill and logical travel keyframes; the RTL selector reverses the animation direction. Reduced motion removes transitions/keyframes and leaves the partial fill static.

- [ ] **Step 6: Export and verify Progress**

Create explicit `progress/index.ts` exports, then run:

```bash
pnpm exec vitest run packages/ui/src/components/progress/__tests__/progress.test.ts
pnpm --filter @puzzle-fuzzy/ui typecheck
pnpm exec eslint packages/ui/src/components/progress
pnpm exec stylelint "packages/ui/src/components/progress/**/*.{vue,less}"
```

Expected: all checks pass.

- [ ] **Step 7: Commit Progress**

```bash
git add packages/ui/src/components/progress
git commit -m "feat(ui): add progress component"
```

---

### Task 6: Integrate new families into the published package

**Files:**

- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.less`
- Modify: `packages/ui/vite.config.ts`
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/tests/package/package-contract.test.ts`
- Modify: `packages/ui/tests/ssr/ssr.test.ts`
- Modify: `scripts/test-package.mjs`

**Interfaces:**

- Consumes: the reviewed Dialog, Tag, Badge, and Progress subpath indexes.
- Produces: root/subpath imports, bundled CSS, declarations, SSR proof, attw entries, and a real tarball consumer.

- [ ] **Step 1: Add failing package and SSR assertions**

Extend package-contract expected exports and files with:

```ts
'./badge',
'./progress',
'./tag',
```

After building, read `dist/styles.css` and assert it contains `.o-tag`, `.o-badge`, and `.o-progress`; this directly protects the published style aggregation rather than only the source imports.

and:

```ts
'dist/components/badge/index.js',
'dist/components/badge/index.d.ts',
'dist/components/progress/index.js',
'dist/components/progress/index.d.ts',
'dist/components/tag/index.js',
'dist/components/tag/index.d.ts',
```

Add SSR cases that render root-imported components:

```ts
test('renders Tag, Badge, and Progress without DOM globals', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h('div', [
          h(OTag, { tone: 'success', closable: true }, () => 'Ready'),
          h(OBadge, { value: 8, ariaLabel: '8 unread' }, () => h(OButton, null, () => 'Inbox')),
          h(OProgress, { value: 42, ariaLabel: 'Build progress', showLabel: true }),
        ]),
    }),
  )

  expect(html).toContain('o-tag--success')
  expect(html).toContain('aria-label="8 unread"')
  expect(html).toContain('role="progressbar"')
  expect(html).toContain('aria-valuenow="42"')
})
```

Update the existing Dialog SSR case: a closed never-opened Dialog has no slot content; an initially open Dialog includes content but not the native `open` attribute. Add width style and stable ID assertions.

- [ ] **Step 2: Run package contract and SSR tests red**

```bash
pnpm exec vitest run packages/ui/tests/package/package-contract.test.ts packages/ui/tests/ssr/ssr.test.ts
```

Expected: missing package exports/dist files and missing root component imports.

- [ ] **Step 3: Add root exports in component order**

Add explicit blocks to `packages/ui/src/index.ts`:

```ts
export {
  OBadge,
  formatOBadgeValue,
  normalizeOBadgeMax,
  oBadgeProps,
  oBadgeTones,
} from './components/badge'
export type { OBadgeProps, OBadgeSlots, OBadgeTone } from './components/badge'

export {
  OProgress,
  normalizeOProgressValue,
  oProgressProps,
  oProgressSizes,
  oProgressStatuses,
} from './components/progress'
export type {
  OProgressLabelSlotProps,
  OProgressProps,
  OProgressSize,
  OProgressSlots,
  OProgressStatus,
} from './components/progress'

export { OTag, oTagProps, oTagSizes, oTagTones, oTagVariants } from './components/tag'
export type {
  OTagEmits,
  OTagProps,
  OTagSize,
  OTagSlots,
  OTagTone,
  OTagVariant,
} from './components/tag'
```

Expand the existing Dialog type block with `ODialogCloseReason`, `ODialogCloseRequest`, `ODialogSlotProps`, and `ODialogWidth`, and add `normalizeODialogWidth`/`oDialogCloseReasons` to runtime exports. Do not root-export `oDialogCommonProps`.

- [ ] **Step 4: Aggregate styles and build entries**

Import Badge before Button, Progress before Radio, and Tag before Tabs in `styles/index.less`. Add matching Vite library entries:

```ts
'components/badge/index': fromPackageRoot('src/components/badge/index.ts'),
'components/progress/index': fromPackageRoot('src/components/progress/index.ts'),
'components/tag/index': fromPackageRoot('src/components/tag/index.ts'),
```

- [ ] **Step 5: Add exact package subpaths**

Add ESM/types exports to `packages/ui/package.json`:

```json
"./badge": {
  "types": "./dist/components/badge/index.d.ts",
  "import": "./dist/components/badge/index.js"
},
"./progress": {
  "types": "./dist/components/progress/index.d.ts",
  "import": "./dist/components/progress/index.js"
},
"./tag": {
  "types": "./dist/components/tag/index.d.ts",
  "import": "./dist/components/tag/index.js"
}
```

- [ ] **Step 6: Extend real-consumer contracts**

In `scripts/test-package.mjs`:

- add the three attw entry points;
- import each component and representative type from root and subpath;
- render root/subpath Tag, Badge, and Progress in the generated Vue consumer;
- exercise `normalizeODialogWidth`, `normalizeOBadgeMax`, and `normalizeOProgressValue` at typecheck time without invoking browser services;
- import `oDialogCommonProps` from `@puzzle-fuzzy/ui/dialog` only, and import `ODialogCloseReason`, `ODialogCloseRequest`, and `ODialogWidth` from both root and Dialog subpath so declaration and export drift fails the tarball consumer.

The generated consumer must include:

```vue
<ORootTag tone="success">Root tag</ORootTag>
<OSubpathBadge :value="8"><button type="button">Inbox</button></OSubpathBadge>
<OSubpathProgress :value="42" aria-label="Subpath progress" />
```

- [ ] **Step 7: Build and run publication checks**

```bash
pnpm build
pnpm test:ssr
pnpm test:package
```

Expected: build emits all subpaths; SSR, publint, attw, and real tarball consumer pass. Naming remains at 23 families until pages and Playwright routes are complete in Task 9.

- [ ] **Step 8: Commit package integration**

```bash
git add packages/ui/src/index.ts packages/ui/src/styles/index.less packages/ui/vite.config.ts packages/ui/package.json packages/ui/tests/package/package-contract.test.ts packages/ui/tests/ssr/ssr.test.ts scripts/test-package.mjs
git commit -m "feat(ui): publish common display primitives"
```

---

### Task 7: Expand the Dialog VitePress capability page

**Files:**

- Replace: `apps/docs/examples/dialog/Basic.vue`
- Create: `apps/docs/examples/dialog/Sizes.vue`
- Create: `apps/docs/examples/dialog/Custom.vue`
- Create: `apps/docs/examples/dialog/Content.vue`
- Create: `apps/docs/examples/dialog/Behavior.vue`
- Modify: `apps/docs/docs/components/dialog.md`

**Interfaces:**

- Consumes: reviewed `ODialog`, `OButton`, `OInput`, lifecycle reason types.
- Produces: five independently labelled demos that expose the complete Dialog contract without business workflow.

- [ ] **Step 1: Rebuild the basic controlled/lifecycle example**

`Basic.vue` uses `v-model:open`, title `工作区设置`, description, localized close label, and a footer slot callback. It records the most recent `request-close`, `open`, `opened`, `close`, and `closed` event as plain UI diagnostics. The demo region label is `Dialog controlled lifecycle` and trigger text is `打开基础弹窗`.

Use this close-reason handler shape:

```ts
const lastEvent = ref('尚未打开')
const handleRequest = (request: ODialogCloseRequest): void => {
  lastEvent.value = `请求关闭：${request.reason}`
}
const handleClose = (reason: ODialogCloseReason): void => {
  lastEvent.value = `开始关闭：${reason}`
}
const handleClosed = (reason: ODialogCloseReason): void => {
  lastEvent.value = `完成关闭：${reason}`
}
```

The cancel button calls slot `close()`; the primary button updates only local UI state and then calls `close()`.

- [ ] **Step 2: Add width and compact viewport examples**

`Sizes.vue` provides independent Dialogs for numeric `width=360`, CSS width `min(92vw, 44rem)`, and fullscreen. Triggers are `打开紧凑弹窗`, `打开宽内容弹窗`, and `打开全屏弹窗`. Each Dialog uses a unique accessible title and explicit internal close action.

- [ ] **Step 3: Add custom structure and focus examples**

`Custom.vue` demonstrates:

- title and description slots with their component-owned IDs;
- a full header slot that applies `:id="titleId"` to its heading;
- a `closeIcon` slot using `LuCircleX` from `vue-icons-plus/lu`;
- default/footer slot `close()`;
- `initial-focus="#dialog-display-name"` targeting an `OInput`.

Use region label `Dialog custom slots and initial focus`.

- [ ] **Step 4: Add long content and mount policy examples**

`Content.vue` demonstrates a 36-row scroll body, a local input whose value persists when `destroyOnClose=false`, and a separate counter/input that resets after `destroyOnClose=true` closes. The example copy explicitly calls these UI mount policies, not save behavior. Use region label `Dialog scrolling and content mounting`.

- [ ] **Step 5: Add close policy, rejected request, dark, and RTL examples**

`Behavior.vue` contains:

- a locked Dialog with mask/Esc/close button disabled and an explicit slot close action;
- a controlled rejection example whose `@update:open` handler deliberately keeps `open=true` until an `允许关闭` toggle is selected;
- one `data-omg-theme="dark" dir="rtl"` Dialog with localized title and close label.

Use distinct region labels and no request, route, or form-submission logic.

- [ ] **Step 6: Rewrite `dialog.md` as the complete public contract**

Import all five examples. Document:

- root/subpath imports;
- common and Dialog-only props;
- width normalization and fullscreen precedence;
- every event and exact payload/order;
- every slot and `ODialogSlotProps`;
- native focus/return and `initialFocus` fallback;
- lazy first mount, preserved default state, and destroy-on-close timing;
- mask pointer gesture behavior;
- accepted/rejected close semantics;
- SSR output;
- entry/exit/reduced motion;
- compact footer and body-only scrolling;
- Confirm/Form/Drawer selection guidance;
- inline Select/Dropdown guidance inside native top layer;
- non-goals.

- [ ] **Step 7: Run docs lint and typecheck**

```bash
pnpm exec eslint apps/docs/examples/dialog apps/docs/docs/.vitepress
pnpm exec stylelint "apps/docs/examples/dialog/**/*.vue"
pnpm --filter @puzzle-fuzzy/docs typecheck
pnpm exec prettier apps/docs/examples/dialog apps/docs/docs/components/dialog.md --check
```

Expected: all checks pass.

- [ ] **Step 8: Commit Dialog documentation**

```bash
git add apps/docs/examples/dialog apps/docs/docs/components/dialog.md
git commit -m "docs(dialog): demonstrate complete native lifecycle"
```

---

### Task 8: Add VitePress pages for Tag, Badge, and Progress

**Files:**

- Create: `apps/docs/examples/tag/Basic.vue`
- Create: `apps/docs/examples/tag/Closable.vue`
- Create: `apps/docs/docs/components/tag.md`
- Create: `apps/docs/examples/badge/Basic.vue`
- Create: `apps/docs/examples/badge/Composition.vue`
- Create: `apps/docs/docs/components/badge.md`
- Create: `apps/docs/examples/progress/Basic.vue`
- Create: `apps/docs/examples/progress/States.vue`
- Create: `apps/docs/docs/components/progress.md`
- Modify: `apps/docs/docs/.vitepress/config.mts`
- Modify: `apps/docs/docs/components/index.md`
- Modify: `apps/docs/docs/index.md`
- Modify: `README.md`
- Modify: `packages/ui/README.md`

**Interfaces:**

- Consumes: the three published component APIs.
- Produces: complete navigation, examples, import guidance, corrected counts, and corrected Image architecture copy.

- [ ] **Step 1: Create Tag examples and page**

`Basic.vue` shows all five tones in soft and solid rows, both sizes, one `LuSparkles` icon slot, and a constrained long label. `Closable.vue` stores an array of display-only tags, removes one only in the consumer `@close` handler, and offers `恢复标签`.

`tag.md` documents every prop/event/slot, text truncation, status text requirement, close-button naming, root/subpath imports, SSR, no self-removal, no business filter mapping, and no decorative border.

- [ ] **Step 2: Create Badge examples and page**

`Basic.vue` shows values `1`, `99`, `120`, `NEW`, zero hidden/shown, dot, hidden, all tones, and standalone rendering. Its zero example has a UI-only `显示零值` switch/button that toggles `showZero`, giving the browser contract a stable interaction. `Composition.vue` places badges on `OAvatar`, an icon-only `OButton`, and text content; it also includes an RTL wrapper and named/unnamed dots.

`badge.md` documents normalization, max formatting, `showZero`, dot semantics, `ariaLabel`/`role=img`, ordinary readable count text, logical positioning, root/subpath imports, SSR, and absence of unsolicited live regions.

- [ ] **Step 3: Create Progress examples and page**

`Basic.vue` shows `0`, `24`, `68`, `100`, both sizes, visible labels, and one custom label slot. It also includes source values `-20` and `140` beside their rendered `0` and `100` outputs so clamping is observable in the page. `States.vue` shows normal/success/warning/error plus indeterminate, dark theme, and RTL.

`progress.md` documents clamping, non-finite indeterminate behavior, explicit status, progressbar ARIA and naming precedence, the custom-label-slot `ariaLabel` requirement, label slot props, transform/RTL motion, reduced-motion static fallback, root/subpath imports, SSR, and no automatic upload/request mapping.

- [ ] **Step 4: Add source aliases and sidebar entries**

In VitePress source aliases add `/badge`, `/progress`, and `/tag`. Under `基础与展示`, order entries as Button, Tag, Badge, Progress, Divider, Image, Avatar families. Keep existing routes unchanged.

- [ ] **Step 5: Correct counts and architecture drift**

Set homepage and root README to `26 个组件族`; set overview to `26 个组件族、27 个公开 Vue 组件`. Add the three new overview links.

Replace the stale overview Image line with:

```markdown
- [Image 图片](/components/image)：原生图片与组件自持的 Teleport 全屏预览层。
```

Update root README component/subpath lists to include Widget, Message, Drawer, Tag, Badge, and Progress. Keep package README's existing independent Image explanation.

- [ ] **Step 6: Run docs contract checks**

```bash
pnpm --filter @puzzle-fuzzy/docs typecheck
pnpm exec eslint apps/docs/examples/tag apps/docs/examples/badge apps/docs/examples/progress
pnpm exec stylelint "apps/docs/examples/{tag,badge,progress}/**/*.vue"
pnpm exec prettier README.md packages/ui/README.md apps/docs/docs apps/docs/examples/tag apps/docs/examples/badge apps/docs/examples/progress --check
```

Expected: every scoped docs check passes. Do not update or run the global naming contract until Task 9 adds the required Playwright routes.

- [ ] **Step 7: Commit common-component documentation**

```bash
git add README.md packages/ui/README.md apps/docs/docs/.vitepress/config.mts apps/docs/docs/components/index.md apps/docs/docs/index.md apps/docs/docs/components/tag.md apps/docs/docs/components/badge.md apps/docs/docs/components/progress.md apps/docs/examples/tag apps/docs/examples/badge apps/docs/examples/progress
git commit -m "docs: document common display primitives"
```

---

### Task 9: Add browser coverage and update durable design records

**Files:**

- Modify: `apps/docs/tests/e2e/components.spec.ts`
- Modify: `DESIGN.md`
- Modify: `.impeccable/design.json`
- Modify: `PRODUCT.md`
- Modify: `scripts/check-naming.mjs`

**Interfaces:**

- Consumes: stable demo labels and component classes from Tasks 1-8.
- Produces: route contract, motion/focus/RTL/theme/compact assertions, axe coverage, and durable design-system records.

- [ ] **Step 1: Replace the single Dialog browser test with focused lifecycle tests**

Add separate scenarios that assert:

```ts
test('runs controlled Dialog requests and accepted lifecycle in order', async ({ page }) => {
  await page.goto('/components/dialog')
  const trigger = page.getByRole('button', { name: '打开基础弹窗', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: '工作区设置' })
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.o-dialog__close')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(page.getByText('完成关闭：escape', { exact: true })).toBeVisible()
})
```

Add one motion test that samples surface transform/opacity on entry and exit, verifies exit completes before hidden, and verifies zero animations under reduced motion. Add one compact/fullscreen test at `320x640`, long-body scrolling test, initial-focus test, rejected-close test, dark/RTL test, and axe checks for every open surface.

- [ ] **Step 2: Preserve specialized modal E2E behavior**

Keep Confirm Dialog safe cancel focus, Form Dialog native validation/state preservation, and Drawer start/end/RTL/scroll/close-motion tests. Update only locators/event expectations that changed with the new lifecycle.

- [ ] **Step 3: Add Tag interaction and visual assertions**

Visit `/components/tag`; verify every tone/variant/size class, `border-left-width:0px`, icon presence, long-content truncation, keyboard activation of a localized close button, consumer removal/restoration, and axe. Read computed foreground/background colors for every soft tone in both themes and assert a contrast ratio of at least `4.5:1`; emulate coarse pointer and verify the close button's hit box is at least `44px` without changing the tag height.

- [ ] **Step 4: Add Badge semantics and composition assertions**

Visit `/components/badge`; verify `99+`, zero visibility toggle, decorative unnamed dot, named dot `role=img`, logical position over Avatar/Button in LTR and RTL, no border, and axe.

- [ ] **Step 5: Add Progress ARIA, transform, RTL, and motion assertions**

Visit `/components/progress`; verify value clamping output, `aria-valuenow` presence/absence, accessible naming for a string label/default percentage/custom slot, explicit statuses at `100`, computed transform scale for `68`, indeterminate animation in normal motion, no animation in reduced motion, RTL transform origin, dark theme, and axe.

- [ ] **Step 6: Update DESIGN and product records**

Add Tag, Badge, and Progress component records to `DESIGN.md` frontmatter and `.impeccable/design.json`. Record:

- Dialog's 220ms/160ms scale/fade lifecycle and width/fullscreen/mount contracts;
- Tag's soft/solid semantic surfaces and close affordance;
- Badge's logical top-end marker and dot accessibility;
- Progress's transform-based determinate fill and reduced-motion indeterminate fallback.

Update `PRODUCT.md` to state that Progress displays consumer-supplied progress and does not own uploads/tasks; Tag removal and Badge values remain consumer state. Preserve the border budget and Image independence.

Insert `badge`, `progress`, and `tag` into `expectedComponents` in `scripts/check-naming.mjs` only after the pages, aliases, overview links, and Playwright route visits exist. Keep every existing icon and documentation check; the success message must report 26 families.

- [ ] **Step 7: Run focused browser and design-record checks**

```bash
pnpm docs:build
pnpm --filter @puzzle-fuzzy/docs exec playwright test tests/e2e/components.spec.ts --grep "Dialog|Tag|Badge|Progress"
pnpm check:naming
pnpm exec prettier DESIGN.md PRODUCT.md .impeccable/design.json apps/docs/tests/e2e/components.spec.ts --check
python -X utf8 -c "import json; json.load(open('.impeccable/design.json', encoding='utf-8')); print('design json ok')"
```

Expected: focused Playwright scenarios and axe pass; naming recognizes 26 families; design JSON parses; formatting is clean.

- [ ] **Step 8: Commit E2E and design records**

```bash
git add apps/docs/tests/e2e/components.spec.ts DESIGN.md PRODUCT.md .impeccable/design.json scripts/check-naming.mjs
git commit -m "test: cover dialog and common display primitives"
```

---

### Task 10: Final verification, remote merge, and publication

**Files:**

- Verify all changed files.
- Semantically merge every conflicted remote file if `origin/main` advances; do not discard either side wholesale.

**Interfaces:**

- Consumes: all reviewed implementation and documentation commits.
- Produces: a clean verified `main` whose remote SHA equals local HEAD.

- [ ] **Step 1: Run the full repository gate**

```bash
pnpm verify
```

Expected:

- Prettier, ESLint, Stylelint, naming, and typecheck pass;
- all unit tests and coverage thresholds pass;
- library and VitePress production builds pass;
- SSR, package contract, publint, attw, and real tarball consumer pass;
- the complete Playwright suite and axe checks pass.

- [ ] **Step 2: Audit the final worktree and protected scope**

```bash
git status --short
git diff --check
git diff f96b269...HEAD -- packages/ui/src/components/image packages/ui/src/components/tabs
rg -n -- "--vp-c-brand-" apps/docs
```

Expected: clean worktree after commits, no whitespace errors, no Image/Tabs implementation changes, and no VitePress brand-variable override.

- [ ] **Step 3: Fetch and inspect remote divergence**

```bash
git fetch --prune origin
git rev-list --left-right --count origin/main...main
```

If output begins `0`, local main is a fast-forward descendant. If the first number is greater than zero, merge:

```bash
git merge --no-edit origin/main
```

If Git reports conflicts, inspect and semantically resolve every conflicted file, preserving both remote work and this release's public contracts. Stage the exact resolved files and complete the merge commit with `git commit --no-edit`. Never use reset, checkout discard, or rebase on shared `main`. Then run `git status --short`, `git diff --check`, and `git rev-list --left-right --count origin/main...main`; the worktree must be clean and the remote-only count must be zero.

- [ ] **Step 4: Re-run verification after any merge**

When a merge occurs, run `pnpm verify` again after the merge commit and repeat the protected-scope audit. Expected: the same complete green result as Step 1, no whitespace errors, and no protected Image/Tabs implementation changes introduced by conflict resolution.

- [ ] **Step 5: Push main and verify the remote SHA**

```bash
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

Expected: push succeeds and the SHA printed by `git ls-remote` equals local `HEAD`.

- [ ] **Step 6: Report exact publication evidence**

Report:

- Dialog lifecycle/API changes;
- Tag, Badge, and Progress capabilities;
- VitePress examples and corrected counts;
- `pnpm verify` result and test totals;
- merge result;
- local and remote final SHA.

Do not claim publication until the remote SHA check passes.
