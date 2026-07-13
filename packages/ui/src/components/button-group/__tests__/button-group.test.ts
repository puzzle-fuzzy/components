import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { OButton } from '../../button'
import {
  OButtonGroup,
  OButtonGroupSeparator,
  OButtonGroupText,
  oButtonGroupOrientations,
  oButtonGroupProps,
  oButtonGroupTextProps,
  type OButtonGroupOrientation,
  type OButtonGroupProps,
  type OButtonGroupSlots,
  type OButtonGroupTextProps,
  type OButtonGroupTextSlots,
} from '../index'

const groupSource = readFileSync(
  resolve('packages/ui/src/components/button-group/src/OButtonGroup.vue'),
  'utf8',
)
const groupStyleSource = readFileSync(
  resolve('packages/ui/src/components/button-group/style/index.less'),
  'utf8',
)

describe('OButtonGroup family', () => {
  it('keeps public orientation, props, validators, and slots aligned', () => {
    const orientation: OButtonGroupOrientation = 'vertical'
    const groupProps: OButtonGroupProps = {
      orientation,
      attached: false,
      ariaLabel: 'Document actions',
    }
    const textProps: OButtonGroupTextProps = { tag: 'div' }
    const groupSlots: OButtonGroupSlots = { default: () => h('button', 'Save') }
    const textSlots: OButtonGroupTextSlots = { default: () => 'Selected' }

    expect(oButtonGroupOrientations).toEqual(['horizontal', 'vertical'])
    expect(oButtonGroupProps.orientation.default).toBe('horizontal')
    expect(oButtonGroupProps.attached.default).toBe(true)
    expect(oButtonGroupProps.orientation.validator(groupProps.orientation)).toBe(true)
    expect(oButtonGroupProps.orientation.validator('grid')).toBe(false)
    expect(oButtonGroupTextProps.tag.default).toBe('span')
    expect(oButtonGroupTextProps.tag.validator(textProps.tag)).toBe(true)
    expect(oButtonGroupTextProps.tag.validator('button')).toBe(false)
    expect(groupSlots.default?.()).toBeTruthy()
    expect(textSlots.default?.()).toBe('Selected')
  })

  it('renders a neutral group with state data and forwarded attributes', () => {
    const wrapper = mount(OButtonGroup, {
      props: { ariaLabel: 'Editing tools' },
      attrs: {
        id: 'editing-tools',
        class: 'consumer-group',
        style: '--consumer-order: 2',
        'data-track': 'tools',
      },
      slots: { default: '<button type="button">Bold</button>' },
    })

    expect(wrapper.attributes()).toMatchObject({
      id: 'editing-tools',
      role: 'group',
      'aria-label': 'Editing tools',
      'data-slot': 'button-group',
      'data-orientation': 'horizontal',
      'data-attached': 'true',
      'data-track': 'tools',
    })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['o-button-group', 'consumer-group']))
    expect((wrapper.element as HTMLElement).style.getPropertyValue('--consumer-order')).toBe('2')
    expect(wrapper.get('button').text()).toBe('Bold')
  })

  it('reactively provides vertical orientation to its separator', async () => {
    const wrapper = mount(OButtonGroup, {
      props: { orientation: 'vertical', attached: false },
      slots: { default: () => h(OButtonGroupSeparator, { 'data-test': 'separator' }) },
    })
    const separator = wrapper.get('[data-test="separator"]')

    expect(wrapper.attributes('data-orientation')).toBe('vertical')
    expect(wrapper.attributes('data-attached')).toBe('false')
    expect(separator.attributes()).toMatchObject({
      'data-slot': 'button-group-separator',
      'data-orientation': 'vertical',
      'data-grouped': 'true',
      'aria-hidden': 'true',
    })

    await wrapper.setProps({ orientation: 'horizontal' })

    expect(wrapper.attributes('data-orientation')).toBe('horizontal')
    expect(separator.attributes('data-orientation')).toBe('horizontal')
  })

  it('falls back to a horizontal decorative separator outside a group', () => {
    const wrapper = mount(OButtonGroupSeparator, {
      attrs: { id: 'standalone-separator', class: 'consumer-separator' },
    })

    expect(wrapper.attributes()).toMatchObject({
      id: 'standalone-separator',
      'data-slot': 'button-group-separator',
      'data-orientation': 'horizontal',
      'data-grouped': 'false',
      'aria-hidden': 'true',
    })
    expect(wrapper.classes()).toContain('consumer-separator')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(groupStyleSource).toMatch(
      /\.o-button-group__separator\[data-grouped='false'\]\[data-orientation='horizontal'\]\s*\{[\s\S]*?inline-size:\s*1px;[\s\S]*?block-size:\s*var\(--omg-control-height-md\);/u,
    )
  })

  it('renders ButtonGroupText as a span or div and forwards attributes', async () => {
    const wrapper = mount(OButtonGroupText, {
      attrs: { id: 'selection-count', 'data-test': 'text' },
      slots: { default: '2 selected' },
    })

    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.attributes()).toMatchObject({
      id: 'selection-count',
      'data-slot': 'button-group-text',
      'data-test': 'text',
    })
    expect(wrapper.text()).toBe('2 selected')

    await wrapper.setProps({ tag: 'div' })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('does not intercept native child button events or add group keyboard handlers', async () => {
    const onClick = vi.fn()
    const wrapper = mount(OButtonGroup, {
      slots: {
        default: () => [
          h(OButton, { onClick }, () => 'Previous'),
          h(OButtonGroupSeparator),
          h(OButton, null, () => 'Next'),
        ],
      },
    })

    await wrapper.findAll('button')[0]?.trigger('click')

    expect(onClick).toHaveBeenCalledOnce()
    expect(groupSource).not.toMatch(/@keydown|onKeydown|onKeyDown/u)
  })

  it('scopes attached geometry to known controls without clipping focus', () => {
    expect(groupStyleSource).toContain(".o-button-group[data-attached='true']")
    expect(groupStyleSource).toContain('> .o-button')
    expect(groupStyleSource).toContain('> .o-input > .o-input__control')
    expect(groupStyleSource).toContain('> .o-select > .o-select__control > .o-select__trigger')
    expect(groupStyleSource).toContain('> .o-dropdown > .o-dropdown__trigger')
    expect(groupStyleSource).toContain('isolation: isolate')
    expect(groupStyleSource).toContain('overflow: visible')
    expect(groupStyleSource).not.toContain('outline: none')
    expect(groupStyleSource).not.toContain('overflow: hidden')
    expect(groupStyleSource).toMatch(
      /\.o-button-group__text\s*\{[\s\S]*?border:\s*0;[\s\S]*?background:\s*var\(--omg-color-neutral-soft\);/u,
    )
    expect(groupStyleSource).toMatch(
      /\.o-button-group__separator\s*\{[\s\S]*?background:\s*var\(--omg-color-border-subtle\);/u,
    )
  })
})
