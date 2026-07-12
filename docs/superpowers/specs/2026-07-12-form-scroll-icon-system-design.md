# Form, Scroll, and Icon System Design

## Status

Approved through the standing instruction to use the recommended approach without additional confirmation.

## Goal

Extend OMG UI with a consistent icon policy, reliable file selection, semantic large-list virtualization, fixed and auto-growing textareas, borderless dialogs, and a minimal set of UI-only form and dialog components.

## Constraints

- Vue 3 is the only supported framework.
- Components contain UI state and interaction behavior only. Validation, requests, persistence, uploads, retries, and domain confirmation flows stay in consumer code.
- Built-in icons come only from `vue-icons-plus/lu`.
- `vue-virtual-scroller` is used only for collections whose DOM rows can be virtualized. It must not replace the native editing surface of `<textarea>` or arbitrary dialog slot content.
- Public names follow `O*`, CSS follows `.o-*`, and tokens follow `--omg-*`.
- The project is unpublished, so obsolete APIs may be replaced rather than deprecated.
- SSR, controlled-value rejection, keyboard interaction, reduced motion, and package subpath consumption remain first-class contracts.

## Approaches Considered

### 1. Semantic hybrid virtualization — selected

Keep native text and form controls, style their real scroll containers, and enable `vue-virtual-scroller` only for long Select collections. Upload keeps a bounded native list because every file row owns a focusable action. This preserves editing, focus, selection, IME, and ARIA behavior while reducing DOM cost where virtualization is materially useful.

### 2. Blanket virtualization

Wrap every overflowing component, including Textarea and Dialog, in a virtual scroller. This was rejected because a virtual list cannot represent a native text editing buffer or arbitrary slot tree, and recycled DOM would break focus and accessible ownership in several components.

### 3. Native scrolling only

Use styled native overflow everywhere and avoid a new dependency. This is the smallest option but does not address very large Select collections or the explicit virtual-scroller requirement.

## Architecture

The implementation has four independent layers:

1. Shared visual policy: one scrollbar mixin and one icon-source contract.
2. Native form controls: `OInput`, `OTextarea`, `OCheckbox`, `ORadio`, and `ORadioGroup` keep browser semantics and emit controlled values.
3. Collection virtualization: Select uses fixed-height `RecycleScroller` above a threshold. Interactive Upload rows remain native so every remove action stays reachable to keyboard and assistive technology.
4. Dialog composition: `OConfirmDialog` and `OFormDialog` compose `ODialog` and `OButton` without owning business state.

The root package exports every component and a matching subpath. Docs import source during development, while package tests validate built ESM and declaration output.

## Icon Policy

- Production component templates must not contain handwritten `<svg>` or raw `.svg` assets.
- Icons import from the tree-shakeable `vue-icons-plus/lu` entry.
- Decorative icons use `aria-hidden="true"`; controls keep their accessible names on the native button or input.
- Status geometry such as Avatar status dots, AvatarFlow lines, Tabs indicators, and content-image SVG data URLs are not icons and remain CSS/content assets.
- Existing improvements:
  - `OButton`: `LuLoader2` replaces the CSS-drawn loading ring.
  - `OImage`: `LuZoomIn` provides a visible preview affordance.
  - `OUpload`: `LuPlus`, `LuTrash2`, and state icons accompany persistent text.
  - `OReferenceTextarea`: `LuFileText` and `LuImage` cover references without thumbnails.
- New components:
  - `OInput`: `LuX`, `LuEye`, and `LuEyeOff`.
  - `OCheckbox`: `LuCheck` and `LuMinus`.
  - `OConfirmDialog`: `LuTriangleAlert` for danger confirmation.
  - Radio selection remains a CSS circle because a Lucide glyph is less legible at control size.

The naming check continues to reject inline template SVG, raw SVG files, alternate icon libraries, and non-`/lu` imports.

## Textarea and Scroll Behavior

`OTextarea` removes the old `resize: 'none' | 'vertical' | 'horizontal' | 'both'` contract. Native resize is always disabled, eliminating the bottom-right browser handle.

New contract:

```ts
interface OTextareaAutosizeOptions {
  readonly minRows?: number
  readonly maxRows?: number
}

interface OTextareaProps {
  readonly modelValue?: string
  readonly rows?: number
  readonly autosize?: boolean | OTextareaAutosizeOptions
  readonly maxlength?: number
  readonly showCount?: boolean
  readonly disabled?: boolean
  readonly readonly?: boolean
  readonly invalid?: boolean
  readonly ariaLabel?: string
}
```

- `autosize=false` keeps a fixed height derived from `rows` and uses native internal scrolling when content overflows.
- `autosize=true` grows from `rows` with content and does not show an internal scrollbar until a limit is supplied.
- `autosize={ minRows, maxRows }` clamps measured height. Once `maxRows` is reached, native scrolling resumes.
- The auto path uses modern CSS `field-sizing: content`, with tokenized row-height clamps. It therefore reacts to content and width changes without replacing the native editor or running measurement observers.
- The actual `<textarea>` remains the editing and scrolling element; this preserves selection, clipboard, spellcheck, mobile keyboards, and accessibility.
- A shared Less scrollbar mixin styles Textarea, Dialog body, native Select/Dropdown panels, and virtual collection viewports without changing their semantics.

## Virtualized Collections

The package adds `vue-virtual-scroller@^3.0.4` and bundles its required CSS into the library stylesheet.

### Select

New props:

```ts
virtual?: boolean // default true
virtualThreshold?: number // default 100
virtualListHeight?: number // default 288
```

