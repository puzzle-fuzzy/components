# Reference Image Prompt Input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Breakingly rebuild `OReferenceTextarea` as a dedicated image-reference Prompt editor: controlled reference images appear above a native textarea, and `@` inserts exact Bailian-style `[Image n]` tokens into the prompt.

**Architecture:** `OReferenceTextarea` composes `OTextarea` for controlled editing, IME, autosize, form attrs, count, and field variants; it composes `OImage` per thumbnail so preview remains self-contained and Teleported. A new SSR-safe composable shares native file-picker limits and same-file reselection with `OUpload`. Internal pure token primitives drive detection/insertion, while only `reindexOReferenceTextareaTokens()` is public for consumer-owned removal.

**Tech Stack:** Vue 3.5, TypeScript, Less, `vue-icons-plus/lu`, existing floating-panel and collection-navigation utilities, Vitest, VitePress, Playwright, pnpm.

## Global Constraints

- Remove `OReferenceTextareaReference`, `OReferenceTextareaReferenceKind`, `references`, `kind`, and `thumbnailSrc` with no aliases or compatibility code.
- `media[index]` always maps to `[Image ${index + 1}]`; the token format is not configurable.
- Keep a real native `<textarea>` through `OTextarea`. Do not use `contenteditable`, mirrored text, chips inside the native value, or a rich-text dependency.
- The component selects `File[]` only. It does not upload, persist, validate business rules, create/revoke object URLs, call APIs, or build a media request.
- `remove` emits intent only. The component must not mutate `media` and must not auto-rewrite `modelValue`.
- Keep `OImage`'s independent Teleport preview; do not extract or couple its preview layer.
- Use `vue-icons-plus/lu`; add no handwritten SVG.
- Use Node.js 24 LTS and pnpm; add no Bun files, Tailwind migration, or VitePress `--vp-*` variables.
- Every Vue SFC change is covered by Vite/Vitest and the final canonical gate is `pnpm verify`.

---

### Task 1: Extract SSR-safe native file selection shared with Upload

**Files:**

- Create: `packages/ui/src/composables/use-file-selection.ts`
- Create: `packages/ui/src/composables/__tests__/use-file-selection.test.ts`
- Modify: `packages/ui/src/components/upload/src/OUpload.vue`
- Modify: `packages/ui/src/components/upload/src/upload.ts`
- Modify: `packages/ui/src/components/upload/__tests__/upload.test.ts`

**Internal interfaces:**

```ts
export const normalizeFileSelectionMaxCount = (value: number | undefined): number | undefined => {
  if (value === undefined || value === Number.POSITIVE_INFINITY) return undefined
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.floor(value))
}

export interface UseFileSelectionOptions {
  readonly canSelect: ComputedRef<boolean>
  readonly multiple: ComputedRef<boolean>
  readonly remainingCount: ComputedRef<number>
  readonly onSelect: (files: File[]) => void
}

export interface UseFileSelectionReturn {
  readonly inputElement: Ref<HTMLInputElement | undefined>
  readonly chooseFiles: () => void
  readonly selectFiles: (files: FileList | readonly File[] | null) => void
  readonly handleInputChange: (event: Event) => void
}
```

The composable must not read `document`, `window`, `File`, or `URL` during setup. `chooseFiles()` only calls the registered ref. `selectFiles()` uses:

```ts
const limit = multiple.value ? remainingCount.value : Math.min(1, remainingCount.value)
const selected = Array.from(files ?? []).slice(0, Math.max(0, limit))
if (selected.length > 0) onSelect(selected)
```

- [ ] **Step 1: Write failing composable tests**

Add tests named:

- `opens the registered input only while selection is allowed`
- `limits picker and drop files by multiple and remaining count`
- `resets the input after every change for same-file reselection`
- `does not access DOM globals during setup`
- `normalizes invalid maximum counts to zero instead of unlimited`

Run:

```bash
pnpm exec vitest run packages/ui/src/composables/__tests__/use-file-selection.test.ts
```

Expected: FAIL because the composable does not exist.

- [ ] **Step 2: Implement the composable**

