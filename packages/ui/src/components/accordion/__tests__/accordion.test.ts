import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { OButton } from '../../button'
import {
  OAccordion,
  OAccordionContent,
  OAccordionItem,
  OAccordionTrigger,
  oAccordionOrientations,
  oAccordionProps,
  oAccordionTypes,
  type OAccordionEmits,
  type OAccordionProps,
  type OAccordionSlots,
  type OAccordionValue,
} from '../index'

const items = [
  { value: 'one', label: '第一项', content: '第一项内容' },
  { value: 'two', label: '第二项', content: '第二项内容' },
  { value: 'three', label: '第三项', content: '第三项内容' },
] as const

const mountAccordion = (props: Record<string, unknown> = {}) =>
  mount(
    defineComponent({
      setup: () => () =>
        h(OAccordion, props, {
          default: () =>
            items.map((item) =>
              h(
                OAccordionItem,
                { value: item.value, 'data-value': item.value },
                {
                  default: () => [
                    h(OAccordionTrigger, () => item.label),
                    h(OAccordionContent, () => item.content),
                  ],
                },
              ),
            ),
        }),
    }),
    { attachTo: document.body },
  )

describe('OAccordion', () => {
  it('keeps local vocabularies, defaults, and slot contracts typed', () => {
    const props: OAccordionProps = {
      type: 'multiple',
      defaultValue: ['one'],
      orientation: 'horizontal',
      dir: 'rtl',
      unmountOnHide: false,
    }
    const emits: OAccordionEmits = { 'update:modelValue': [['one', 'two']] }
    const slots: OAccordionSlots = { default: ({ modelValue }) => JSON.stringify(modelValue) }
    const value: OAccordionValue = props.defaultValue

    expect(oAccordionTypes).toEqual(['single', 'multiple'])
    expect(oAccordionOrientations).toEqual(['vertical', 'horizontal'])
    expect(oAccordionProps.type.default).toBe('single')
    expect(oAccordionProps.orientation.default).toBe('vertical')
    expect(oAccordionProps.unmountOnHide.default).toBe(true)
    expect(oAccordionProps.type.validator('toggle')).toBe(false)
    expect(value).toEqual(['one'])
    expect(emits['update:modelValue']).toEqual([['one', 'two']])
    expect(slots.default?.({ modelValue: 'one' })).toBe('"one"')
  })

  it('supports single uncontrolled state and collapsible behavior', async () => {
    const wrapper = mountAccordion({ defaultValue: 'one', collapsible: true })
    const first = wrapper.get<HTMLButtonElement>('[data-value="one"] button')
    const second = wrapper.get<HTMLButtonElement>('[data-value="two"] button')

    expect(first.attributes('aria-expanded')).toBe('true')
    expect(first.attributes('aria-controls')).toBe(
      wrapper.get('[data-value="one"] .o-accordion__content-inner').attributes('id'),
    )
    expect(wrapper.get('[data-value="one"]').attributes('data-state')).toBe('open')

    await second.trigger('click')
    expect(first.attributes('aria-expanded')).toBe('false')
    expect(second.attributes('aria-expanded')).toBe('true')
    expect(wrapper.findComponent(OAccordion).emitted('update:modelValue')?.at(-1)).toEqual(['two'])

    await second.trigger('click')
    expect(second.attributes('aria-expanded')).toBe('false')
    expect(wrapper.findComponent(OAccordion).emitted('update:modelValue')?.at(-1)).toEqual([
      undefined,
    ])
  })

  it('supports multiple values without closing an existing item', async () => {
    const wrapper = mountAccordion({ type: 'multiple', defaultValue: ['one'] })

    await wrapper.get('[data-value="two"] button').trigger('click')

    expect(wrapper.get('[data-value="one"] button').attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('[data-value="two"] button').attributes('aria-expanded')).toBe('true')
    expect(wrapper.findComponent(OAccordion).emitted('update:modelValue')?.at(-1)).toEqual([
      ['one', 'two'],
    ])
  })

  it('only emits requested values when controlled', async () => {
    const wrapper = mountAccordion({ modelValue: 'one' })

    await wrapper.get('[data-value="two"] button').trigger('click')

    expect(wrapper.findComponent(OAccordion).emitted('update:modelValue')).toEqual([['two']])
    expect(wrapper.get('[data-value="one"] button').attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('[data-value="two"] button').attributes('aria-expanded')).toBe('false')
  })

  it('blocks disabled roots and items while keeping stable state data', async () => {
    const rootDisabled = mountAccordion({ defaultValue: 'one', disabled: true })
    const trigger = rootDisabled.get<HTMLButtonElement>('[data-value="two"] button')

    expect(trigger.attributes()).toHaveProperty('disabled')
    expect(trigger.attributes('data-disabled')).toBe('')
    await trigger.trigger('click')
    expect(rootDisabled.findComponent(OAccordion).emitted('update:modelValue')).toBeUndefined()

    const itemDisabled = mount(OAccordion, {
      slots: {
        default: () =>
          h(
            OAccordionItem,
            { value: 'locked', disabled: true },
            {
              default: () => [
                h(OAccordionTrigger, () => '锁定项'),
                h(OAccordionContent, () => '锁定内容'),
              ],
            },
          ),
      },
    })
    expect(itemDisabled.get('button').attributes()).toHaveProperty('disabled')
    expect(itemDisabled.get('.o-accordion__item').attributes('data-disabled')).toBe('')
  })

  it('provides roving arrow, Home, and End focus navigation', async () => {
    const wrapper = mountAccordion()
    const triggers = wrapper.findAll<HTMLButtonElement>('button')

    triggers[0]!.element.focus()
    await triggers[0]!.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(triggers[1]!.element)

    await triggers[1]!.trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(triggers[2]!.element)

    await triggers[2]!.trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(triggers[0]!.element)
  })

  it('supports horizontal RTL navigation and state orientation', async () => {
    const wrapper = mountAccordion({ orientation: 'horizontal', dir: 'rtl' })
    const triggers = wrapper.findAll<HTMLButtonElement>('button')

    expect(wrapper.get('.o-accordion').attributes('data-orientation')).toBe('horizontal')
    expect(wrapper.get('.o-accordion__item').attributes('data-orientation')).toBe('horizontal')

    triggers[0]!.element.focus()
    await triggers[0]!.trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(triggers[1]!.element)
  })

  it('supports the default icon, a custom icon, and asChild composition', async () => {
    const standard = mount(OAccordion, {
      slots: {
        default: () =>
          h(
            OAccordionItem,
            { value: 'one' },
            {
              default: () => [
                h(OAccordionTrigger, null, {
                  default: () => '标题',
                  icon: () => h('span', { 'data-custom-icon': '' }, '+'),
                }),
                h(OAccordionContent, { forceMount: true }, () => '内容'),
              ],
            },
          ),
      },
    })
    expect(standard.find('[data-custom-icon]').exists()).toBe(true)

    const composed = mount(OAccordion, {
      slots: {
        default: () =>
          h(
            OAccordionItem,
            { value: 'one' },
            {
              default: () => [
                h(OAccordionTrigger, { asChild: true }, () =>
                  h(OButton, { variant: 'soft' }, () => '组合标题'),
                ),
                h(OAccordionContent, () => '组合内容'),
              ],
            },
          ),
      },
    })

    expect(composed.findAll('button')).toHaveLength(1)
    expect(composed.get('button').classes()).toEqual(
      expect.arrayContaining(['o-button', 'o-accordion__trigger']),
    )
    expect(composed.find('.o-accordion__indicator').exists()).toBe(false)

    await composed.get('button').trigger('click')
    expect(composed.get('[role="region"]').text()).toBe('组合内容')
  })

  it('warns in development when value shape does not match type', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const single = mountAccordion({ type: 'single', modelValue: ['one'] })

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('type="single" expects modelValue and defaultValue to be strings'),
    )
    single.unmount()

    const multiple = mountAccordion({ type: 'multiple', modelValue: 'one' })
    await nextTick()
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'type="multiple" expects modelValue and defaultValue to be string arrays',
      ),
    )
    multiple.unmount()
  })

  it('renders measured disclosure markup during SSR', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(
            OAccordion,
            { defaultValue: 'one' },
            {
              default: () =>
                h(
                  OAccordionItem,
                  { value: 'one' },
                  {
                    default: () => [
                      h(OAccordionTrigger, () => '服务端标题'),
                      h(OAccordionContent, { forceMount: true }, () => '服务端内容'),
                    ],
                  },
                ),
            },
          ),
      }),
    )

    expect(html).toContain('class="o-accordion')
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('role="region"')
    expect(html).toContain('服务端内容')
  })
})
