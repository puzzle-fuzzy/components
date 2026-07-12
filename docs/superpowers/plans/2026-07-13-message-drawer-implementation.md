# Message and Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a solid-surface top-right Message system and a native-dialog-based side Drawer, publish both through the Vue-only package, and demonstrate every supported capability in VitePress.

**Architecture:** `OMessage` is a public flow-positioned message surface, while `oMessage()` lazily mounts a private per-target host that owns fixed stacking, timers, pause/resume, and transition cleanup. `ODrawer` composes `ODialog` so native top-layer, focus, mask, Esc, controlled close, and scroll-lock behavior stay centralized. Explicit root/subpath exports, documentation contracts, SSR, package smoke tests, and browser tests remain the repository-wide integration path.

**Tech Stack:** Vue 3.5, TypeScript, Less, `vue-icons-plus/lu`, Vite 8, VitePress, Vitest, Vue Test Utils, Playwright, pnpm.

## Global Constraints

- Vue-only ESM package; no CommonJS, UMD, framework-neutral entry, compatibility alias, Provider requirement, Vue plugin, or package-manager migration.
- Use the repository's pnpm/Vite/Vitest/Playwright workflow and existing formatting, type, naming, package, and documentation contracts.
- Built-in and documentation icons use direct named imports from `vue-icons-plus/lu`; do not add handwritten SVG or another icon package.
- Message is physically fixed at the top-right in both LTR and RTL; it enters from the right and exits by shrinking in place and fading.
- Message surfaces are fully opaque, borderless, `#fff` in light mode, and exactly `#2d2d2d` in dark mode.
- Drawer supports only logical `start` and `end`, is borderless, and composes `ODialog` rather than duplicating modal behavior.
- Shared components contain UI behavior only; no requests, retry, persistence, permissions, routing, form submission, or business-state mapping.
- `OImage` keeps its protected self-contained Teleport preview, and unrelated Tabs, Widget, Avatar, form, and border-budget visuals remain unchanged.
- Do not declare or override any VitePress `--vp-*` variable.

---

### Task 1: Build the public OMessage surface and type contract

**Files:**

- Create: `packages/ui/src/components/message/src/message.ts`
- Create: `packages/ui/src/components/message/src/OMessage.vue`
- Create: `packages/ui/src/components/message/index.ts`
- Create: `packages/ui/src/components/message/__tests__/message.test.ts`

**Interfaces:**

- Produces: `OMessage`, `oMessageProps`, `oMessageStatuses`, `normalizeOMessageDuration`, `OMessageStatus`, component props/emits/slots, and service option/handle types.
- Consumed later by: the private Host and service in Task 2, root/subpath publication in Task 4, VitePress in Task 5, and SSR/package tests in Task 7.

- [ ] **Step 1: Write failing public-contract and rendering tests**

Create `message.test.ts` with type assignments and focused assertions:

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import {
  OMessage,
  normalizeOMessageDuration,
  oMessageProps,
  oMessageStatuses,
  type OMessageEmits,
  type OMessageOptions,
  type OMessageProps,
  type OMessageSlots,
} from '../index'

describe('OMessage', () => {
  it('keeps runtime vocabulary and public types aligned', () => {
    const props: OMessageProps = {
      message: '保存成功',
      status: 'success',
      closable: true,
      closeAriaLabel: '关闭保存消息',
    }
    const emits: OMessageEmits = { close: [] }
    const slots: OMessageSlots = {
      icon: () => h('span', 'icon'),
      default: () => '自定义消息',
    }
    const options: OMessageOptions = {
      message: '保存成功',
      status: 'success',
      duration: 3000,
      closable: true,
      closeAriaLabel: '关闭保存消息',
      pauseOnHover: true,
    }

    expect(oMessageStatuses).toEqual(['info', 'success', 'warning', 'error'])
    expect(oMessageProps.status.default).toBe('info')
    expect(oMessageProps.closable.default).toBe(false)
    expect(oMessageProps.closeAriaLabel.default).toBe('Close message')
    expect(props.status).toBe('success')
    expect(emits.close).toEqual([])
    expect(slots.default?.()).toBe('自定义消息')
    expect(options.pauseOnHover).toBe(true)
  })

  it.each([
    ['info', 'status'],
    ['success', 'status'],
    ['warning', 'status'],
    ['error', 'alert'],
  ] as const)('renders %s with the correct live role and icon', (status, role) => {
    const wrapper = mount(OMessage, { props: { message: status, status } })
    expect(wrapper.attributes('role')).toBe(role)
    expect(wrapper.attributes('aria-atomic')).toBe('true')
    expect(wrapper.classes()).toContain(`o-message--${status}`)
    expect(wrapper.get('.o-message__icon svg').attributes('aria-hidden')).toBe('true')
  })

  it('prefers slots and emits one close event per activation', async () => {
    const wrapper = mount(OMessage, {
      props: { message: 'prop', closable: true, closeAriaLabel: '关闭消息' },
      slots: { icon: '<span data-test="icon">I</span>', default: 'slot content' },
    })
    expect(wrapper.text()).toContain('slot content')
    expect(wrapper.text()).not.toContain('prop')
    expect(wrapper.get('[data-test="icon"]')).toBeTruthy()
    const close = wrapper.get<HTMLButtonElement>('.o-message__close')
    expect(close.attributes('aria-label')).toBe('关闭消息')
    await close.trigger('click')
    expect(wrapper.emitted('close')).toEqual([[]])
  })

  it('imports only named Lucide icons', () => {
    const source = readFileSync(
      resolve('packages/ui/src/components/message/src/OMessage.vue'),
      'utf8',
    )
    expect(source).toContain("from 'vue-icons-plus/lu'")
    expect(source).toContain('LuInfo')
    expect(source).toContain('LuCheckCircle2')
    expect(source).toContain('LuAlertTriangle')
    expect(source).toContain('LuXCircle')
    expect(source).toContain('LuX')
  })
})
```

- [ ] **Step 2: Run the test and verify the missing component failure**

Run: `pnpm exec vitest run packages/ui/src/components/message/__tests__/message.test.ts`

Expected: FAIL because `../index` and the Message source files do not exist.

- [ ] **Step 3: Implement the complete public vocabulary**

Create `message.ts` with these exact defaults and normalizers:

```ts
import type { ExtractPublicPropTypes, PropType, VNodeChild } from 'vue'

export const oMessageStatuses = ['info', 'success', 'warning', 'error'] as const
export type OMessageStatus = (typeof oMessageStatuses)[number]

const isOMessageStatus = (value: unknown): value is OMessageStatus =>
  typeof value === 'string' && oMessageStatuses.some((status) => status === value)

export const normalizeOMessageDuration = (value?: number): number => {
  if (value === undefined || !Number.isFinite(value)) return 3000
  if (value <= 0) return 0
  return Math.floor(value)
}

export const oMessageProps = {
  message: String,
  status: {
    type: String as PropType<OMessageStatus>,
    default: 'info',
    validator: isOMessageStatus,
  },
  closable: {
    type: Boolean,
    default: false,
  },
  closeAriaLabel: {
    type: String,
    default: 'Close message',
  },
} as const

export type OMessageProps = ExtractPublicPropTypes<typeof oMessageProps>

