# Remote Widget Integration and Border Budget Design

## Context

Remote `main` adds six commits from `39eb0dd` through `1a43e4a`. Together they introduce `OWidget`, replace emoji icons with `vue-icons-plus/lu`, import its styles, add a frosted surface, remove two ordinary container borders, refine its icon circle, and enlarge its title. The remote work is intentional personal-library UI and must be integrated without turning Widget into a generic Card or rewriting its approved effect.

The user selected the semantic border budget approach: borders are kept only when they communicate an input boundary, state, focus, separation, or otherwise unavailable hierarchy.

## Protected Remote Visuals

The following Widget behavior is the visual source of truth:

- fixed `160px × 130px` compact footprint;
- `35px` outer radius and no outer card border;
- 55% translucent surface, 20px backdrop blur, and diagonal highlight layer;
- four-quadrant icon, title, value/unit, and mini-chart composition;
- circular icon container, medium-size muted title, and 22px value;
- brand-color sparkline with area fade and a two-row activity-dot visualization;
- direct named Lucide imports and a 4px demo grid gap.

Correctness and restrained border changes may not remove or replace these effects.

## Border Budget

This integration removes exactly four redundant visible borders:

1. `OUpload` file rows keep their muted background, radius, spacing, state tint, and progress fill but no ordinary outline.
2. `ODropdown` floating panels keep their surface and semantic shadow but no duplicate panel outline.
3. `OSelect` floating panels keep their surface and semantic shadow but no duplicate panel outline.
4. `OWidget` keeps the circular icon composition but replaces its 1px ring with a quiet translucent tonal fill.

The following borders remain protected:

- Input, Textarea, Code Input, Select trigger, Dropdown trigger, Checkbox, and Radio control boundaries;
- focus, invalid, drag-active, disabled, and selected state changes;
- Upload dropzone dashed affordance;
- Divider lines and divided Dropdown items;
- Tabs line baseline and the remote-approved slider indicator outline;
- Avatar outer separation, stacked-avatar separation, status rings, and status symbols;
- Button outline variant and transparent geometry-preserving borders;
- explicit `border: 0` resets on Dialog and native controls.

No other component receives a visual redesign in this pass.

## OWidget Public Contract

`OWidget` remains a display-only personal component with no requests, timers, persistence, or business state.

Its public props are:

```ts
interface OWidgetProps {
  readonly title: string
  readonly value: string | number
  readonly unit?: string
  readonly chartType?: 'line' | 'activity'
  readonly chartData?: readonly number[]
  readonly chartAriaLabel?: string
}
```

`#icon` and `#chart` return `VNodeChild`. The default icon remains `LuBarChart3`. Default charts use `chartAriaLabel` as `role="img"` and an accessible name when provided; otherwise they are explicitly decorative. A custom `#chart` slot owns its own semantics.

Line charts ignore non-finite points and avoid spread-based min/max calculation. They render only when at least two finite points remain. Activity charts render at most the documented two weeks (14 points), preventing later points from overlapping the second row.

Title and value cells receive minimum-size and overflow constraints so personal labels cannot escape the fixed card. Normal examples retain the same appearance.

## Visualization SVG Rule

The project continues to forbid handwritten icon SVG. Widget's two inline SVG elements are data visualizations, not icons. They receive a dedicated `data-omg-visualization` marker, and the naming checker allows inline SVG only when that exact marker is present. The exception stays narrow; unmarked SVG and raw SVG assets remain forbidden.

## Package and Documentation Integration

Widget becomes a complete public component:

- root export and `@puzzle-fuzzy/ui/widget` subpath;
- Vite library entry, declarations, stylesheet import, package contract, attw list, and real consumer smoke usage;
- naming contract entry;
- VitePress alias, sidebar, example, and corrected `160 × 130 / 35px` documentation;
- public README and design-system records;
- no emoji used as documentation icons.

## Verification

- Unit tests cover runtime/type vocabularies, slots, finite line data, the 14-point activity ceiling, chart semantics, and long-content structure.
- Style tests lock the four approved border removals and representative required borders.
- SSR renders Widget with stable visualization IDs and no DOM globals.
- Browser tests verify 160 × 130 geometry, 35px radius, borderless glass surface, tonal icon circle, visible chart, text, and accessibility.
- Package tests prove root and subpath imports, emitted files, declarations, publint, attw, and consumer build.
- Full formatting, lint, stylelint, naming, typecheck, coverage, build, SSR, package, docs, and Playwright checks pass.

## Non-Goals

- No removal of the Widget frosted-glass or highlight effect.
- No conversion to a generic Card, chart package, or dashboard business component.
- No changes to approved Tabs motion or Image preview architecture.
- No blanket border reset and no removal of state/focus/form boundaries.
- No compatibility aliases, CommonJS entry, new dependency, or package-manager migration.
