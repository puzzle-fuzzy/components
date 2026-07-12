# Dialog Refresh and Common Components Design

## Context

OMG UI is a Vue 3-only personal component library. This release has two goals:

- replace the current minimally functional `ODialog` with a clearer native-dialog contract whose lifecycle, focus behavior, motion, sizing, and slots are comfortable to use directly;
- add a small, coherent batch of common UI-only display primitives: `OTag`, `OBadge`, and `OProgress`.

The repository is not published and does not preserve compatibility aliases. The implementation follows the existing Node.js 24 LTS, pnpm, Vue 3, Vite, Vitest, Less, VitePress, Playwright, `vue-icons-plus/lu`, SSR, and package-contract conventions. No dependency is added.

At design time, local `main` is a clean fast-forward descendant of `origin/main`: it is ahead by 18 commits and behind by zero. The remote must be fetched again immediately before publication; any new remote work is merged into `main`, the full verification suite is rerun, and only then is `main` pushed.

## Selected Scope

The selected component batch is deliberately cohesive:

- `OTag` expresses compact semantic labels and removable filters;
- `OBadge` adds a dot, count, or short value to another visual surface;
- `OProgress` expresses determinate or indeterminate visual progress.

This batch is preferred over a form-control batch or a floating-overlay batch because it adds no cross-component infrastructure, introduces no new dependency, and leaves enough review capacity for the Dialog rewrite and its three downstream compositions. `OSwitch` is the next recommended primitive. `OTooltip` and `OPopover` remain deferred until `useFloatingPanel` has orthogonal placement, offset, and dismissal policies.

## Design Direction

The existing "Precision Workbench" language remains unchanged: inherited typography, compact spacing, solid semantic surfaces, short state-driven motion, and a strict border budget. Dialog, Tag, Badge, and Progress do not introduce decorative outlines, glass effects, or new brand colors.

The implementation borrows mature capability boundaries rather than copying another library's API or appearance:

- explicit width, fullscreen, mount policy, and lifecycle concepts;
- controlled state with a distinct close request;
- accessible title and description identifiers exposed to custom slots;
- native modal focus behavior and clear reduced-motion handling.

## Dialog Architecture

### Native Surface and Controlled State

`ODialog` remains one native `<dialog>` rendered in place. `showModal()` owns the top layer, page isolation, focus return, and modal keyboard boundary. The component does not add a Teleport, Provider, global plugin, or a second focus-trap implementation.

`open` remains controlled through `v-model:open`. User actions emit a close request and `update:open=false`; they do not imperatively close the native surface while the parent still supplies `open=true`. A rejecting parent therefore leaves the Dialog fully open without emitting an actual close lifecycle event.

The internal lifecycle has four visible phases:

1. closed: the native Dialog is not open;
2. opening: content is mounted, `showModal()` has run, and entry motion is active;
3. open: the surface is settled in the top layer;
4. closing: the accepted controlled close is animating while the native Dialog remains open; `dialog.close()` runs only when exit finishes.

Rapid `true -> false -> true` changes invalidate stale transition completion callbacks. The final prop value always wins. Scroll lock and focus containment remain active through the closing phase.

### Shared and Dialog-Only Props

The current practice of spreading all `oDialogProps` into Confirm Dialog, Form Dialog, and Drawer is removed. `dialog.ts` defines an explicit common prop object for the shared modal contract and a Dialog-only extension:

```ts
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
  width: { type: [String, Number], default: 520 },
  fullscreen: { type: Boolean, default: false },
  destroyOnClose: { type: Boolean, default: false },
  initialFocus: String,
} as const
```

`oDialogCommonProps` is exported from `@puzzle-fuzzy/ui/dialog` for internal compositions, but it is not added to the root package namespace. The root continues to expose `ODialog` and `oDialogProps`.

`normalizeODialogWidth()` is public from the Dialog subpath and root entry:

- a positive finite number becomes floored pixels;
- a non-empty string is trimmed and used as a CSS length or expression;
- invalid numbers, empty strings, and missing values fall back to `520px`.

`fullscreen` overrides width, margin, maximum dimensions, and corner radii. It fills `100vw x 100dvh` and respects safe-area padding through the header and footer. It does not change modal behavior.

### Mounting Policy

Dialog slot content is lazy on first use:

