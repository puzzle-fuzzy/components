---
name: OMG UI
description: A restrained and precise Vue 3 component system for consistent personal products.
colors:
  focused-blue: '#1d4ed8'
  focused-blue-hover: '#1e40af'
  focused-blue-dark: '#7da2ff'
  on-focused-blue: '#ffffff'
  light-surface: '#ffffff'
  light-surface-muted: '#eef2f7'
  dark-surface: '#141821'
  dark-surface-muted: '#242936'
  light-ink: '#273040'
  light-ink-muted: '#475467'
  dark-ink: '#f4f6fb'
  dark-ink-muted: '#d9dee9'
  danger: '#d92d20'
  success: '#067647'
  warning: '#dc6803'
typography:
  title:
    fontSize: '18px'
    fontWeight: 650
    lineHeight: 1.25
  body:
    fontSize: '14px'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontSize: '12px'
    fontWeight: 650
    lineHeight: 1.2
rounded:
  sm: '6px'
  md: '8px'
  lg: '12px'
  full: '999px'
spacing:
  1: '4px'
  2: '8px'
  3: '12px'
  4: '16px'
  5: '20px'
  6: '24px'
components:
  button-solid:
    backgroundColor: '{colors.focused-blue}'
    textColor: '{colors.on-focused-blue}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
    height: '38px'
  button-soft:
    backgroundColor: '#1d4ed81f'
    textColor: '{colors.focused-blue}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
    height: '38px'
  code-field:
    backgroundColor: '{colors.light-surface}'
    textColor: '{colors.light-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    width: '40px'
    height: '48px'
  avatar:
    backgroundColor: '{colors.light-surface-muted}'
    textColor: '{colors.light-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.full}'
    width: '40px'
    height: '40px'
  dropdown-trigger:
    backgroundColor: '{colors.light-surface}'
    textColor: '{colors.light-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '0 12px'
    height: '38px'
  floating-panel:
    backgroundColor: '{colors.light-surface}'
    textColor: '{colors.light-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '4px'
  select-control:
    backgroundColor: '{colors.light-surface}'
    textColor: '{colors.light-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '0 12px'
    height: '38px'
  input-field:
    backgroundColor: '{colors.light-surface}'
    textColor: '{colors.light-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '0 12px'
    height: '38px'
  checkbox-control:
    backgroundColor: '{colors.light-surface}'
    textColor: '{colors.light-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.sm}'
    width: '20px'
    height: '20px'
  radio-control:
    backgroundColor: '{colors.light-surface}'
    textColor: '{colors.light-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.full}'
    width: '20px'
    height: '20px'
  dialog-surface:
    backgroundColor: '{colors.light-surface}'
    textColor: '{colors.light-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '20px'
  confirm-dialog-surface:
    backgroundColor: '{colors.light-surface}'
    textColor: '{colors.light-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '20px'
  form-dialog-surface:
    backgroundColor: '{colors.light-surface}'
    textColor: '{colors.light-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '20px'
  textarea-field:
    backgroundColor: '{colors.light-surface}'
    textColor: '{colors.light-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '12px'
  tabs-control:
    backgroundColor: '{colors.light-surface-muted}'
    textColor: '{colors.light-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '4px'
  upload-dropzone:
    backgroundColor: '{colors.light-surface-muted}'
    textColor: '{colors.light-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '20px'
  widget:
    backgroundColor: '{colors.light-surface}'
    textColor: '{colors.light-ink}'
    typography: '{typography.body}'
    rounded: '35px'
    padding: '16px'
    width: '160px'
    height: '130px'
---

# Design System: OMG UI

## Overview

**Creative North Star: "The Precision Workbench"**

OMG UI behaves like a carefully organized workbench: every control has one job, every state is visible, and every reusable part fits the same measuring system. The visual language is restrained and familiar so developers can compose product interfaces without relearning standard affordances.

Precision does not mean sterility. Compact spacing, quiet surfaces, sharp focus treatment, and short state-driven motion create a responsive feel without decoration. Components inherit the host project's font and use scoped OMG tokens, allowing the library to remain recognizable without taking ownership of the consuming product's brand.

This is a personal workbench, not a catalogue of generic market primitives. Approved motion, layout, and visual effects are product behavior. Frequently reused personal patterns and stylistically specific components belong in the library when they improve the owner's projects; engineering standards keep them understandable and reliable without sanding away their identity.

The system rejects business logic inside primitives, copied framework aesthetics, gratuitous states, exaggerated shadows, unrequested motion, fragmented icon sources, and documentation styles that leak into component tokens.

**Key Characteristics:**