`handleInputChange()` must call `selectFiles(input.files)` and then unconditionally set `input.value = ''`, including when the selected list is empty or selection is currently disabled.

- [ ] **Step 3: Preserve the public Upload helper**

Keep `normalizeOUploadMaxCount` public, but delegate its implementation to `normalizeFileSelectionMaxCount`. In `OUpload.vue`, replace only `inputElement`, `chooseFiles`, `emitSelectedFiles`, and `handleInputChange` with the composable. Keep existing DOM, styles, drag events, labels, progress, remove/clear events, and public API unchanged. Route drop files through `selectFiles()`.

- [ ] **Step 4: Verify Upload did not regress**

```bash
pnpm exec vitest run packages/ui/src/composables/__tests__/use-file-selection.test.ts packages/ui/src/components/upload/__tests__/upload.test.ts
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: composable and every existing Upload selection, drop, max-count, same-file, status, and accessibility test pass.

- [ ] **Step 5: Commit the shared primitive**

```bash
git add packages/ui/src/composables/use-file-selection.ts packages/ui/src/composables/__tests__/use-file-selection.test.ts packages/ui/src/components/upload
git commit -m "refactor(upload): share native file selection"
```

### Task 2: Implement exact image-token primitives

**Files:**

- Create: `packages/ui/src/components/reference-textarea/src/reference-token.ts`
- Create: `packages/ui/src/components/reference-textarea/__tests__/reference-token.test.ts`

**Internal/public boundary:** `formatOReferenceTextareaToken`, `findOReferenceTextareaMention`, and `insertOReferenceTextareaToken` are internal relative imports. Only `reindexOReferenceTextareaTokens` is re-exported by the component entry and package root.

```ts
export interface OReferenceTextareaMention {
  readonly start: number
  readonly end: number
  readonly query: string
}

export interface OReferenceTextareaInsertion {
  readonly value: string
  readonly caret: number
}

export const formatOReferenceTextareaToken = (index: number): string =>
  `[Image ${String(index + 1)}]`

export const findOReferenceTextareaMention = (
  value: string,
  selectionStart: number,
  selectionEnd = selectionStart,
): OReferenceTextareaMention | undefined

export const insertOReferenceTextareaToken = (
  value: string,
  mention: OReferenceTextareaMention,
  mediaIndex: number,
): OReferenceTextareaInsertion

export const reindexOReferenceTextareaTokens = (
  value: string,
  removedIndex: number,
): string
```

`findOReferenceTextareaMention()` accepts `@query` only at string start or when the `@` is immediately preceded by Unicode whitespace. It stops at whitespace or another `@`, clamps selection offsets into the string, and uses `selectionEnd` as the replacement end. `insert...()` appends no space and returns the caret immediately after the complete token.

`reindex...()` treats `removedIndex` as zero-based. It returns the original string for negative/non-integer indexes, removes every exact token for the removed item, decrements exact higher `[Image N]` tokens, and leaves lower, malformed, differently-cased, or unrelated text byte-for-byte unchanged.

- [ ] **Step 1: Write failing token tests**

Use these names:

- `formats zero-based media positions as one-based Image tokens`
- `finds only an active @ query at start or after whitespace`
- `does not detect a mention across whitespace or another at sign`
- `replaces only the active range and preserves surrounding prompt text`
- `inserts no space before direct Chinese continuation`
- `removes exact deleted tokens and decrements every later token`
- `leaves lower malformed and unrelated text unchanged`

Required assertions include:

```ts
expect(
  insertOReferenceTextareaToken(
    '@红衣中身着红色旗袍的女性',
    { start: 0, end: 3, query: '红衣' },
    0,
  ),
).toEqual({
  value: '[Image 1]中身着红色旗袍的女性',
  caret: '[Image 1]'.length,
})