export interface OMessageEmits {
  close: []
}

export interface OMessageSlots {
  icon?: () => VNodeChild
  default?: () => VNodeChild
}

export interface OMessageOptions {
  readonly message: string
  readonly status?: OMessageStatus
  readonly duration?: number
  readonly closable?: boolean
  readonly closeAriaLabel?: string
  readonly pauseOnHover?: boolean
  readonly appendTo?: string | HTMLElement
  readonly onClose?: () => void
}

export interface OMessageHandle {
  close: () => void
}

export type OMessageHelperInput = string | Omit<OMessageOptions, 'status'>

export interface OMessageService {
  (input: string | OMessageOptions): OMessageHandle
  info: (input: OMessageHelperInput) => OMessageHandle
  success: (input: OMessageHelperInput) => OMessageHandle
  warning: (input: OMessageHelperInput) => OMessageHandle
  error: (input: OMessageHelperInput) => OMessageHandle
  closeAll: () => void
}
```

Add parameterized duration assertions for `undefined`, `NaN`, infinities, zero, negatives, fractions, and positive integers.

- [ ] **Step 4: Implement OMessage as a timer-free visual primitive**

Use a typed icon map and emit one event for each close-button activation; service-level idempotency belongs to Task 2:

```vue
<script setup lang="ts">
import { LuAlertTriangle, LuCheckCircle2, LuInfo, LuX, LuXCircle } from 'vue-icons-plus/lu'
import { computed, type Component } from 'vue'

import {
  oMessageProps,
  type OMessageEmits,
  type OMessageSlots,
  type OMessageStatus,
} from './message'

defineOptions({ name: 'OMessage' })

const props = defineProps(oMessageProps)
const emit = defineEmits<OMessageEmits>()
const slots = defineSlots<OMessageSlots>()

const statusIcons = {
  info: LuInfo,
  success: LuCheckCircle2,
  warning: LuAlertTriangle,
  error: LuXCircle,
} satisfies Record<OMessageStatus, Component>

const statusIcon = computed(() => statusIcons[props.status])
const liveRole = computed(() => (props.status === 'error' ? 'alert' : 'status'))
</script>

<template>
  <article
    class="o-message"
    :class="`o-message--${props.status}`"
    :role="liveRole"
    aria-atomic="true"
  >
    <span class="o-message__icon" aria-hidden="true">
      <slot name="icon">
        <component :is="statusIcon" aria-hidden="true" />
      </slot>
    </span>
    <div class="o-message__content">
      <slot>{{ props.message }}</slot>
    </div>
    <button
      v-if="props.closable"
      class="o-message__close"
      type="button"
      :aria-label="props.closeAriaLabel"
      @click="emit('close')"
    >
      <LuX aria-hidden="true" />
    </button>
  </article>
</template>
```

Create `index.ts` with only the approved public names:

```ts
export { default as OMessage } from './src/OMessage.vue'
export { normalizeOMessageDuration, oMessageProps, oMessageStatuses } from './src/message'
export type {
  OMessageEmits,
  OMessageHandle,
  OMessageOptions,
  OMessageProps,
  OMessageService,
  OMessageSlots,
  OMessageStatus,
} from './src/message'
```

Task 2 adds `oMessage`; do not export helper-input, Host, record, or controller types.

- [ ] **Step 5: Run focused tests and typecheck**

Run:

```bash
pnpm exec vitest run packages/ui/src/components/message/__tests__/message.test.ts
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: all primitive and duration tests pass; no implicit `any`, invalid slot type, or DOM access occurs.

- [ ] **Step 6: Commit the public primitive**

```bash
git add packages/ui/src/components/message
git commit -m "feat: add message surface contract"
```

### Task 2: Add the lazy Message host, timers, solid theme, and motion

**Files:**

- Create: `packages/ui/src/components/message/src/message-host.ts`
- Create: `packages/ui/src/components/message/src/OMessageHost.vue`
- Create: `packages/ui/src/components/message/src/message-service.ts`
- Create: `packages/ui/src/components/message/style/index.less`
- Modify: `packages/ui/src/components/message/index.ts`
- Modify: `packages/ui/src/components/message/__tests__/message.test.ts`
- Modify: `packages/ui/src/styles/tokens/primitives.less`
- Modify: `packages/ui/src/styles/tokens/semantic.less`

**Interfaces:**

- Consumes: Task 1's `OMessage`, status vocabulary, option types, and duration normalizer.
- Produces: public `oMessage` plus private per-target Hosts with idempotent close, remaining-time pause/resume, delayed after-leave finalization, and exact surface tokens.

- [ ] **Step 1: Add failing service lifecycle tests**

Extend `message.test.ts` and import `createOMessageService` directly from the private service module for test isolation. Cover this exact sequence:

```ts
it('mounts lazily, shares a target host, and cleans up after leave', async () => {
  vi.useFakeTimers()
  const controller = createTestService()
  expect(document.querySelector('.o-message-host')).toBeNull()

  const firstClose = vi.fn()
  const first = controller.service.success({
    message: 'Saved',
    duration: 1000,
    onClose: firstClose,
  })
  controller.service.warning({ message: 'Check this', duration: 0 })
  await nextTick()

  expect(document.querySelectorAll('.o-message-host')).toHaveLength(1)
  expect(document.querySelectorAll('.o-message')).toHaveLength(2)

  first.close()
  first.close()
  await nextTick()
  expect(firstClose).not.toHaveBeenCalled()

  await vi.runAllTimersAsync()
  await nextTick()
  expect(firstClose).toHaveBeenCalledOnce()

  controller.service.closeAll()
  await vi.runAllTimersAsync()
  await nextTick()
  expect(document.querySelector('.o-message-host')).toBeNull()
  controller.destroy()
})
```

Add separate tests for string input defaults, all four helpers, invalid/disconnected `appendTo` fallback, two connected targets, `duration=0`, timeout close, hover pause, focus pause, remaining-time resume, idempotent `closeAll`, single `onClose`, client-only no-op, and immediate private `destroy()` cleanup.

Use `vi.setSystemTime(0)`, advance to 600ms, pause, advance while paused, resume, then advance 399ms and 1ms to prove the remaining 400ms is preserved rather than restarted.

Keep every private controller in a test-owned array and use this cleanup contract so fake timers, global stubs, Hosts, and target DOM cannot leak between cases:

```ts
type TestController = ReturnType<typeof createOMessageService>
const controllers: TestController[] = []
const createTestService = (): TestController => {
  const controller = createOMessageService()
  controllers.push(controller)
  return controller
}

afterEach(() => {
  vi.unstubAllGlobals()
  for (const controller of controllers.splice(0)) controller.destroy()
  vi.clearAllTimers()
  vi.useRealTimers()
  document.body.replaceChildren()
})
```

- [ ] **Step 2: Run the service tests and verify failure**

Run: `pnpm exec vitest run packages/ui/src/components/message/__tests__/message.test.ts`

Expected: FAIL because Host, service, tokens, and styles are missing.

- [ ] **Step 3: Define the private host record and events**

Create `message-host.ts`:

