# Common State Primitives Design

## Context

OMG UI is a Vue 3-only personal component library with 26 public component families. The current library is strong in inputs, avatars, menus, and overlays, but it has four recurring gaps: a dedicated immediate boolean control, contextual help for icon-heavy controls, persistent inline feedback, and loading placeholders.

This release adds `OSwitch`, `OTooltip`, `OAlert`, and `OSkeleton`. The components remain UI-only: they do not persist settings, execute actions, translate exceptions, start requests, or decide when data is ready. The implementation follows Node.js 24 LTS, pnpm, Vue 3, Vite, Vitest, Less, VitePress, Playwright, `vue-icons-plus/lu`, SSR, and the existing package-contract workflow. No dependency is added.

The user has already authorized the recommended path without additional approval prompts. The selected batch is therefore treated as approved by the current “continue and make more components” request.

## Considered Approaches

Three batches were considered:

1. **State foundations (selected):** Switch, Tooltip, Alert, and Skeleton.
2. **Navigation foundations:** Pagination, Breadcrumb, and Steps.
3. **Advanced inputs:** Slider, Date/Time input, and Autocomplete.

State foundations are selected because they fill the largest number of existing composition gaps while keeping each public component independent. Navigation and advanced-input batches remain useful future work, but both require more product-specific policy and interaction vocabulary than this release.

## Design Direction

The existing “Precision Workbench” direction remains unchanged: compact inherited typography, opaque semantic surfaces, a strict border budget, direct state motion, and no ornamental decoration.

- Switch uses track fill and thumb position, not a decorative outline, to communicate state.
- Tooltip uses an opaque inverse surface and small shadow with no border.
- Alert uses a soft semantic surface and explicit status icon with no outer border.
- Skeleton uses muted surfaces and restrained motion with no card frame or shadow.
- Focus and invalid states may use a ring or semantic edge because they communicate interaction state rather than decorate a surface.
- Every built-in icon comes from `vue-icons-plus/lu`; Skeleton deliberately has no icon.

## OSwitch Contract

`OSwitch` is a controlled boolean input backed by a real `<input type="checkbox" role="switch">`. It preserves native `name`, `value`, `required`, form submission, Space-key interaction, and label activation.

```ts
export const oSwitchSizes = ['sm', 'md'] as const

export interface OSwitchEmits {
  'update:modelValue': [value: boolean]
  change: [value: boolean, event: Event]
}
```

Props are:

- `modelValue=false`;
- `size='md'`;
- `label?: string`;
- `description?: string`;
- `disabled=false`;
- `readonly=false`;
- `loading=false`;
- `invalid=false`.

Slots are `default` for the visible label and `description` for supporting text. The component forwards undeclared attributes and listeners to the native input. It uses an SSR-safe generated ID when the consumer does not supply one.

`loading` is a visual interaction state, not a request lifecycle. It displays `LuLoaderCircle`, prevents changes, and sets `aria-disabled=true` without changing the consumer's value. `readonly` similarly prevents pointer and keyboard changes, restores the controlled native state after attempted input, and exposes `aria-readonly=true`. Disabled uses the native attribute. Rejected parent updates restore the DOM to `modelValue` after the event cycle.

The track is borderless in its normal state. Checked state uses the brand fill, the thumb translates along the logical inline axis, and RTL reverses the motion. Invalid state uses the danger token. Focus-visible uses the shared focus ring. Both sizes retain a 44px coarse-pointer label target without inflating the visual track.

## OTooltip Contract

`OTooltip` is a non-interactive description layer. It must not contain buttons, inputs, links, menus, or forms; those belong in a future `OPopover`. Tooltip never moves focus and never opens on click alone.

```ts
export const oTooltipPlacements = [
  'top',
  'top-start',
  'top-end',
  'right',
  'right-start',
  'right-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
] as const

export interface OTooltipEmits {
  'update:open': [open: boolean]
}
```

Props are:

- `content?: string`;
- `open?: boolean` for controlled or uncontrolled operation;
- `disabled=false`;
- `placement='top'`;
- `showDelay=400` milliseconds;
- `hideDelay=100` milliseconds;
- `offset=8` pixels;
- `teleported=true`;
- `teleportTo='body'` as a selector or `HTMLElement`.