expect(
  reindexOReferenceTextareaTokens('[Image 1] 保留 [Image 2] 删除 [Image 3] 变二 [image 4] 原样', 1),
).toBe('[Image 1] 保留  删除 [Image 2] 变二 [image 4] 原样')
```

- [ ] **Step 2: Observe failure, implement, and re-run**

```bash
pnpm exec vitest run packages/ui/src/components/reference-textarea/__tests__/reference-token.test.ts
```

Expected before implementation: module-not-found failure. Expected after implementation: every pure-function case passes without mounting Vue.

- [ ] **Step 3: Commit token primitives**

```bash
git add packages/ui/src/components/reference-textarea/src/reference-token.ts packages/ui/src/components/reference-textarea/__tests__/reference-token.test.ts
git commit -m "feat(reference-textarea): add image token primitives"
```

### Task 3: Replace the obsolete public reference model

**Files:**

- Modify: `packages/ui/src/components/reference-textarea/src/reference-textarea.ts`
- Modify: `packages/ui/src/components/reference-textarea/index.ts`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/components/reference-textarea/__tests__/reference-textarea.test.ts`

**Public model:**

```ts
export interface OReferenceTextareaMedia {
  readonly id: string
  readonly src: string
  readonly previewSrc?: string
  readonly label: string
  readonly alt?: string
}

export interface OReferenceTextareaLabels {
  readonly mediaList: string
  readonly upload: string
  readonly add: string
  readonly remove: (media: OReferenceTextareaMedia, index: number) => string
  readonly mentionList: string
  readonly mentionOption: (media: OReferenceTextareaMedia, index: number, token: string) => string
}

export type OReferenceTextareaLabelOverrides = Partial<OReferenceTextareaLabels>
```

Defaults are English and centralized in `defaultOReferenceTextareaLabels`; `resolveOReferenceTextareaLabels()` fills partial overrides.

**Props added after `...oTextareaProps`:**

```ts
media: {
  type: Array as PropType<readonly OReferenceTextareaMedia[]>,
  default: (): readonly OReferenceTextareaMedia[] => [],
},
accept: { type: String, default: 'image/*' },
multiple: { type: Boolean, default: true },
maxCount: Number as PropType<number | undefined>,
uploadable: { type: Boolean, default: true },
removable: { type: Boolean, default: true },
teleported: { type: Boolean, default: true },
teleportTo: {
  type: [String, Object] as PropType<string | HTMLElement>,
  default: 'body',
},
labels: {
  type: Object as PropType<OReferenceTextareaLabelOverrides>,
  default: (): OReferenceTextareaLabelOverrides => ({}),
},
```

**Events and slots:**

```ts
export interface OReferenceTextareaEmits {
  'update:modelValue': [value: string]
  select: [files: File[]]
  remove: [media: OReferenceTextareaMedia, index: number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

export interface OReferenceTextareaMediaSlotProps {
  readonly media: OReferenceTextareaMedia
  readonly index: number
  readonly token: string
}

export interface OReferenceTextareaMentionOptionSlotProps extends OReferenceTextareaMediaSlotProps {
  readonly active: boolean
}

export interface OReferenceTextareaSlots {
  readonly media?: (props: OReferenceTextareaMediaSlotProps) => VNodeChild
  readonly mentionOption?: (props: OReferenceTextareaMentionOptionSlotProps) => VNodeChild
  readonly upload?: () => VNodeChild
}
```

There is deliberately no `dragChange` event and no custom token formatter.

- [ ] **Step 1: Replace old type tests with failing new contract tests**

Add `keeps the dedicated image-media public contract typed` and assert the media type, default labels, default props, inherited `variant`, event tuples, slots, and exported `reindexOReferenceTextareaTokens`. Delete every test assignment for generic text references.

- [ ] **Step 2: Implement the new contract and exports**

Delete every obsolete public symbol from the component entry and root. Export the new media/labels/slot types and the reindex helper from root and `@puzzle-fuzzy/ui/reference-textarea`.

- [ ] **Step 3: Verify type contracts**

