# Message and Drawer Design

## Context

OMG UI is a personal, Vue 3-only component library. This change adds two UI-only overlay primitives:

- a compact message system whose primary experience appears at the viewport's physical top-right corner, enters from the right, and exits by shrinking and fading;
- a modal side panel that enters from the logical start or end edge and reuses the library's existing native-dialog behavior.

The implementation follows the current pnpm, Vite, Vue, Less, Vitest, Playwright, `vue-icons-plus/lu`, SSR, package-contract, and VitePress conventions. It adds no dependency and no business workflow.

## Selected Architecture

### Message

The selected design combines an Element Plus-style imperative API with a reusable visual primitive:

- `OMessage` is the public, declarative single-message surface. It owns content structure, status icon selection, close affordance, semantics, slots, and visual styling. It is flow-positioned and has no global state or timer.
- `oMessage()` is the recommended top-right experience. It lazily creates an internal host only when called in a browser, adds messages to a visual queue, owns timers and pause/resume behavior, and removes the host after the last leave transition.
- `OMessageHost` is private. It owns fixed positioning, `TransitionGroup`, stacking, movement, and delayed cleanup after leave.

This keeps the surface reusable for personal layouts while making the common call concise. It avoids a required app-level Provider, an `app.use()` plugin, and module-import DOM side effects.

### Drawer

`ODrawer` is a public composition over `ODialog`, following the existing Confirm Dialog and Form Dialog pattern. It delegates native `showModal()`, top-layer behavior, backdrop interaction, Esc handling, focus cycling, accessible naming, controlled closing, and document scroll locking to `ODialog`. Drawer adds only logical placement, size normalization, side-panel geometry, directional motion, and drawer-specific labels.

It does not reuse anchored floating-panel logic and does not replace the protected `OImage` preview implementation.

## Message Public Contract

### Status and Component

```ts
export const oMessageStatuses = ['info', 'success', 'warning', 'error'] as const
export type OMessageStatus = (typeof oMessageStatuses)[number]

export interface OMessageProps {
  readonly message?: string
  readonly status?: OMessageStatus
  readonly closable?: boolean
  readonly closeAriaLabel?: string
}

export interface OMessageEmits {
  close: []
}

export interface OMessageSlots {
  icon?: () => VNodeChild
  default?: () => VNodeChild
}
```

Defaults are `status='info'`, `closable=false`, and `closeAriaLabel='Close message'`. The default slot replaces the `message` prop. The icon slot replaces only the built-in status icon. The close control always uses `LuX` and emits one `close` event.

Built-in icons are direct named imports from `vue-icons-plus/lu`:

- info: `LuInfo`;
- success: `LuCheckCircle2`;
- warning: `LuAlertTriangle`;
- error: `LuXCircle`.

Icons are decorative and receive `aria-hidden="true"`; status remains available through text and live-region semantics. Error messages use `role="alert"`; all other statuses use `role="status"`. No outer host is also a live region, preventing duplicate announcements.

### Imperative Service

```ts
export interface OMessageOptions {
  readonly message: string
  readonly status?: OMessageStatus
  readonly duration?: number
  readonly closable?: boolean
  readonly pauseOnHover?: boolean
  readonly appendTo?: string | HTMLElement
  readonly onClose?: () => void
}

export interface OMessageHandle {
  close: () => void
}

export interface OMessageService {
  (input: string | OMessageOptions): OMessageHandle
  info: (input: string | Omit<OMessageOptions, 'status'>) => OMessageHandle
  success: (input: string | Omit<OMessageOptions, 'status'>) => OMessageHandle
  warning: (input: string | Omit<OMessageOptions, 'status'>) => OMessageHandle
  error: (input: string | Omit<OMessageOptions, 'status'>) => OMessageHandle
  closeAll: () => void
}

export const oMessage: OMessageService
```

Service defaults are `status='info'`, `duration=3000`, `closable=false`, `pauseOnHover=true`, and `appendTo=document.body`. `normalizeOMessageDuration()` maps `undefined` and non-finite values to `3000`, values at or below zero to `0`, and positive values to `Math.floor(value)`; `0` means persistent. Empty message strings remain valid UI content and are not replaced with business copy.

`appendTo` may be a connected `HTMLElement` or selector. A disconnected element or missing selector falls back to `document.body`. Each mounted target has at most one internal host. This permits local theme inheritance and messages inside native-dialog top-layer content without forcing theme mirroring into the service.

