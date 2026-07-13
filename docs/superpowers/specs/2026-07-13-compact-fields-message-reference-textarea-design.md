# Compact Fields, Message Lifecycle, and Reference Textarea Design

## Context

OMG UI is a personal, Vue-only component library. The current VitePress demos expose three
connected quality problems:

- controls inherit VitePress typography and several action buttons render at approximately
  `38px / 16px`, while the accepted Upload visual language uses compact `32px / 12px` actions;
- the imperative Message timer works, but permanent demos and hover pausing make the component
  appear unable to close automatically;
- `OReferenceTextarea` was implemented as a generic textarea with references below it, while its
  intended purpose is a dedicated reference-image prompt editor whose prompt contains Bailian-style
  `[Image n]` tokens.

This phase corrects the public defaults rather than masking the problems inside VitePress. The
repository is not released, so obsolete contracts may be removed without compatibility aliases.

The implementation continues to use Node.js 24 LTS, pnpm, Vue 3, TypeScript, Less, Vite, Vitest,
Playwright, `vue-icons-plus/lu`, the existing floating-panel utilities, and the current package and
SSR checks. It adds no Bun files and does not override any VitePress `--vp-*` variable.

## Design References and Adaptation

Material Design is a reference, not a skin to copy. Material Web exposes filled and outlined forms
as functionally equivalent variants, separates container, shape, text, and focus tokens, and gives
Select and Menu their own surface and selected-state tokens:

