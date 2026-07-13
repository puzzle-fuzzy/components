import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  OMessage,
  normalizeOMessageDuration,
  oMessageProps,
  oMessageStatuses,
  type OMessageEmits,
  type OMessageOptions,
  type OMessageProps,
  type OMessageService,
  type OMessageSlots,
} from '../index'
import { createOMessageService } from '../src/message-service'

type TestController = ReturnType<typeof createOMessageService>

const controllers: TestController[] = []

const createTestService = (): TestController => {
  const controller = createOMessageService()
  controllers.push(controller)
  return controller
}

const flushLeaveTransitions = async (): Promise<void> => {
  await nextTick()
  await vi.runAllTimersAsync()
  await nextTick()
}

afterEach(() => {
  vi.unstubAllGlobals()
  for (const controller of controllers.splice(0)) controller.destroy()
  vi.restoreAllMocks()
  vi.clearAllTimers()
  vi.useRealTimers()
  document.body.replaceChildren()
})

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

  it('keeps declarative OMessage controlled and timer-free', async () => {
    vi.useFakeTimers()
    const wrapper = mount(OMessage, {
      props: { message: 'Controlled surface', closable: true },
    })

    await vi.advanceTimersByTimeAsync(10_000)

    expect(wrapper.get('.o-message').text()).toContain('Controlled surface')
    expect(wrapper.emitted('close')).toBeUndefined()
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
    expect(wrapper.find('.o-message__close').exists()).toBe(false)
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
    await close.trigger('click')

    expect(wrapper.emitted('close')).toEqual([[], []])
  })

  it('uses named Lucide icons and the exact motion vocabulary', () => {
    const componentSource = readFileSync(
      resolve('packages/ui/src/components/message/src/OMessage.vue'),
      'utf8',
    )
    const styles = readFileSync(
      resolve('packages/ui/src/components/message/style/index.less'),
      'utf8',
    )
    const hostSource = readFileSync(
      resolve('packages/ui/src/components/message/src/OMessageHost.vue'),
      'utf8',
    )
    const serviceSource = readFileSync(
      resolve('packages/ui/src/components/message/src/message-service.ts'),
      'utf8',
    )

    expect(componentSource).toContain("from 'vue-icons-plus/lu'")
    expect(componentSource).toContain('LuInfo')
    expect(componentSource).toContain('LuCheckCircle2')
    expect(componentSource).toContain('LuAlertTriangle')
    expect(componentSource).toContain('LuXCircle')
    expect(componentSource).toContain('LuX')
    expect(styles).toMatch(/\.o-message\s*\{[^}]*border:\s*0/su)
    expect(styles).toMatch(
      /\.o-message\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*auto minmax\(0,\s*1fr\) auto;/su,
    )
    expect(styles).toContain('--omg-message-accent: var(--omg-color-brand)')
    expect(styles).toContain('--omg-message-icon-background: var(--omg-color-brand-soft)')
    expect(styles).toMatch(
      /\.o-message__icon\s*\{[^}]*inline-size:\s*28px;[^}]*block-size:\s*28px;/su,
    )
    expect(styles).toMatch(
      /\.o-message__icon\s*>\s*svg\s*\{[^}]*inline-size:\s*var\(--omg-space-4\);[^}]*block-size:\s*var\(--omg-space-4\);/su,
    )
    expect(styles).toMatch(
      /\.o-message__content\s*\{[^}]*display:\s*grid;[^}]*min-block-size:\s*28px;[^}]*align-content:\s*center;[^}]*gap:\s*var\(--omg-space-1\);/su,
    )
    expect(styles).toMatch(
      /\.o-message__close\s*\{[^}]*inline-size:\s*var\(--omg-space-6\);[^}]*block-size:\s*var\(--omg-space-6\);/su,
    )
    expect(styles).toMatch(
      /\.o-message__close\s*>\s*svg\s*\{[^}]*inline-size:\s*var\(--omg-space-4\);[^}]*block-size:\s*var\(--omg-space-4\);/su,
    )
    expect(styles).toMatch(
      /\.o-message--info\s*\{[^}]*--omg-message-accent:\s*var\(--omg-color-brand\);[^}]*--omg-message-icon-background:\s*var\(--omg-color-brand-soft\);/su,
    )
    expect(styles).toMatch(
      /\.o-message--success\s*\{[^}]*--omg-message-accent:\s*var\(--omg-color-success\);[^}]*--omg-message-icon-background:\s*var\(--omg-color-success-soft\);/su,
    )
    expect(styles).toMatch(
      /\.o-message--warning\s*\{[^}]*--omg-message-accent:\s*var\(--omg-color-warning\);[^}]*--omg-message-icon-background:\s*var\(--omg-color-warning-soft\);/su,
    )
    expect(styles).toMatch(
      /\.o-message--error\s*\{[^}]*--omg-message-accent:\s*var\(--omg-color-danger\);[^}]*--omg-message-icon-background:\s*var\(--omg-color-danger-soft\);/su,
    )
    expect(styles).toMatch(
      /@media\s*\(pointer:\s*coarse\)\s*\{[\s\S]*\.o-message__close::before\s*\{[^}]*inline-size:\s*44px;[^}]*block-size:\s*44px;/su,
    )
    expect(styles).toMatch(/\.o-message-enter-from\s*\{[^}]*opacity:\s*0[^}]*translateX\(/su)
    expect(styles).toMatch(/\.o-message-leave-to\s*\{[^}]*opacity:\s*0[^}]*scale\(0\.9\)/su)
    expect(styles).not.toMatch(/\.o-message-leave-to\s*\{[^}]*translateX\(/su)
    expect(styles).toMatch(
      /\.o-message-leave-active\s*\{[^}]*position:\s*absolute;[^}]*width:\s*100%;/su,
    )
    expect(styles).toMatch(/prefers-reduced-motion:\s*reduce/su)
    expect(styles).toMatch(/\.o-message-move[\s\S]*transition:\s*none/su)
    expect(hostSource).toContain('@after-leave="handleAfterLeave"')
    expect(serviceSource).toContain('onAfterLeave: finalize')
    expect(serviceSource).toContain('leaving.set(id, runtime)')
    expect(serviceSource).toMatch(
      /try\s*\{[^}]*runtime\.onClose\?\.\(\)[^}]*\}\s*finally\s*\{[^}]*destroyHostWhenEmpty/su,
    )
  })
})