Calling the service without DOM globals is a documented client-only no-op that returns an idempotent handle; importing the root package remains fully SSR-safe. A handle, timeout, close button, or `closeAll()` may request closure, but each message starts its leave transition once and invokes `onClose` exactly once after leave completes. `closeAll()` covers every active target host.

Automatic timing pauses while a message is hovered and while keyboard focus is inside it. Resume uses the remaining duration instead of restarting the full duration. The internal host is destroyed only after all records and pending leave transitions are complete.

## Message Visual and Motion Contract

- The primary host is fixed at the physical top-right corner with a 16px viewport inset and 10px item gap, independent of text direction.
- Each message uses `min(360px, calc(100vw - 32px))`, allows long text to wrap, and keeps controls from shrinking.
- The surface has no border and is fully opaque.
- Light mode uses exact `#fff`; dark mode uses exact `#2d2d2d`. These values live in a dedicated semantic message-surface token rather than replacing the general surface token.
- A dedicated message shadow supplies elevation. Status color appears only on the icon and does not tint or make the surface transparent.
- Entry takes approximately 260ms: the item fades in while translating from beyond the right edge using a natural ease-out curve.
- Exit takes approximately 180ms: the item stays spatially anchored, scales to approximately `0.9` from its top-end origin, and fades out. It does not slide back to the right.
- Stack reflow uses a transform-based move transition. Animation changes only `transform` and `opacity`.
- The host uses `pointer-events: none`; message surfaces use `pointer-events: auto`.
- `prefers-reduced-motion: reduce` removes entry, exit, and move motion without delaying cleanup.

New semantic tokens include the message surface, message shadow, and message z-index. No VitePress `--vp-*` variable is declared or changed.

## Drawer Public Contract

```ts
export const oDrawerPlacements = ['start', 'end'] as const
export type ODrawerPlacement = (typeof oDrawerPlacements)[number]

export interface ODrawerProps {
  readonly open?: boolean
  readonly placement?: ODrawerPlacement
  readonly size?: string | number
  readonly title?: string
  readonly description?: string
  readonly closeOnMask?: boolean
  readonly closeOnEsc?: boolean
  readonly showClose?: boolean
  readonly closeAriaLabel?: string
  readonly ariaLabel?: string
}

export interface ODrawerEmits {
  'update:open': [open: boolean]
  close: []
}

export interface ODrawerSlots {
  header?: () => VNodeChild
  default?: () => VNodeChild
  footer?: () => VNodeChild
}
```

Defaults are `open=false`, `placement='end'`, `size=400`, `closeOnMask=true`, `closeOnEsc=true`, `showClose=true`, and `closeAriaLabel='Close drawer'`. A positive finite numeric size becomes pixels. A non-empty string is used as a CSS length expression. Invalid numeric or blank-string input falls back to `400px`. The normalization helper is exported and tested.

`ODrawer` forwards non-prop attributes to the underlying native `<dialog>` through `ODialog`. It mirrors `update:open` and `close` without adding submit, confirm, request, or form state. Header, default, and footer slots retain the same meaning as Dialog.

## Drawer Visual, Motion, and Accessibility Contract

- Drawer is modal and occupies the full dynamic viewport block size.
- Inline size is `min(var(--omg-drawer-inline-size), 100vw)`, preventing horizontal overflow on compact screens.
- `end` docks to logical inline-end; `start` docks to logical inline-start. Both automatically respond to RTL.
- Only the two inner corners are rounded; the viewport-edge corners remain flush.
- The surface is borderless and uses the normal semantic surface, native backdrop, and a directional dialog-level shadow.
- Header and footer remain fixed within the surface. The body is the only scrolling region and uses the shared Less scrollbar mixin and overscroll containment.
- Open motion takes approximately 260ms and combines a small opacity change with a full directional translate from the selected edge. Close is faster and reverses the transform.
- Native-dialog `display` and `overlay` transitions use modern discrete-transition support with `@starting-style`; no compatibility fallback is required before launch.
- Reduced-motion mode removes directional movement and timing while keeping open/close behavior intact.
- Accessible naming, focus cycling, Esc policy, mask policy, focus return, and page scroll locking remain owned by `ODialog` and receive Drawer integration tests.

Anchored Select or Dropdown content inside Drawer must either remain inline with `teleported=false` or target an element inside the native dialog, because ordinary body content cannot render above a native top-layer dialog.

## VitePress Capability Coverage

The Message page must visibly demonstrate:

