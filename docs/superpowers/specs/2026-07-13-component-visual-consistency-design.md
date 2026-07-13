# OMG UI component visual consistency design

## Context

The current component contracts are behaviorally sound, but several visual details are not isolated from host CSS or from third-party icon defaults:

- Radio still looks close to a browser-default control and lacks a stable state layer.
- `OButton` centers its content correctly, but icon slots allow `vue-icons-plus` to keep its default 24px SVG size. A 24px icon can make a 32px button grow and makes adjacent 12px text look optically misplaced.
- Accordion headers, Empty titles, and Card titles may render as `h3`. VitePress `.vp-doc h3` has higher specificity than their single-class component rules, so its 32px margin and typography leak into component surfaces.
- Basic Empty is a direct flex item in the documentation demo. Without an explicit inline size it collapses to min-content width and Chinese copy wraps one character per line.
- Message uses a separate loose flex treatment even though Alert already defines the stronger status-feedback rhythm.
- Select reserves a 32px desktop tail rail, while Dropdown uses a fixed 160px menu minimum. Both can create more apparent space at the logical end than the start.

## Goals

1. Make every affected component visually stable in VitePress and in arbitrary Vue consumers.
2. Keep existing public behavior and native semantics intact.
3. Preserve the compact OMG UI vocabulary: 4px spacing rhythm, restrained surfaces, purposeful borders, and `vue-icons-plus/lu` icons.
4. Improve desktop, touch, dark-theme, RTL, reduced-motion, and forced-colors behavior together.
5. Keep components UI-only. No request, persistence, confirmation, or business-state logic is added.

## Non-goals

- No compatibility aliases or legacy variants.
- No Radio card/tile API and no Toggle Group behavior.
- No shared public base component for Alert and Message.
- No global override of VitePress heading styles.
- No conversion of the Dialog close control to `OButton`; it remains a purpose-specific native button.

## Design

### Radio

The native radio and controlled Group data flow remain unchanged. The default visual is redesigned as a familiar compact product radio:

- 20px indicator with a 2px ring and 10px selected dot.
- A single `--omg-radio-accent` drives selected and invalid ring/dot color so mixed brand/danger states cannot occur.
- A centered state layer around the indicator communicates hover, active, and focus without turning the whole option into a card.
- Labels use a 32px desktop minimum row and center alignment; coarse pointers keep a 44px target.
- Vertical groups use an 8px rhythm. Horizontal groups use 8px row and 16px column gaps.
- Forced colors restores system outlines and selected fill; reduced motion removes dot and state-layer transitions.

No new public prop is needed. Documentation must show horizontal and vertical groups, checked, disabled, invalid, long label, and dark-theme states.

### Button icon and text geometry

Button text is already mathematically centered for Chinese and English. The fix is to own icon geometry:

- Introduce an internal `--omg-button-icon-size` token.
- Small and medium buttons use 16px icons; large buttons use 18px icons.
- The icon wrapper and its direct SVG use the token and render as a block.
- Spinner geometry stays aligned with the same size vocabulary.
- No `translateY` or language-specific optical correction is applied to text.

All ordinary Dialog, Confirm Dialog, and Form Dialog actions continue to use `OButton`. The native Dialog close button remains independent and keeps its existing named hit target.

### Host heading isolation

Component title/header rules use structural selectors with higher specificity than `.vp-doc h3`:

- Accordion item to Accordion header.
- Empty header to Empty title.
- Card copy to Card title.

Each contract resets margin, font size, line height, and letter spacing. Semantic heading elements remain intact. This solves the issue for VitePress and for other host systems without mutating normal documentation headings.

### Empty layout

`OEmpty` becomes an explicit full-inline-size empty-state surface. Its internal header, content, and actions keep their readable maximum width and centered alignment. This prevents min-content collapse when the component is a direct flex item, while still allowing a parent container to determine its actual available width.

### Message visual language

Message lifecycle, queueing, timers, roles, mounting, and motion are unchanged. Only the visual surface is refined:

- Use Alert's stable three-column rhythm: icon, `minmax(0, 1fr)` copy, optional close action.
- Preserve exact opaque surfaces: `#fff` in light theme and `#2d2d2d` in dark theme.
- Preserve the borderless Message shadow, physical top-right stacking, right-side entry, and top-right scale/fade exit.
- Put the status icon in a 28px semantic soft tile with a 16px Lucide icon. Status color remains concentrated in the icon area rather than tinting the whole Message.
- Use a 24px close control with a 16px icon, matching Alert's visual weight while retaining a 44px coarse-pointer hit area.
- Make content a small grid so custom slot blocks such as `strong` and `span` form a readable vertical hierarchy.

Message does not gain title, description, or action props and does not compose `OAlert`.

### Dropdown and Select spacing

Both controls keep a stable tail action area so indicators and clear actions never move text.

- Desktop Select tail rail changes from a hard-coded 32px to a named 28px internal rail; the 16px indicator is centered inside it and the 24px clear action fits without shifting content.
- Coarse pointers retain the real 44px action rail.
- Dropdown adopts the same 28px indicator rail when an indicator is present; indicator-free triggers retain ordinary 12px inline padding.
- Dropdown panel matches at least the trigger width instead of enforcing a fixed 160px minimum. Long content may expand it, while short menus no longer create an unnecessary empty tail.
- Dropdown and Select keep 4px panel padding, 36px rows, and symmetric option padding. RTL uses logical properties throughout.

## Testing and documentation

Focused unit tests cover visual classes/tokens without replacing behavior tests. SSR tests continue to validate native elements and exports. VitePress examples document all changed states.

Playwright regression coverage must assert:

- Chinese and English Button text centers remain stable, and slotted icons are 16px/18px without changing nominal button height.
- Accordion, Empty, and Card headings have zero host margin and component-owned typography.
- Basic Empty occupies a useful width and does not wrap Chinese one character per line.
- Radio geometry, focus, invalid, dark, touch, RTL, reduced-motion, and forced-colors behavior.
- Message opaque surfaces, icon tile, close geometry, long copy, lifecycle, and motion.
- Dropdown short-menu width and Select/Dropdown tail rails in desktop, 390px, and RTL layouts.

The final gate remains `pnpm verify`, followed by live desktop and 390px visual inspection of every affected component page.