```bash
pnpm exec vitest run packages/ui/src/components/reference-textarea/__tests__/reference-textarea.test.ts packages/ui/src/components/reference-textarea/__tests__/reference-token.test.ts
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: the contract tests pass; component rendering may still fail until Task 4 and must not be committed in a red state.

### Task 4: Build the controlled media strip and Upload-style picker

**Files:**

- Replace: `packages/ui/src/components/reference-textarea/src/OReferenceTextarea.vue`
- Replace: `packages/ui/src/components/reference-textarea/style/index.less`
- Replace rendering tests: `packages/ui/src/components/reference-textarea/__tests__/reference-textarea.test.ts`
- Consume unchanged: `packages/ui/src/components/image/src/OImage.vue`
- Consume shared: `packages/ui/src/composables/use-file-selection.ts`

**Required structure:**

```vue
<div class="o-reference-textarea">
  <section class="o-reference-textarea__media" :aria-label="labels.mediaList">
    <!-- empty Upload-style picker, or media list plus compact add tile -->
  </section>
  <OTextarea class="o-reference-textarea__prompt" ... />
</div>
```

Media must precede the prompt in DOM and visual order. Use `:key="`${item.id}:${index}`"` so duplicate consumer IDs do not trigger duplicate-key warnings. Each default media item renders:

```vue
<OImage
  :src="item.src"
  :preview-src="item.previewSrc"
  :alt="item.alt ?? item.label"
  :preview-aria-label="labels.mentionOption(item, index, token)"
  :disabled="props.disabled"
  fit="cover"
  loading="lazy"
/>
```

Show the token and ellipsized label beside/below the thumbnail. Use `LuImagePlus`, `LuPlus`, and `LuX` from `vue-icons-plus/lu`. The empty picker alone may use a dashed boundary because it communicates drop affordance; media cards and the outer component remain borderless.

- [ ] **Step 1: Add failing rendering and file tests**

Use these names:

- `renders controlled media before the native textarea`
- `maps media order to visible Image tokens`
- `uses OImage for independent teleported previews`
- `emits selected files and permits the same file again`
- `limits picker and drop selection by maxCount and multiple`
- `emits remove intent without mutating media or rewriting the prompt`
- `keeps preview available while readonly and hides mutation controls`
- `disables editing selection removal and preview while disabled`
- `preserves textarea attrs autosize count focus blur and controlled rejection`
- `uses stable composite keys when consumer media IDs repeat`

The removal assertion must be exact:

```ts
await wrapper.get('[aria-label="Remove Image 2"]').trigger('click')
expect(wrapper.emitted('remove')).toEqual([[media[1], 1]])
expect(wrapper.emitted('update:modelValue')).toBeUndefined()
expect(wrapper.props('media')).toBe(media)
```

- [ ] **Step 2: Implement file capacity and picker behavior**

Compute normalized max count through `normalizeFileSelectionMaxCount`, subtract `media.length`, and hide/disable upload when capacity is zero, `uploadable` is false, readonly, or disabled. Use the shared input ref/change/select functions. Reset the file input after every selection. Route drop files to `selectFiles()`; internal drag styling emits no public event.

- [ ] **Step 3: Forward the full Textarea contract**

Pass `modelValue`, rows, autosize, maxlength, showCount, variant, invalid, disabled, readonly, placeholder, ariaLabel, and inherited native attrs to `OTextarea`. Forward update/focus/blur exactly once. Do not duplicate controlled-value or IME code already owned by `OTextarea`.

- [ ] **Step 4: Implement responsive border-budget styles**

Use a responsive horizontal strip/grid, `surface-muted` cards, OMG radii/gaps, 14px token/label hierarchy, line clamping, and `.omg-scrollbar()` only where real overflow exists. The compact add tile remains last. At coarse pointer, upload/remove actions reach 44px. At reduced motion, state transitions stop. The outer component and cards have no decorative border.

- [ ] **Step 5: Verify and commit the media surface**

```bash
pnpm exec vitest run packages/ui/src/components/reference-textarea packages/ui/src/components/image packages/ui/src/components/upload packages/ui/src/composables/__tests__/use-file-selection.test.ts
pnpm exec eslint packages/ui/src/components/reference-textarea packages/ui/src/composables/use-file-selection.ts --max-warnings 0
pnpm exec stylelint "packages/ui/src/components/reference-textarea/**/*.{vue,less}"
git add packages/ui/src/components/reference-textarea packages/ui/src/index.ts
git commit -m "feat(reference-textarea): rebuild image media surface"
```

### Task 5: Add the native-textarea `@` listbox

**Files:**

- Modify: `packages/ui/src/components/reference-textarea/src/OReferenceTextarea.vue`
- Modify: `packages/ui/src/components/reference-textarea/style/index.less`
- Modify: `packages/ui/src/components/reference-textarea/__tests__/reference-textarea.test.ts`
- Consume: `packages/ui/src/composables/use-floating-panel.ts`
- Consume: `packages/ui/src/utils/collection-navigation.ts`

**State and filtering:**

```ts
const textareaElement = shallowRef<HTMLTextAreaElement | null>(null)
const mention = shallowRef<OReferenceTextareaMention>()
const activeIndex = ref(-1)
const isComposing = ref(false)