1. all four statuses and built-in icons;
2. command helpers and plain `oMessage()`;
3. automatic close, hover/focus pause, and `duration=0` persistence;
4. manual close, returned handle, `closeAll()`, and stacked reflow;
5. long wrapping content;
6. the declarative `OMessage` surface with default and custom icon/content slots;
7. exact light and dark surfaces, including scoped `appendTo` usage;
8. complete component props/events/slots and service options/handle documentation;
9. ARIA, SSR, reduced-motion, target mounting, and native-dialog target guidance.

The Drawer page must visibly demonstrate:

1. end and start placement with logical-direction explanation;
2. numeric and CSS-string sizes plus compact viewport behavior;
3. default and custom headers, body, and footer;
4. long independently scrolling content;
5. mask, Esc, close-button, and explicit inner-action close paths;
6. hidden close button and persistent behavior variants;
7. RTL and dark-theme surfaces;
8. embedded form controls and inline Select guidance;
9. complete props/events/slots, accessibility, focus, scroll-lock, and motion documentation.

Both pages receive focused Playwright coverage and axe checks. VitePress source aliases, sidebar, component overview, and examples are part of the public component contract rather than optional marketing content.

## Documentation Contract Improvement

The naming checker is extended so each public component family must have:

- `apps/docs/docs/components/<family>.md`;
- a VitePress source alias;
- a sidebar entry;
- a component-overview link;
- at least one Playwright route visit.

Existing example filenames and sharing stay valid: several mature pages intentionally use semantic names such as `Variants.vue`, `States.vue`, or a shared Avatar example instead of a family-local `Basic.vue`. The new Message and Drawer families each add `apps/docs/examples/<family>/Basic.vue` plus their capability-specific examples, and their documentation pages import every new example.

Existing documentation drift is corrected at the same time: Widget is added to the overview, and the final totals become 23 component families and 24 public Vue components.

## Package and Architecture Integration

Both components receive complete library integration:

- component directory contract, root export, style aggregation, and naming vocabulary;
- `@puzzle-fuzzy/ui/message` and `@puzzle-fuzzy/ui/drawer` subpaths;
- Vite entries and declaration output;
- package-contract assertions, attw entry points, and real tarball consumer imports;
- SSR root-import and render coverage;
- README, PRODUCT, DESIGN, and design-registry records;
- VitePress aliases, sidebar entries, overview links, examples, API pages, and E2E routes.

No compatibility alias, CommonJS output, package-manager migration, or new runtime dependency is added.

## Verification

### Message

- Type and unit tests cover status vocabulary, default icons, slots, close semantics, duration normalization, client-only lazy mounting, target resolution, multiple targets, fake timers, pause/resume with remaining time, persistent messages, idempotent handles, single `onClose`, `closeAll()`, delayed leave cleanup, and host destruction.
- SSR tests prove root import has no DOM side effects and declarative `OMessage` renders stable accessible markup.
- Browser tests verify physical top-right geometry in both LTR and RTL, exact light `rgb(255, 255, 255)` and dark `rgb(45, 45, 45)` surfaces, no border, visible shadow, distinct status icons, right-side entry, shrink/fade exit, stack movement, wrapping, keyboard close, reduced motion, and axe.

### Drawer

- Type and unit tests cover placement vocabulary, size normalization, prop forwarding, slots, controlled close events, mask and Esc policy, accessible naming, and composition with `ODialog`.
- SSR tests cover closed and open markup without direct DOM access or unstable IDs.
- Browser tests verify start/end docking in LTR and RTL, responsive size, borderless surface, scrolling body, backdrop, focus entry/cycle/return, page scroll lock, every close policy, dark theme, reduced motion, and axe.

### Repository

- Focused component tests run first.
- Formatting, ESLint, Stylelint, naming/documentation contracts, typecheck, coverage, library build, docs build, SSR suite, package suite, publint, attw, real tarball consumer, and the complete Playwright suite all pass.
- `git diff --check` remains clean.

## Non-Goals

- No notification title/action layout, progress bar, grouping, deduplication, retry, request-result mapping, or business-state conversion.
- No required Provider, Vue plugin installation, global app mutation, or eager browser mount.
- No top or bottom Drawer placement.
- No Drawer form submission or confirmation logic.
- No transparent Message surface, decorative Message border, or VitePress theme-variable override.
- No refactor of protected Image preview, Tabs visuals, Widget visuals, or unrelated component styles.
