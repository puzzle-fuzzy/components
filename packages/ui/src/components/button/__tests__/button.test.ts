import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import {
  OButton,
  oButtonNativeTypes,
  oButtonProps,
  oButtonSizes,
  oButtonTones,
  oButtonVariants,
  type OButtonEmits,
  type OButtonProps,
  type OButtonSlots,
} from '../index'

const buttonSource = readFileSync(
  resolve('packages/ui/src/components/button/src/OButton.vue'),
  'utf8',
)
const buttonStyleSource = readFileSync(
  resolve('packages/ui/src/components/button/style/index.less'),
  'utf8',
)
const interactiveStyleSources = [
  'button',
  'accordion',
  'checkbox',
  'dropdown',
  'popover',
  'radio',
  'switch',
].map((component) => ({
  component,
  source: readFileSync(resolve(`packages/ui/src/components/${component}/style/index.less`), 'utf8'),
}))

describe('OButton', () => {
  it('keeps its public vocabularies and types aligned with runtime validation', () => {
    const publicProps: OButtonProps = {
      variant: 'outline',
      size: 'lg',
      tone: 'danger',
      type: 'submit',
      loading: true,
      disabled: true,
      iconOnly: true,
    }
    const publicSlots: OButtonSlots = {
      default: () => 'Save changes',
      icon: () => null,
    }
    const event = new MouseEvent('click')
    const publicEmits: OButtonEmits = { click: [event] }

    expect(oButtonVariants).toEqual(['solid', 'soft', 'outline', 'ghost'])
    expect(oButtonSizes).toEqual(['sm', 'md', 'lg'])
    expect(oButtonTones).toEqual(['brand', 'neutral', 'danger'])
    expect(oButtonNativeTypes).toEqual(['button', 'submit', 'reset'])
    expect(oButtonProps.variant.validator(publicProps.variant)).toBe(true)
    expect(oButtonProps.variant.validator('invalid')).toBe(false)
    expect(oButtonProps.size.validator(publicProps.size)).toBe(true)
    expect(oButtonProps.size.validator('invalid')).toBe(false)
    expect(oButtonProps.tone.validator(publicProps.tone)).toBe(true)
    expect(oButtonProps.tone.validator('invalid')).toBe(false)
    expect(oButtonProps.type.validator(publicProps.type)).toBe(true)
    expect(oButtonProps.type.validator('invalid')).toBe(false)
    expect(oButtonProps.size.default).toBe('sm')
    expect(oButtonProps.iconOnly.default).toBe(false)
    expect(publicSlots.default?.()).toBe('Save changes')
    expect(publicEmits.click).toEqual([event])
  })

  it('renders native button semantics with safe defaults', () => {
    const wrapper = mount(OButton, {
      slots: { default: 'Save changes' },
    })
    const button = wrapper.get('button')

    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.attributes('aria-busy')).toBeUndefined()
    expect(button.classes()).toEqual(
      expect.arrayContaining(['o-button', 'o-button--solid', 'o-button--sm', 'o-button--brand']),
    )
    expect(button.classes()).not.toContain('o-button--icon-only')
    expect(button.text()).toBe('Save changes')
  })

  it('renders an explicit icon-only mode without removing its accessible text', () => {
    const wrapper = mount(OButton, {
      props: { iconOnly: true },
      slots: {
        default: 'Open settings',
        icon: '<span data-test="settings-icon" />',
      },
    })
    const button = wrapper.get('button')

    expect(button.classes()).toContain('o-button--icon-only')
    expect(wrapper.get('.o-button__content').text()).toBe('Open settings')
    expect(wrapper.get('.o-button__icon').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('[data-test="settings-icon"]').exists()).toBe(true)
  })

  it('accepts a native aria-label when an icon-only button has no default content', () => {
    const wrapper = mount(OButton, {
      props: { iconOnly: true },
      attrs: { 'aria-label': 'Add item' },
      slots: { icon: '<span data-test="add-icon" />' },
    })
    const button = wrapper.get('button')

    expect(button.attributes('aria-label')).toBe('Add item')
    expect(button.classes()).toContain('o-button--icon-only')
    expect(wrapper.get('.o-button__content').text()).toBe('')
  })

  it('uses the existing control height as both icon-only dimensions', () => {
    expect(buttonStyleSource).toContain("@import '../../../styles/mixins.less';")
    expect(buttonStyleSource).toMatch(
      /&--icon-only\s*\{[^}]*inline-size:\s*var\(--omg-button-height\);/su,
    )
    expect(buttonStyleSource).toMatch(
      /&--icon-only\s*\{[^}]*block-size:\s*var\(--omg-button-height\);/su,
    )
    expect(buttonStyleSource).toMatch(
      /&--icon-only\s*\{[\s\S]*?\.o-button__content\s*\{\s*\.visually-hidden\(\);/u,
    )
  })

  it('keeps each button size on the compact control and typography scale', () => {
    expect(buttonStyleSource).toMatch(
      /&--sm\s*\{[^}]*--omg-button-height:\s*var\(--omg-control-height-sm\);[^}]*--omg-button-font-size:\s*var\(--omg-font-size-sm\);/su,
    )
    expect(buttonStyleSource).toMatch(
      /&--md\s*\{[^}]*--omg-button-height:\s*var\(--omg-control-height-md\);[^}]*--omg-button-font-size:\s*var\(--omg-font-size-md\);/su,
    )
    expect(buttonStyleSource).toMatch(
      /&--lg\s*\{[^}]*--omg-button-height:\s*var\(--omg-control-height-lg\);[^}]*--omg-button-font-size:\s*var\(--omg-font-size-md\);/su,
    )
    expect(buttonStyleSource).toContain('font-size: var(--omg-button-font-size)')
  })

  it('sets explicit OMG typography for every related interactive family', () => {
    for (const { component, source } of interactiveStyleSources) {
      expect(source, component).toMatch(/font-size:\s*var\(--omg-font-size-(?:sm|md)\)/u)
    }
  })

  it('reacts to variant, size, tone, and native type changes', async () => {
    const wrapper = mount(OButton, {
      props: {
        variant: 'soft',
        size: 'sm',
        tone: 'neutral',
        type: 'reset',
      },
    })
    const button = wrapper.get('button')

    expect(button.classes()).toEqual(
      expect.arrayContaining(['o-button--soft', 'o-button--sm', 'o-button--neutral']),
    )
    expect(button.attributes('type')).toBe('reset')

    await wrapper.setProps({
      variant: 'outline',
      size: 'lg',
      tone: 'danger',
      type: 'submit',
    })

    expect(button.classes()).toEqual(
      expect.arrayContaining(['o-button--outline', 'o-button--lg', 'o-button--danger']),
    )
    expect(button.classes()).not.toContain('o-button--soft')
    expect(button.classes()).not.toContain('o-button--sm')
    expect(button.classes()).not.toContain('o-button--neutral')
    expect(button.attributes('type')).toBe('submit')
  })

  it('renders the default and icon slots', () => {
    const wrapper = mount(OButton, {
      slots: {
        default: '<span data-test="label">Continue</span>',
        icon: '<svg data-test="icon" />',
      },
    })

    expect(wrapper.get('[data-test="label"]').text()).toBe('Continue')
    expect(wrapper.get('.o-button__icon').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('[data-test="icon"]').exists()).toBe(true)
  })

  it('replaces the icon with a standardized inaccessible loading icon', () => {
    const wrapper = mount(OButton, {
      props: { loading: true },
      slots: {
        default: 'Saving',
        icon: '<svg data-test="icon" />',
      },
    })
    const button = wrapper.get('button')

    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('aria-busy')).toBe('true')
    expect(button.classes()).toEqual(expect.arrayContaining(['is-loading', 'is-disabled']))
    expect(wrapper.get('.o-button__spinner').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('.o-button__spinner').element.tagName.toLowerCase()).toBe('svg')
    expect(wrapper.find('[data-test="icon"]').exists()).toBe(false)
    expect(button.text()).toBe('Saving')
  })

  it('uses the standard Lucide loader instead of handwritten geometry', () => {
    expect(buttonSource).toContain("import { LuLoader2 } from 'vue-icons-plus/lu'")
    expect(buttonSource).toContain('<LuLoader2')
    expect(buttonSource).not.toContain('<svg')
  })

  it('emits the original MouseEvent for an enabled click', async () => {
    const wrapper = mount(OButton)

    await wrapper.get('button').trigger('click')

    const events = wrapper.emitted('click')
    expect(events).toHaveLength(1)
    expect(events?.[0]?.[0]).toBeInstanceOf(MouseEvent)
  })

  it.each([
    {
      state: 'disabled',
      props: { disabled: true, loading: false },
    },
    {
      state: 'loading',
      props: { disabled: false, loading: true },
    },
  ])('does not emit click while $state', async ({ props }) => {
    const wrapper = mount(OButton, { props })
    const button = wrapper.get('button')
    const element = button.element as HTMLButtonElement

    expect(element.disabled).toBe(true)

    // Remove the native guard to exercise the component guard as well.
    element.disabled = false
    await button.trigger('click')

    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('forwards attrs, class, and style to the native button', () => {
    const wrapper = mount(OButton, {
      attrs: {
        id: 'save-action',
        class: ['consumer-button', { 'is-wide': true }],
        style: {
          width: '100%',
          '--consumer-button-order': '1',
        },
        'data-track': 'save',
        'aria-label': 'Save record',
      },
    })
    const button = wrapper.get('button')
    const element = button.element as HTMLButtonElement

    expect(button.attributes('id')).toBe('save-action')
    expect(button.attributes('data-track')).toBe('save')
    expect(button.attributes('aria-label')).toBe('Save record')
    expect(button.classes()).toEqual(
      expect.arrayContaining(['o-button', 'consumer-button', 'is-wide']),
    )
    expect(element.style.width).toBe('100%')
    expect(element.style.getPropertyValue('--consumer-button-order')).toBe('1')
  })

  it('restores interaction and accessibility state when loading ends', async () => {
    const wrapper = mount(OButton, {
      props: { loading: true },
      slots: { default: 'Save' },
    })
    const button = wrapper.get('button')

    await wrapper.setProps({ loading: false })

    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.attributes('aria-busy')).toBeUndefined()
    expect(button.classes()).not.toContain('is-loading')
    expect(button.classes()).not.toContain('is-disabled')

    await button.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
