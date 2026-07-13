import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, expectTypeOf, it } from 'vitest'

import {
  OKbd,
  OKbdGroup,
  oKbdGroupProps,
  oKbdProps,
  oKbdSizes,
  type OKbdGroupProps,
  type OKbdGroupSlots,
  type OKbdProps,
  type OKbdSize,
  type OKbdSlots,
} from '../index'

const kbdStyles = readFileSync(resolve('packages/ui/src/components/kbd/style/index.less'), 'utf8')

describe('OKbd', () => {
  it('publishes stable sizes, defaults, validators, and public types', () => {
    const size: OKbdSize = 'md'
    const props: OKbdProps = { size }
    const slots: OKbdSlots = { default: () => h('span', 'K') }

    expect(oKbdSizes).toEqual(['sm', 'md'])
    expect(oKbdProps.size.default).toBe('sm')
    expect(oKbdProps.size.validator(size)).toBe(true)
    expect(oKbdProps.size.validator('lg')).toBe(false)
    expect(oKbdProps.size.validator(undefined)).toBe(false)
    expectTypeOf<OKbdProps['size']>().toEqualTypeOf<OKbdSize | undefined>()
    expect(props.size).toBe('md')
    expect(slots.default?.()).toBeTruthy()
  })

  it('renders a real kbd element and forwards consumer attributes', () => {
    const wrapper = mount(OKbd, {
      props: { size: 'md' },
      attrs: { id: 'shortcut-key', class: 'consumer-key', title: 'Keyboard shortcut' },
      slots: { default: 'K' },
    })

    expect(wrapper.element.tagName).toBe('KBD')
    expect(wrapper.attributes()).toMatchObject({
      id: 'shortcut-key',
      title: 'Keyboard shortcut',
      'data-slot': 'kbd',
    })
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-kbd', 'o-kbd--md', 'consumer-key']),
    )
    expect(wrapper.text()).toBe('K')
  })

  it('uses a borderless neutral surface with an inset visual highlight', () => {
    expect(kbdStyles).toMatch(/\.o-kbd\s*\{[\s\S]*?background:\s*var\(--omg-color-neutral-soft\);/u)
    expect(kbdStyles).toMatch(/\.o-kbd\s*\{[\s\S]*?box-shadow:\s*inset/u)
    expect(kbdStyles).toMatch(/\.o-kbd\s*\{[\s\S]*?border:\s*0;/u)
  })
})

describe('OKbdGroup', () => {
  it('publishes optional labeling and slot types', () => {
    const props: OKbdGroupProps = { ariaLabel: 'Save shortcut' }
    const slots: OKbdGroupSlots = { default: () => 'Ctrl + S' }

    expect(oKbdGroupProps.ariaLabel.type).toBe(String)
    expect(props.ariaLabel).toBe('Save shortcut')
    expect(slots.default?.()).toBe('Ctrl + S')
  })

  it('renders a semantic group with an optional accessible name', () => {
    const named = mount(OKbdGroup, {
      props: { ariaLabel: 'Save shortcut' },
      attrs: { class: 'consumer-group', 'data-track': 'save' },
      slots: { default: '<kbd>Ctrl</kbd><span>+</span><kbd>S</kbd>' },
    })

    expect(named.element.tagName).toBe('SPAN')
    expect(named.attributes()).toMatchObject({
      role: 'group',
      'aria-label': 'Save shortcut',
      'data-slot': 'kbd-group',
      'data-track': 'save',
    })
    expect(named.classes()).toEqual(expect.arrayContaining(['o-kbd-group', 'consumer-group']))
    expect(named.findAll('kbd')).toHaveLength(2)

    const unnamed = mount(OKbdGroup)
    expect(unnamed.attributes('role')).toBe('group')
    expect(unnamed.attributes('aria-label')).toBeUndefined()
  })
})
