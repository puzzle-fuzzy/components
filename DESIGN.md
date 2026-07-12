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
---

# Design System: OMG UI

## Overview

**Creative North Star: "The Precision Workbench"**

OMG UI behaves like a carefully organized workbench: every control has one job, every state is visible, and every reusable part fits the same measuring system. The visual language is restrained and familiar so developers can compose product interfaces without relearning standard affordances.

Precision does not mean sterility. Compact spacing, quiet surfaces, sharp focus treatment, and short state-driven motion create a responsive feel without decoration. Components inherit the host project's font and use scoped OMG tokens, allowing the library to remain recognizable without taking ownership of the consuming product's brand.

The system rejects business logic inside primitives, copied framework aesthetics, gratuitous states, exaggerated shadows, bounce motion, fragmented icon sources, and documentation styles that leak into component tokens.

**Key Characteristics:**

- Restrained blue accent on active, selected, and focused states.
- Compact 4px spacing rhythm with 6px, 8px, and 12px structural radii.
- Familiar controls with explicit keyboard, focus, disabled, and reduced-motion behavior.
- Theme-aware semantic tokens instead of page-specific values.
- Composition over compatibility layers or premature public abstractions.

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

OMG UI is flat by default. Borders and tonal surface changes define structure; a compact one-step shadow is reserved for solid controls, avatars, and floating surfaces where separation from surrounding content is functional.

### Shadow Vocabulary

- **Light Structural** (`0 1px 2px rgb(15 23 42 / 10%)`): subtle separation on light surfaces.
- **Dark Structural** (`0 1px 2px rgb(0 0 0 / 26%)`): equivalent separation on dark surfaces.

### Named Rules

**The Eight-Pixel Ceiling Rule.** Component shadows never exceed an 8px blur; wide ambient ghost-card shadows are prohibited.

**The Portal Surface Rule.** Menus and listboxes use fixed positioning through a portal so overflow containers cannot clip them.

## Components

### Buttons

- **Shape:** gently curved control corners (8px) with compact heights of 32px, 38px, and 46px.
- **Primary:** Focused Blue background, on-brand text, 8px by 16px medium padding, and semibold inherited type.
- **Hover / Focus:** 160ms semantic color transition, a visible 3px focus ring with 2px offset, and a restrained 1px active translation.
- **Soft / Outline / Ghost:** preserve the same geometry and use tint, border, or transparent surfaces instead of inventing new control shapes.

### Cards / Containers

- **Corner Style:** compact 8px or 12px corners; full pills are limited to circular status and identity shapes.
- **Background:** semantic surface and muted-surface tokens in both themes.
- **Shadow Strategy:** flat at rest unless the element floats over another surface.
- **Border:** 1px semantic border or border-subtle role.
- **Internal Padding:** multiples of the 4px spacing base, most often 8px, 12px, or 16px.

### Inputs / Fields

- **Style:** 1px semantic border, 8px radius, inherited type, and a surface background.
- **Focus:** border changes are immediate and legible; Code Input uses a 2px Focused Blue border without glow or box shadow.
- **Error / Disabled:** danger border for invalid input; disabled opacity is 0.56 with a non-interactive cursor.

### Navigation

- **Style:** standard button, menu, combobox, listbox, and option semantics are preserved. Active and selected states use Focused Blue or a quiet neutral tint.
- **Keyboard:** familiar Arrow, Home, End, Enter, Space, Escape, and Tab behavior is part of the visual component contract.
- **Responsive treatment:** components use intrinsic sizing, logical properties, and container-aware spacing instead of fluid typography.

### Avatar and Avatar Flow

- **Avatar:** 24px to 72px sizes, circular by default, with 8px rounded and 6px square alternatives. Status uses both color and a distinct internal symbol.
- **Avatar Group:** overlap is a scoped CSS variable so composition controls spacing without changing individual avatars.
- **Avatar Flow:** exactly three visual connector states. Loading dots scale in place, connected is a static line, and transferring is a moving dashed line.

### Code Input and Divider

- **Code Input:** fields are taller than wide at 32×40px, 40×48px, or 48×56px. Focus is border-only.
- **Divider:** a single semantic line with optional content; dashed and vertical variants retain the same one-pixel visual weight.

## Do's and Don'ts

### Do:

- **Do** express reusable visual and interaction behavior while leaving requests, routing, permissions, countdowns, and state mapping to consumers.
- **Do** use one `O*` name, one `.o-*` class vocabulary, and one `--omg-*` token source for each concept.
- **Do** use `vue-icons-plus/lu` for every built-in and documentation icon.
- **Do** verify keyboard focus, ARIA, contrast, SSR, dark theme, and `prefers-reduced-motion` for every interactive component.
- **Do** keep control motion at 160ms for direct feedback and 240ms or less for larger state changes.
- **Do** reuse shared internal interaction foundations before exposing a new public primitive.

### Don't:

- **Don't** put remote requests, countdowns, permissions, routing, or business-state mapping inside foundational components.
- **Don't** use complex decoration, exaggerated shadows, bounce motion, or extra states that add visual noise.
- **Don't** copy the appearance or API of Element Plus, Naive UI, or another framework; only adopt proven architecture, accessibility, and release practices.
- **Don't** use multiple icon sources, copied SVG assets, or a pass-through `OIcon` layer.
- **Don't** override `--vp-c-brand-*` or allow VitePress theme values to become component tokens.
- **Don't** preserve pre-release compatibility aliases, private branches, CommonJS, or UMD entries.
- **Don't** pair a one-pixel border with a decorative shadow wider than 8px, over-round controls beyond 12px, or use color as the only status signal.