- a closed Dialog that has never opened renders only the native `<dialog>` shell;
- an initially open SSR render includes the content but never calls DOM methods on the server;
- after the first open, content remains mounted across closes by default so form and scroll state persist;
- `destroyOnClose=true` removes header, body, and footer only after the `closed` lifecycle completes.

This behavior is documented explicitly and tested for initialization, preservation, and destruction.

### Close Reasons and Events

```ts
export const oDialogCloseReasons = [
  'close-button',
  'mask',
  'escape',
  'slot',
  'native',
  'programmatic',
] as const

export type ODialogCloseReason = (typeof oDialogCloseReasons)[number]

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
```

Semantics are exact:

- `request-close` describes a user/native close intent and its source;
- `update:open=false` follows that request for `v-model` consumers;
- `open` fires after `showModal()` succeeds and entry begins;
- `opened` fires after entry motion completes;
- `close` fires only after the parent accepts the request, or when `open` becomes false programmatically, and exit begins;
- `closed` fires after exit completes, `dialog.close()` runs, and native focus return can occur.

Programmatically setting `open=false` has reason `programmatic` and does not emit `request-close`. The footer/default slot callback uses reason `slot`. Native `cancel` is always prevented; Esc becomes a controlled `escape` request only when `closeOnEsc=true`.

The request reason is retained only through the Vue update cycle in which `update:open=false` is emitted. If the parent still supplies `open=true` after that flush, the request is considered rejected and a later programmatic close uses reason `programmatic`. Once a close request is pending, later gestures in the same update cycle are ignored and the first reason wins; requests while closing are also ignored. A native close that occurs while the controlled prop is still true is normalized as a `native` request; it remains closed only when the parent accepts the update, otherwise `showModal()` restores it on the next post-flush synchronization. Because the browser has already removed an unexpected native close from the top layer, the accepted branch emits `close` and finalizes `closed` after the next render flush without waiting for an exit animation.

No `beforeClose`, Promise handling, dirty-form policy, submission state, or route guard is added. Consumers reject a request simply by keeping `open=true`.

### Slots and Accessible Naming

