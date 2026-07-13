import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import { OButton } from '../../button'
import {
  OCollapsible,
  OCollapsibleContent,
  OCollapsibleTrigger,
  oCollapsibleContentProps,
  oCollapsibleProps,
  oCollapsibleTriggerProps,
  type OCollapsibleEmits,
  type OCollapsibleProps,
  type OCollapsibleSlots,
} from '../index'

const mountCollapsible = (props: Record<string, unknown> = {}) =>
  mount(
    defineComponent({
      setup: () => () =>
        h(OCollapsible, props, {
          default: () => [
            h(OCollapsibleTrigger, { 'data-trigger': '' }, () => '切换详情'),
            h(OCollapsibleContent, { 'data-content': '' }, () => '折叠内容'),
          ],
        }),
    }),
  )

describe('OCollapsible', () => {
  it('keeps the local public contract independent from the runtime primitive', () => {
    const props: OCollapsibleProps = {
      defaultOpen: true,
      disabled: false,
      unmountOnHide: true,
      as: 'section',
    }
    const emits: OCollapsibleEmits = { 'update:open': [true] }
    const slots: OCollapsibleSlots = { default: ({ open }) => String(open) }

    expect(oCollapsibleProps.defaultOpen.default).toBe(false)
    expect(oCollapsibleProps.unmountOnHide.default).toBe(true)
    expect(oCollapsibleProps.as.default).toBe('div')
    expect(oCollapsibleTriggerProps.as.default).toBe('button')
    expect(oCollapsibleContentProps.as.default).toBe('div')
    expect(props.as).toBe('section')
    expect(emits['update:open']).toEqual([true])
    expect(slots.default?.({ open: true })).toBe('true')
  })

  it('supports an uncontrolled default state and stable state hooks', async () => {
    const wrapper = mountCollapsible({ defaultOpen: true })
    const trigger = wrapper.get<HTMLButtonElement>('[data-trigger]')

    expect(wrapper.get('.o-collapsible').attributes('data-state')).toBe('open')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(trigger.attributes('aria-controls')).toBe(
      wrapper.get('.o-collapsible__content-inner').attributes('id'),
    )
    expect(wrapper.get('.o-collapsible__content-inner').attributes('data-state')).toBe('open')

    await trigger.trigger('click')

    expect(wrapper.get('.o-collapsible').attributes('data-state')).toBe('closed')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('[data-content]').attributes('data-state')).toBe('closed')
  })

  it('only emits a requested change when controlled', async () => {
    const wrapper = mount(OCollapsible, {
      props: { open: false },
      slots: {
        default: () => [h(OCollapsibleTrigger, () => '切换'), h(OCollapsibleContent, () => '内容')],
      },
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.findComponent(OCollapsible).emitted('update:open')).toEqual([[true]])
    expect(wrapper.get('.o-collapsible').attributes('data-state')).toBe('closed')
    expect(wrapper.get('.o-collapsible__content').attributes('data-state')).toBe('closed')

    await wrapper.setProps({ open: true })
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    await nextTick()
    expect(wrapper.get('.o-collapsible').attributes('data-state')).toBe('open')
    expect(wrapper.get('.o-collapsible__content').text()).toBe('内容')
  })

  it('uses native button keyboard semantics and blocks a disabled disclosure', async () => {
    const wrapper = mountCollapsible({ disabled: true })
    const trigger = wrapper.get<HTMLButtonElement>('button')

    expect(trigger.attributes('type')).toBe('button')
    expect(trigger.attributes()).toHaveProperty('disabled')
    expect(trigger.attributes('data-disabled')).toBe('')

    await trigger.trigger('keydown', { key: 'Enter' })
    await trigger.trigger('keydown', { key: ' ' })
    await trigger.trigger('click')

    expect(wrapper.get('.o-collapsible').attributes('data-state')).toBe('closed')
    expect(wrapper.get('[data-content]').attributes('data-state')).toBe('closed')
  })

  it('keeps content mounted when requested and forwards native attrs', () => {
    const wrapper = mount(OCollapsible, {
      attrs: { id: 'advanced-options', 'aria-label': '高级选项' },
      slots: {
        default: () => [
          h(OCollapsibleTrigger, { class: 'custom-trigger' }, () => '切换'),
          h(OCollapsibleContent, { forceMount: true, class: 'custom-content' }, () => '内容'),
        ],
      },
    })

    expect(wrapper.get('.o-collapsible').attributes('id')).toBe('advanced-options')
    expect(wrapper.get('.o-collapsible').attributes('aria-label')).toBe('高级选项')
    expect(wrapper.get('button').classes()).toContain('custom-trigger')
    expect(wrapper.get('.o-collapsible__content').classes()).toContain('custom-content')
    expect(wrapper.get('.o-collapsible__content').attributes('data-state')).toBe('closed')
  })

  it('composes an existing button without creating a nested button', async () => {
    const wrapper = mount(OCollapsible, {
      slots: {
        default: () => [
          h(OCollapsibleTrigger, { asChild: true }, () =>
            h(OButton, { variant: 'soft' }, () => '查看配置'),
          ),
          h(OCollapsibleContent, () => '配置内容'),
        ],
      },
    })

    expect(wrapper.findAll('button')).toHaveLength(1)
    expect(wrapper.get('button').classes()).toEqual(
      expect.arrayContaining(['o-button', 'o-collapsible__trigger']),
    )

    await wrapper.get('button').trigger('click')
    expect(wrapper.get('.o-collapsible__content').text()).toBe('配置内容')
  })

  it('renders open and force-mounted states during SSR', async () => {
    const render = (open: boolean, forceMount = false) =>
      renderToString(
        createSSRApp({
          render: () =>
            h(
              OCollapsible,
              { defaultOpen: open },
              {
                default: () => [
                  h(OCollapsibleTrigger, () => '切换'),
                  h(OCollapsibleContent, { forceMount }, () => '服务端内容'),
                ],
              },
            ),
        }),
      )

    const openHtml = await render(true)
    const forcedHtml = await render(false, true)

    expect(openHtml).toContain('aria-expanded="true"')
    expect(openHtml).toContain('服务端内容')
    expect(forcedHtml).toContain('data-state="closed"')
    expect(forcedHtml).toContain('服务端内容')
    await nextTick()
  })
})
