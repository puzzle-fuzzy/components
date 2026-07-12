import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import {
  OCheckbox,
  oCheckboxProps,
  type OCheckboxEmits,
  type OCheckboxProps,
  type OCheckboxSlots,
} from '../index'

describe('OCheckbox', () => {
  it('keeps its public prop, emit, and slot contracts typed', () => {
    const props: OCheckboxProps = {
      modelValue: true,
      label: '接受条款',
      indeterminate: false,
      disabled: false,
      readonly: false,
      invalid: false,
    }
    const event = new Event('change')
    const emits: OCheckboxEmits = {
      'update:modelValue': [false],
      change: [false, event],
    }
    const slots: OCheckboxSlots = { default: () => '接受条款' }

    expect(oCheckboxProps.modelValue.default).toBe(false)
    expect(props.modelValue).toBe(true)
    expect(emits.change).toEqual([false, event])
    expect(slots.default?.()).toBe('接受条款')
  })

  it('associates a generated SSR-safe input id with its visible label', () => {
    const wrapper = mount(OCheckbox, {
      props: { modelValue: false, label: '接受条款' },
    })
    const input = wrapper.get('input')
    const text = wrapper.get('.o-checkbox__label')

    expect(input.attributes('type')).toBe('checkbox')
    expect(input.attributes('id')).toBeTruthy()
    expect(text.attributes('for')).toBe(input.attributes('id'))
    expect(text.text()).toBe('接受条款')
  })

  it('forwards attrs and listeners to the native checkbox', async () => {
    const onClick = vi.fn()
    const wrapper = mount(OCheckbox, {
      props: { modelValue: false },
      attrs: {
        id: 'newsletter',
        name: 'newsletter',
        required: true,
        value: 'yes',
        'aria-describedby': 'newsletter-help',
        class: 'consumer-checkbox',
        onClick,
      },
      slots: { default: '订阅更新' },
    })
    const input = wrapper.get('input')

    expect(wrapper.attributes('id')).toBeUndefined()
    expect(input.attributes()).toEqual(
      expect.objectContaining({
        id: 'newsletter',
        name: 'newsletter',
        required: '',
        value: 'yes',
        'aria-describedby': 'newsletter-help',
      }),
    )
    expect(input.classes()).toEqual(
      expect.arrayContaining(['o-checkbox__input', 'consumer-checkbox']),
    )
    expect(wrapper.get('.o-checkbox__label').attributes('for')).toBe('newsletter')

    await input.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('emits checked state and restores a rejected controlled update', async () => {
    const wrapper = mount(OCheckbox, { props: { modelValue: false } })
    const input = wrapper.get<HTMLInputElement>('input')

    await input.setValue(true)
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe(true)
    expect(wrapper.emitted('change')?.[0]?.[1]).toBeInstanceOf(Event)
    expect(input.element.checked).toBe(false)
  })

  it('synchronizes the mixed DOM property and accessible state', async () => {
    const wrapper = mount(OCheckbox, {
      props: { modelValue: false, indeterminate: true },
    })
    const input = wrapper.get<HTMLInputElement>('input')

    expect(input.element.indeterminate).toBe(true)
    expect(input.attributes('aria-checked')).toBe('mixed')
    expect(wrapper.classes()).toContain('is-indeterminate')
    expect(wrapper.get('.o-checkbox__indicator').find('svg').exists()).toBe(true)

    await wrapper.setProps({ indeterminate: false, modelValue: true })
    expect(input.element.indeterminate).toBe(false)
    expect(input.attributes('aria-checked')).toBe('true')
    expect(wrapper.classes()).toContain('is-checked')
  })

  it('does not mutate or emit while readonly', async () => {
    const wrapper = mount(OCheckbox, {
      props: { modelValue: true, readonly: true },
    })
    const input = wrapper.get<HTMLInputElement>('input')

    await input.trigger('click')
    await nextTick()

    expect(input.element.checked).toBe(true)
    expect(input.attributes('aria-readonly')).toBe('true')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('reflects disabled and invalid states on the native input', () => {
    const wrapper = mount(OCheckbox, {
      props: { modelValue: false, disabled: true, invalid: true },
    })
    const input = wrapper.get('input')

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['is-disabled', 'is-invalid']))
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('aria-invalid')).toBe('true')
  })

  it('renders stable input-label association on the server and hydration', async () => {
    const render = () => h(OCheckbox, { modelValue: true, label: 'SSR checkbox' })
    const html = await renderToString(createSSRApp({ render }))
    const container = document.createElement('div')
    container.innerHTML = html
    const serverId = container.querySelector('input')?.id
    const app = createSSRApp({ render })
    app.mount(container)

    expect(serverId).toBeTruthy()
    expect(container.querySelector('input')?.id).toBe(serverId)
    expect(container.querySelector('.o-checkbox__label')?.getAttribute('for')).toBe(serverId)
    app.unmount()
  })
})