```ts
import type { OMessageStatus } from './message'

export type OMessagePauseSource = 'hover' | 'focus'

export interface OMessageHostRecord {
  readonly id: string
  readonly message: string
  readonly status: OMessageStatus
  readonly closable: boolean
  readonly closeAriaLabel: string
}

export interface OMessageHostEmits {
  requestClose: [id: string]
  pause: [id: string, source: OMessagePauseSource]
  resume: [id: string, source: OMessagePauseSource]
  afterLeave: [id: string]
}
```

- [ ] **Step 4: Implement OMessageHost with one non-live fixed stack**

Use a `TransitionGroup` whose keyed wrapper carries the ID. Resume focus timing only when focus truly leaves the wrapper:

```vue
<script setup lang="ts">
import OMessage from './OMessage.vue'
import type { OMessageHostEmits, OMessageHostRecord } from './message-host'

defineOptions({ name: 'OMessageHost' })

defineProps<{ records: readonly OMessageHostRecord[] }>()
const emit = defineEmits<OMessageHostEmits>()

const handleAfterLeave = (element: Element): void => {
  const id = (element as HTMLElement).dataset.messageId
  if (id) emit('afterLeave', id)
}

const handleFocusOut = (event: FocusEvent, id: string): void => {
  const current = event.currentTarget as HTMLElement
  if (event.relatedTarget instanceof Node && current.contains(event.relatedTarget)) return
  emit('resume', id, 'focus')
}
</script>

<template>
  <TransitionGroup
    class="o-message-host"
    name="o-message"
    tag="div"
    @after-leave="handleAfterLeave"
  >
    <div
      v-for="record in records"
      :key="record.id"
      class="o-message-host__item"
      :data-message-id="record.id"
      @mouseenter="emit('pause', record.id, 'hover')"
      @mouseleave="emit('resume', record.id, 'hover')"
      @focusin="emit('pause', record.id, 'focus')"
      @focusout="handleFocusOut($event, record.id)"
    >
      <OMessage v-bind="record" @close="emit('requestClose', record.id)" />
    </div>
  </TransitionGroup>
</template>
```

- [ ] **Step 5: Implement the service controller and public function**

`message-service.ts` starts with these runtime and type imports, then uses a shallow-reactive rendered array per target plus non-reactive runtime metadata:

```ts
import { createApp, nextTick, shallowReactive, type App } from 'vue'

import OMessageHost from './OMessageHost.vue'
import type { OMessageHostRecord, OMessagePauseSource } from './message-host'
import {
  normalizeOMessageDuration,
  type OMessageHandle,
  type OMessageHelperInput,
  type OMessageOptions,
  type OMessageService,
  type OMessageStatus,
} from './message'
```

```ts
interface OMessageHostRuntime {
  readonly target: HTMLElement
  readonly root: HTMLDivElement
  readonly app: App<Element>
  readonly records: OMessageHostRecord[]
  destroyed: boolean
}

interface OMessageRuntime {
  readonly host: OMessageHostRuntime
  readonly record: OMessageHostRecord
  readonly onClose: (() => void) | undefined
  readonly pauseOnHover: boolean
  readonly persistent: boolean
  readonly pausedBy: Set<OMessagePauseSource>
  remaining: number
  startedAt: number
  timeout: ReturnType<typeof setTimeout> | undefined
  closing: boolean
  finalized: boolean
}

interface OMessageServiceController {
  readonly service: OMessageService
  destroy: () => void
}
```

Inside `createOMessageService()`, initialize `nextId`, a resettable `WeakMap<HTMLElement, OMessageHostRuntime>`, an iterable Host set, and global active/leaving maps keyed by message ID. Implement target and Host lifecycle first:

```ts
let nextId = 0
let hostsByTarget = new WeakMap<HTMLElement, OMessageHostRuntime>()
const hosts = new Set<OMessageHostRuntime>()
const active = new Map<string, OMessageRuntime>()
const leaving = new Map<string, OMessageRuntime>()

const resolveTarget = (appendTo?: string | HTMLElement): HTMLElement | undefined => {
  if (typeof document === 'undefined') return undefined
  if (appendTo instanceof HTMLElement && appendTo.isConnected) return appendTo
  if (typeof appendTo === 'string') {
    try {
      const selected = document.querySelector(appendTo)
      if (selected instanceof HTMLElement && selected.isConnected) return selected
    } catch {
      return document.body
    }
  }
  return document.body
}

const destroyHost = (host: OMessageHostRuntime): void => {
  if (host.destroyed) return
  host.destroyed = true
  host.app.unmount()
  host.root.remove()
  hostsByTarget.delete(host.target)
  hosts.delete(host)
}

const destroyHostWhenEmpty = (host: OMessageHostRuntime): void => {
  const hasActive = [...active.values()].some((runtime) => runtime.host === host)
  const hasLeaving = [...leaving.values()].some((runtime) => runtime.host === host)
  if (host.records.length === 0 && !hasActive && !hasLeaving) destroyHost(host)
}
```

Implement finalization, close, timers, pause, and resume. Internal cleanup must finish even when a consumer callback throws. An immediate close before Vue creates a keyed DOM node finalizes on the next tick instead of waiting for an impossible leave event:

```ts
const finalize = (id: string): void => {
  const runtime = leaving.get(id)
  if (!runtime || runtime.finalized) return
  runtime.finalized = true
  leaving.delete(id)
  active.delete(id)
  try {
    runtime.onClose?.()
  } finally {
    destroyHostWhenEmpty(runtime.host)
  }
}

const requestClose = (id: string): void => {
  const runtime = active.get(id)
  if (!runtime || runtime.closing) return
  runtime.closing = true
  if (runtime.timeout !== undefined) clearTimeout(runtime.timeout)
  runtime.timeout = undefined
  const index = runtime.host.records.findIndex((record) => record.id === id)
  if (index >= 0) runtime.host.records.splice(index, 1)
  leaving.set(id, runtime)
  void nextTick(() => {
    const selector = `[data-message-id="${id}"]`
    if (leaving.has(id) && !runtime.host.root.querySelector(selector)) finalize(id)
  })
}

const startTimer = (runtime: OMessageRuntime): void => {
  if (runtime.persistent || runtime.closing || runtime.timeout !== undefined) return
  runtime.startedAt = Date.now()
  runtime.timeout = setTimeout(() => {
    runtime.timeout = undefined
    runtime.remaining = 0
    requestClose(runtime.record.id)
  }, runtime.remaining)
}

const pause = (id: string, source: OMessagePauseSource): void => {
  const runtime = active.get(id)
  if (
    !runtime ||
    runtime.closing ||
    runtime.persistent ||
    (source === 'hover' && !runtime.pauseOnHover)
  )
    return
  runtime.pausedBy.add(source)
  if (runtime.timeout === undefined) return
  clearTimeout(runtime.timeout)
  runtime.timeout = undefined
  runtime.remaining = Math.max(0, runtime.remaining - (Date.now() - runtime.startedAt))
}

const resume = (id: string, source: OMessagePauseSource): void => {
  const runtime = active.get(id)
  if (
    !runtime ||
    runtime.closing ||
    runtime.persistent ||
    (source === 'hover' && !runtime.pauseOnHover)
  )
    return
  runtime.pausedBy.delete(source)
  if (runtime.pausedBy.size > 0) return
  if (runtime.remaining === 0) requestClose(id)
  else startTimer(runtime)
}
```