Slots are the required single-root `default` trigger and the optional `content` slot. The trigger is cloned rather than wrapped. OMG UI merges the reference callback, pointer/focus/Escape handlers, and visible-tooltip `aria-describedby` into that one trigger VNode. This preserves button layout, native semantics, and accessible description ownership. Development builds warn once when the trigger slot is empty or has multiple meaningful roots; only the first meaningful root is used.

Hover requests open after `showDelay`; focus-visible/focus-in requests open immediately; pointer leave and focus out request close after `hideDelay`; Escape closes immediately. Delayed callbacks are generation-guarded so stale timers cannot reopen a disabled or unmounted tooltip. Controlled consumers receive `update:open` and own the actual visible state. `disabled=true` clears timers and requests closed state.

The floating layer uses `role=tooltip`, a stable SSR-safe ID, fixed positioning, viewport flip/shift, and a maximum inline size of `240px`. It is pointer-inert. Teleported content mirrors the trigger's `--omg-*` tokens, inherited typography, theme, `lang`, and `dir` through the existing floating-panel infrastructure.

`useFloatingPanel` expands its internal placement type from two bottom positions to the twelve orthogonal positions and accepts an optional reactive offset. Its default remains `6px`, so Select and Dropdown retain their current geometry. Component refs resolve to their `$el` HTMLElement where possible so a cloned `OButton` can be a reference without a wrapper.

Tooltip enters with opacity and a 2px placement-aware translation; it never scales. Reduced-motion removes the translation and transition. SSR renders only the trigger because uncontrolled Tooltip starts closed; explicitly controlled open SSR may render inline/teleport-safe markup without reading DOM globals.

## OAlert Contract

`OAlert` is persistent inline feedback. It complements transient `OMessage` but does not reuse its service, queue, timer, or corner placement.

```ts
export const oAlertStatuses = ['info', 'success', 'warning', 'error'] as const

export interface OAlertEmits {
  close: [event: MouseEvent]
}
```

Props are:

- `status='info'`;
- `title?: string`;
- `description?: string`;
- `closable=false`;
- `showIcon=true`;
- `closeAriaLabel='Close alert'`.

Slots are `icon`, `title`, `default`, `action`, and `closeIcon`. Default status icons are `LuInfo`, `LuCircleCheck`, `LuTriangleAlert`, and `LuCircleX`; the close fallback is `LuX`. Custom icons replace only the decorative status glyph. The close button is a real non-submit button and only emits intent; the component never removes itself.

Alert remains static by default and does not create an unsolicited live region. Consumers that insert dynamic feedback can pass native `role="status"`, `role="alert"`, or `aria-live` through inherited attributes. Status is expressed by icon, consumer text, and semantic surface rather than color alone.

The layout supports title-only, body-only, title plus description, long wrapping text, action content, and a close control without overlap. On compact widths the action moves below the text. The entire surface is borderless; the status icon receives the strongest semantic color while the background stays soft enough for long-form readability.

## OSkeleton Contract

`OSkeleton` is an atomic loading placeholder with an optional resolved-content slot. It does not infer loading, fetch data, reserve a card layout, or announce business progress.

```ts
export const oSkeletonVariants = ['text', 'rect', 'circle'] as const
```

Props are:

- `loading=true`;
- `animated=true`;
- `variant='text'`;
- `width?: string | number`;
- `height?: string | number`;
- `lines=1` for text Skeletons.

The default slot is rendered only when `loading=false`. Positive finite numeric dimensions become pixels; non-empty strings are trimmed; invalid dimensions fall back to the variant defaults. `lines` is normalized to an integer from 1 through 12 and applies only to `text`. The final text line uses a shorter logical width when more than one line is rendered, while an explicit `width` still constrains the overall block.

Placeholder shapes are `aria-hidden=true`. Consumers own the surrounding `aria-busy` state and any loading announcement because only they know which content region is being replaced. Each placeholder uses a muted opaque surface. Animated mode uses a low-contrast background-position sweep; reduced-motion and `animated=false` render a static surface.

