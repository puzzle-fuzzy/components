import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { OLabel, oLabelProps, type OLabelProps, type OLabelSlots } from '../index'

describe('OLabel', () => {
  it('keeps public props, defaults, and slots aligned', () => {
    const props: OLabelProps = { for: 'name', disabled: true, required: true }
    const slots: OLabelSlots = { default: () => h('span', 'Name') }

    expect(oLabelProps.disabled.default).toBe(false)
    expect(oLabelProps.required.default).toBe(false)
    expect(props.for).toBe('name')
    expect(slots.default?.()).toBeTruthy()
  })

  it('renders a native label, forwards attrs and listeners, and exposes state', async () => {
    const onClick = vi.fn()
    const wrapper = mount(OLabel, {
      props: { for: 'name', disabled: true, required: true },
      attrs: {
        id: 'name-label',
        class: 'consumer-label',
        'data-track': 'name',
        onClick,
      },
      slots: { default: 'Name' },
    })

    expect(wrapper.element.tagName).toBe('LABEL')
    expect(wrapper.attributes()).toMatchObject({
      id: 'name-label',
      for: 'name',
      'data-slot': 'label',
      'data-disabled': 'true',
      'data-required': 'true',
      'data-track': 'name',
    })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['o-label', 'consumer-label']))
    expect(wrapper.text()).toBe('Name*')
    expect(wrapper.get('[data-slot="label-required"]').attributes('aria-hidden')).toBe('true')

    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('keeps native label association behavior', async () => {
    const wrapper = mount(
      {
        components: { OLabel },
        template:
          '<div><OLabel for="terms" required>Terms</OLabel><input id="terms" type="checkbox"></div>',
      },
      { attachTo: document.body },
    )

    const checkbox = wrapper.get<HTMLInputElement>('#terms')
    await wrapper.get('label').trigger('click')

    expect(checkbox.element.checked).toBe(true)
    wrapper.unmount()
  })
})