- Restrained blue accent on active, selected, and focused states.
- Compact 4px spacing rhythm with 6px, 8px, and 12px structural radii.
- Familiar controls with explicit keyboard, focus, disabled, and reduced-motion behavior.
- Theme-aware semantic tokens instead of page-specific values.
- Protected personal effects over generic redesigns.
- Deliberate composition without forced public-component coupling.

## Colors

Focused Blue provides one clear accent while slate surfaces and ink roles carry nearly all interface structure.

### Primary

- **Focused Blue** (`#1d4ed8`): primary actions, active selections, focus borders, and visual progress in the light theme.
- **Focused Blue Hover** (`#1e40af`): interactive hover feedback for solid brand controls.
- **Focused Blue Dark** (`#7da2ff`): the dark-theme accent, raised in lightness to preserve contrast on Midnight Surface.

### Neutral

- **Clear Surface** (`#ffffff`) and **Quiet Surface** (`#eef2f7`): light-theme controls and secondary layers.
- **Midnight Surface** (`#141821`) and **Midnight Raised** (`#242936`): dark-theme controls and muted layers.
- **Slate Ink** (`#273040`) and **Slate Muted** (`#475467`): light-theme primary and secondary text.
- **Cloud Ink** (`#f4f6fb`) and **Cloud Muted** (`#d9dee9`): dark-theme primary and secondary text.

### Tertiary

- **Clear Danger** (`#d92d20`): destructive actions and invalid borders.
- **Clear Success** (`#067647`): successful or online status.
- **Clear Warning** (`#dc6803`): warning and away status.

### Named Rules

**The One Accent Rule.** Focused Blue is reserved for action, focus, selection, and progress; it is never background decoration.

**The Semantic Theme Rule.** Components consume `--omg-color-*` roles and never branch on theme names inside component markup.

## Typography

**Display Font:** inherited from the consuming Vue application

**Body Font:** inherited from the consuming Vue application

**Character:** OMG UI is typography-neutral by design. It uses a compact product scale, tabular numerals where alignment matters, and weight rather than a second font family to communicate hierarchy.

### Hierarchy

- **Title** (650, 18px, 1.25): compact component headings in documentation and composed surfaces.
- **Body** (400, 14px, 1.5): labels, option text, descriptions, and control content; prose should remain within 65 to 75 characters per line.
- **Label** (650, 12px, 1.2): compact status and metadata labels.
- **Avatar Initials** (750, 10px to 24px, 1): size-coupled identity marks with uppercase fallback text.

### Named Rules

**The Host Typeface Rule.** The library always uses `font: inherit` or `font-family: inherit`; it never ships a display font or overrides the consumer's typography stack.

## Elevation

OMG UI is flat by default. Surface tone, spacing, and one purposeful elevation layer define most structure. Borders are a limited resource for input boundaries, states, focus, true separators, or hierarchy that has no quieter substitute. Modal Dialog is the deliberate exception: its borderless top-layer surface uses one wider semantic shadow to separate it from the backdrop without adding an outline.

### Shadow Vocabulary

- **Light Structural** (`0 1px 2px rgb(15 23 42 / 10%)`): subtle separation on light surfaces.
- **Dark Structural** (`0 1px 2px rgb(0 0 0 / 26%)`): equivalent separation on dark surfaces.
- **Light Dialog** (`0 24px 64px rgb(15 23 42 / 24%), 0 8px 24px rgb(15 23 42 / 14%)`): modal-only top-layer separation.
- **Dark Dialog** (`0 24px 64px rgb(0 0 0 / 52%), 0 8px 24px rgb(0 0 0 / 32%)`): modal-only dark-theme separation.

### Named Rules

**The Purposeful Elevation Rule.** Controls and ordinary floating panels use the compact structural shadow. Only native modal Dialog may use the wider `--omg-shadow-dialog`; decorative card shadows remain prohibited.

**The Portal Surface Rule.** Menus and listboxes use fixed positioning through a portal so overflow containers cannot clip them.

**The Border Budget Rule.** Cards, list rows, and floating panels use surface, spacing, or one shadow before a border. A border exists only for an input boundary, state, focus, separator, or irreplaceable layer distinction.

## Icons

`vue-icons-plus/lu` is the only icon source for component code and documentation examples. Icons remain direct named imports so bundlers can tree-shake them; the library does not expose a pass-through icon wrapper.

