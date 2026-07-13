import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import {
  OField,
  OFieldContent,
  OFieldDescription,
  OFieldError,
  OFieldGroup,
  OFieldLabel,
  OFieldLegend,
  OFieldSet,
  OFieldTitle,
  oFieldErrorProps,
  oFieldLegendProps,
  oFieldOrientations,
  oFieldProps,
  type OFieldErrorProps,
  type OFieldLegendProps,
  type OFieldOrientation,
  type OFieldProps,
  type OFieldSlots,
} from '../index'

const fieldStyles = readFileSync(
  resolve('packages/ui/src/components/field/style/index.less'),
  'utf8',
)

describe('OField family', () => {
  it('keeps vocabularies, defaults, validators, and public types aligned', () => {
    const orientation: OFieldOrientation = 'responsive'
    const props: OFieldProps = {
      orientation,
      disabled: true,
      invalid: true,
      required: true,
    }
    const errors: OFieldErrorProps = {
      errors: ['Required', { message: 'Too short' }, null],
    }
    const legend: OFieldLegendProps = { variant: 'label' }
    const slots: OFieldSlots = { default: () => h('input') }

    expect(oFieldOrientations).toEqual(['vertical', 'horizontal', 'responsive'])
    expect(oFieldProps.orientation.default).toBe('vertical')
    expect(oFieldProps.disabled.default).toBe(false)
    expect(oFieldProps.invalid.default).toBe(false)
    expect(oFieldProps.required.default).toBe(false)
    expect(oFieldProps.orientation.validator(props.orientation)).toBe(true)
    expect(oFieldProps.orientation.validator('diagonal')).toBe(false)
    expect(oFieldErrorProps.errors.default()).toEqual([])
    expect(oFieldLegendProps.variant.default).toBe('legend')
    expect(oFieldLegendProps.variant.validator(legend.variant)).toBe(true)
    expect(oFieldLegendProps.variant.validator('heading')).toBe(false)
    expect(errors.errors).toHaveLength(3)
    expect(slots.default?.()).toBeTruthy()
  })

  it('renders semantic compound parts and propagates field state', async () => {
    const wrapper = mount(OField, {
      props: {
        orientation: 'horizontal',
        disabled: true,
        invalid: true,
        required: true,
      },
      attrs: { id: 'profile-field', 'data-track': 'profile' },
      slots: {
        default: () => [
          h(OFieldLabel, { for: 'profile-name' }, () => 'Name'),
          h(OFieldContent, null, {
            default: () => [
              h(OFieldTitle, null, () => 'Public name'),
              h('input', { id: 'profile-name', disabled: true, 'aria-invalid': 'true' }),
              h(OFieldDescription, null, () => 'Shown on your profile.'),
              h(OFieldError, { errors: ['Required'] }),
            ],
          }),
        ],
      },
    })

    expect(wrapper.attributes()).toMatchObject({
      id: 'profile-field',
      'data-slot': 'field',
      'data-orientation': 'horizontal',
      'data-disabled': 'true',
      'data-invalid': 'true',
      'data-required': 'true',
      'data-track': 'profile',
    })
    expect(wrapper.get('label').attributes()).toMatchObject({
      for: 'profile-name',
      'data-disabled': 'true',
      'data-required': 'true',
    })
    expect(wrapper.get('[data-slot="label-required"]')).toBeTruthy()
    expect(wrapper.get('[data-slot="field-content"]').attributes('data-invalid')).toBe('true')
    expect(wrapper.get('[data-slot="field-title"]').text()).toBe('Public name')
    expect(wrapper.get('[data-slot="field-description"]').text()).toBe('Shown on your profile.')
    expect(wrapper.get('[data-slot="field-error"]').attributes('role')).toBe('alert')

    await wrapper.setProps({ disabled: false, invalid: false, required: false })
    expect(wrapper.attributes('data-disabled')).toBeUndefined()
    expect(wrapper.get('label').attributes('data-disabled')).toBeUndefined()
    expect(wrapper.find('[data-slot="label-required"]').exists()).toBe(false)
  })

  it('renders fieldset and legend with native semantics and forwarded attrs', () => {
    const wrapper = mount(OFieldSet, {
      props: { disabled: true },
      attrs: { name: 'preferences', class: 'consumer-set' },
      slots: {
        default: () => [
          h(OFieldLegend, { variant: 'label', id: 'preferences-title' }, () => 'Preferences'),
          h(OFieldGroup, { 'aria-labelledby': 'preferences-title' }, () => h('input')),
        ],
      },
    })

    expect(wrapper.element.tagName).toBe('FIELDSET')
    expect(wrapper.attributes()).toMatchObject({
      disabled: '',
      name: 'preferences',
      'data-slot': 'field-set',
    })
    expect(wrapper.classes()).toContain('consumer-set')
    expect(wrapper.get('legend').attributes()).toMatchObject({
      id: 'preferences-title',
      'data-slot': 'field-legend',
      'data-variant': 'label',
    })
    expect(wrapper.get('[data-slot="field-group"]').attributes('aria-labelledby')).toBe(
      'preferences-title',
    )
  })

  it('filters and deduplicates errors, uses a list only for multiple messages, and omits empty output', () => {
    const multiple = mount(OFieldError, {
      props: {
        errors: [
          ' Required ',
          { message: 'Required' },
          undefined,
          null,
          '',
          { message: 'Too short' },
        ],
      },
    })
    const single = mount(OFieldError, { props: { errors: ['Only error'] } })
    const empty = mount(OFieldError, { props: { errors: [undefined, null, '', {}] } })

    expect(multiple.findAll('li').map((node) => node.text())).toEqual(['Required', 'Too short'])
    expect(multiple.attributes('role')).toBe('alert')
    expect(single.find('ul').exists()).toBe(false)
    expect(single.text()).toBe('Only error')
    expect(single.attributes('role')).toBe('alert')
    expect(empty.html()).toBe('<!--v-if-->')
  })

  it('lets the default slot replace errors without rendering the error list', () => {
    const wrapper = mount(OFieldError, {
      props: { errors: ['Fallback one', 'Fallback two'] },
      slots: { default: '<strong>Custom error</strong>' },
    })

    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.get('strong').text()).toBe('Custom error')
    expect(wrapper.find('ul').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Fallback')
  })

  it('uses borderless logical layouts and container queries', () => {
    expect(fieldStyles).toContain('container-type: inline-size')
    expect(fieldStyles).toContain('@container o-field-group')
    expect(fieldStyles).toContain('overflow-wrap: anywhere')
    expect(fieldStyles).toMatch(/\.o-field\s*\{[\s\S]*?border:\s*0;/u)
    expect(fieldStyles).toMatch(/\.o-field-set\s*\{[\s\S]*?border:\s*0;/u)
    expect(fieldStyles).not.toContain('var(--vp-')
  })
})