describe('oMessage service', () => {
  it('does not mount until the first browser call', async () => {
    expect(document.querySelector('.o-message-host')).toBeNull()
    const controller = createTestService()
    const service: OMessageService = controller.service
    expect(document.querySelector('.o-message-host')).toBeNull()

    service('Hello')
    await nextTick()

    expect(document.querySelectorAll('.o-message-host')).toHaveLength(1)
    expect(document.querySelector('.o-message')?.textContent).toContain('Hello')
    expect(document.querySelector('.o-message')?.classList).toContain('o-message--info')
    expect(document.querySelector('.o-message__close')).toBeNull()
  })

  it('shares one host per target and keeps separate connected targets isolated', async () => {
    const controller = createTestService()
    const firstTarget = document.createElement('section')
    const secondTarget = document.createElement('section')
    secondTarget.id = 'second-message-target'
    document.body.append(firstTarget, secondTarget)

    controller.service.info({ message: 'One', duration: 0, appendTo: firstTarget })
    controller.service.success({ message: 'Two', duration: 0, appendTo: firstTarget })
    controller.service.warning({
      message: 'Three',
      duration: 0,
      appendTo: '#second-message-target',
    })
    await nextTick()

    expect(firstTarget.querySelectorAll('.o-message-host')).toHaveLength(1)
    expect(firstTarget.querySelectorAll('.o-message')).toHaveLength(2)
    expect(secondTarget.querySelectorAll('.o-message-host')).toHaveLength(1)
    expect(secondTarget.querySelectorAll('.o-message')).toHaveLength(1)
  })

  it('falls back to body for malformed, missing, and disconnected targets', async () => {
    const controller = createTestService()
    const disconnected = document.createElement('div')

    controller.service({ message: 'Malformed', duration: 0, appendTo: '[' })
    controller.service({ message: 'Missing', duration: 0, appendTo: '#missing-target' })
    controller.service({ message: 'Disconnected', duration: 0, appendTo: disconnected })
    await nextTick()

    expect(document.body.querySelectorAll(':scope > [data-omg-message-root]')).toHaveLength(1)
    expect(document.body.querySelectorAll('.o-message')).toHaveLength(3)
  })

  it('renders all helpers with their forced status', async () => {
    const controller = createTestService()

    controller.service.info({ message: 'Info', duration: 0 })
    controller.service.success({ message: 'Success', duration: 0 })
    controller.service.warning({ message: 'Warning', duration: 0 })
    controller.service.error({ message: 'Error', duration: 0 })
    await nextTick()

    expect(document.querySelectorAll('.o-message--info')).toHaveLength(1)
    expect(document.querySelectorAll('.o-message--success')).toHaveLength(1)
    expect(document.querySelectorAll('.o-message--warning')).toHaveLength(1)
    expect(document.querySelectorAll('.o-message--error')).toHaveLength(1)
    expect(document.querySelector('.o-message--error')?.getAttribute('role')).toBe('alert')
  })

  it('keeps duration zero persistent and closes timed messages once', async () => {
    vi.useFakeTimers()
    const controller = createTestService()
    const timedClose = vi.fn()
    const persistentClose = vi.fn()

    controller.service.success({ message: 'Timed', duration: 1000, onClose: timedClose })
    controller.service.info({ message: 'Persistent', duration: 0, onClose: persistentClose })
    await nextTick()

    await vi.advanceTimersByTimeAsync(999)
    expect(document.body.textContent).toContain('Timed')
    await vi.advanceTimersByTimeAsync(1)
    await flushLeaveTransitions()

    expect(timedClose).toHaveBeenCalledOnce()
    expect(persistentClose).not.toHaveBeenCalled()
    expect(document.body.textContent).not.toContain('Timed')
    expect(document.body.textContent).toContain('Persistent')
  })

  it('uses 3000ms by default and ignores hover unless opted in', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const controller = createTestService()
    const onClose = vi.fn()

    controller.service({ message: 'Default lifecycle', onClose })
    await nextTick()
    const item = document.querySelector<HTMLElement>('.o-message-host__item')!

    await vi.advanceTimersByTimeAsync(2500)
    item.dispatchEvent(new MouseEvent('mouseenter'))
    await vi.advanceTimersByTimeAsync(500)
    await flushLeaveTransitions()

    expect(onClose).toHaveBeenCalledOnce()
    expect(document.querySelector('.o-message')).toBeNull()
    expect(document.querySelector('.o-message-host')).toBeNull()
  })

  it('preserves remaining time when hover pause is explicitly enabled', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const controller = createTestService()
    const onClose = vi.fn()

    controller.service({
      message: 'Hover me',
      duration: 1000,
      pauseOnHover: true,
      onClose,
    })
    await nextTick()
    const item = document.querySelector<HTMLElement>('.o-message-host__item')!

    await vi.advanceTimersByTimeAsync(600)
    item.dispatchEvent(new MouseEvent('mouseenter'))
    await vi.advanceTimersByTimeAsync(2000)
    expect(onClose).not.toHaveBeenCalled()

    item.dispatchEvent(new MouseEvent('mouseleave'))
    await vi.advanceTimersByTimeAsync(399)
    expect(onClose).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    await flushLeaveTransitions()

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('pauses while focus is inside with the default hover policy', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const controller = createTestService()
    const onClose = vi.fn()

    controller.service({
      message: 'Focusable',
      duration: 1000,
      closable: true,
      onClose,
    })
    await nextTick()
    const item = document.querySelector<HTMLElement>('.o-message-host__item')!
    const close = item.querySelector<HTMLButtonElement>('.o-message__close')!

    await vi.advanceTimersByTimeAsync(600)
    close.focus()
    await nextTick()
    await vi.advanceTimersByTimeAsync(2000)
    expect(onClose).not.toHaveBeenCalled()

    close.blur()
    await nextTick()
    await vi.advanceTimersByTimeAsync(400)
    await flushLeaveTransitions()

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('keeps non-positive durations persistent and closes positive fractions after at least one millisecond', async () => {
    vi.useFakeTimers()
    const controller = createTestService()
    const fractionalClose = vi.fn()
    const zeroHandle = controller.service({ message: 'Zero', duration: 0 })
    const negativeHandle = controller.service({ message: 'Negative', duration: -1 })

    controller.service({ message: 'Fractional', duration: 0.8, onClose: fractionalClose })
    await nextTick()

    expect(document.body.textContent).toContain('Zero')
    expect(document.body.textContent).toContain('Negative')
    expect(document.body.textContent).toContain('Fractional')

    await vi.advanceTimersByTimeAsync(1)
    await flushLeaveTransitions()

    expect(fractionalClose).toHaveBeenCalledOnce()
    expect(document.body.textContent).not.toContain('Fractional')
    expect(document.body.textContent).toContain('Zero')
    expect(document.body.textContent).toContain('Negative')

    zeroHandle.close()
    negativeHandle.close()
    await flushLeaveTransitions()

    expect(document.querySelector('.o-message-host')).toBeNull()
  })

  it('does not pause hover timing when pauseOnHover is false', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const controller = createTestService()
    const onClose = vi.fn()

    controller.service({ message: 'No hover pause', duration: 1000, pauseOnHover: false, onClose })
    await nextTick()
    const item = document.querySelector<HTMLElement>('.o-message-host__item')!

    await vi.advanceTimersByTimeAsync(600)
    item.dispatchEvent(new MouseEvent('mouseenter'))
    await vi.advanceTimersByTimeAsync(400)
    await flushLeaveTransitions()

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('finalizes through the transition lifecycle and keeps close idempotent', async () => {
    vi.useFakeTimers()
    const controller = createTestService()
    const onClose = vi.fn()
    const handle = controller.service.success({ message: 'Saved', duration: 0, onClose })
    await nextTick()

    handle.close()
    handle.close()
    await flushLeaveTransitions()

    expect(onClose).toHaveBeenCalledOnce()
    expect(document.querySelector('.o-message-host')).toBeNull()
  })

  it('finalizes a same-tick close that never rendered a keyed item', async () => {
    const controller = createTestService()
    const onClose = vi.fn()
    const handle = controller.service({ message: 'Immediate', duration: 0, onClose })

    handle.close()
    handle.close()
    await nextTick()
    await nextTick()

    expect(onClose).toHaveBeenCalledOnce()
    expect(document.querySelector('.o-message-host')).toBeNull()
  })

  it('closes every target and can reopen a destroyed target cleanly', async () => {
    vi.useFakeTimers()
    const controller = createTestService()
    const target = document.createElement('section')
    document.body.append(target)

    controller.service({ message: 'First', duration: 0, appendTo: target })
    controller.service({ message: 'Second', duration: 0 })
    await nextTick()
    const originalRoot = target.querySelector('[data-omg-message-root]')

    controller.service.closeAll()
    controller.service.closeAll()
    await flushLeaveTransitions()
    expect(document.querySelector('.o-message-host')).toBeNull()

    controller.service({ message: 'Reopened', duration: 0, appendTo: target })
    await nextTick()

    expect(target.querySelector('.o-message')?.textContent).toContain('Reopened')
    expect(target.querySelector('[data-omg-message-root]')).not.toBe(originalRoot)
  })

  it('returns an inert idempotent handle when DOM globals are unavailable', () => {
    const controller = createTestService()
    expect(document.querySelector('.o-message-host')).toBeNull()

    vi.stubGlobal('document', undefined)
    const handle = controller.service.error('SSR')
    handle.close()
    handle.close()
    vi.unstubAllGlobals()

    expect(document.querySelector('.o-message-host')).toBeNull()
  })

  it('destroys immediately without invoking consumer close callbacks', async () => {
    vi.useFakeTimers()
    const controller = createTestService()
    const onClose = vi.fn()

    controller.service({ message: 'Destroy', duration: 1000, onClose })
    await nextTick()
    controller.destroy()
    await vi.runAllTimersAsync()

    expect(onClose).not.toHaveBeenCalled()
    expect(document.querySelector('.o-message-host')).toBeNull()
  })
})
