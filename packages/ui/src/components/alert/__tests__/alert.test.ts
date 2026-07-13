import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import {
  OAlert,
  oAlertProps,
  oAlertStatuses,
  type OAlertEmits,
  type OAlertProps,
  type OAlertSlots,
} from '../index'

const alertSource = readFileSync(
  resolve(process.cwd(), 'packages/ui/src/components/alert/src/OAlert.vue'),
  'utf8',
)
const alertStyles = readFileSync(
  resolve(process.cwd(), 'packages/ui/src/components/alert/style/index.less'),
  'utf8',
)

describe('OAlert', () => {
  it('keeps its status vocabulary, defaults, and public types aligned', () => {
    const props: OAlertProps = {
      status: 'warning',
      title: 'Review',
      description: 'Check the values',
      closable: true,
      showIcon: true,
      closeAriaLabel: 'Close review alert',
    }
    const event = new MouseEvent('click')
    const emits: OAlertEmits = { close: [event] }
    const slots: OAlertSlots = {
      icon: () => h('span', '!'),
      title: () => 'Custom review',
      default: () => 'Custom details',
      action: () => h('button', { type: 'button' }, 'Inspect'),
      closeIcon: () => h('span', 'x'),
    }

    expect(oAlertStatuses).toEqual(['info', 'success', 'warning', 'error'])
    expect(oAlertProps.status.default).toBe('info')
    expect(oAlertProps.closable.default).toBe(false)
    expect(oAlertProps.showIcon.default).toBe(true)
    expect(oAlertProps.closeAriaLabel.default).toBe('Close alert')
    expect(oAlertProps.status.validator(props.status)).toBe(true)
    expect(oAlertProps.status.validator('danger')).toBe(false)
    expect(emits.close).toEqual([event])
    expect(slots.default?.()).toBe('Custom details')
  })

  it('renders persistent warning feedback and only emits close intent', async () => {
    const wrapper = mount(OAlert, {
      props: {
        status: 'warning',
        title: 'Review',
        description: 'Check the values',
        closable: true,
      },
      slots: { action: '<button type="button">Inspect</button>' },
    })

    expect(wrapper.classes()).toContain('o-alert--warning')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.get('.o-alert__title').text()).toBe('Review')
    expect(wrapper.get('.o-alert__body').text()).toBe('Check the values')
    expect(wrapper.get('.o-alert__action button').text()).toBe('Inspect')

    const close = wrapper.get('.o-alert__close')
    expect(close.attributes('type')).toBe('button')
    expect(close.attributes('aria-label')).toBe('Close alert')
    await close.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('close')?.[0]?.[0]).toBeInstanceOf(MouseEvent)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Review')
  })

  it('renders a distinct standardized fallback icon for every status', () => {
    const iconMarkup = oAlertStatuses.map((status) => {
      const wrapper = mount(OAlert, { props: { status, title: status } })
      const icon = wrapper.get('.o-alert__icon')

      expect(wrapper.classes()).toContain(`o-alert--${status}`)
      expect(icon.attributes('aria-hidden')).toBe('true')
      expect(icon.find('svg').exists()).toBe(true)

      return icon.html()
    })

    expect(new Set(iconMarkup).size).toBe(oAlertStatuses.length)
  })

  it('supports every custom slot while keeping decorative glyphs hidden', () => {
    const wrapper = mount(OAlert, {
      props: { status: 'error', closable: true },
      slots: {
        icon: '<span data-test="icon">custom status</span>',
        title: '<strong data-test="title">Custom title</strong>',
        default: '<p data-test="body">Custom body</p>',
        action: '<a data-test="action" href="#details">Details</a>',
        closeIcon: '<span data-test="close-icon">dismiss</span>',
      },
    })

    expect(wrapper.get('[data-test="icon"]').text()).toBe('custom status')
    expect(wrapper.get('[data-test="title"]').text()).toBe('Custom title')
    expect(wrapper.get('[data-test="body"]').text()).toBe('Custom body')
    expect(wrapper.get('[data-test="action"]').attributes('href')).toBe('#details')
    expect(wrapper.get('[data-test="close-icon"]').text()).toBe('dismiss')
    expect(wrapper.get('.o-alert__icon').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('.o-alert__close-icon').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.o-alert__close-icon svg').exists()).toBe(false)
  })

  it('supports title-only, body-only, hidden icons, and long wrapping copy', () => {
    const titleOnly = mount(OAlert, { props: { title: 'Saved' } })
    const bodyOnly = mount(OAlert, {
      props: { description: 'A'.repeat(180), showIcon: false },
    })

    expect(titleOnly.get('.o-alert__title').text()).toBe('Saved')
    expect(titleOnly.find('.o-alert__body').exists()).toBe(false)
    expect(bodyOnly.find('.o-alert__title').exists()).toBe(false)
    expect(bodyOnly.get('.o-alert__body').text()).toHaveLength(180)
    expect(bodyOnly.find('.o-alert__icon').exists()).toBe(false)
    expect(bodyOnly.find('.o-alert__close').exists()).toBe(false)
  })

  it('forwards native live-region semantics and consumer attributes without inventing them', () => {
    const passive = mount(OAlert, { props: { title: 'Passive feedback' } })
    const live = mount(OAlert, {
      props: { status: 'error', title: 'Save failed' },
      attrs: {
        id: 'save-error',
        role: 'alert',
        'aria-live': 'assertive',
        'data-track': 'save',
      },
    })

    expect(passive.attributes('role')).toBeUndefined()
    expect(passive.attributes('aria-live')).toBeUndefined()
    expect(live.attributes()).toMatchObject({
      id: 'save-error',
      role: 'alert',
      'aria-live': 'assertive',
      'data-track': 'save',
    })
  })

  it('uses Lucide-only icons and a borderless compact-responsive surface', () => {
    expect(alertSource).toContain("from 'vue-icons-plus/lu'")
    expect(alertSource).toContain('LuInfo')
    expect(alertSource).toContain('LuCircleCheck')
    expect(alertSource).toContain('LuTriangleAlert')
    expect(alertSource).toContain('LuCircleX')
    expect(alertSource).toContain('LuX')
    expect(alertSource).not.toMatch(/<svg(?:\s|>)/u)
    expect(alertStyles).toMatch(/\.o-alert\s*\{[\s\S]*?border:\s*0;/u)
    expect(alertStyles).toContain('overflow-wrap: anywhere')
    expect(alertStyles).toContain('@container o-alert')
    expect(alertStyles).toContain('@media (pointer: coarse)')
    expect(alertStyles).toMatch(
      /@media \(pointer: coarse\)[\s\S]*?\.o-alert__close::before\s*\{[\s\S]*?inline-size:\s*44px;[\s\S]*?block-size:\s*44px;/u,
    )
  })
})