Create and mount a Host only after a valid client target exists. Vue event listeners connect the private Host to the controller functions:

```ts
const createHost = (target: HTMLElement): OMessageHostRuntime => {
  const root = document.createElement('div')
  root.dataset.omgMessageRoot = ''
  target.append(root)
  const records = shallowReactive<OMessageHostRecord[]>([])
  const app = createApp(OMessageHost, {
    records,
    onRequestClose: requestClose,
    onPause: pause,
    onResume: resume,
    onAfterLeave: finalize,
  })
  const host: OMessageHostRuntime = { target, root, app, records, destroyed: false }
  hostsByTarget.set(target, host)
  hosts.add(host)
  app.mount(root)
  return host
}

const getHost = (target: HTMLElement): OMessageHostRuntime => {
  const current = hostsByTarget.get(target)
  return current && !current.destroyed ? current : createHost(target)
}
```

Normalize string/object input and enqueue every default explicitly. A helper-provided status overrides any untyped runtime status field:

```ts
const openMessage = (
  input: string | OMessageOptions,
  forcedStatus?: OMessageStatus,
): OMessageHandle => {
  const options: OMessageOptions = typeof input === 'string' ? { message: input } : input
  const target = resolveTarget(options.appendTo)
  if (!target) return { close: () => undefined }
  const host = getHost(target)
  const duration = normalizeOMessageDuration(options.duration)
  const id = `o-message-${String(++nextId)}`
  const record: OMessageHostRecord = {
    id,
    message: options.message,
    status: forcedStatus ?? options.status ?? 'info',
    closable: options.closable ?? false,
    closeAriaLabel: options.closeAriaLabel ?? 'Close message',
  }
  const runtime: OMessageRuntime = {
    host,
    record,
    onClose: options.onClose,
    pauseOnHover: options.pauseOnHover ?? true,
    persistent: duration === 0,
    pausedBy: new Set(),
    remaining: duration,
    startedAt: 0,
    timeout: undefined,
    closing: false,
    finalized: false,
  }
  active.set(id, runtime)
  host.records.push(record)
  startTimer(runtime)
  return { close: () => requestClose(id) }
}
```

Create each helper by applying a forced status, and build the public callable exactly once:

```ts
const closeAll = (): void => {
  for (const id of [...active.keys()]) requestClose(id)
}

const withStatus =
  (status: OMessageStatus) =>
  (input: OMessageHelperInput): OMessageHandle =>
    openMessage(input, status)

const service = Object.assign((input: string | OMessageOptions) => openMessage(input), {
  info: withStatus('info'),
  success: withStatus('success'),
  warning: withStatus('warning'),
  error: withStatus('error'),
  closeAll,
}) satisfies OMessageService
```

`destroy()` clears every timer, unmounts every Host, clears active/leaving/Host sets, replaces the WeakMap, and resets the ID counter without invoking consumer callbacks. Export `createOMessageService` only from the source module for tests. Create one default controller at module evaluation, export only its `service` as `oMessage`, and add `export { oMessage } from './src/message-service'` to `message/index.ts`; controller construction itself performs no DOM work.

Add tests for empty-host destruction followed by reopening the same target, stale WeakMap/Set removal, consumer `onClose` throwing without leaking a Host, and handle close in the same tick as enqueue.

- [ ] **Step 6: Add exact theme tokens and Message styles**

Add private `@message-dark-surface: #2d2d2d;`. Add `--omg-z-index-message: 1200` to foundation tokens, and these semantic values:

```less
// light
--omg-color-message-surface: @white;
--omg-shadow-message: 0 14px 36px fade(#0f172a, 18%), 0 4px 12px fade(#0f172a, 10%);

// dark
--omg-color-message-surface: @message-dark-surface;
--omg-shadow-message: 0 16px 40px fade(#000, 48%), 0 4px 14px fade(#000, 30%);
```

Create Message Less with:

```less
.o-message-host {
  position: fixed;
  z-index: var(--omg-z-index-message);
  top: var(--omg-space-4);
  right: var(--omg-space-4);
  display: flex;
  width: min(360px, calc(100vw - (var(--omg-space-4) * 2)));
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.o-message {
  display: flex;
  box-sizing: border-box;
  align-items: flex-start;
  gap: var(--omg-space-3);
  padding: var(--omg-space-3) var(--omg-space-4);
  border: 0;
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-message-surface);
  box-shadow: var(--omg-shadow-message);
  color: var(--omg-color-text);
  pointer-events: auto;
}

.o-message-enter-active {
  transition:
    opacity 260ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.o-message-leave-active {
  position: absolute;
  width: 100%;
  transform-origin: top right;
  transition:
    opacity 180ms cubic-bezier(0.25, 1, 0.5, 1),
    transform 180ms cubic-bezier(0.25, 1, 0.5, 1);
}

.o-message-enter-from {
  opacity: 0;
  transform: translateX(calc(100% + var(--omg-space-4)));
}

.o-message-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.o-message-move {
  transition: transform var(--omg-duration-normal) var(--omg-easing-standard);
}
```

Complete icon colors, wrapping, close hover/focus, icon/control sizing, and reduced-motion selectors. The absolute leaving wrapper keeps its static visual position while leaving the flex flow so Vue can calculate transform-only FLIP movement for the remaining rows. Do not tint the surface, add surface opacity, or animate layout properties.

Add source assertions that the surface has `border: 0`, both exact colors exist, enter uses positive `translateX`, leave uses only scale/opacity, and reduced motion disables enter/leave/move transitions.

- [ ] **Step 7: Verify focused behavior and styles**

Run:

```bash
pnpm exec vitest run packages/ui/src/components/message/__tests__/message.test.ts
pnpm exec eslint packages/ui/src/components/message
pnpm exec stylelint "packages/ui/src/components/message/**/*.{vue,less}" packages/ui/src/styles/tokens/*.less
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: lifecycle, fake-timer, target, semantics, and source-style tests pass without leaked Hosts.

- [ ] **Step 8: Commit the service and motion**

```bash
git add packages/ui/src/components/message packages/ui/src/styles/tokens
git commit -m "feat: add top-right message service"
```

### Task 3: Build ODrawer as a logical native-dialog composition

**Files:**

- Create: `packages/ui/src/components/drawer/src/drawer.ts`
- Create: `packages/ui/src/components/drawer/src/ODrawer.vue`
- Create: `packages/ui/src/components/drawer/style/index.less`
- Create: `packages/ui/src/components/drawer/__tests__/drawer.test.ts`
- Create: `packages/ui/src/components/drawer/index.ts`
- Modify: `packages/ui/src/styles/tokens/semantic.less`

**Interfaces:**

- Consumes: public `ODialog`, `oDialogProps`, and `ODialogSlots`.
- Produces: `ODrawer`, placement and size contracts, controlled close events, logical side geometry, and drawer-specific directional shadows.

- [ ] **Step 1: Write failing type, normalize, composition, and style tests**

Create `drawer.test.ts` using the same `HTMLDialogElement.showModal/close` mocks as `dialog.test.ts`. Assert:

```ts
expect(oDrawerPlacements).toEqual(['start', 'end'])
expect(oDrawerProps.placement.default).toBe('end')
expect(oDrawerProps.size.default).toBe(400)
expect(normalizeODrawerSize(480)).toBe('480px')
expect(normalizeODrawerSize(480.9)).toBe('480px')
expect(normalizeODrawerSize(' 32rem ')).toBe('32rem')
expect(normalizeODrawerSize('min(90vw, 36rem)')).toBe('min(90vw, 36rem)')
expect(normalizeODrawerSize(0)).toBe('400px')
expect(normalizeODrawerSize(Number.NaN)).toBe('400px')
expect(normalizeODrawerSize(Number.POSITIVE_INFINITY)).toBe('400px')
expect(normalizeODrawerSize('   ')).toBe('400px')
```

Mount an open Drawer and assert one `dialog.o-dialog.o-drawer.o-drawer--end`, the `--omg-drawer-inline-size` style, title/description IDs, default/header/footer slots, `$attrs` forwarding, placement updates, close-button events, controlled-parent rejection, mask/Esc delegation, and no copied focus-trap code in `ODrawer.vue`.

Read the Less source and require borderless full-height geometry, logical insets, RTL transform reversal, `@starting-style`, discrete display/overlay transitions, body-only scrolling, and reduced motion.

- [ ] **Step 2: Run the focused test and verify missing module failure**

Run: `pnpm exec vitest run packages/ui/src/components/drawer/__tests__/drawer.test.ts`

Expected: FAIL because the Drawer component directory does not exist.

- [ ] **Step 3: Implement the exact Drawer contract**

Create `drawer.ts`:

```ts
import { oDialogProps, type ODialogSlots } from '../../dialog'
import type { ExtractPublicPropTypes, PropType } from 'vue'

export const oDrawerPlacements = ['start', 'end'] as const
export type ODrawerPlacement = (typeof oDrawerPlacements)[number]
type ODrawerSize = string | number

const defaultDrawerSize = 400
const isDrawerPlacement = (value: unknown): value is ODrawerPlacement =>
  typeof value === 'string' && oDrawerPlacements.some((placement) => placement === value)

export const normalizeODrawerSize = (size: ODrawerSize | undefined): string => {
  if (typeof size === 'number') {
    return Number.isFinite(size) && size > 0
      ? `${String(Math.floor(size))}px`
      : `${String(defaultDrawerSize)}px`
  }
  const normalized = size?.trim()
  return normalized || `${String(defaultDrawerSize)}px`
}

export const oDrawerProps = {
  ...oDialogProps,
  closeAriaLabel: {
    type: String,
    default: 'Close drawer',
  },
  placement: {
    type: String as PropType<ODrawerPlacement>,
    default: 'end',
    validator: isDrawerPlacement,
  },
  size: {
    type: [String, Number] as PropType<ODrawerSize>,
    default: defaultDrawerSize,
  },
} as const

export type ODrawerProps = ExtractPublicPropTypes<typeof oDrawerProps>
export interface ODrawerEmits {
  'update:open': [open: boolean]
  close: []
}
export type ODrawerSlots = ODialogSlots
```

- [ ] **Step 4: Compose ODialog without duplicating modal behavior**

Implement `ODrawer.vue` with `inheritAttrs: false`, an exact-optional `optionalDialogProps` object matching Confirm Dialog, a CSS custom-property style, conditional slot forwarding, and mirrored close events:

```vue
<ODialog
  v-bind="$attrs"
  v-bind="optionalDialogProps"
  class="o-drawer"
  :class="`o-drawer--${props.placement}`"
  :style="drawerStyle"
  :open="props.open"
  :close-on-mask="props.closeOnMask"
  :close-on-esc="props.closeOnEsc"
  :show-close="props.showClose"
  :close-aria-label="props.closeAriaLabel"
  @update:open="emit('update:open', $event)"
  @close="emit('close')"
>
  <template v-if="slots.header" #header><slot name="header" /></template>
  <slot />
  <template v-if="slots.footer" #footer><slot name="footer" /></template>