```ts
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

The `close()` slot callback emits a controlled `slot` request. The default close icon remains `LuX`; `closeIcon` replaces only the decorative icon, never the accessible button.

`title` and `description` slots preserve component-owned wrappers and IDs. A full `header` slot replaces the title/description layout but not the default close button; it receives both IDs so the consumer can apply them to the correct heading and description elements.

Accessible-name resolution is:

1. `ariaLabel` when provided;
2. the `title` prop or `title` slot via `aria-labelledby=titleId`;
3. a custom header element to which the consumer applies `titleId`.

In development, mounting without `ariaLabel`, a title prop, a title slot, or a header slot produces one concise warning. When a full header slot supplies the naming source, the component uses `aria-labelledby=titleId` and checks after render that an element with that ID exists inside the Dialog; a missing target produces the same concise warning. A custom header without `ariaLabel` is documented and tested with `titleId`; the component does not label the Dialog with the entire header wrapper.

### Focus

The manual `focusableSelector` and Tab loop are deleted. Native modal Dialog behavior owns Tab and Shift+Tab containment.

Initial focus resolves in this order:

1. a valid element inside the Dialog matching `initialFocus`;
2. a descendant carrying native `autofocus`;
3. the browser's native `showModal()` focus selection.

Invalid selectors are caught and use the native fallback. Focus is never moved outside the Dialog. Confirm Dialog and Form Dialog keep `autofocus` on their safe cancel actions. Closing focus return remains native and is covered in Playwright.

### Mask Interaction

A mask close requires pointer-down and pointer-up to both occur on the Dialog backdrop area outside the surface bounds. Starting a drag inside content and releasing outside does not close the Dialog. `closeOnMask=false` disables the request without changing backdrop rendering.

### Visual Structure and Motion

The surface remains fully opaque and borderless. Width defaults to `520px`, compact viewport width remains `calc(100vw - 32px)`, and maximum height remains `calc(100dvh - 32px)`. Header and footer are fixed inside the flex surface; body is the only scroll container and keeps the shared scrollbar mixin and overscroll containment.

Motion is restrained:

- entry: `opacity: 0`, `translateY(8px)`, `scale(.98)` to settled in `220ms`;
- exit: settled to `opacity: 0`, `translateY(6px)`, `scale(.98)` in `160ms`;
- backdrop entry: `180ms`; backdrop exit: `140ms`;
- only opacity and transform animate;
- `display` and `overlay` use `allow-discrete`, with `@starting-style` for native top-layer entry;
- `prefers-reduced-motion: reduce` removes surface and backdrop transitions without delaying lifecycle completion.

The closing state keeps the top layer and scroll lock until motion completes. At widths at or below `480px`, footer actions wrap and primary actions can grow without horizontal overflow. Fullscreen surfaces use zero radius; ordinary compact Dialogs keep the 12px radius. Fullscreen header/footer padding respects top, bottom, and logical inline safe-area insets without changing ordinary Dialog spacing.

### Downstream Compositions

`OConfirmDialog`, `OFormDialog`, and `ODrawer` consume `oDialogCommonProps`, not the Dialog-only prop object.

- Confirm Dialog keeps consumer-controlled confirmation and safe cancel autofocus. It forwards `request-close`, actual `close`, and `closed` with reason payloads where its public contract exposes them.
- Form Dialog keeps the native form, constraint validation, external footer submit association, and safe cancel autofocus.
- Drawer keeps its existing start/end geometry, RTL mapping, width normalization, scrolling, and directional motion. It listens to `request-close` rather than treating `close` as intent, forwards every declared Dialog-derived slot, and does not inherit Dialog scale/translate motion.
- Image remains an independent `Teleport + preview layer` implementation and is not coupled to Dialog.

## OTag Contract

```ts
export const oTagTones = ['neutral', 'brand', 'success', 'warning', 'danger'] as const
export const oTagVariants = ['soft', 'solid'] as const
export const oTagSizes = ['sm', 'md'] as const
```

Props are `tone='neutral'`, `variant='soft'`, `size='md'`, `closable=false`, and `closeAriaLabel='Close tag'`. Slots are `icon`, `default`, and `closeIcon`; `closeIcon` replaces the decorative `LuX`. The only event is `close: [event: MouseEvent]`. The component never removes itself or maps a business filter state.

Tags are inline-flex, single-line, truncate safely, and use semantic soft or solid surfaces without a decorative border. Each soft tone has an independent `*-soft-text` token so text contrast is not coupled to the solid fill color; light and dark combinations meet at least WCAG AA contrast. Status is communicated by visible text as well as tone. The close button is keyboard-operable, has a local focus ring, does not submit an enclosing form, and has a `24px` base target plus a `44px` coarse-pointer hit area that does not enlarge the visible tag.

## OBadge Contract

```ts
export const oBadgeTones = ['neutral', 'brand', 'success', 'warning', 'danger'] as const
```

Props are:

- `value?: string | number`;
- `max=99`;
- `dot=false`;
- `hidden=false`;
- `showZero=false`;
- `tone='danger'`;
- `ariaLabel?: string`.

`normalizeOBadgeMax()` accepts a positive finite number, floors it to an integer, and falls back to `99`. `formatOBadgeValue()` normalizes its own `max` argument before comparing, so direct helper consumers receive the same behavior as the component. Numeric values above max render as `<max>+`. Numeric zero is hidden unless `showZero=true`. `dot` ignores `value`; a dot with no `ariaLabel` is decorative and `aria-hidden=true`. When `ariaLabel` is supplied, the badge marker uses `role=img` with that accessible name. Text/count badges without `ariaLabel` remain ordinary readable text and do not create an unsolicited live region.

The default slot is optional. With content, the badge is positioned at logical block-start/inline-end and responds to RTL. Without content it renders as a standalone inline badge. The badge uses a solid semantic surface and compact shadow, not a decorative border.

## OProgress Contract

```ts
export const oProgressStatuses = ['normal', 'success', 'warning', 'error'] as const
export const oProgressSizes = ['sm', 'md'] as const
```

Props are:

- `value?: number`;
- `status='normal'`;
- `size='md'`;
- `showLabel=false`;
- `label?: string`;
- `ariaLabel?: string`.

`normalizeOProgressValue()` maps `undefined` and non-finite values to `undefined` (indeterminate), and clamps finite numbers to `0..100`. Completion never changes status automatically; business meaning remains explicit.

Determinate Progress exposes `role=progressbar`, `aria-valuemin=0`, `aria-valuemax=100`, and `aria-valuenow`. Indeterminate Progress omits `aria-valuenow`. A visible label uses `label`, otherwise the default value label is `<rounded value>%`. When the component renders that default label, `aria-labelledby` points to the same label element; a string `label` becomes both the visible label and the accessible name. The `label` slot receives `{ value, indeterminate, status }`; because slot content cannot be converted safely into a name, a custom label slot requires `ariaLabel` and produces a concise development warning when it is missing. When no visible label or explicit name exists, the fallback accessible name is `Progress`.

The track is a muted semantic surface with no border. Determinate fill uses transform-based scaling rather than width animation. Its transform origin follows logical inline-start and reverses in RTL. Indeterminate fill moves from logical inline-start to inline-end; reduced-motion mode renders a static partial fill and removes animation.

## VitePress Capability Coverage

### Dialog

The Dialog page receives at least five distinct examples:

1. controlled basic Dialog with close reasons and lifecycle output;
2. numeric and CSS-expression widths plus compact viewport behavior;
3. title/description slots, full custom header, close icon, and slot close callback;
4. long independently scrolling content, lazy state preservation, destroy-on-close, and fullscreen;
5. mask/Esc/close-button policies, parent-rejected close, `initialFocus`/`autofocus`, dark theme, RTL, and reduced-motion notes.

The page documents every prop, event, event payload, slot prop, width normalization rule, native focus behavior, lifecycle phase, SSR behavior, Select/Dropdown top-layer guidance, and downstream specialized-dialog choice.

### Tag, Badge, and Progress

- Tag demonstrates every tone, both variants, both sizes, long truncation, icon slots, and consumer-controlled removal.
- Badge demonstrates dot/count/text, maximum values, zero/hidden behavior, RTL, standalone rendering, and composition with Avatar/Button.
- Progress demonstrates determinate values, indeterminate state, four statuses, both sizes, visible/custom labels, dark theme, and reduced motion.

Each page includes root/subpath imports, complete API tables, accessibility guidance, SSR notes, non-goals, focused Playwright interaction/style checks, and axe coverage.

Navigation and component counts become 26 public families and 27 public Vue components. The stale root README counts are corrected. The component overview no longer claims Image preview is based on Dialog; it explicitly preserves the independent Teleport preview layer.

No VitePress `--vp-*` variable is introduced or changed.

## Package and Repository Integration

Each new family receives the full directory contract:

- `src/O<Name>.vue`;
- `src/<name>.ts`;
- `style/index.less`;
- `__tests__/<name>.test.ts`;
- explicit `index.ts` exports.

All three receive root exports, stylesheet aggregation, Vite library entries, package subpaths, declaration output, naming registration, SSR coverage, package-contract assertions, attw entry points, and real tarball consumer imports.

Dialog receives updated unit, SSR, package, and browser tests. Dialog, Confirm Dialog, Form Dialog, and Drawer are always tested together after lifecycle changes.

Design records are updated in `DESIGN.md` and `.impeccable/design.json`; product documentation records the new UI-only boundaries. No lockfile changes are expected.

## Verification and Publication

Focused tests run before repository-wide verification:

- Dialog + Confirm Dialog + Form Dialog + Drawer unit suites;
- Tag, Badge, and Progress unit suites;
- SSR suite;
- focused Dialog/Tag/Badge/Progress Playwright scenarios.

Final verification is exactly `pnpm verify`, covering formatting, ESLint, Stylelint, naming, typecheck, coverage, build, SSR, package smoke tests, publint, attw, real Vue consumer build, docs build, Playwright, and axe.

Immediately before publication:

1. fetch `origin`;
2. verify whether `origin/main` is still an ancestor of local `main`;
3. if it advanced, merge `origin/main` into local `main` and semantically resolve every conflicted file while preserving both remote work and this release's contracts;
4. rerun `pnpm verify` after any merge;
5. push local `main` to `origin/main`;
6. confirm the pushed remote SHA equals local HEAD.

## Non-Goals

- No compatibility aliases for the previous Dialog event semantics.
- No custom focus-trap library, Portal provider, or replacement for native `<dialog>`.
- No `beforeClose`, asynchronous guard, request mapping, dirty-form policy, or submission workflow.
- No draggable Dialog, arbitrary animation names, non-modal Dialog, top offsets, or z-index prop.
- No circular Progress, step Progress, tooltip/popover, switch/slider, pagination, skeleton, or form-field abstraction in this release.
- No refactor of Image preview, Tabs effects, Widget visuals, Message timing, Upload state management, or unrelated component styles.