Circle defaults to `40px × 40px`; rect defaults to `100% × 120px`; text defaults to `100% × 1em`. Circle always uses a 50% radius, text uses a compact pill radius, and rect uses the shared medium radius.

## Architecture and Isolation

Each family uses the established component directory contract:

```text
packages/ui/src/components/<name>/
├─ index.ts
├─ src/O<Name>.vue
├─ src/<name>.ts
├─ style/index.less
└─ __tests__/<name>.test.ts
```

The four public components do not import one another. Switch borrows behavior patterns from Checkbox without wrapping it. Alert shares status vocabulary visually with Message without sharing a public module. Tooltip consumes internal composables only. Skeleton depends only on Vue props and design tokens.

The shared publication lane updates root exports, global styles, Vite library entries, package subpaths, naming checks, SSR coverage, package-contract assertions, attw entrypoints, and a real tarball consumer. No compatibility aliases or deprecated APIs are introduced.

## VitePress Capability Coverage

Every new page includes root and subpath imports, complete prop/event/slot tables, accessibility guidance, SSR notes, UI-only non-goals, and at least two live examples.

- Switch shows sizes, label/description, checked state, disabled, readonly, loading, invalid, dark theme, native form attributes, and controlled rejection.
- Tooltip shows icon-button help, all four primary directions, start/end alignment, long wrapping text, hover, focus, Escape, controlled state, Teleport theme mirroring, viewport flip, and reduced motion.
- Alert shows four statuses, title/body combinations, custom/action slots, consumer-controlled close, long content, compact wrapping, and dark theme.
- Skeleton shows text lines, avatar/circle, rectangular media, composed card placeholders, loading-to-content switching, explicit dimensions, and reduced motion.

The VitePress sidebar is reorganized into clearer foundation, form, navigation, feedback, overlay, and personal-component groups rather than adding four more entries to an already dense category. Existing routes and visual effects remain unchanged. The home page and overview become 30 component families and 31 public Vue components.

No VitePress `--vp-*` variable is introduced or changed. Image remains an independent Teleport preview and Tabs retains its current slider/line effects.

## Testing

Unit tests cover public prop vocabulary, type contracts, native attribute forwarding, controlled state restoration, timer cancellation, single-root trigger cloning, close intent, normalization helpers, slots, SSR-safe IDs, icon sources, and source/style invariants.

Playwright covers:

- Switch click and Space behavior, readonly/disabled/loading blocking, focus-visible, controlled rejection, dark and RTL layouts;
- Tooltip hover/focus timing, Escape, `aria-describedby`, Teleport context sync, flip/shift, controlled state, compact viewport, and reduced motion;
- Alert all statuses, close intent, action slot, long content, compact wrapping, dark theme, and borderless surface;
- Skeleton all variants, normalized dimensions, content switching, multi-line shape, and static reduced-motion rendering;
- axe checks on every new page.

SSR adds all four root components. Package tests import and render root and subpath forms. Focused tests run first, followed by exactly `pnpm verify`.

## Documentation Records and Publication

`DESIGN.md`, `PRODUCT.md`, `.impeccable/design.json`, root/package READMEs, component overview, and VitePress navigation record the new contracts and counts. The component registry remains explicit in this release; consolidating the repeated package/build/docs lists into an internal manifest is deferred to a separate architecture task so component delivery is not mixed with a repository-wide generator migration.

Immediately before publication, fetch `origin`, merge any remote-only commits into local `main`, rerun `pnpm verify` after a merge, and push only when the worktree is clean. Verify the remote `refs/heads/main` SHA matches local `HEAD`.

## Non-goals

- No Popover, interactive Tooltip content, tour system, or global Tooltip provider.
- No Switch persistence, optimistic request, permission checks, or confirmation workflow.
- No Alert exception mapping, retry behavior, timer, queue, or automatic removal.
- No Skeleton data request, global loading state, content measurement, or card template.
- No compatibility aliases, legacy styles, VitePress theme-variable overrides, or unrelated Image/Tabs changes.