</ODialog>
```

The computed style is `{ '--omg-drawer-inline-size': normalizeODrawerSize(props.size) }` typed as `CSSProperties`. Create the public index without the helper-only size alias:

```ts
export { default as ODrawer } from './src/ODrawer.vue'
export { normalizeODrawerSize, oDrawerPlacements, oDrawerProps } from './src/drawer'
export type { ODrawerEmits, ODrawerPlacement, ODrawerProps, ODrawerSlots } from './src/drawer'
```

- [ ] **Step 5: Implement logical geometry and directional motion**

Add these exact theme-specific directional shadows:

```less
// light
--omg-shadow-drawer-start: 18px 0 48px fade(#0f172a, 20%), 6px 0 18px fade(#0f172a, 10%);
--omg-shadow-drawer-end: -18px 0 48px fade(#0f172a, 20%), -6px 0 18px fade(#0f172a, 10%);

// dark
--omg-shadow-drawer-start: 18px 0 52px fade(#000, 54%), 6px 0 20px fade(#000, 34%);
--omg-shadow-drawer-end: -18px 0 52px fade(#000, 54%), -6px 0 20px fade(#000, 34%);
```

Create Less with these required selectors:

```less
.o-dialog.o-drawer {
  --omg-drawer-inline-size: 400px;
  --omg-drawer-closed-translate: 100%;

  position: fixed;
  inset-block: 0;
  width: min(100vw, var(--omg-drawer-inline-size));
  height: 100dvh;
  max-height: 100dvh;
  margin-block: 0;
  padding: 0;
  border: 0;
  opacity: 0;
  transform: translate3d(var(--omg-drawer-closed-translate), 0, 0);
  transition:
    opacity 140ms cubic-bezier(0.25, 1, 0.5, 1),
    transform 180ms cubic-bezier(0.25, 1, 0.5, 1),
    display 180ms allow-discrete,
    overlay 180ms allow-discrete;
}

.o-dialog.o-drawer--start {
  --omg-drawer-closed-translate: -100%;

  inset-inline-start: 0;
  inset-inline-end: auto;
  margin-inline: 0 auto;
  border-start-start-radius: 0;
  border-end-start-radius: 0;
  box-shadow: var(--omg-shadow-drawer-start);
}

.o-dialog.o-drawer--end {
  inset-inline-start: auto;
  inset-inline-end: 0;
  margin-inline: auto 0;
  border-start-end-radius: 0;
  border-end-end-radius: 0;
  box-shadow: var(--omg-shadow-drawer-end);
}

.o-dialog.o-drawer--start:dir(rtl) {
  --omg-drawer-closed-translate: 100%;

  box-shadow: var(--omg-shadow-drawer-end);
}
.o-dialog.o-drawer--end:dir(rtl) {
  --omg-drawer-closed-translate: -100%;

  box-shadow: var(--omg-shadow-drawer-start);
}
.o-dialog.o-drawer[open] {
  opacity: 1;
  transform: none;
  transition-duration: 260ms, 260ms, 260ms, 260ms;
}
.o-dialog.o-drawer > .o-dialog__body {
  min-height: 0;
  flex: 1;
}

.o-dialog.o-drawer::backdrop {
  opacity: 0;
  transition:
    opacity 140ms cubic-bezier(0.25, 1, 0.5, 1),
    display 180ms allow-discrete,
    overlay 180ms allow-discrete;
}

.o-dialog.o-drawer[open]::backdrop {
  opacity: 1;
  transition-duration: 260ms, 260ms, 260ms;
}

@starting-style {
  .o-dialog.o-drawer[open] {
    opacity: 0;
    transform: translate3d(var(--omg-drawer-closed-translate), 0, 0);
  }

  .o-dialog.o-drawer[open]::backdrop {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .o-dialog.o-drawer,
  .o-dialog.o-drawer::backdrop {
    transition: none;
  }
}
```

Do not leave `translate3d(0, 0, 0)` or `will-change: transform` on the settled open Drawer: either creates a fixed containing block that offsets inline fixed-position Select panels. Do not animate width, height, inset, margin, or shadow.

- [ ] **Step 6: Run focused Drawer validation**

Run:

```bash
pnpm exec vitest run packages/ui/src/components/drawer/__tests__/drawer.test.ts packages/ui/src/components/dialog/__tests__/dialog.test.ts
pnpm exec eslint packages/ui/src/components/drawer
pnpm exec stylelint "packages/ui/src/components/drawer/**/*.{vue,less}" packages/ui/src/styles/tokens/semantic.less
pnpm --filter @puzzle-fuzzy/ui typecheck
```

Expected: Drawer and existing Dialog tests pass; ODialog behavior remains the only focus/mask implementation.

- [ ] **Step 7: Commit Drawer**

```bash
git add packages/ui/src/components/drawer packages/ui/src/styles/tokens/semantic.less
git commit -m "feat: add logical side drawer"
```

### Task 4: Publish both component families and lock package contracts

**Files:**

- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.less`
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/vite.config.ts`
- Modify: `scripts/check-naming.mjs`
- Modify: `packages/ui/tests/package/package-contract.test.ts`
- Modify: `scripts/test-package.mjs`
- Modify: `packages/ui/tests/ssr/ssr.test.ts`

**Interfaces:**

- Consumes: completed Message and Drawer public entries.
- Produces: root imports, `@puzzle-fuzzy/ui/message`, `@puzzle-fuzzy/ui/drawer`, declarations, shared CSS, attw coverage, consumer build, and SSR-safe imports.

- [ ] **Step 1: Add failing naming, manifest, dist-file, consumer, and SSR expectations**

Add `message` and `drawer` to expected component arrays and add these files to the package contract:

```ts
'dist/components/drawer/index.js',
'dist/components/drawer/index.d.ts',
'dist/components/message/index.js',
'dist/components/message/index.d.ts',
```

Add SSR tests that render a success `OMessage`, an error `OMessage`, and an open `ODrawer`. Assert Message roles/text/close label, Drawer title/body/class, no server-side native `open` attribute, and stable repeated Drawer IDs.

The SSR suite uses jsdom, so prove the service no-op explicitly:

```ts
expect(document.querySelector('.o-message-host')).toBeNull()
vi.stubGlobal('document', undefined)
try {
  const handle = oMessage('SSR')
  handle.close()
  handle.close()
} finally {
  vi.unstubAllGlobals()
}
expect(document.querySelector('.o-message-host')).toBeNull()
```

This test also proves importing the root entry did not eagerly mount a Host.

Run: `pnpm check:naming && pnpm build && pnpm test:ssr && pnpm test:package`

Expected before publication edits: naming reports unsupported families or missing integration, subpath/dist assertions fail, and root imports are absent.

- [ ] **Step 2: Add explicit root and stylesheet aggregation**

Insert these root blocks in component order:

```ts
export { ODrawer, normalizeODrawerSize, oDrawerPlacements, oDrawerProps } from './components/drawer'
export type {
  ODrawerEmits,
  ODrawerPlacement,
  ODrawerProps,
  ODrawerSlots,
} from './components/drawer'

export {
  OMessage,
  normalizeOMessageDuration,
  oMessage,
  oMessageProps,
  oMessageStatuses,
} from './components/message'
export type {
  OMessageEmits,
  OMessageHandle,
  OMessageOptions,
  OMessageProps,
  OMessageService,
  OMessageSlots,
  OMessageStatus,
} from './components/message'
```

Import Drawer styles immediately after Dialog styles and Message styles after Input styles.

- [ ] **Step 3: Add subpath manifest and Vite entries**

Add exact `./drawer` and `./message` ESM/types exports and these Vite library entries:

```ts
'components/drawer/index': fromPackageRoot('src/components/drawer/index.ts'),
'components/message/index': fromPackageRoot('src/components/message/index.ts'),
```

Do not change dependencies, peer dependencies, package format, license, or side effects.

- [ ] **Step 4: Extend naming and real package consumption**

Add the two families to `expectedComponents`. At this task, retain the existing source-directory contract; the documentation checks are added only after pages exist in Task 7.

Add both subpaths to attw. In the generated consumer, import `oMessage as rootMessage` from the root and `oMessage as subpathMessage` from `@puzzle-fuzzy/ui/message`, together with root/subpath components, `OMessageService`, and `OMessageStatus`. Assign both services without calling them during consumer build:

```ts
const rootMessageService: OMessageService = rootMessage
const subpathMessageService: OMessageService = subpathMessage
void rootMessageService
void subpathMessageService
```

Render:

```vue
<ORootMessage message="Root message" status="success" />
<OSubpathMessage message="Subpath message" :status="messageStatus" />
<ORootDrawer :open="false" title="Root drawer">Drawer</ORootDrawer>
<OSubpathDrawer :open="false" placement="start" size="24rem" title="Subpath drawer" />
```

- [ ] **Step 5: Verify publication and SSR**

Run:

```bash
pnpm check:naming
pnpm build
pnpm test:ssr
pnpm test:package
```

Expected: naming reports 23 component families; SSR passes without Host creation; publint, attw, declarations, root/subpath consumer typecheck, and Vite consumer build pass.

- [ ] **Step 6: Commit package integration**

```bash
git add packages/ui scripts/check-naming.mjs scripts/test-package.mjs
git commit -m "build: publish message and drawer entries"
```

### Task 5: Fully document Message capabilities in VitePress

**Files:**

- Create: `apps/docs/examples/message/Basic.vue`
- Create: `apps/docs/examples/message/Declarative.vue`
- Create: `apps/docs/examples/message/Themes.vue`
- Create: `apps/docs/docs/components/message.md`

**Interfaces:**

- Consumes: public `OMessage`, `oMessage`, status/service types, exact theme tokens, and target mounting.
- Produces: stable accessible labels and demo regions consumed by Task 7 browser tests.

- [ ] **Step 1: Create the service lifecycle demo**

`Basic.vue` must expose buttons named exactly:

- `显示普通消息`
- `显示成功消息`
- `显示警告消息`
- `显示错误消息`
- `显示三条消息`
- `显示持久消息`
- `关闭持久消息`
- `关闭全部消息`
- `显示长消息`

Use each helper, plain `oMessage()`, a retained `OMessageHandle`, `duration: 0`, `closable: true`, localized close labels, and a long Chinese sentence. The `显示成功消息` action must call `oMessage.success('保存成功')`, fixing the exact E2E-visible content. The demo root is a region labeled `Message service and lifecycle`.

- [ ] **Step 2: Create the declarative surface demo**

`Declarative.vue` renders all four `OMessage` statuses in normal document flow, a closable surface with visible close feedback, a custom `LuBell` icon slot, custom default content, and a long wrapping message. The root is labeled `Message declarative surfaces` and uses no card border.

- [ ] **Step 3: Create exact light and dark target demos**

`Themes.vue` uses two connected target refs:

```ts
const lightTarget = ref<HTMLElement | null>(null)
const darkTarget = ref<HTMLElement | null>(null)

const showLight = (): void => {
  if (!lightTarget.value) return
  oMessage.info({
    message: '白色消息表面',
    duration: 0,
    closable: true,
    appendTo: lightTarget.value,
  })
}

const showDark = (): void => {
  if (!darkTarget.value) return
  oMessage.success({
    message: '深色消息表面',
    duration: 0,
    closable: true,
    appendTo: darkTarget.value,
  })
}
```

Each target is a positioned scoped container with `data-omg-theme="light"` or `dark`; document that a host mounted inside a native dialog must likewise target an element inside that dialog. Label the root `Message solid theme surfaces`.

- [ ] **Step 4: Write the complete Message page**

`message.md` imports all three demos and contains three DemoBlocks. Document root/subpath imports, component Props/Events/Slots, every service option, helper functions, handle, `closeAll`, default normalization, pause with remaining time, physical top-right behavior in RTL, exact colors, no-border shadow hierarchy, long text, ARIA roles, reduced motion, SSR no-op, selector fallback, scoped themes, and native-dialog target guidance.

- [ ] **Step 5: Verify the standalone page compiles**

Run: `pnpm docs:build`

Expected before shared navigation registration: the direct `/components/message` page builds and all examples typecheck.

- [ ] **Step 6: Commit Message docs**

```bash
git add apps/docs/examples/message apps/docs/docs/components/message.md
git commit -m "docs: demonstrate message capabilities"
```

### Task 6: Fully document Drawer capabilities in VitePress

**Files:**

- Create: `apps/docs/examples/drawer/Basic.vue`
- Create: `apps/docs/examples/drawer/Placement.vue`
- Create: `apps/docs/examples/drawer/Scrollable.vue`
- Create: `apps/docs/examples/drawer/Behavior.vue`
- Create: `apps/docs/docs/components/drawer.md`

**Interfaces:**

- Consumes: public `ODrawer`, `OButton`, `OInput`, and `OSelect`.
- Produces: stable labels and scenarios for geometry, focus, scrolling, policy, dark, RTL, and top-layer browser coverage.

- [ ] **Step 1: Create the controlled basic Drawer demo**

`Basic.vue` uses `v-model:open`, title `项目设置`, description, `:size="400"`, localized close label, body copy, and footer buttons. The opening button is named `从右侧打开`; both footer actions update consumer state. The region label is `Drawer basic controlled panel`.

- [ ] **Step 2: Create placement, size, RTL, and dark variants**

`Placement.vue` provides independent buttons named `从起始侧打开` and `从结束侧打开`, using `placement="start" :size="320"` and `placement="end" size="28rem"`. Add a `dir="rtl" data-omg-theme="dark"` section whose button is named `在 RTL 中从起始侧打开`. The region label is `Drawer logical placements and sizes`.

- [ ] **Step 3: Create custom slots and scrolling content**

`Scrollable.vue` uses a named custom header with an accessible visible heading, 40 deterministic content rows, an `OInput`, an `OSelect :teleported="false"`, and a custom footer. Label the Select `抽屉内选择器` and the region `Drawer custom slots and scrollable content`.

- [ ] **Step 4: Create dismissal-policy demo**

`Behavior.vue` renders one Drawer with `:close-on-mask="false"`, `:close-on-esc="false"`, and `:show-close="false"`. Its only close path is a visible autofocus button named `关闭锁定面板`. The opener is named `打开锁定面板`, and the region label is `Drawer dismissal controls`.

- [ ] **Step 5: Write the complete Drawer page**

`drawer.md` imports all four demos and documents root/subpath imports, every prop/event/slot, numeric and CSS-string size normalization, controlled close semantics, `start/end` in RTL, native focus and return, mask/Esc policy, page scroll lock, body-only scrolling, responsive width, borderless directional elevation, discrete entry/exit motion, reduced motion, Select/Dropdown top-layer targeting, and the UI-only non-goals.

- [ ] **Step 6: Verify and commit Drawer docs**

Run: `pnpm docs:build`

Expected: all four Drawer demos compile without top-level DOM access.

```bash
git add apps/docs/examples/drawer apps/docs/docs/components/drawer.md
git commit -m "docs: demonstrate drawer capabilities"
```

### Task 7: Register documentation, enforce capability presence, and add browser tests

**Files:**

- Modify: `apps/docs/docs/.vitepress/config.mts`
- Modify: `apps/docs/docs/index.md`
- Modify: `apps/docs/docs/components/index.md`
- Modify: `apps/docs/tests/e2e/components.spec.ts`
- Modify: `scripts/check-naming.mjs`

**Interfaces:**

- Consumes: completed Message and Drawer pages/examples plus their stable accessible labels.
- Produces: discoverable navigation, accurate counts, automated page-registration contract, and end-to-end visual/interaction verification.

- [ ] **Step 1: Add failing documentation-contract checks**

Read the VitePress config, overview, and E2E source once near the top of `check-naming.mjs`. For every expected family, require:

```js
await access(resolve(repositoryRoot, 'apps/docs/docs/components', directory + '.md'))

if (!docsConfig.includes('find: /^@puzzle-fuzzy\\/ui\\/' + directory + '$/')) {
  errors.push(directory + ': missing VitePress source alias')
}
if (!docsConfig.includes("link: '/components/" + directory + "'")) {
  errors.push(directory + ': missing VitePress sidebar entry')
}
if (!docsOverview.includes('](/components/' + directory + ')')) {
  errors.push(directory + ': missing component overview link')
}
if (!e2eSource.includes("page.goto('/components/" + directory + "')")) {
  errors.push(directory + ': missing Playwright route visit')
}
```

Keep existing semantic example filenames valid. Require `apps/docs/examples/message/Basic.vue` and `apps/docs/examples/drawer/Basic.vue` explicitly, not `Basic.vue` for every mature family.

Run: `pnpm check:naming`

Expected: FAIL for missing Message/Drawer aliases, sidebar/overview/E2E routes and the existing missing Widget overview link.

- [ ] **Step 2: Register aliases, navigation, and accurate counts**

Add source aliases for `/message` and `/drawer`, then add both under `浮层、导航与流程`. Add Widget, Message, and Drawer to the overview. Set the overview to `23 个组件族、24 个公开 Vue 组件` and the homepage to `23 个组件族`.

- [ ] **Step 3: Add Message browser coverage**

Add a test that visits `/components/message`, opens success and persistent messages, and asserts:

```ts
const message = page.getByRole('status').filter({ hasText: '保存成功' })
await expect(message).toHaveCSS('position', 'static')
const item = message.locator('..')
const host = item.locator('..')
await expect(host).toHaveCSS('position', 'fixed')
await expect(message).toHaveCSS('background-color', 'rgb(255, 255, 255)')
await expect(message).toHaveCSS('border-left-width', '0px')
expect(await message.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none')
```

At a 1280px viewport, assert the host right edge is 16px from the viewport in LTR and RTL. Verify four status classes contain distinct SVG component markup, persistent close, `closeAll`, long-text width, stack gap/reflow, and axe. Click `关闭全部消息` and wait for every `.o-message-host` to detach before starting the scoped-light phase; repeat that cleanup before scoped-dark, RTL, and reduced-motion phases so persistent Hosts never overlap or intercept one another. Trigger the dark scoped target only after cleanup and assert `rgb(45, 45, 45)`.

Capture motion on `.o-message-host__item`, not the inner surface. Use an in-page helper that polls across animation frames until both the opacity and transform transitions exist, pauses both, reads their keyframes, resumes both, and fails after eight frames:

```ts
const captureTransitions = (item: Locator) =>
  item.evaluate(
    (element) =>
      new Promise<readonly { frames: ComputedKeyframe[]; property: string }[]>(
        (resolve, reject) => {
          let attempts = 0
          const inspect = () => {
            const transitions = element
              .getAnimations()
              .filter((animation): animation is CSSTransition => animation instanceof CSSTransition)
              .filter((transition) =>
                ['opacity', 'transform'].includes(transition.transitionProperty),
              )
            const properties = new Set(
              transitions.map((transition) => transition.transitionProperty),
            )
            if (properties.has('opacity') && properties.has('transform')) {
              for (const transition of transitions) transition.pause()
              const snapshots = transitions.map((transition) => ({
                frames: (transition.effect as KeyframeEffect).getKeyframes(),
                property: transition.transitionProperty,
              }))
              for (const transition of transitions) transition.play()
              resolve(snapshots)
              return
            }
            attempts += 1
            if (attempts >= 8) reject(new Error('Expected an active message transition'))
            else requestAnimationFrame(inspect)
          }
          requestAnimationFrame(inspect)
        },
      ),
  )
```

For entry, call the helper as soon as the keyed wrapper appears. Before testing leave, await every entry animation's `finished` promise so the capture cannot mistake entry for exit. Then create the leave-helper promise before clicking the close button and await it after the click. Read opacity and transform snapshots independently: require entry opacity from 0 and positive X translation; require leave opacity toward 0 and scale below 1 with no positive X translation. Under reduced motion, do not call the helper: assert `getAnimations()` is empty and wait for deterministic node/Host cleanup.

- [ ] **Step 4: Add Drawer browser coverage**

Add one test for controlled modal behavior and one for logical/context variants. At a 1280×720 viewport assert default end Drawer width 400, right edge 1280, height 720, all border widths 0, visible directional shadow, and locked `html` overflow. Verify close-button focus, forward/backward Tab cycle, Escape/mask close, and trigger focus return.

For start/end, assert LTR start left edge 0 and RTL start right edge equals viewport width, including the matching inward shadow direction. At a 320px viewport, assert Drawer width is at most 320. In the scroll demo, wait for the entry transition to finish, require body `scrollHeight > clientHeight`, keep header/footer visible, and prove `抽屉内选择器` opens an inline listbox inside the dialog without coordinate drift. In the locked demo prove Escape and mask do not close while `关闭锁定面板` does.

Verify real close motion using the CSS locator `dialog.o-drawer`: after requesting close, assert the native `open` attribute is removed while the element remains briefly visible, inspect an active `CSSTransition` whose `transitionProperty` is `transform` or `opacity`, then wait for hidden state and trigger-focus restoration. Under reduced motion, assert close hides immediately with no active transition. Also verify entry keyframes, dark theme, and axe.

- [ ] **Step 5: Run documentation and browser gates**

Run:

```bash
pnpm check:naming
pnpm docs:build
pnpm --filter @puzzle-fuzzy/docs exec playwright test --grep "Message|Drawer"
```

Expected: naming passes for 23 families, VitePress builds, and all new visual, interaction, motion, and accessibility tests pass.

- [ ] **Step 6: Commit navigation and browser contracts**

```bash
git add apps/docs scripts/check-naming.mjs
git commit -m "test: cover message and drawer documentation"
```

### Task 8: Record design boundaries and run the full release gate

**Files:**

- Modify: `packages/ui/README.md`
- Modify: `PRODUCT.md`
- Modify: `DESIGN.md`
- Modify: `.impeccable/design.json`
- Review: every changed file from Tasks 1–7

**Interfaces:**

- Consumes: final runtime, package, docs, and browser contracts.
- Produces: durable personal-library guidance, a clean verified branch, and intentional commits ready for a separately authorized push.

- [ ] **Step 1: Update public and product boundaries**

Add `/message` and `/drawer` to the README subpath list. Document declarative versus service Message usage, `duration`, pause, `appendTo`, SSR no-op, exact solid surfaces, Drawer logical placement/size, and Drawer-internal Select guidance. State that display timers are UI lifecycle, while request mapping, retry, persistence, dirty-form confirmation, and navigation remain consumer responsibilities.

Update PRODUCT with the same UI-only boundary and accurate component count.

- [ ] **Step 2: Update the design sources of truth**

Add Message and Drawer component records to DESIGN and `.impeccable/design.json`. Record:

- Message surface light `#fff`, dark `#2d2d2d`, message shadow, status icons, physical top-right, 260ms right entry, 180ms scale/fade exit, and reduced motion;
- Drawer borderless native top layer, start/end geometry, directional shadows, body-only scroll, discrete motion, and top-layer floating guidance;
- the border budget rule that neither surface receives a decorative outline.

Do not change VitePress brand variables or unrelated component records.

- [ ] **Step 3: Format and inspect the final scope**

Run:

```bash
pnpm format
git diff --check
git diff --stat
```

Expected: formatting succeeds, no whitespace errors remain, and the diff contains only Message, Drawer, their integration, documentation contracts, tests, and design records.

- [ ] **Step 4: Run the complete release gate**

Run:

```bash
pnpm verify
```

Expected: the repository's canonical gate expands to check, build, SSR, package, and E2E; format, ESLint, Stylelint, 23-family naming/docs contract, typecheck, coverage thresholds, library/docs builds, publint, attw, real tarball consumer, all Playwright tests, and axe checks pass.

- [ ] **Step 5: Perform a final protected-scope audit**

Confirm:

- Message service module import performs no DOM work;
- Message light/dark surfaces are exact and opaque, with zero border;
- entry translates from the right and leave only scales/fades;
- Drawer delegates focus/mask/Esc/scroll lock to ODialog;
- Drawer start/end remain logical while Message remains physically right-aligned;
- Image preview, Tabs, Widget, Avatar, existing form controls, and VitePress variables have no unintended diff.

- [ ] **Step 6: Commit final design records if they were not included earlier**

```bash
git add --all
git commit -m "docs: record message and drawer boundaries"
```

- [ ] **Step 7: Report repository state**

Run: `git status --short --branch && git rev-list --left-right --count origin/main...HEAD`

Expected: clean local `main`, zero commits behind the fetched remote, and local commits ahead. Do not push unless the user separately requests it.
