# Message Lifecycle Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make imperative messages reliably auto-close by default, preserve explicit accessibility pauses, and make every VitePress demonstration truthful about static versus timed behavior.

**Architecture:** `OMessage` remains a timer-free, flow-positioned, controlled visual primitive. `oMessage()` remains the only timer owner and keeps host creation, stacking, pause/resume, leave transitions, handles, and cleanup. The change is limited to duration normalization, the default hover policy, finite examples, and lifecycle coverage.

**Tech Stack:** Vue 3.5, TypeScript, Vitest fake timers, Vue Test Utils, VitePress, Playwright, pnpm.

## Global Constraints

- Do not add a Provider, Vue plugin, second timer, private `visible` state, or business notification store.
- Do not alter Message's opaque white / `#2d2d2d` surfaces, top-right placement, icons, borderless shadow, entry, or shrink/fade exit.
- Default duration is 3000ms. Only `duration <= 0` is persistent.
- Default `pauseOnHover` is `false`; explicit `true` remains supported.
- Focus inside a closable service message always pauses regardless of hover policy.
- Declarative `OMessage` never closes itself and does not gain a `duration` prop.
- Use Node.js 24 LTS and pnpm. Do not add Bun files or VitePress `--vp-*` variables.

---

### Task 1: Lock the corrected duration and pause contract with failing tests

**Files:**

- Modify: `packages/ui/src/components/message/__tests__/message.test.ts`
- Read implementation under test:
  - `packages/ui/src/components/message/src/message.ts`
  - `packages/ui/src/components/message/src/message-service.ts`
  - `packages/ui/src/components/message/src/OMessageHost.vue`

- [ ] **Step 1: Expand duration normalization cases**

Update the table test to assert:

```ts
it.each([
  [undefined, 3000],
  [Number.NaN, 3000],
  [Number.POSITIVE_INFINITY, 3000],
  [Number.NEGATIVE_INFINITY, 3000],
  [0, 0],
  [-12, 0],
  [0.8, 1],
  [1.9, 1],
  [1200.9, 1200],
] as const)('normalizes duration %s to %s', (input, expected) => {
  expect(normalizeOMessageDuration(input)).toBe(expected)
})
```

- [ ] **Step 2: Add the default lifecycle test**

Create `uses 3000ms by default and ignores hover unless opted in` using `createOMessageService()`, fake timers, and an `onClose` spy. Open a message with no `duration` and no `pauseOnHover`, advance 2500ms, dispatch `mouseenter` on the message, advance 500ms, flush Vue ticks/leave cleanup, and assert the message and host are removed and `onClose` ran once.

- [ ] **Step 3: Make opt-in and focus coverage explicit**

Rename the existing hover test to `preserves remaining time when hover pause is explicitly enabled` and pass `pauseOnHover: true`. Rename the focus test to `pauses while focus is inside with the default hover policy`, remove any `pauseOnHover: false` override, focus the close action, advance beyond duration, assert it remains, blur, advance the remaining time, and assert one close.

- [ ] **Step 4: Protect fractions and persistent values at service level**

Add `keeps non-positive durations persistent and closes positive fractions after at least one millisecond`. Open `duration: 0`, `duration: -1`, and `duration: 0.8`; assert all exist at 0ms, the fractional message closes at 1ms, and both non-positive records remain until their handles close.

- [ ] **Step 5: Protect the static primitive**

Add `keeps declarative OMessage controlled and timer-free`:

```ts
const wrapper = mount(OMessage, { props: { message: 'Controlled surface', closable: true } })
await vi.advanceTimersByTimeAsync(10_000)
expect(wrapper.get('.o-message').text()).toContain('Controlled surface')
expect(wrapper.emitted('close')).toBeUndefined()
```

Run:

```bash
pnpm exec vitest run packages/ui/src/components/message/__tests__/message.test.ts
```

Expected: FAIL on `0.8`, default hover, and any old assertions that assumed hover pause by default.

- [ ] **Step 6: Commit only the failing tests if execution policy requires red-test commits**

The repository normally commits passing states. Keep the red tests uncommitted and continue directly to Task 2 unless the executing agent's workflow explicitly records red/green commits.

### Task 2: Implement the minimal Message lifecycle correction

**Files:**

- Modify: `packages/ui/src/components/message/src/message.ts`
- Modify: `packages/ui/src/components/message/src/message-service.ts`
- Modify: `packages/ui/src/components/message/__tests__/message.test.ts`

- [ ] **Step 1: Clamp every positive duration to at least one millisecond**

Use exactly:

```ts
export const normalizeOMessageDuration = (value?: number): number => {
  if (value === undefined || !Number.isFinite(value)) return 3000
  if (value <= 0) return 0
  return Math.max(1, Math.floor(value))
}
```

- [ ] **Step 2: Change only the hover default**

In the service runtime record, replace:

```ts
pauseOnHover: options.pauseOnHover ?? true,
```

with:

```ts
pauseOnHover: options.pauseOnHover ?? false,
```

Do not change `pause()`, `resume()`, focus pause sources, remaining-time math, or host destruction.

- [ ] **Step 3: Run the full Message unit suite**