- Decorative icons use `aria-hidden="true"`; the native control keeps the accessible name.
- Checkbox check/mixed marks, Input clear/password controls, Upload actions and states, Select indicators, Dialog close, Button icons, and loading feedback all use Lucide Vue components.
- Avatar status marks, Avatar Flow connectors, Tabs indicators, Divider lines, and progress geometry are CSS state shapes rather than icons.
- Widget sparklines and activity points are marked data visualizations, not icons; they may use controlled inline SVG with explicit accessibility semantics.
- Unmarked handwritten template SVG, raw SVG assets, second icon libraries, and icon-only controls without a name are prohibited.

## Scrolling and Large Collections

Scrolling follows semantics instead of applying virtualization to every overflow container.

- **Select:** fixed-height option collections use `vue-virtual-scroller` only after the normalized threshold is reached. Smaller collections keep direct DOM rendering.
- **Textarea:** the real textarea remains the editor and scroll container. Fixed mode scrolls internally; autosize grows with content and resumes scrolling only at `maxRows`.
- **Upload:** the file list is height-bounded but remains complete in the accessibility tree because every row can own a focusable remove action.
- **Dialog, Dropdown, Tabs, and references:** arbitrary slot content and short focus-owned collections remain complete DOM.

All native and virtual viewports share a quiet tokenized scrollbar treatment. Virtualization must never break focus ownership, IME, text selection, native validation, or screen-reader access.

## Components

### Buttons

- **Shape:** gently curved control corners (8px) with compact heights of 32px, 38px, and 46px.
- **Primary:** Focused Blue background, on-brand text, 8px by 16px medium padding, and semibold inherited type.
- **Hover / Focus:** 160ms semantic color transition, a visible 3px focus ring with 2px offset, and a restrained 1px active translation.
- **Soft / Outline / Ghost:** preserve the same geometry and use tint, border, or transparent surfaces instead of inventing new control shapes.
- **Icon Only:** the same 32px, 38px, or 46px height becomes the square inline size; the icon is decorative and the native button must retain an accessible name.

### Cards / Containers

- **Corner Style:** compact 8px or 12px corners; full pills are limited to circular status and identity shapes.
- **Background:** semantic surface and muted-surface tokens in both themes.
- **Shadow Strategy:** flat at rest unless the element floats over another surface.
- **Border:** absent by default when surface, spacing, or elevation already separates the container; otherwise one 1px semantic border.
- **Internal Padding:** multiples of the 4px spacing base, most often 8px, 12px, or 16px.

### Inputs / Fields

- **Style:** 1px semantic border, 8px radius, inherited type, and a surface background.
- **Focus:** border changes are immediate and legible; Code Input uses a 2px Focused Blue border without glow or box shadow.
- **Error / Disabled:** danger border for invalid input; disabled opacity is 0.56 with a non-interactive cursor.
- **Input:** single-line controls retain the real input, controlled-value rejection, IME commitment, autocomplete, prefix/suffix composition, clear action, and optional password visibility.
- **Checkbox / Radio:** selection mirrors a real native input. Checkbox mixed state and Radio Group naming remain SSR-safe; CSS or Lucide marks never replace native semantics.
- **Textarea:** native form attributes and events belong to the real textarea; native resize is always disabled. Fixed rows scroll internally, while `autosize` can grow freely or clamp between `minRows` and `maxRows`.
- **Reference Textarea:** references are controlled visual items supplied by consumers. The component never parses member syntax, image syntax, URLs, or other domain protocols.

### Navigation

- **Style:** standard button, menu, combobox, listbox, and option semantics are preserved. Active and selected states use Focused Blue or a quiet neutral tint.
- **Keyboard:** familiar Arrow, Home, End, Enter, Space, Escape, and Tab behavior is part of the visual component contract.
- **Responsive treatment:** components use intrinsic sizing, logical properties, and container-aware spacing instead of fluid typography.
- **Dropdown:** a 38px bordered menu button opens a borderless portal surface with one structural shadow, 36px minimum action rows, disabled-item skipping, danger tone, and focus restoration.
- **Select:** a 180px minimum bordered combobox keeps focus on its trigger; its borderless portal surface uses one structural shadow, exposes active options through `aria-activedescendant`, and virtualizes fixed-height rows only for large collections.
- **Portal context:** a floating surface mirrors local theme, language, direction, typography, and divergent `--omg-*` overrides while leaving root tokens naturally inherited. Native dialog/top-layer compositions use `teleported="false"` or an in-layer `teleportTo` target.

### Avatar and Avatar Flow

- **Avatar:** 24px to 72px sizes, circular by default, with 8px rounded and 6px square alternatives. Status uses both color and a distinct internal symbol.
- **Avatar Group:** overlap is a scoped CSS variable so composition controls spacing without changing individual avatars.
- **Avatar Flow:** exactly three visual connector states. Loading dots scale in place, connected is a static line, and transferring is a moving dashed line.
- **Avatar Dropdown:** a thin composition keeps Avatar pure while the Dropdown shell owns the native button, menu semantics, indicator, and focus behavior.

