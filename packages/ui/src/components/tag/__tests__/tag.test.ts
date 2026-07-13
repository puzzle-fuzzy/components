import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import {
  OTag,
  oTagProps,
  oTagSizes,
  oTagTones,
  oTagVariants,
  type OTagEmits,
  type OTagProps,
  type OTagSlots,
} from '../index'

const tagSource = readFileSync(resolve('packages/ui/src/components/tag/src/OTag.vue'), 'utf8')
const tagStyleSource = readFileSync(
  resolve('packages/ui/src/components/tag/style/index.less'),
  'utf8',
)

describe('OTag', () => {
  it('keeps runtime vocabularies, validation, and public types aligned', () => {
    const props: OTagProps = {
      tone: 'success',
      variant: 'solid',
      size: 'sm',
      closable: true,
      closeAriaLabel: '移除已完成标签',
    }
    const event = new MouseEvent('click')
    const emits: OTagEmits = { close: [event] }
    const slots: OTagSlots = {
      icon: () => h('span', 'I'),
      default: () => '已完成',
      closeIcon: () => h('span', 'X'),
    }

    expect(oTagTones).toEqual(['neutral', 'brand', 'success', 'warning', 'danger'])
    expect(oTagVariants).toEqual(['soft', 'solid'])
    expect(oTagSizes).toEqual(['sm', 'md'])
    expect(oTagProps.tone.default).toBe('neutral')
    expect(oTagProps.variant.default).toBe('soft')
    expect(oTagProps.size.default).toBe('md')
    expect(oTagProps.tone.validator(props.tone)).toBe(true)
    expect(oTagProps.tone.validator('info')).toBe(false)
    expect(oTagProps.variant.validator(props.variant)).toBe(true)
    expect(oTagProps.variant.validator('outline')).toBe(false)
    expect(oTagProps.size.validator(props.size)).toBe(true)
    expect(oTagProps.size.validator('lg')).toBe(false)
    expect(emits.close).toEqual([event])
    expect(slots.default?.()).toBe('已完成')
  })

  it('renders semantic classes, slots, and a named non-submit close button', async () => {
    const wrapper = mount(OTag, {
      props: {
        tone: 'warning',
        variant: 'soft',
        size: 'sm',
        closable: true,
        closeAriaLabel: '移除警告标签',
      },
      slots: {
        icon: '<span data-test="icon">!</span>',
        default: '待确认',
      },
    })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-tag', 'o-tag--warning', 'o-tag--soft', 'o-tag--sm']),
    )
    expect(wrapper.get('.o-tag__icon').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('[data-test="icon"]').exists()).toBe(true)

    const close = wrapper.get('button.o-tag__close')
    expect(close.attributes()).toMatchObject({
      type: 'button',
      'aria-label': '移除警告标签',
    })
    expect(close.get('.o-tag__close-icon').attributes('aria-hidden')).toBe('true')

    await close.trigger('click')

    const events = wrapper.emitted('close')
    expect(events).toHaveLength(1)
    expect(events?.[0]?.[0]).toBeInstanceOf(MouseEvent)
    expect(wrapper.text()).toContain('待确认')
  })

  it('does not render a close control unless explicitly requested', () => {
    const wrapper = mount(OTag, {
      slots: { default: '稳定' },
    })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-tag--neutral', 'o-tag--soft', 'o-tag--md']),
    )
    expect(wrapper.find('.o-tag__close').exists()).toBe(false)
    expect(wrapper.text()).toBe('稳定')
  })

  it('renders a consumer close icon while keeping it decorative', () => {
    const wrapper = mount(OTag, {
      props: { closable: true },
      slots: {
        default: '已选条件',
        closeIcon: '<span data-test="custom-close">remove</span>',
      },
    })

    expect(wrapper.find('[data-test="custom-close"]').exists()).toBe(true)
    expect(wrapper.get('.o-tag__close-icon').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.o-tag__close-icon svg').exists()).toBe(false)
  })

  it('reacts to tone, variant, size, and closable changes', async () => {
    const wrapper = mount(OTag, {
      props: { tone: 'brand', variant: 'solid', size: 'md' },
      slots: { default: '发布中' },
    })

    await wrapper.setProps({ tone: 'danger', variant: 'soft', size: 'sm', closable: true })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-tag--danger', 'o-tag--soft', 'o-tag--sm']),
    )
    expect(wrapper.classes()).not.toContain('o-tag--brand')
    expect(wrapper.classes()).not.toContain('o-tag--solid')
    expect(wrapper.classes()).not.toContain('o-tag--md')
    expect(wrapper.find('.o-tag__close').exists()).toBe(true)
  })

  it('forwards consumer attributes, classes, and styles to the root tag', () => {
    const wrapper = mount(OTag, {
      attrs: {
        id: 'release-status',
        class: 'consumer-tag',
        style: '--consumer-tag-order: 2',
        'data-track': 'release',
      },
      slots: { default: '已发布' },
    })

    expect(wrapper.attributes('id')).toBe('release-status')
    expect(wrapper.attributes('data-track')).toBe('release')
    expect(wrapper.classes()).toContain('consumer-tag')
    expect(
      (wrapper.element as HTMLSpanElement).style.getPropertyValue('--consumer-tag-order'),
    ).toBe('2')
  })

  it('uses standardized icons and borderless, touch-safe styles', () => {
    expect(tagSource).toContain("import { LuX } from 'vue-icons-plus/lu'")
    expect(tagSource).toContain('<LuX')
    expect(tagSource).not.toContain('<svg')
    expect(tagStyleSource).toMatch(/\.o-tag\s*\{[\s\S]*?border:\s*0;/u)
    expect(tagStyleSource).toMatch(
      /\.o-tag__close\s*\{[\s\S]*?inline-size:\s*24px;[\s\S]*?block-size:\s*24px;/u,
    )
    expect(tagStyleSource).toContain('@media (pointer: coarse)')
    expect(tagStyleSource).toMatch(
      /@media \(pointer: coarse\)[\s\S]*?\.o-tag__close::before\s*\{[\s\S]*?inline-size:\s*44px;[\s\S]*?block-size:\s*44px;/u,
    )
  })
})
