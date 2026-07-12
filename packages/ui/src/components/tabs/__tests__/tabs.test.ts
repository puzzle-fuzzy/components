import { renderToString } from '@vue/server-renderer'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, h, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import {
  OTabs,
  oTabsProps,
  oTabsVariants,
  type OTabsEmits,
  type OTabsItem,
  type OTabsProps,
  type OTabsSlots,
  type OTabsVariant,
} from '../index'

const items = [
  { value: 'text', label: '传输文本' },
  { value: 'file', label: '传输文件' },
  { value: 'disabled', label: '禁用', disabled: true },
] as const satisfies readonly OTabsItem[]

const getTab = (wrapper: VueWrapper, label: string) =>
  wrapper.findAll<HTMLButtonElement>('[role="tab"]').find((tab) => tab.text() === label)!

describe('OTabs', () => {
  it('keeps the public vocabularies, readonly items, and slot contract typed', () => {
    const publicProps: OTabsProps = {
      modelValue: 'text',
      items,
      variant: 'slider',
      ariaLabel: '传输类型',
    }
    const publicEmits: OTabsEmits = {
      'update:modelValue': ['file'],
      change: ['file'],
    }
    const publicSlots: OTabsSlots = {
      default: ({ item, selected }) => h('p', { 'data-selected': selected }, item.label),
    }

    expect(oTabsVariants).toEqual(['slider', 'line'])
    expect(oTabsProps.variant.validator(publicProps.variant)).toBe(true)
    expect(oTabsProps.variant.validator('plain')).toBe(false)
    const variant: OTabsVariant | undefined = publicProps.variant
    expect(variant).toBe('slider')
    expect(publicEmits.change).toEqual(['file'])
    expect(publicSlots.default).toBeTypeOf('function')
  })

  it('connects every tab to a deterministic optional tabpanel', async () => {
    const wrapper = mount(OTabs, {
      props: {
        modelValue: 'text',
        items,
        ariaLabel: '传输类型',
      },
      slots: {
        default: ({ item, selected }: { item: OTabsItem; selected: boolean }) =>
          h(
            'p',
            { 'data-panel-value': item.value, 'data-selected': selected },
            `${item.label}内容`,
          ),
      },
    })
    const tabs = wrapper.findAll('[role="tab"]')
    const panels = wrapper.findAll('[role="tabpanel"]')

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['o-tabs', 'o-tabs--slider']))
    expect(wrapper.get('[role="tablist"]').attributes('aria-label')).toBe('传输类型')
    expect(tabs).toHaveLength(3)
    expect(panels).toHaveLength(3)
    expect(tabs[0]?.attributes('aria-selected')).toBe('true')
    expect(tabs[0]?.attributes('tabindex')).toBe('0')
    expect(tabs[2]?.attributes('aria-disabled')).toBe('true')
    expect(tabs[2]?.attributes('tabindex')).toBe('-1')
    expect(tabs[0]?.attributes('aria-controls')).toBe(panels[0]?.attributes('id'))
    expect(panels[0]?.attributes('aria-labelledby')).toBe(tabs[0]?.attributes('id'))
    expect(panels[0]?.attributes('hidden')).toBeUndefined()
    expect(panels[1]?.attributes()).toHaveProperty('hidden')
    expect(wrapper.find('.o-tabs__indicator').exists()).toBe(false)

    await tabs[1]?.trigger('click')
    await tabs[2]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['file']])
    expect(wrapper.emitted('change')).toEqual([['file']])
  })

  it('omits panels and aria-controls when the default slot is absent', () => {
    const wrapper = mount(OTabs, {
      props: { modelValue: 'text', items },
    })

    expect(wrapper.find('[role="tabpanel"]').exists()).toBe(false)
    expect(wrapper.get('[role="tab"]').attributes('aria-controls')).toBeUndefined()
  })

  it('keeps one stable roving tab stop when a controlled update is rejected', async () => {
    const wrapper = mount(OTabs, {
      attachTo: document.body,
      props: { modelValue: 'text', items },
    })
    const textTab = getTab(wrapper, '传输文本')
    const fileTab = getTab(wrapper, '传输文件')

    textTab.element.focus()
    await textTab.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([['file']])
    expect(document.activeElement).toBe(fileTab.element)
    expect(textTab.attributes('aria-selected')).toBe('true')
    expect(textTab.attributes('tabindex')).toBe('-1')
    expect(fileTab.attributes('aria-selected')).toBe('false')
    expect(fileTab.attributes('tabindex')).toBe('0')

    await fileTab.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(textTab.element)
    expect(textTab.attributes('tabindex')).toBe('0')

    await textTab.trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(fileTab.element)
    expect(fileTab.attributes('tabindex')).toBe('0')

    wrapper.unmount()
  })

  it('supports Home and End while skipping disabled tabs', async () => {
    const wrapper = mount(OTabs, {
      attachTo: document.body,
      props: { modelValue: 'text', items },
    })
    const textTab = getTab(wrapper, '传输文本')
    const fileTab = getTab(wrapper, '传输文件')

    textTab.element.focus()
    await textTab.trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(fileTab.element)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['file'])

    await fileTab.trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(textTab.element)
    expect(wrapper.emitted('update:modelValue')).toEqual([['file']])

    wrapper.unmount()
  })

  it('falls back to the first enabled item for invalid or disabled models', async () => {
    const wrapper = mount(OTabs, {
      props: { modelValue: 'missing', items },
      slots: { default: ({ item }: { item: OTabsItem }) => item.label },
    })
    const tabs = wrapper.findAll('[role="tab"]')
    const panels = wrapper.findAll('[role="tabpanel"]')

    expect(tabs[0]?.attributes('aria-selected')).toBe('true')
    expect(tabs[0]?.attributes('tabindex')).toBe('0')
    expect(panels[0]?.attributes('hidden')).toBeUndefined()

    await wrapper.setProps({ modelValue: 'disabled' })

    expect(tabs[0]?.attributes('aria-selected')).toBe('true')
    expect(tabs[0]?.attributes('tabindex')).toBe('0')
    expect(tabs[2]?.attributes('aria-selected')).toBe('false')
    expect(tabs[2]?.attributes('tabindex')).toBe('-1')
  })

  it('tracks focused tabs by value across reorder, removal, and disabled changes', async () => {
    const mutableItems: readonly OTabsItem[] = [
      { value: 'text', label: '传输文本' },
      { value: 'file', label: '传输文件' },
      { value: 'archive', label: '归档' },
    ]
    const wrapper = mount(OTabs, {
      attachTo: document.body,
      props: { modelValue: 'text', items: mutableItems },
    })

    const textTab = getTab(wrapper, '传输文本')
    textTab.element.focus()
    await textTab.trigger('keydown', { key: 'ArrowRight' })
    expect(getTab(wrapper, '传输文件').attributes('tabindex')).toBe('0')

    await wrapper.setProps({
      items: [mutableItems[2]!, mutableItems[1]!, mutableItems[0]!],
    })
    expect(getTab(wrapper, '传输文件').attributes('tabindex')).toBe('0')

    await wrapper.setProps({
      items: [mutableItems[2]!, { ...mutableItems[1]!, disabled: true }, mutableItems[0]!],
    })
    expect(getTab(wrapper, '传输文本').attributes('tabindex')).toBe('0')

    await wrapper.setProps({
      modelValue: 'missing',
      items: [mutableItems[2]!, { ...mutableItems[0]!, disabled: true }],
    })
    expect(getTab(wrapper, '归档').attributes('aria-selected')).toBe('true')
    expect(getTab(wrapper, '归档').attributes('tabindex')).toBe('0')

    wrapper.unmount()
  })

  it('moves the roving stop when an external model update changes selection', async () => {
    const wrapper = mount(OTabs, {
      props: { modelValue: 'text', items },
    })

    await wrapper.setProps({ modelValue: 'file' })

    expect(getTab(wrapper, '传输文本').attributes('tabindex')).toBe('-1')
    expect(getTab(wrapper, '传输文件').attributes('aria-selected')).toBe('true')
    expect(getTab(wrapper, '传输文件').attributes('tabindex')).toBe('0')
  })

  it('renders stable tab and panel IDs on the server', async () => {
    const render = () =>
      renderToString(
        createSSRApp({
          render: () =>
            h(
              OTabs,
              {
                modelValue: 'file',
                items,
                variant: 'line',
                ariaLabel: '传输类型',
              },
              { default: ({ item }: { item: OTabsItem }) => item.label },
            ),
        }),
      )
    const first = await render()
    const second = await render()

    expect(first).toContain('class="o-tabs o-tabs--line')
    expect(first).toContain('role="tablist"')
    expect(first).toContain('role="tabpanel"')
    expect(first.match(/id="(o-tabs-[^"]+-tab-[^"]+)"/u)?.[1]).toBe(
      second.match(/id="(o-tabs-[^"]+-tab-[^"]+)"/u)?.[1],
    )
    expect(first).not.toContain('o-tabs__indicator')
  })
})