- [Material Web text field](https://github.com/material-components/material-web/blob/main/docs/components/text-field.md)
- [Material Web Select](https://github.com/material-components/material-web/blob/main/docs/components/select.md)
- [Material Web Menu](https://github.com/material-components/material-web/blob/main/docs/components/menu.md)

OMG UI adopts the useful principles:

- filled and outlined field variants with identical behavior;
- clearly differentiated rest, hover, focus, invalid, readonly, and disabled states;
- one deliberate trailing action area instead of accumulating icon padding;
- separate field and popup surfaces;
- external labels and supporting text remain available through `OLabel` and `OField`.

OMG UI does not copy Material's Roboto dependency, 56px default field height, floating labels,
bottom-only active indicator, ripple system, or Material shape scale. The library keeps its compact
32px/38px desktop controls, 44px coarse-pointer targets, 8px primary control radius, blue identity,
existing typography, and reduced border budget.

## Selected Architecture

The work is divided into four bounded streams that share one visual contract:

1. compact action and documentation defaults;
2. shared soft and outline field appearances, including Select spacing repair;
3. Message lifecycle defaults and truthful demonstrations;
4. a breaking, dedicated `OReferenceTextarea` contract.

Each stream has independent unit coverage and documentation, while one browser pass verifies that
the resulting pages use the same typography, spacing, state feedback, dark theme, and responsive
behavior.

## Compact Button and Documentation Contract

### Button defaults

`OButton` changes its public default `size` from `md` to `sm`. The size vocabulary remains
`sm | md | lg`, and every size receives an explicit component font size instead of inheriting its
host page:

| Size | Minimum height | Font size | Purpose                                |
| ---- | -------------: | --------: | -------------------------------------- |
| `sm` |           32px |      12px | default actions and dense controls     |
| `md` |           38px |      14px | standard form and dialog actions       |
| `lg` |           46px |      14px | larger hit area without oversized text |

The Button capability page uses explicit `size="md"` and `size="lg"` where those sizes are being
demonstrated. Built-in Confirm Dialog and Form Dialog actions inherit the new compact default unless
they intentionally request another size.

### Host-independent typography

Interactive component roots that currently rely only on `font: inherit` receive explicit OMG font
tokens at the appropriate content element. This includes Button, Select, Dropdown, Accordion,
Checkbox, Radio, Switch, and Popover. Normal control copy uses 14px; dense metadata and compact
actions use 12px. Font family still inherits from the consuming application.

### VitePress demo shell

The demo shell remains a neutral VitePress consumer rather than a second theme:

- `.omg-docs-demo__content` uses 14px copy and a 1.5 line height;
- its gap becomes `var(--omg-space-3)` and `.omg-example-stack` uses
  `var(--omg-space-4)`;
- the decorative DemoBlock border is removed while the quiet background and radius remain;
- mobile padding remains compact;
- no `--vp-*` variable is declared or changed.

Browser coverage asserts a default Button is 32px high with 12px text and normal demo copy is 14px.

## Shared Field Appearance Contract

### Public variants

`OInput`, `OTextarea`, and `OSelect` each expose the same public vocabulary:

```ts
type OInputVariant = 'soft' | 'outline'
type OTextareaVariant = 'soft' | 'outline'
type OSelectVariant = 'soft' | 'outline'
```

The runtime source of truth is an internal `oFieldControlVariants` tuple. Each component exports its
own component-named tuple and type so root and subpath consumers retain discoverable APIs. `soft`
is the new default. `outline` preserves the deliberate always-bordered presentation as an explicit
choice, not as a compatibility fallback.

### Soft visual states

The soft variant follows the accepted Upload surface language:

- rest: `surface-muted` background and a transparent 1px reserved border;
- hover: a subtle state-layer background change, without revealing a decorative border;
- focus or open: surface background, brand border, and a 2px brand-soft shadow;
- invalid: danger border and a restrained danger-soft background;
- readonly: muted surface with no hover affordance;
- disabled: muted surface, disabled cursor, and existing disabled opacity.

The transparent reserved border prevents layout movement when focus or validation reveals a real
border. Native CSS `outline` is not used for these field surfaces. Keyboard focus, pointer focus,
Select open state, invalid state, and high-contrast readability remain visually distinguishable.
Forced-colors mode replaces authored surface differences with system-color borders and focus colors
so the visually borderless resting style does not erase the control boundary in that environment.

### Outline visual states

The outline variant keeps a normal semantic border at rest, brand-border hover feedback, and the
same focus, invalid, readonly, and disabled semantics as soft. Both variants keep identical DOM,
events, keyboard behavior, form attributes, SSR behavior, autosize behavior, and slots.

### Scope

`OReferenceTextarea` uses the soft `OTextarea` presentation. Input Group keeps one clipped group
surface: soft children use transparent individual borders inside the shared muted surface, while
outline children retain the existing single-boundary composition without doubled outer borders.
Focused tests cover both variants and their radii. Code Input keeps its purpose-specific per-cell
border behavior.

## Select Spacing and Trailing Action Contract

### Current defect

The existing Select trigger reserves 12px end padding, a 16px chevron, and an 8px gap. When clear is
available it increases end padding to 36px while retaining the chevron, causing approximately 60px
of trailing reservation. In contrast, list options use only 8px horizontal padding. This creates the
reported wide right side and cramped menu rows.

### Corrected trigger geometry

Select uses one trailing rail rather than independent accumulated offsets:

- trigger text starts 12px from the logical start edge;
- exactly 32px is reserved at logical end for the trailing rail;
- the chevron is 16px and visually centered in that rail;
- the clear action uses a compact 24px desktop hit area inside the same rail;
- when a selected clearable Select is hovered or focus is within the control, clear replaces the
  chevron instead of sitting beside it;
- on non-hover/coarse-pointer devices, clear is visible when available;
- keyboard focus can reach clear and makes it visible before activation;
- the trigger retains one accessible `combobox` button and the clear action remains its sibling, so
  no button is nested inside another button.

The fixed 180px minimum width remains a sizing policy, not hidden padding. Consumers can continue to
set an explicit width through attributes or surrounding layout.

### Corrected popup geometry

- panel padding remains 4px;
- option horizontal padding becomes 12px;
- option minimum height remains 36px on desktop;
- normal option and trigger text is explicitly 14px;
- selected check and trailing icons remain 16px;
- coarse-pointer trigger and action targets reach at least 44px;
- RTL uses logical properties and mirrors the rail without special-case left/right rules.

The Reference Textarea mention list uses the same 4px panel, 36px row, 12px inline padding, 14px
primary text, 12px metadata, active state layer, and 16px trailing icon rhythm.

## Message Lifecycle Contract

### Architecture retained

`OMessage` remains a static, flow-positioned visual primitive. It does not gain a second timer or
private visibility state. `oMessage()` remains the recommended automatic top-right experience and
continues to own queueing, leave transitions, target hosts, handles, and timing.

### Default behavior changes

- default `duration` remains 3000ms;
- default `pauseOnHover` changes from `true` to `false`, so observing a message does not make it look
  permanently stuck;
- consumers may explicitly set `pauseOnHover: true` when reading time is more important;
- focus inside a closable message still pauses timing for keyboard accessibility;
- `duration <= 0` remains the only persistent mode;
- a positive fractional duration is floored but clamped to at least 1ms, so `0.8` no longer becomes
  persistent accidentally.

### Documentation truthfulness

Only the explicitly named persistent demo uses `duration: 0`. Stacked messages, long messages, and
light/dark target demonstrations use finite durations. The declarative section is named and
described as a controlled static surface. The primary service demo visibly explains automatic close
and the opt-in hover-pause behavior.

### Tests

Unit tests cover omitted-duration automatic close, positive fractions, persistent duration,
opt-in hover pause with remaining time, mandatory focus pause, idempotent handles, `closeAll()`, and
single `onClose` invocation. Browser coverage opens a normal message and waits for both the message
and its host to disappear without calling `closeAll()`.

## Dedicated Reference Textarea Contract

### Purpose

`OReferenceTextarea` becomes a dedicated reference-image prompt editor. Its invariant is:

```text
media[0] <-> [Image 1]
media[1] <-> [Image 2]
media[n] <-> [Image n + 1]
```

Reference images are displayed and selected above the prompt. The prompt itself contains the exact
plain-text tokens expected by a media-array API, for example:

```text
[Image 1]中身着红色旗袍的女性
```

There is no reference list below the textarea and no generic text-reference kind.

### Public media model

The old `OReferenceTextareaReference`, `kind`, `references`, and `thumbnailSrc` contract is removed.
No compatibility alias is kept.

```ts
interface OReferenceTextareaMedia {
  readonly id: string
  readonly src: string
  readonly previewSrc?: string
  readonly label: string
  readonly alt?: string
}
```

`src` is the thumbnail source. `previewSrc` optionally supplies a larger preview source. `label` is
visible in the media strip and mention menu. `alt` describes meaningful image content when supplied;
the generated `[Image n]` token remains the stable protocol label.

### Props

The component keeps the `OTextarea` value, rows, autosize, maxlength, count, variant, disabled,
readonly, invalid, placeholder, ARIA, and native-attribute contract, and adds:

```ts
interface OReferenceTextareaProps {
  readonly media?: readonly OReferenceTextareaMedia[]
  readonly accept?: string // default: 'image/*'
  readonly multiple?: boolean // default: true
  readonly maxCount?: number
  readonly uploadable?: boolean // default: true
  readonly removable?: boolean // default: true
  readonly teleported?: boolean // default: true
  readonly teleportTo?: string | HTMLElement // default: 'body'
  readonly labels?: Partial<OReferenceTextareaLabels>
}
```

`maxCount` follows Upload normalization: non-negative finite integers are enforced, invalid values
do not create an accidental unlimited picker, and current media count limits each selection event.

Visible and accessible copy is centralized in `OReferenceTextareaLabels`, including media-list,
upload, remove, mention-list, and mention-option labels. Defaults remain English and the VitePress
examples provide Chinese overrides.

### Events and slots

```ts
interface OReferenceTextareaEmits {
  'update:modelValue': [value: string]
  select: [files: File[]]
  remove: [media: OReferenceTextareaMedia, index: number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}
```

Upload selection only emits native `File[]`; validation, persistence, and real uploading remain
consumer work. Removal is a controlled intent, matching `OUpload`.

Typed slots are limited to the dedicated UI:

- `media`: `{ media, index, token }`;
- `mentionOption`: `{ media, index, token, active }`;
- `upload`: upload-entry content.

The token formatter is intentionally not customizable. It always produces `[Image ${index + 1}]`
so display order and request text cannot silently diverge.

### Media strip and upload

- an empty component shows a concise Upload-style dashed image picker above the prompt;
- after selection, media render as a responsive strip/grid with thumbnail, `[Image n]`, label, and
  optional remove action;
- a compact add tile stays at the end while more media may be selected;
- the picker accepts click and drag/drop, resets the native input after each change, supports
  selecting the same file again, and truncates selection at `maxCount`;
- generic selection-limit and file-list normalization live in an internal file-selection utility
  shared with `OUpload`; `OReferenceTextarea` does not compose or import the Upload visual component;
- each image composes `OImage`, preserving its independent Teleport preview and focus restoration;
- built-in upload, image, plus, and remove icons come from `vue-icons-plus/lu`;
- the component never creates, uploads, revokes, or persists object URLs.

### `@` mention behavior

The editor remains a real native `<textarea>`, not `contenteditable` and not a mirrored overlay.
This preserves IME, native selection, form attributes, controlled values, SSR, autosize, and screen
reader behavior.

1. Focus, input, click, select, and keydown record the native textarea and current selection.
2. Outside IME composition, an `@query` beginning at the start of text or after whitespace opens a
   listbox when media exist.
3. The listbox is anchored to the textarea's bottom-start edge through the existing floating-panel
   utility. The first version does not perform fragile caret-pixel measurement.
4. Query matching checks generated token number and media label.
5. Arrow Up/Down changes the active enabled item; Enter or Tab accepts it; Escape closes the list.
6. Pointer selection prevents the textarea from losing focus.
7. Selection replaces only the active `@query` range with `[Image n]`, preserves text before and
   after the range, restores focus, and places the caret immediately after the token.
8. No space is appended, allowing direct continuation such as `[Image 1]中身着...`.
9. If the complete token would exceed `maxlength`, no partial token is inserted.
10. IME intermediate values never open the list or emit a malformed controlled value.

The textarea exposes `aria-expanded`, `aria-controls`, and `aria-activedescendant` while the menu is
open. The listbox and options include stable SSR-safe IDs and localized accessible names.

### Removal and index safety

Media array order is the only numbering source. Drag reordering is not part of this phase. Removal
emits intent but does not mutate the controlled array or prompt automatically.

The package exports a pure `reindexOReferenceTextareaTokens(value, removedIndex)` helper for
consumers that remove an item. `removedIndex` is zero-based, matching the emitted array index. The
helper removes exact tokens for that item and decrements higher numbered tokens, leaving lower tokens
and unrelated text unchanged. The VitePress demo uses this helper so a middle removal never makes
`[Image n]` silently point at the wrong image.

## VitePress Capability Coverage

### Field and Select pages

- Input, Textarea, and Select demonstrate soft default and explicit outline variants;
- rest, hover, focus, invalid, readonly, disabled, light, dark, and compact layouts are visible;
- Select demonstrates selected, clearable, open, empty, disabled-option, long-label, RTL, and
  virtualized states;
- computed-style browser tests protect trigger start/end reservation, option padding, typography,
  coarse-pointer height, and the single trailing rail.

### Message page

- automatic messages disappear without cleanup controls;
- only one persistent example remains;
- hover pause is demonstrated as opt-in;
- declarative `OMessage` is explicitly described as static and controlled;
- light/dark, status icons, stacking, long copy, close handles, and `closeAll()` remain covered.

### Reference Textarea page

At least three visible demonstrations are provided:

1. complete image-strip, upload, preview, and `@` insertion workflow;
2. controlled removal and token reindexing;
3. readonly, disabled, maximum-count, dark-theme, and narrow-layout states.

Examples use local raster assets rather than handwritten data-URI SVG. The page explains that
`media` order and `[Image n]` numbering are identical and shows the Bailian-style Chinese prompt.

## Testing and Package Integration

### Focused unit tests

- Button default size and explicit font sizes;
- every field variant vocabulary, default, DOM class, and state styling hook;
- Input Group composition with soft and outline controls;
- Select start/end spacing hooks, single trailing rail, clear replacement, RTL, keyboard behavior,
  virtual list, and coarse-pointer contract;
- Message lifecycle changes described above;
- Reference media numbering, upload selection, same-file reselection, drag/drop, maximum count,
  remove intent, pure reindex helper, image preview composition, mention filtering and navigation,
  exact insertion range, caret restoration, IME, maxlength, disabled/readonly, duplicate IDs, and
  controlled-value rejection.

### SSR and package tests

- all new variants and Reference media types compile from root and subpath exports;
- Reference setup never reads `window`, `document`, `File`, or `URL` during SSR;
- closed mention markup and the media strip render stable IDs;
- declarations contain no accidental internal or Reka type leakage;
- the real packed consumer imports the new types and helper and renders every changed public family.

### Browser tests

- exact compact Button and demo typography;
- field state surfaces in light and dark themes;
- Select geometry, clear rail, keyboard behavior, popup alignment, RTL, virtualization, and axe;
- automatic Message removal and persistent opt-in;
- real file selection, `@` selection of the second image, exact `[Image 2]` text, removal reindexing,
  OImage preview, responsive media strip, and axe for Reference Textarea.

The final gate is `pnpm verify`, followed by a visual browser pass of the affected VitePress pages.

## Non-Goals

- No Tailwind migration, Material dependency, Roboto dependency, or Material component wrapper.
- No VitePress brand-variable override.
- No business upload, media persistence, request construction, retry, validation policy, or API
  invocation inside Reference Textarea.
- No generic member/file mention protocol, rich-text editor, contenteditable token chip, inline image
  inside the native text value, caret-pixel popup positioning, or drag reordering.
- No second Message timer inside `OMessage` and no Provider/plugin requirement.
- No rewrite of Image's independent Teleport preview, Tabs slider motion, Upload behavior, or Code
  Input's purpose-specific border presentation.
- No compatibility aliases for the obsolete Reference Textarea contract.