```bash
pnpm exec vitest run packages/ui/src/components/message/__tests__/message.test.ts
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: default 3000ms, explicit hover pause, mandatory focus pause, persistent modes, fractional duration, idempotent handles, `closeAll`, and single `onClose` all pass.

- [ ] **Step 4: Commit runtime and unit coverage**

```bash
git add packages/ui/src/components/message
git commit -m "fix(message): correct automatic display lifecycle"
```

### Task 3: Keep SSR semantics explicit

**Files:**

- Modify: `packages/ui/tests/ssr/ssr.test.ts`

- [ ] **Step 1: Rename and strengthen the existing Message SSR test**

Use the name `renders controlled OMessage surfaces and keeps the service inert without DOM`. Keep server-rendering the declarative component. Call `oMessage('SSR no-op')`, assert the returned `close` handle is callable, and assert no host markup is introduced into the rendered HTML.

- [ ] **Step 2: Verify SSR**

```bash
pnpm test:ssr
```

Expected: SSR passes without `window`, `document`, timer host, or import-time DOM work.

- [ ] **Step 3: Commit SSR coverage**

```bash
git add packages/ui/tests/ssr/ssr.test.ts
git commit -m "test(message): protect controlled SSR behavior"
```

### Task 4: Make VitePress Message demonstrations finite and explicit

**Files:**

- Modify: `apps/docs/examples/message/Basic.vue`
- Verify static implementation: `apps/docs/examples/message/Declarative.vue`
- Modify: `apps/docs/examples/message/Themes.vue`
- Modify: `apps/docs/docs/components/message.md`

**Demo duration policy:**

| Scenario                      |                        Duration |
| ----------------------------- | ------------------------------: |
| normal/success default        |       omitted, therefore 3000ms |
| warning hover-pause demo      | 6000ms and `pauseOnHover: true` |
| error                         |                          4200ms |
| three-message stack           |                     6000ms each |
| long copy                     |                          6000ms |
| light/dark scoped targets     |                          4200ms |
| explicitly persistent message |                               0 |

- [ ] **Step 1: Remove accidental persistent durations**

Search only the current Message examples:

```bash
rg "duration:\s*0" apps/docs/examples/message
```

After edits, the only match must be the action visibly named `显示持久消息`. Keep the retained handle and explicit close action for that example.

- [ ] **Step 2: Demonstrate opt-in hover pause**

The warning action must pass `pauseOnHover: true` and use visible copy explaining that hover pause was explicitly enabled. Default normal/success actions must omit the option.

- [ ] **Step 3: Correct documentation language**

Document:

- `oMessage()` defaults to 3000ms and `pauseOnHover: false`;
- focus inside the message always pauses and resumes from remaining time;
- `duration <= 0` is persistent;
- positive fractions floor but never below 1ms;
- `OMessage` is a static controlled surface, ignores service timing, and only emits a close intent when its close action is activated;
- `oMessage()` is the recommended automatic top-right experience.

- [ ] **Step 4: Build and commit docs**

```bash
pnpm --filter @puzzle-fuzzy/docs typecheck
pnpm docs:build
git add apps/docs/examples/message apps/docs/docs/components/message.md
git commit -m "docs(message): clarify finite and controlled usage"
```

### Task 5: Add focused browser lifecycle coverage

**Files:**

- Modify: `apps/docs/tests/e2e/components.spec.ts`

- [ ] **Step 1: Add default auto-hide coverage**

Add a test named `auto-hides Message with the default hover policy and preserves focus pause`:

1. Visit `/components/message`.
2. Click `显示普通消息`.
3. Locate its `role=status` message and run the existing serious-axe helper while visible.
4. Hover the surface.
5. Within 4500ms, expect both the message and its `.o-message-host` to detach without clicking `closeAll`.
6. Open the finite closable focus-pause example, focus its close button, wait beyond its configured duration, and assert it remains.
7. Move focus outside, then expect message and empty host removal after remaining time.

- [ ] **Step 2: Stabilize existing visual tests around finite examples**

Complete computed-style, stack, motion, scoped-theme, RTL, and reduced-motion assertions before finite timers expire. Use the one explicitly persistent example only when a deterministic long-lived node is required, and close it through its handle/action. Await `.o-message-host` detachment between phases so no host intercepts later clicks.

- [ ] **Step 3: Run the focused browser test**

```bash
pnpm docs:build
pnpm --filter @puzzle-fuzzy/docs exec playwright test --grep "Message"
```

Expected: default hover does not stop auto-close, focus still pauses, finite examples clean up, visual contracts and axe pass.

- [ ] **Step 4: Commit browser coverage**

```bash
git add apps/docs/tests/e2e/components.spec.ts
git commit -m "test(message): cover automatic host cleanup"
```

### Task 6: Focused Message gate

- [ ] **Step 1: Format and inspect**

```bash
pnpm exec prettier packages/ui/src/components/message packages/ui/tests/ssr/ssr.test.ts apps/docs/examples/message apps/docs/docs/components/message.md apps/docs/tests/e2e/components.spec.ts --write
git diff --check
```

- [ ] **Step 2: Run Message's complete dependency chain**

```bash
pnpm exec vitest run packages/ui/src/components/message
pnpm test:ssr
pnpm docs:build
pnpm --filter @puzzle-fuzzy/docs exec playwright test --grep "Message"
```

Expected: every command passes. Package-wide and cross-page verification is completed by `2026-07-13-compact-prompt-release-integration.md`.
