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

export const createOMessageService = (): OMessageServiceController => {
  let nextId = 0
  let hostsByTarget = new WeakMap<HTMLElement, OMessageHostRuntime>()
  const hosts = new Set<OMessageHostRuntime>()
  const active = new Map<string, OMessageRuntime>()
  const leaving = new Map<string, OMessageRuntime>()

  const resolveTarget = (appendTo?: string | HTMLElement): HTMLElement | undefined => {
    if (typeof document === 'undefined') return undefined
    if (
      typeof HTMLElement !== 'undefined' &&
      appendTo instanceof HTMLElement &&
      appendTo.isConnected
    ) {
      return appendTo
    }
    if (typeof appendTo === 'string') {
      try {
        const selected = document.querySelector(appendTo)
        if (
          typeof HTMLElement !== 'undefined' &&
          selected instanceof HTMLElement &&
          selected.isConnected
        ) {
          return selected
        }
      } catch {
        // Invalid selectors use the same safe body fallback as missing targets.
      }
    }
    return document.body ?? undefined
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
    leaving.set(id, runtime)
    const index = runtime.host.records.findIndex((record) => record.id === id)
    if (index >= 0) runtime.host.records.splice(index, 1)
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
    ) {
      return
    }
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
    ) {
      return
    }
    runtime.pausedBy.delete(source)
    if (runtime.pausedBy.size > 0) return
    if (runtime.remaining === 0) requestClose(id)
    else startTimer(runtime)
  }

  const createHost = (target: HTMLElement): OMessageHostRuntime => {
    const root = target.ownerDocument.createElement('div')
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

  const openMessage = (
    input: string | OMessageOptions,
    forcedStatus?: OMessageStatus,
  ): OMessageHandle => {
    const options = typeof input === 'string' ? { message: input } : input
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
      pauseOnHover: options.pauseOnHover ?? false,
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

  const destroy = (): void => {
    const runtimes = new Set([...active.values(), ...leaving.values()])
    for (const runtime of runtimes) {
      if (runtime.timeout !== undefined) clearTimeout(runtime.timeout)
      runtime.timeout = undefined
    }
    active.clear()
    leaving.clear()
    for (const host of [...hosts]) destroyHost(host)
    hosts.clear()
    hostsByTarget = new WeakMap()
    nextId = 0
  }

  return { service, destroy }
}

const defaultOMessageController = createOMessageService()

export const oMessage = defaultOMessageController.service