- Below the normalized threshold, Select retains the current native rendered list.
- At or above the threshold, `RecycleScroller` renders fixed 36px rows with a stable value/index key and SSR prerendering.
- Keyboard navigation calls `scrollToItem(index, { align: 'nearest' })` before updating `aria-activedescendant`, so the active option exists in the rendered window.
- Each rendered option exposes `aria-setsize` and `aria-posinset` so assistive technology understands the complete collection.
- The combobox remains focused; recycled options are not independent tab stops.

### Components that remain native

Upload, Dropdown action menus, Tabs, reference chips, and arbitrary Dialog content are deliberately not virtualized. Upload rows contain focusable remove actions, so recycling would make part of the queue unreachable through sequential keyboard navigation and invisible to many screen readers. Upload instead receives a bounded native list viewport and the shared scrollbar styling; every file remains in the accessibility tree. The remaining components are expected to stay short or require complete focus/slot ownership.

## Upload File Selection

The current failure is caused by the hidden file input living inside a dropzone whose click handler calls `input.click()`. The generated input click bubbles back to the dropzone and retriggers file selection.

The corrected structure:

- keeps the native file input as a visually hidden sibling, not a descendant of the click target;
- associates the empty-state selection surface with the input using a stable `id` and native label behavior;
- uses the explicit “Add more files” button for subsequent selections;
- removes restrictive `accept` values from the basic docs demo so ordinary files can be selected;
- continues to emit native `File[]` through `select`, while display metadata stays controlled through `files`;
- resets the native input value after every change so the same file can be chosen twice;
- preserves `multiple`, `accept`, `maxCount`, disabled behavior, drag/drop, and keyboard operation.

## Native Form Components

### OInput

`OInput` is a controlled single-line native input with `text`, `password`, `email`, `search`, `tel`, and `url` types. It forwards native attrs and events to the real input, supports sizes `sm | md | lg`, disabled/read-only/invalid states, prefix and suffix slots, clearable behavior, and password visibility toggling. Its value remains a string. It emits `update:modelValue`, `focus`, `blur`, and `clear`.

### OCheckbox

`OCheckbox` keeps a real checkbox input and supports `modelValue`, `label`, `disabled`, `readonly`, `invalid`, and `indeterminate`. It emits `update:modelValue` and `change`. `LuCheck` and `LuMinus` are visual mirrors only; the native input owns checked and mixed semantics.

### ORadio and ORadioGroup

`ORadio` accepts `modelValue`, `value`, `label`, `name`, `disabled`, and `invalid`, with `string | number | boolean` values. It emits the selected value through `update:modelValue` and `change`.

`ORadioGroup` provides a controlled value, SSR-safe shared name, orientation, disabled state, and accessible label to slotted `ORadio` children inside `role="radiogroup"`. Native radio arrow-key behavior remains intact, and the group does not validate domain values.

## Dialog Components

### ODialog

The surface border is removed. Separation comes from backdrop contrast, radius, and a stronger semantic dialog shadow. Existing native `<dialog>`, focus containment, Escape, mask closing, controlled-state rejection, and scroll lock remain unchanged.

### OConfirmDialog

`OConfirmDialog` composes `ODialog` and exposes controlled `open`, title, description, `tone: 'neutral' | 'danger'`, confirm/cancel labels, loading, disabled, close rules, and default/details slots. It emits `update:open`, `confirm`, and `cancel`. Confirm never performs or assumes an operation; the consumer decides whether and when to close.

### OFormDialog

`OFormDialog` composes `ODialog`, a native `<form>`, and `OButton`. It exposes controlled `open`, title, description, submit/cancel labels, loading, submit-disabled state, and close rules. The default slot contains consumer-owned form controls. Native submit is prevented and emitted as `submit`; cancel emits `cancel` and requests close. Validation and data stay entirely outside the component.

## Visual Direction

The system remains refined and utilitarian: compact controls, quiet surfaces, strong focus treatment, restrained brand color, no decorative gradients, and no Dialog outline. Form controls share the same height, radius, border, typography, disabled opacity, invalid color, and focus ring tokens. Icons are functional and never replace necessary text.

## Error and Edge Cases

- Invalid numeric thresholds, row counts, and virtual heights normalize to safe positive values.
- Controlled form values are restored after the parent rejects or normalizes an emitted update.
- IME composition emits a committed value once.
- A disabled or read-only control cannot mutate through pointer or keyboard input.
- Empty virtual collections use existing empty slots without initializing unnecessary rows.
- Virtualized active options are scrolled into the render window before ARIA points to them.
- Upload ignores empty selections and enforces single/multiple and remaining-count limits before emission.
- Dialog variants remain open when a controlled parent rejects a close request.
- Reduced-motion removes loader rotation and panel transitions while retaining state clarity.

## Testing

- Unit tests cover public props/types/emits/slots, controlled rejection, IME, autosize clamping, focus, keyboard selection, disabled and invalid states, icon-source contracts, Upload click recursion, same-file reselection, and virtual/non-virtual branches.
- SSR tests render every new component, Textarea autosize markup, and prerendered virtual lists without DOM globals.
- Package tests import every root and subpath export from the packed tarball and render a Vue consumer.
- E2E tests cover real file selection, Textarea fixed/auto height, Input clear/password behavior, Checkbox/Radio keyboard behavior, Confirm/Form Dialog focus and submission, long Select virtualization, bounded Upload scrolling, reduced motion, and axe serious-impact violations.
- `pnpm verify` remains the final gate.
