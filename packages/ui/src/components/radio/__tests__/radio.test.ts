import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import {
  ORadio,
  ORadioGroup,
  oRadioGroupOrientations,
  oRadioGroupProps,
  oRadioProps,
  type ORadioEmits,
  type ORadioGroupEmits,
  type ORadioGroupProps,
  type ORadioGroupSlots,
  type ORadioProps,
  type ORadioSlots,
  type ORadioValue,
} from '../index'

const styleSource = readFileSync(
  resolve('packages/ui/src/components/radio/style/index.less'),
  'utf8',
)

const renderGroup = (modelValue: ORadioValue = 'email') =>
  h(
    ORadioGroup,
    { modelValue, ariaLabel: '通知方式' },
    {
      default: () => [
        h(ORadio, { value: 'email', label: '邮件' }),
        h(ORadio, { value: 'sms', label: '短信' }),
      ],
    },
  )

describe('ORadio and ORadioGroup', () => {
  it('uses compact geometry and accessible state-layer feedback', () => {
    expect(styleSource).toContain('--omg-radio-accent: var(--omg-color-brand)')
    expect(styleSource).toContain('--omg-radio-state-layer: var(--omg-color-brand-soft)')
    expect(styleSource).toMatch(
      /&--horizontal\s*\{[^}]*gap:\s*var\(--omg-space-2\) var\(--omg-space-4\)/su,
    )
    expect(styleSource).toMatch(
      /&__indicator\s*\{[^}]*inline-size:\s*20px[^}]*block-size:\s*20px[^}]*border:\s*2px solid/su,
    )
    expect(styleSource).toMatch(
      /\.o-radio__indicator::before\s*\{[^}]*inline-size:\s*36px[^}]*block-size:\s*36px[^}]*opacity:\s*var\(--omg-radio-state-opacity, 0\)/su,
    )
    expect(styleSource).toMatch(
      /&__dot\s*\{[^}]*inline-size:\s*10px[^}]*block-size:\s*10px[^}]*background:\s*var\(--omg-radio-accent\)/su,
    )
    expect(styleSource).toMatch(
      /&__label\s*\{[^}]*min-block-size:\s*var\(--omg-control-height-sm\)/su,
    )
    expect(styleSource).toMatch(
      /&\.is-invalid\s*\{[^}]*--omg-radio-accent:\s*var\(--omg-color-danger\)[^}]*--omg-radio-state-layer:\s*var\(--omg-color-danger-soft\)/su,
    )
    expect(styleSource).toContain('&__input:focus-visible + &__label')
    expect(styleSource).toContain('&:not(.is-disabled) &__label:active')
    expect(styleSource).toContain('.o-radio:not(.is-disabled):hover')
    expect(styleSource).toContain('@media (pointer: coarse)')
    expect(styleSource).toContain('min-block-size: 44px')
    expect(styleSource).toContain('@media (forced-colors: active)')
    expect(styleSource).toContain('@media (prefers-reduced-motion: reduce)')
  })

  it('keeps public vocabularies and types stable', () => {
    const radioProps: ORadioProps = {
      modelValue: 'one',
      value: 2,
      label: 'Two',
      name: 'choice',
      disabled: false,
      invalid: false,
    }
    const groupProps: ORadioGroupProps = {
      modelValue: 'one',
      name: 'choices',
      orientation: 'horizontal',
      disabled: false,
      invalid: false,
      ariaLabel: 'Choices',
    }
    const event = new Event('change')
    const radioEmits: ORadioEmits = {
      'update:modelValue': [2],
      change: [2, event],
    }
    const groupEmits: ORadioGroupEmits = {
      'update:modelValue': [2],
      change: [2, event],
    }
    const radioSlots: ORadioSlots = { default: () => 'Two' }
    const groupSlots: ORadioGroupSlots = { default: () => 'Radios' }

    expect(oRadioGroupOrientations).toEqual(['horizontal', 'vertical'])
    expect(oRadioGroupProps.orientation.validator(groupProps.orientation)).toBe(true)
    expect(oRadioGroupProps.orientation.validator('grid')).toBe(false)
    expect(oRadioProps.value.required).toBe(true)
    expect(radioProps.value).toBe(2)
    expect(radioEmits.change).toEqual([2, event])
    expect(groupEmits.change).toEqual([2, event])
    expect(radioSlots.default?.()).toBe('Two')
    expect(groupSlots.default?.()).toBe('Radios')
  })

  it('updates a standalone native radio and restores a rejected value', async () => {
    const wrapper = mount(ORadio, {
      props: {
        modelValue: 'email',
        value: 'sms',
        label: '短信',
        name: 'channel',
      },
    })
    const input = wrapper.get<HTMLInputElement>('input')

    expect(input.attributes('type')).toBe('radio')
    expect(input.attributes('name')).toBe('channel')
    expect(input.element.checked).toBe(false)

    await input.setValue(true)
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([['sms']])
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe('sms')
    expect(wrapper.emitted('change')?.[0]?.[1]).toBeInstanceOf(Event)
    expect(input.element.checked).toBe(false)
  })

  it('forwards attrs and listeners to the standalone native radio', async () => {
    const onClick = vi.fn()
    const wrapper = mount(ORadio, {
      props: { modelValue: 1, value: 2, label: '第二项' },
      attrs: {
        id: 'second-choice',
        required: true,
        'aria-describedby': 'choice-help',
        class: 'consumer-radio',
        onClick,
      },
    })
    const input = wrapper.get('input')

    expect(wrapper.attributes('id')).toBeUndefined()
    expect(input.attributes()).toEqual(
      expect.objectContaining({
        id: 'second-choice',
        required: '',
        'aria-describedby': 'choice-help',
      }),
    )
    expect(input.classes()).toEqual(expect.arrayContaining(['o-radio__input', 'consumer-radio']))
    expect(wrapper.get('.o-radio__label').attributes('for')).toBe('second-choice')

    await input.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('provides shared value, name, disabled, invalid, and orientation from the group', () => {
    const wrapper = mount(ORadioGroup, {
      props: {
        modelValue: 'email',
        orientation: 'horizontal',
        disabled: true,
        invalid: true,
        ariaLabel: '通知方式',
      },
      slots: {
        default: () => [
          h(ORadio, { value: 'email', label: '邮件' }),
          h(ORadio, { value: 'sms', label: '短信' }),
        ],
      },
    })
    const group = wrapper.get('[role="radiogroup"]')
    const inputs = wrapper.findAll<HTMLInputElement>('input')
    const names = inputs.map((input) => input.attributes('name'))

    expect(group.attributes('aria-label')).toBe('通知方式')
    expect(group.attributes('aria-orientation')).toBe('horizontal')
    expect(group.classes()).toContain('o-radio-group--horizontal')
    expect(names[0]).toBeTruthy()
    expect(new Set(names).size).toBe(1)
    expect(inputs[0]?.element.checked).toBe(true)
    expect(inputs[1]?.element.checked).toBe(false)
    expect(inputs.every((input) => input.attributes('disabled') !== undefined)).toBe(true)
    expect(inputs.every((input) => input.attributes('aria-invalid') === 'true')).toBe(true)
  })

  it('emits only from the group and restores all native radios after rejection', async () => {
    const wrapper = mount(ORadioGroup, {
      props: { modelValue: 'email', name: 'channel' },
      slots: {
        default: () => [
          h(ORadio, { value: 'email', label: '邮件' }),
          h(ORadio, { value: 'sms', label: '短信' }),
        ],
      },
    })
    const radios = wrapper.findAllComponents(ORadio)
    const inputs = wrapper.findAll<HTMLInputElement>('input')

    await inputs[1]?.setValue(true)
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([['sms']])
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe('sms')
    expect(radios[1]?.emitted('update:modelValue')).toBeUndefined()
    expect(inputs[0]?.element.checked).toBe(true)
    expect(inputs[1]?.element.checked).toBe(false)
  })

  it('accepts group updates and preserves numeric values without parsing', async () => {
    const value = ref<ORadioValue>(1)
    const Harness = defineComponent({
      setup: () => () =>
        h(
          ORadioGroup,
          {
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue: ORadioValue) => {
              value.value = nextValue
            },
          },
          {
            default: () => [
              h(ORadio, { value: 1, label: 'One' }),
              h(ORadio, { value: 2, label: 'Two' }),
            ],
          },
        ),
    })
    const wrapper = mount(Harness)
    const inputs = wrapper.findAll<HTMLInputElement>('input')

    await inputs[1]?.setValue(true)
    await nextTick()

    expect(value.value).toBe(2)
    expect(typeof value.value).toBe('number')
    expect(inputs[1]?.element.checked).toBe(true)
  })

  it('generates unique label associations for duplicate visible labels', () => {
    const wrapper = mount(ORadioGroup, {
      props: { modelValue: 'a' },
      slots: {
        default: () => [
          h(ORadio, { value: 'a', label: '重复' }),
          h(ORadio, { value: 'b', label: '重复' }),
        ],
      },
    })
    const ids = wrapper.findAll('input').map((input) => input.attributes('id'))
    const fors = wrapper.findAll('.o-radio__label').map((label) => label.attributes('for'))

    expect(ids.every(Boolean)).toBe(true)
    expect(new Set(ids).size).toBe(2)
    expect(fors).toEqual(ids)
  })

  it('renders stable group names and radio ids on the server and hydration', async () => {
    const render = () => renderGroup()
    const html = await renderToString(createSSRApp({ render }))
    const container = document.createElement('div')
    container.innerHTML = html
    const serverNames = [...container.querySelectorAll('input')].map((input) => input.name)
    const serverIds = [...container.querySelectorAll('input')].map((input) => input.id)
    const app = createSSRApp({ render })
    app.mount(container)

    expect(new Set(serverNames).size).toBe(1)
    expect(serverNames[0]).toBeTruthy()
    expect(new Set(serverIds).size).toBe(2)
    expect([...container.querySelectorAll('input')].map((input) => input.name)).toEqual(serverNames)
    expect([...container.querySelectorAll('input')].map((input) => input.id)).toEqual(serverIds)
    app.unmount()
  })
})