const candidates = computed(() =>
  props.media
    .map((media, index) => ({ media, index, token: formatOReferenceTextareaToken(index) }))
    .filter(({ media, token }) =>
      `${token} ${media.label}`
        .toLocaleLowerCase()
        .includes(mention.value?.query.toLocaleLowerCase() ?? ''),
    ),
)
```

`isMentionOpen` requires a mention, at least one candidate, a focused textarea, and neither readonly nor disabled. On empty results, close the panel rather than rendering an empty listbox. The floating panel uses `bottom-start`, `matchReferenceWidth: true`, `teleported`, and `teleportTo`; first release anchors to the textarea edge, not caret pixels.

- [ ] **Step 1: Add failing mention tests**

Use these names:

- `opens the image listbox from @ while retaining textarea focus`
- `filters options by generated token number and media label`
- `navigates enabled options with Arrow keys and inserts with Enter`
- `inserts with Tab and pointer selection without blurring`
- `replaces only the active @ range and restores the caret`
- `closes with Escape and blur outside the compound component`
- `does not open or commit during IME composition`
- `rejects a complete token that would exceed maxlength`
- `does not render an empty listbox without matching media`
- `merges consumer keydown click input and selection listeners`
- `exposes the textarea/listbox active descendant relationship`

- [ ] **Step 2: Track the real textarea without changing OTextarea internals**

Capture `event.currentTarget` from OTextarea's forwarded native `input`, `click`, `select`, `keydown`, `compositionstart`, and `compositionend` listeners. Capture it from the forwarded focus event as well and pass it to `floating.setReferenceElement`. Do not query private child DOM and do not add a new OTextarea expose API.

- [ ] **Step 3: Implement keyboard and pointer selection**

Outside composition, refresh the mention from actual `selectionStart` / `selectionEnd`. ArrowDown/ArrowUp move within filtered candidates; Enter and Tab prevent default and choose the active candidate; Escape closes. Option `pointerdown.prevent` keeps focus, and click chooses. Use `insertOReferenceTextareaToken`, reject if `maxlength` would be exceeded, emit one `update:modelValue`, then `nextTick()` focus and call `setSelectionRange(caret, caret)` only if the consumer accepted the controlled value.

- [ ] **Step 4: Apply ARIA and panel geometry**

While open, the native textarea receives `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`, and `aria-activedescendant`. The panel is `role="listbox"` with `labels.mentionList`; options are `role="option"` with stable useId-based IDs and `aria-selected`. Styling matches Select: 4px panel padding, 36px rows, 12px inline padding, 14px primary copy, 12px metadata, 16px icon, active state layer, shadow, and reduced motion.

- [ ] **Step 5: Verify and commit mention behavior**

```bash
pnpm exec vitest run packages/ui/src/components/reference-textarea
pnpm --filter @puzzle-fuzzy/ui typecheck
pnpm exec stylelint "packages/ui/src/components/reference-textarea/**/*.{vue,less}"
git add packages/ui/src/components/reference-textarea
git commit -m "feat(reference-textarea): add image mentions"
```

### Task 6: Update SSR and packed-consumer contracts

**Files:**

- Modify: `packages/ui/tests/ssr/ssr.test.ts`
- Modify: `scripts/test-package.mjs`
- Verify unchanged manifest entries:
  - `packages/ui/package.json`
  - `packages/ui/vite.config.ts`

- [ ] **Step 1: Replace obsolete SSR props and types**

Create `renders OReferenceTextarea media before the prompt without DOM globals` with:

```ts
media: [{ id: 'one', src: '/reference-one.webp', label: '红色旗袍参考图' }],
modelValue: '[Image 1]中身着红色旗袍的女性',
```

Assert `[Image 1]` and the image occur before `<textarea`, no listbox exists while closed, and server setup does not construct `File`, `URL`, or access `document`.

- [ ] **Step 2: Update real tarball imports**

From root and `@puzzle-fuzzy/ui/reference-textarea`, import `OReferenceTextarea`, `OReferenceTextareaMedia`, `OReferenceTextareaProps`, and `reindexOReferenceTextareaTokens`. Derive the inherited variant as `NonNullable<OReferenceTextareaProps['variant']>`, render both components with `:media="media"`, call the helper in consumer TypeScript, and delete every obsolete `references` type/prop.

- [ ] **Step 3: Verify declarations and consumption**

```bash
pnpm build
pnpm test:ssr
pnpm test:package
```

Expected: library declarations, publint, attw, root/subpath type imports, packed consumer typecheck, and Vite consumer build pass without internal floating/Reka type leakage.

- [ ] **Step 4: Commit integration**

```bash
git add packages/ui/tests/ssr/ssr.test.ts scripts/test-package.mjs packages/ui/src/index.ts packages/ui/src/components/reference-textarea/index.ts
git commit -m "test(reference-textarea): publish image prompt contracts"
```

### Task 7: Rebuild the VitePress capability page with local raster references

**Files:**

- Replace: `apps/docs/examples/reference-textarea/Basic.vue`
- Create: `apps/docs/examples/reference-textarea/Reindex.vue`
- Create: `apps/docs/examples/reference-textarea/States.vue`
- Replace: `apps/docs/docs/components/reference-textarea.md`
- Create raster assets:
  - `apps/docs/public/images/reference-textarea/reference-1.webp`
  - `apps/docs/public/images/reference-textarea/reference-2.webp`
- Modify current component records:
  - `packages/ui/README.md`
  - `packages/ui/component-manifest.json`
  - `DESIGN.md`

The raster assets are local 3:2 reference images with distinct subjects and no embedded text. Do not use remote URLs, base64 data URIs, or handwritten SVG. The implementation worker may generate them through the available image-generation workflow, then visually inspect both files before use.

- [ ] **Step 1: Build the complete controlled workflow demo**

`Basic.vue` starts with two media entries and a Prompt containing `[Image 1]中身着红色旗袍的女性`. It handles `select(files)` in consumer code by creating object URLs and adding controlled media; it records only object URLs it created and revokes them on removal/unmount. It handles `remove(media, index)` by first calling `reindexOReferenceTextareaTokens(prompt.value, index)`, then removing that media. The shared component never owns those operations.

Use Chinese label overrides, `aria-label="参考图提示词"`, and visible instructions to type `@`. The upload selection IDs use a deterministic local counter; do not call `crypto.randomUUID()` during SSR.

- [ ] **Step 2: Build removal/reindex and state demos**

`Reindex.vue` visibly shows three images, tokens before removal, a middle-item removal, and resulting reindexing. `States.vue` shows readonly, disabled, `maxCount`, dark theme, and a narrow container. No example renders references below the textarea.

- [ ] **Step 3: Rewrite the page contract**

Document:

- the invariant `media[0] <-> [Image 1]`;
- exact Bailian-style Chinese usage;
- all props/events/slots/types and root/subpath imports;
- click/drop file selection versus consumer-owned upload/object URLs;
- `@` filtering and keyboard table;
- controlled removal plus the public reindex helper;
- native textarea/IME/maxlength behavior;
- OImage independent preview and Teleport;
- non-goals including contenteditable, rich text, drag reorder, API work, and compatibility aliases.

Update README, manifest, and DESIGN from the obsolete generic reference-list description to this dedicated image Prompt editor. Keep component counts unchanged.

- [ ] **Step 4: Build and commit docs**

```bash
pnpm --filter @puzzle-fuzzy/docs typecheck
pnpm docs:build
git add apps/docs/examples/reference-textarea apps/docs/docs/components/reference-textarea.md apps/docs/public/images/reference-textarea packages/ui/README.md packages/ui/component-manifest.json DESIGN.md
git commit -m "docs(reference-textarea): showcase image prompts"
```

### Task 8: Add focused Reference Textarea browser coverage

**Files:**

- Modify: `apps/docs/tests/e2e/components.spec.ts`

- [ ] **Step 1: Replace the obsolete below-list test**

Add `composes image-referenced prompts with @ and controlled media`:

1. Visit `/components/reference-textarea` at 1280px.
2. Assert media cards precede the textbox and `.o-reference-textarea__references` does not exist.
3. Focus `参考图提示词`, select all, type `@`.
4. Assert `选择参考图` listbox is visible and textarea retains focus.
5. Press ArrowDown then Enter.
6. Assert the exact value is `[Image 2]`, then type direct Chinese continuation and assert `[Image 2]中桌边的陶瓷花瓶`.
7. Run the existing serious-axe helper while the listbox is visible.

- [ ] **Step 2: Cover picker, preview, removal, and responsiveness**

Use `setInputFiles()` on the hidden input and assert a controlled third media card appears. Select the same file again after the consumer removes it to prove input reset. Open the second OImage thumbnail, assert the Teleported dialog, close with Escape, and assert focus restoration. Remove the middle media and assert both visible numbering and Prompt use the reindexed token. At 390px assert no document horizontal overflow and media remains above Prompt.

- [ ] **Step 3: Cover state and theme semantics**

Verify readonly hides upload/remove but leaves preview available; disabled prevents preview and editing; maxCount hides add; dark theme keeps readable surfaces. Run axe on full workflow and states sections.

- [ ] **Step 4: Run and commit focused E2E**

```bash
pnpm docs:build
pnpm --filter @puzzle-fuzzy/docs exec playwright test --grep "image-referenced prompts|Reference Textarea"
git add apps/docs/tests/e2e/components.spec.ts
git commit -m "test(reference-textarea): cover image prompt workflow"
```

### Task 9: Focused Reference Textarea gate and obsolete-contract scan

- [ ] **Step 1: Format touched text files**

```bash
pnpm exec prettier packages/ui/src/composables/use-file-selection.ts packages/ui/src/composables/__tests__/use-file-selection.test.ts packages/ui/src/components/upload packages/ui/src/components/reference-textarea packages/ui/src/index.ts packages/ui/tests/ssr/ssr.test.ts scripts/test-package.mjs apps/docs/examples/reference-textarea apps/docs/docs/components/reference-textarea.md apps/docs/tests/e2e/components.spec.ts packages/ui/README.md packages/ui/component-manifest.json DESIGN.md --write
```

- [ ] **Step 2: Prove obsolete code is gone from current sources**

Run a Python UTF-8 scan over `packages/ui`, `apps/docs`, `scripts`, `README.md`, and `DESIGN.md`, excluding `docs/superpowers`, for:

```text
OReferenceTextareaReferenceKind
OReferenceTextareaReference
thumbnailSrc
:references="references"
```

Expected: no obsolete implementation, current documentation, test, or consumer match. Historical specs/plans may retain historical text.

- [ ] **Step 3: Run the focused dependency chain**

```bash
pnpm exec vitest run packages/ui/src/composables/__tests__/use-file-selection.test.ts packages/ui/src/components/upload packages/ui/src/components/reference-textarea packages/ui/src/components/image
pnpm build
pnpm test:ssr
pnpm test:package
pnpm docs:build
pnpm --filter @puzzle-fuzzy/docs exec playwright test --grep "Reference Textarea|image-referenced prompts"
```

Expected: all commands pass. Cross-subsystem `pnpm verify` and final browser review are completed by `2026-07-13-compact-prompt-release-integration.md`.
