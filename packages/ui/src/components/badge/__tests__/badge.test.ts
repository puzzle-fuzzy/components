import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import {
  formatOBadgeValue,
  normalizeOBadgeMax,
  OBadge,
  oBadgeProps,
  oBadgeTones,
  type OBadgeProps,
  type OBadgeSlots,
  type OBadgeTone,
} from '../index'

const badgeStyles = readFileSync(
  resolve('packages/ui/src/components/badge/style/index.less'),
  'utf8',
)

describe('OBadge', () => {
  it('keeps its public vocabulary and types aligned with runtime validation', () => {
    const tone: OBadgeTone = 'warning'
    const props: OBadgeProps = {
      ariaLabel: '3 pending items',
      dot: false,
      hidden: false,
      max: 9,
      showZero: true,
      tone,
      value: 3,
    }
    const slots: OBadgeSlots = { default: () => h('button', 'Inbox') }

    expect(oBadgeTones).toEqual(['neutral', 'brand', 'success', 'warning', 'danger'])
    expect(oBadgeProps.tone.default).toBe('danger')
    expect(oBadgeProps.max.default).toBe(99)
    expect(oBadgeProps.dot.default).toBe(false)
    expect(oBadgeProps.hidden.default).toBe(false)
    expect(oBadgeProps.showZero.default).toBe(false)
    expect(oBadgeProps.tone.validator(props.tone)).toBe(true)
    expect(oBadgeProps.tone.validator('info')).toBe(false)
    expect(oBadgeProps.tone.validator(undefined)).toBe(false)
    expect(slots.default?.()).toBeTruthy()
  })

  it.each([
    [undefined, 99],
    [120.9, 120],
    [0, 99],
    [-2, 99],
    [Number.NaN, 99],
  ] as const)('normalizes max %s to %s', (value, expected) => {
    expect(normalizeOBadgeMax(value)).toBe(expected)
  })

  it.each([
    [{ value: 120, max: 99 }, '99+'],
    [{ value: 120, max: 0 }, '99+'],
    [{ value: 120, max: Number.NaN }, '99+'],
    [{ value: 4, max: 99 }, '4'],
    [{ value: 'NEW', max: 99 }, 'NEW'],
  ] as const)('formats badge content', (input, expected) => {
    expect(formatOBadgeValue(input.value, input.max)).toBe(expected)
  })

  it('supports content composition, logical marker classes, and readable count text', () => {
    const wrapper = mount(OBadge, {
      props: { value: 120, max: 99, tone: 'danger', ariaLabel: '120 条未读消息' },
      slots: { default: '<button type="button">收件箱</button>' },
    })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-badge', 'o-badge--with-content', 'o-badge--danger']),
    )
    expect(wrapper.get('button').text()).toBe('收件箱')
    expect(wrapper.get('.o-badge__marker').text()).toBe('99+')
    expect(wrapper.get('.o-badge__marker').attributes()).toMatchObject({
      role: 'img',
      'aria-label': '120 条未读消息',
    })
    expect(wrapper.get('.o-badge__marker').attributes('aria-live')).toBeUndefined()
  })

  it('hides zero by default and treats an unnamed dot as decorative', async () => {
    const zero = mount(OBadge, { props: { value: 0 } })
    expect(zero.find('.o-badge__marker').exists()).toBe(false)

    await zero.setProps({ showZero: true })
    expect(zero.get('.o-badge__marker').text()).toBe('0')

    const dot = mount(OBadge, { props: { dot: true } })
    expect(dot.get('.o-badge__marker').attributes('aria-hidden')).toBe('true')
    expect(dot.get('.o-badge__marker').attributes('role')).toBeUndefined()
  })

  it('gives a named dot image semantics and lets hidden override every marker', async () => {
    const wrapper = mount(OBadge, {
      props: { ariaLabel: 'Online', dot: true, value: 8 },
    })
    const marker = wrapper.get('.o-badge__marker')

    expect(marker.attributes()).toMatchObject({ role: 'img', 'aria-label': 'Online' })
    expect(marker.attributes('aria-hidden')).toBeUndefined()
    expect(marker.text()).toBe('')

    await wrapper.setProps({ hidden: true })
    expect(wrapper.find('.o-badge__marker').exists()).toBe(false)
  })

  it('renders text and count badges without unsolicited live-region semantics', () => {
    const count = mount(OBadge, { props: { value: 7, tone: 'brand' } })
    const text = mount(OBadge, { props: { value: 'NEW', tone: 'success' } })

    for (const wrapper of [count, text]) {
      const marker = wrapper.get('.o-badge__marker')
      expect(marker.attributes('role')).toBeUndefined()
      expect(marker.attributes('aria-live')).toBeUndefined()
      expect(marker.attributes('aria-hidden')).toBeUndefined()
    }

    expect(count.get('.o-badge__marker').text()).toBe('7')
    expect(text.get('.o-badge__marker').text()).toBe('NEW')
  })

  it('renders as a standalone inline badge when no content is supplied', () => {
    const wrapper = mount(OBadge, { props: { value: 12, tone: 'neutral' } })

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['o-badge', 'o-badge--neutral']))
    expect(wrapper.classes()).not.toContain('o-badge--with-content')
    expect(wrapper.get('.o-badge__marker').text()).toBe('12')
  })

  it('uses logical positioning, reverses RTL translation, and stays borderless', () => {
    expect(badgeStyles).toMatch(
      /\.o-badge--with-content \.o-badge__marker\s*\{[^}]*inset-block-start:\s*0;[^}]*inset-inline-end:\s*0;/su,
    )
    expect(badgeStyles).toMatch(
      /\.o-badge--with-content:dir\(rtl\) \.o-badge__marker\s*\{[^}]*translate\(-50%, -50%\)/su,
    )
    expect(badgeStyles).not.toMatch(/^\s*border\s*:/mu)
    expect(badgeStyles).not.toMatch(/^\s*outline\s*:/mu)
  })
})
