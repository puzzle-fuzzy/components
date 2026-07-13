import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  OTooltip,
  normalizeOTooltipDelay,
  normalizeOTooltipOffset,
  oTooltipPlacements,
  oTooltipProps,
  type OTooltipEmits,
  type OTooltipProps,
  type OTooltipSlots,
} from '../index'

const ButtonTrigger = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () => h('button', { ...attrs, type: 'button' }, 'Help')
  },
})

const mountTooltip = (props: Record<string, unknown> = {}) =>
  mount(OTooltip, {
    attachTo: document.body,
    props: { content: 'Helpful context', teleported: false, ...props },
    slots: { default: () => h(ButtonTrigger) },
  })

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.body.replaceChildren()
})

describe('OTooltip', () => {
  it('keeps runtime vocabulary and public types aligned', () => {
    const props: OTooltipProps = {
      content: 'Help',
      placement: 'right-start',
      showDelay: 300,
      hideDelay: 80,
      offset: 10,
      teleported: false,
    }
    const emits: OTooltipEmits = { 'update:open': [true] }
    const slots: OTooltipSlots = {
      default: () => h('button', 'Trigger'),
      content: () => 'Description',
    }

    expect(oTooltipPlacements).toEqual([
      'top',
      'top-start',
      'top-end',
      'right',
      'right-start',
      'right-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'left',
      'left-start',
      'left-end',
    ])
    expect(oTooltipProps.placement.default).toBe('top')
    expect(oTooltipProps.showDelay.default).toBe(400)
    expect(oTooltipProps.hideDelay.default).toBe(100)
    expect(oTooltipProps.offset.default).toBe(8)
    expect(props.placement).toBe('right-start')
    expect(emits['update:open']).toEqual([true])
    expect(slots.content?.()).toBe('Description')
  })

  it.each([
    [undefined, 400],
    [Number.NaN, 400],
    [-1, 0],
    [0.8, 0],
    [120.9, 120],
  ])('normalizes delay %s to %s', (value, expected) => {
    expect(normalizeOTooltipDelay(value)).toBe(expected)
  })

  it.each([
    [undefined, 8],
    [Number.NaN, 8],
    [-1, 0],
    [0.8, 0],
    [12.9, 12],
  ])('normalizes offset %s to %s', (value, expected) => {
    expect(normalizeOTooltipOffset(value)).toBe(expected)
  })

  it('opens after hover delay, clones one trigger, and describes it while visible', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip()
    const trigger = wrapper.get('button')

    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
    await trigger.trigger('pointerenter')
    await vi.advanceTimersByTimeAsync(399)
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await nextTick()

    const tooltip = wrapper.get('[role="tooltip"]')
    expect(tooltip.text()).toBe('Helpful context')
    expect(trigger.attributes('aria-describedby')).toBe(tooltip.attributes('id'))
    expect(wrapper.findAll('button')).toHaveLength(1)
    expect(wrapper.emitted('update:open')).toEqual([[true]])
  })

  it('opens immediately from focus and closes from Escape', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip()
    const trigger = wrapper.get('button')

    await trigger.trigger('focusin')
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(true)
    await trigger.trigger('keydown', { key: 'Escape' })
    await nextTick()

    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
    expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
  })

  it('closes from document Escape while the hovered trigger is not focused', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip({ showDelay: 0 })

    await wrapper.get('button').trigger('pointerenter')
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))
    await nextTick()

    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
    expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
  })

  it('cancels stale show timers and blocks disabled triggers', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip()
    const trigger = wrapper.get('button')

    await trigger.trigger('pointerenter')
    await trigger.trigger('pointerleave')
    await vi.runAllTimersAsync()
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)

    await wrapper.setProps({ disabled: true })
    await trigger.trigger('focusin')
    await trigger.trigger('pointerenter')
    await vi.runAllTimersAsync()
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
  })

  it('only requests state changes when controlled', async () => {
    vi.useFakeTimers()
    const wrapper = mountTooltip({ open: false })
    const trigger = wrapper.get('button')

    await trigger.trigger('focusin')
    expect(wrapper.emitted('update:open')).toEqual([[true]])
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)

    await wrapper.setProps({ open: true })
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(true)
    await trigger.trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(true)
  })

  it('uses custom content and warns for multiple meaningful trigger roots', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const wrapper = mount(OTooltip, {
      props: { content: 'prop', open: true, teleported: false },
      slots: {
        default: () => [h('button', 'First'), h('button', 'Second')],
        content: () => h('strong', 'Slot content'),
      },
    })
    await nextTick()

    expect(wrapper.findAll('button')).toHaveLength(1)
    expect(wrapper.get('[role="tooltip"]').text()).toBe('Slot content')
    expect(warn).toHaveBeenCalledWith(
      '[OMG UI][OTooltip] The default slot must contain exactly one meaningful root.',
    )
  })

  it('keeps its inverse floating surface borderless and reduced-motion safe', () => {
    const componentSource = readFileSync(
      resolve('packages/ui/src/components/tooltip/src/OTooltip.vue'),
      'utf8',
    )
    const styles = readFileSync(
      resolve('packages/ui/src/components/tooltip/style/index.less'),
      'utf8',
    )

    expect(componentSource).toContain('cloneVNode')
    expect(componentSource).not.toContain('<svg')
    expect(styles).toMatch(/\.o-tooltip\s*\{[^}]*border:\s*0/su)
    expect(styles).toContain('max-inline-size: 240px')
    expect(styles).toContain('pointer-events: none')
    expect(styles).toMatch(/prefers-reduced-motion:\s*reduce/su)
    expect(styles).not.toContain('--vp-c-brand-')
  })
})
