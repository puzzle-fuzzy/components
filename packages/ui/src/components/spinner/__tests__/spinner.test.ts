import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { describe, expect, expectTypeOf, it } from 'vitest'

import {
  OSpinner,
  oSpinnerProps,
  oSpinnerSizes,
  type OSpinnerProps,
  type OSpinnerSize,
  type OSpinnerSlots,
} from '../index'

const spinnerSource = readFileSync(
  resolve('packages/ui/src/components/spinner/src/OSpinner.vue'),
  'utf8',
)
const spinnerStyles = readFileSync(
  resolve('packages/ui/src/components/spinner/style/index.less'),
  'utf8',
)

describe('OSpinner', () => {
  it('publishes stable sizes, defaults, validators, and public types', () => {
    const size: OSpinnerSize = 'lg'
    const props: OSpinnerProps = { decorative: false, label: 'Syncing', size }
    const slots: OSpinnerSlots = {}

    expect(oSpinnerSizes).toEqual(['sm', 'md', 'lg'])
    expect(oSpinnerProps.size.default).toBe('md')
    expect(oSpinnerProps.label.default).toBe('Loading')
    expect(oSpinnerProps.decorative.default).toBe(false)
    expect(oSpinnerProps.size.validator(size)).toBe(true)
    expect(oSpinnerProps.size.validator('xl')).toBe(false)
    expect(oSpinnerProps.size.validator(null)).toBe(false)
    expectTypeOf<OSpinnerProps['size']>().toEqualTypeOf<OSpinnerSize | undefined>()
    expect(props.label).toBe('Syncing')
    expect(slots).toEqual({})
  })

  it('uses the standard Lucide loader icon', () => {
    expect(spinnerSource).toContain("import { LuLoader2 } from 'vue-icons-plus/lu'")
    expect(spinnerSource).toContain('<LuLoader2')
    expect(spinnerSource).not.toContain('<svg')
  })

  it('renders a named status by default and forwards consumer attributes', () => {
    const wrapper = mount(OSpinner, {
      props: { label: '正在同步', size: 'sm' },
      attrs: { id: 'sync-status', class: 'consumer-spinner', 'data-track': 'sync' },
    })

    expect(wrapper.attributes()).toMatchObject({
      id: 'sync-status',
      role: 'status',
      'aria-label': '正在同步',
      'data-slot': 'spinner',
      'data-track': 'sync',
    })
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-spinner', 'o-spinner--sm', 'consumer-spinner']),
    )
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
  })

  it('removes status semantics when decorative', () => {
    const wrapper = mount(OSpinner, {
      props: { decorative: true, label: 'Ignored', size: 'lg' },
    })

    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(wrapper.classes()).toContain('o-spinner--lg')
  })

  it('inherits text color and stops animation when reduced motion is requested', () => {
    expect(spinnerStyles).toMatch(/\.o-spinner\s*\{[\s\S]*?color:\s*inherit;/u)
    expect(spinnerStyles).toMatch(/\.o-spinner__icon\s*\{[\s\S]*?color:\s*currentcolor;/u)
    expect(spinnerStyles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(spinnerStyles).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\.o-spinner__icon\s*\{[\s\S]*?animation:\s*none;/u,
    )
  })
})