### Widget

- **Identity:** a protected personal component rather than a generic Card. Its fixed 160×130px four-quadrant composition uses a 35px radius, 55% translucent surface, 20px backdrop blur, and diagonal highlight.
- **Content:** Lucide icon at top left, compact title at top right, 22px value and unit at bottom left, and a brand sparkline or two-row activity visualization at bottom right.
- **Border treatment:** the glass surface has no outer border. The circular icon container uses a quiet tonal fill without a ring.
- **Semantics:** title and value remain text; a default chart is decorative unless `chartAriaLabel` supplies its accessible meaning. Data retrieval and business interpretation stay outside.

### Dialog, Image, Tabs, and Upload

- **Dialog:** uses the native `<dialog>` top layer for modal focus, background inertness, Escape ordering, and scroll behavior. Its borderless surface keeps a 12px radius and uses the dedicated dialog shadow.
- **Confirm Dialog:** composes Dialog and Button. Confirm emits intent without closing; cancel requests a controlled close. Danger tone adds a standard warning icon while keeping the safe cancel action as initial focus.
- **Form Dialog:** connects an SSR-safe native form to its footer submit button. Native validation runs before the raw `SubmitEvent` is emitted; serialization, error mapping, and persistence stay outside.
- **Image:** a native image remains non-interactive unless preview is enabled. A named button opens the component's own Teleport preview layer, keeping the remote-approved dark, close-button-free presentation without coupling Image to Dialog.
- **Tabs:** one enabled tab remains in the tab order, selection is tracked by stable values, and optional panels are linked with deterministic IDs. The measured sliding indicator, line treatment, and fill layout are protected component effects.
- **Upload:** a hidden native input is a sibling of the selection label, preventing recursive picker activation; resetting it permits same-file reselection. The dropzone retains its dashed affordance, while muted file rows need no duplicate outline. Requests, validation policy, retries, and persistence remain outside.

### Code Input and Divider

- **Code Input:** fields are taller than wide at 32×40px, 40×48px, or 48×56px. Focus is border-only.
- **Divider:** a single semantic line with optional content; dashed and vertical variants retain the same one-pixel visual weight.

## Do's and Don'ts

### Do:

- **Do** express reusable visual and interaction behavior while leaving requests, routing, permissions, countdowns, and state mapping to consumers.
- **Do** use one `O*` name, one `.o-*` class vocabulary, and one `--omg-*` token source for each concept.
- **Do** use `vue-icons-plus/lu` for every built-in and documentation icon.
- **Do** virtualize only fixed-row collections large enough to benefit, and preserve native editing or complete focusable lists elsewhere.
- **Do** verify keyboard focus, ARIA, contrast, SSR, dark theme, and `prefers-reduced-motion` for every interactive component.
- **Do** keep control motion at 160ms for direct feedback and 240ms or less for larger state changes.
- **Do** treat user-approved motion, layout, and visual identity as tested behavior during reviews and merges.
- **Do** allow personal, high-frequency, or stylistically specific public components when they are valuable to the owner's projects.
- **Do** share internal foundations when they reduce real duplication; keep a component self-contained when public composition adds coupling without a user-facing benefit.
- **Do** spend borders on form boundaries, state, focus, and real separation; prefer surface, spacing, or one shadow for ordinary layers.

### Don't:

- **Don't** put remote requests, countdowns, permissions, routing, or business-state mapping inside foundational components.
- **Don't** add complex decoration, exaggerated shadows, unrequested motion, or extra states that dilute an approved effect.
- **Don't** copy the appearance or API of Element Plus, Naive UI, or another framework; only adopt proven architecture, accessibility, and release practices.
- **Don't** use multiple icon sources, copied SVG assets, or a pass-through `OIcon` layer.
- **Don't** replace an approved effect with a generic alternative merely to resemble another component library.
- **Don't** reject a useful personal component because it is not a conventional market primitive.
- **Don't** combine a decorative border with a surface or shadow that already communicates the same boundary.
- **Don't** override `--vp-c-brand-*` or allow VitePress theme values to become component tokens.
- **Don't** preserve pre-release compatibility aliases, private branches, CommonJS, or UMD entries.
- **Don't** add borders to Dialog surfaces, decorative card shadows, unrequested oversized radii, or color-only status signals; protected personal components such as Widget may keep their deliberate geometry.
