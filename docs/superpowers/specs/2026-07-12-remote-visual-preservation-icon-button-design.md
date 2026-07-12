# Remote Visual Preservation and Icon Button Design

## Context

OMG UI is a personal Vue component library. Its standards exist to keep code understandable, publishable, and testable; they do not require every component to look generic or to depend on another public component. User-authored visual behavior is product intent and must survive integration unless it is demonstrably broken.

The remote `main` commit `8945652` restores the desired Tabs motion and refines Image preview sizing. The implementation must merge that work without discarding the locally completed form controls, virtualized Select, Upload fix, or icon system.

## Integration Rule

- Treat the remote Tabs visual behavior as the source of truth.
- Preserve the sliding indicator for both `slider` and `line` variants.
- Preserve `fill` mode and the remote examples and tests.
- Resolve only mechanical conflicts; do not redesign the effect during merge.
- Existing accessibility, package, SSR, and naming contracts remain in force when they do not change the approved visual behavior.

## OImage Architecture

`OImage` becomes self-contained again. It must not import or render `ODialog`.

The preview remains a `Teleport`-based overlay owned directly by `OImage`:

- the preview layer teleports to `body` only while it is open;
- the layer exposes dialog semantics with `role="dialog"` and `aria-modal="true"`;
- Escape closes the preview while focus is inside the layer;
- opening moves focus to the preview layer and closing restores focus to the image trigger;
- clicking the backdrop closes the preview, while clicking the rendered image does not;
- controlled component props still close the preview when previewing becomes unavailable;
- open and close events remain exactly `previewOpen` and `previewClose`;
- no business state, public overlay dependency, or external overlay manager is introduced.

The visual result follows remote commit `8945652`: an 80vw by 80dvh image ceiling, a dark `rgb(0 0 0 / 85%)` backdrop, no visible close button, no added zoom badge, and the existing mobile viewport reduction. The obsolete `closeAriaLabel` prop is removed because the self-contained preview exposes no close control.

## OButton Icon-Only Mode

`OButton` gains one boolean prop:

```ts
iconOnly: boolean // default false
```

When enabled:

- the button remains the same native `<button>` and keeps `variant`, `tone`, `size`, `loading`, `disabled`, and `type` behavior;
- inline size equals the existing control height for `sm`, `md`, and `lg`;
- padding and content gap collapse so the button is square;
- loading replaces the icon with the existing `LuLoader2` spinner;
- `#icon` remains the visual icon source and is hidden from the accessibility tree;
- default-slot text remains in the accessibility tree but becomes visually hidden in icon-only mode;
- consumers may instead pass an accessible name through native `aria-label` or `aria-labelledby`.

The component does not add an icon-name prop, icon registry, circular variant, tooltip, badge, or new `OIconButton` wrapper.

## Personal Component Principle

Project guidance must state:

1. User-authored motion, layout, and visual identity are protected behavior.
2. A standards review may fix correctness and make restrained visual adjustments, but must not replace an approved effect without explicit direction.
3. Personal, frequently reused, or stylistically specific components are valid public components even when they are not generic market primitives.
4. Public-component reuse is optional. A component should remain self-contained when reuse creates coupling without a clear user-facing benefit.
5. Tests should describe the intended effect so later refactors preserve it.

## Verification

- Merge history contains both local work and remote commit `8945652`.
- Tabs unit and browser tests prove the indicator changes position rather than swapping static active styles, and `fill` distributes tabs evenly.
- Image unit, SSR, and browser tests prove it has no `ODialog` dependency and retains modal preview behavior.
- Button unit and browser tests cover slot fallback, square sizing, loading, disabled state, and accessible naming.
- Package build, all public subpaths, docs build, naming checks, coverage, SSR, and package-consumer smoke tests pass.

## Non-Goals

- No redesign of remote Tabs or Image visuals.
- No migration away from pnpm, Vite, Vue, Vitest, or Playwright.
- No compatibility aliases or deprecated APIs.
- No rule that future components must be generic, business-neutral market primitives; only shared library code must remain free of application-specific side effects.
