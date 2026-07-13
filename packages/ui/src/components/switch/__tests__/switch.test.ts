import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { createSSRApp, h, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import {
  OSwitch,
  oSwitchProps,
  oSwitchSizes,
  type OSwitchEmits,
  type OSwitchProps,
  type OSwitchSlots,
} from '../index'

const switchSource = readFileSync(
  resolve('packages/ui/src/components/switch/src/OSwitch.vue'),
  'utf8',
)
const switchStyleSource = readFileSync(
  resolve('packages/ui/src/components/switch/style/index.less'),
  'utf8',
)

describe('OSwitch', () => {
  it('keeps its public vocabulary and types aligned with runtime validation', () => {
    const props: OSwitchProps = {
      modelValue: true,
      size: 'sm',
      label: 'Sync files',
      description: 'Keep local and remote files aligned',
      disabled: false,
      readonly: false,
      loading: true,
      invalid: false,
    }
    const event = new Event('change')
    const emits: OSwitchEmits = {
      'update:modelValue': [false],
      change: [false, event],
    }
    const slots: OSwitchSlots = {
      default: () => 'Sync files',
      description: () => 'Keep files aligned',
    }

    expect(oSwitchSizes).toEqual(['sm', 'md'])
    expect(oSwitchProps.modelValue.default).toBe(false)
    expect(oSwitchProps.size.default).toBe('md')
    expect(oSwitchProps.size.validator(props.size)).toBe(true)
    expect(oSwitchProps.size.validator('lg')).toBe(false)
    expect(props.loading).toBe(true)
    expect(emits.change).toEqual([false, event])
    expect(slots.default?.()).toBe('Sync files')
    expect(slots.description?.()).toBe('Keep files aligned')
  })

  it('renders a native switch with generated label and description associations', () => {
    const wrapper = mount(OSwitch, {
      props: {
        modelValue: false,
        label: 'Sync',
        description: 'Keep files aligned',
      },
    })
    const input = wrapper.get('input')
    const label = wrapper.get('label')
    const description = wrapper.get('.o-switch__description')

    expect(input.attributes()).toEqual(
      expect.objectContaining({
        type: 'checkbox',
        role: 'switch',
        'aria-checked': 'false',
      }),
    )
    expect(input.attributes('id')).toBeTruthy()
    expect(label.attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('aria-describedby')).toBe(description.attributes('id'))
    expect(wrapper.text()).toContain('Sync')
    expect(wrapper.text()).toContain('Keep files aligned')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['o-switch', 'o-switch--md']))
  })

  it('forwards native form attrs, listeners, and consumer descriptions to the input', async () => {
    const onFocus = vi.fn()
    const wrapper = mount(OSwitch, {
      props: { modelValue: false, description: 'Local description' },
      attrs: {
        id: 'sync-control',
        name: 'sync',
        required: true,
        value: 'enabled',
        autocomplete: 'off',
        class: 'consumer-switch-input',
        'aria-describedby': 'external-help',
        onFocus,
      },
    })
    const input = wrapper.get('input')

    expect(wrapper.attributes('id')).toBeUndefined()
    expect(input.attributes()).toEqual(
      expect.objectContaining({
        id: 'sync-control',
        name: 'sync',
        required: '',
        value: 'enabled',
        autocomplete: 'off',
        'aria-describedby': expect.stringContaining('external-help'),
      }),
    )
    expect(input.attributes('aria-describedby')).toContain('sync-control-description')
    expect(input.classes()).toEqual(
      expect.arrayContaining(['o-switch__input', 'consumer-switch-input']),
    )

    await input.trigger('focus')
    expect(onFocus).toHaveBeenCalledOnce()
  })

  it('emits checked state and restores a rejected controlled update', async () => {
    const wrapper = mount(OSwitch, { props: { modelValue: false } })
    const input = wrapper.get<HTMLInputElement>('input')

    await input.setValue(true)
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe(true)
    expect(wrapper.emitted('change')?.[0]?.[1]).toBeInstanceOf(Event)
    expect(input.element.checked).toBe(false)
  })

  it.each([
    ['readonly', { readonly: true }, 'aria-readonly'],
    ['loading', { loading: true }, 'aria-disabled'],
  ] as const)('does not mutate or emit while %s', async (_state, stateProps, ariaAttribute) => {
    const wrapper = mount(OSwitch, {
      props: { modelValue: true, ...stateProps },
    })
    const input = wrapper.get<HTMLInputElement>('input')

    await input.trigger('click')
    await nextTick()

    expect(input.element.checked).toBe(true)
    expect(input.attributes(ariaAttribute)).toBe('true')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('uses native disabled state and exposes invalid state accessibly', () => {
    const wrapper = mount(OSwitch, {
      props: { modelValue: false, disabled: true, invalid: true },
    })
    const input = wrapper.get('input')

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['is-disabled', 'is-invalid']))
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('aria-invalid')).toBe('true')
  })

  it('renders label and description slots in preference to props', () => {
    const wrapper = mount(OSwitch, {
      props: { label: 'Prop label', description: 'Prop description', size: 'sm' },
      slots: {
        default: '<strong data-test="label">Slot label</strong>',
        description: '<span data-test="description">Slot description</span>',
      },
    })

    expect(wrapper.classes()).toContain('o-switch--sm')
    expect(wrapper.get('[data-test="label"]').text()).toBe('Slot label')
    expect(wrapper.get('[data-test="description"]').text()).toBe('Slot description')
    expect(wrapper.text()).not.toContain('Prop label')
    expect(wrapper.text()).not.toContain('Prop description')
  })

  it('renders only the standardized loading icon while loading', async () => {
    const wrapper = mount(OSwitch, { props: { modelValue: false, loading: true } })

    expect(wrapper.classes()).toContain('is-loading')
    expect(wrapper.get('.o-switch__spinner').element.tagName.toLowerCase()).toBe('svg')
    expect(wrapper.get('.o-switch__spinner').attributes('aria-hidden')).toBe('true')

    await wrapper.setProps({ loading: false })
    expect(wrapper.find('.o-switch__spinner').exists()).toBe(false)
    expect(wrapper.get('input').attributes('aria-disabled')).toBeUndefined()
  })

  it('renders stable input-label association on the server and hydration', async () => {
    const render = () =>
      h(OSwitch, {
        modelValue: true,
        label: 'SSR switch',
        description: 'SSR description',
      })
    const html = await renderToString(createSSRApp({ render }))
    const container = document.createElement('div')
    container.innerHTML = html
    const serverId = container.querySelector('input')?.id
    const app = createSSRApp({ render })
    app.mount(container)

    expect(serverId).toBeTruthy()
    expect(container.querySelector('input')?.id).toBe(serverId)
    expect(container.querySelector('label')?.getAttribute('for')).toBe(serverId)
    expect(container.querySelector('.o-switch__description')?.id).toBe(`${serverId}-description`)
    app.unmount()
  })

  it('uses the standard icon and borderless, logical, motion-safe styles', () => {
    expect(switchSource).toContain(
      "import { LuLoader2 as LuLoaderCircle } from 'vue-icons-plus/lu'",
    )
    expect(switchSource).toContain('<LuLoaderCircle')
    expect(switchSource).not.toContain('<svg')
    expect(switchStyleSource).toMatch(/\.o-switch[\s\S]*?&__track\s*\{[\s\S]*?border:\s*0;/u)
    expect(switchStyleSource).toContain('--omg-switch-thumb-offset')
    expect(switchStyleSource).toContain(':dir(rtl)')
    expect(switchStyleSource).toContain("[dir='rtl']")
    expect(switchStyleSource).toContain('@media (pointer: coarse)')
    expect(switchStyleSource).toContain('min-block-size: 44px')
    expect(switchStyleSource).toContain('@media (prefers-reduced-motion: reduce)')
  })
})
