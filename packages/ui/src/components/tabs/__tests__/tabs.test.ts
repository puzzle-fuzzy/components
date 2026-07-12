import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import {
  OTabs,
  oTabsProps,
  oTabsVariants,
  type OTabsEmits,
  type OTabsItem,
  type OTabsProps,
  type OTabsVariant,
} from '../index'

const items: OTabsItem[] = [
  { value: 'text', label: '传输文本' },
  { value: 'file', label: '传输文件' },
  { value: 'disabled', label: '禁用', disabled: true },
]

describe('OTabs', () => {
  it('keeps public vocabularies and types stable', () => {
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

    expect(oTabsVariants).toEqual(['slider', 'line'])
    expect(oTabsProps.variant.validator(publicProps.variant)).toBe(true)
    expect(oTabsProps.variant.validator('plain')).toBe(false)
    const variant: OTabsVariant | undefined = publicProps.variant
    expect(variant).toBe('slider')
    expect(publicEmits.change).toEqual(['file'])
  })

  it('renders tab semantics and selects enabled tabs', async () => {
    const wrapper = mount(OTabs, {
      props: {
        modelValue: 'text',
        items,
        ariaLabel: '传输类型',
      },
    })
    const tabs = wrapper.findAll('[role="tab"]')

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['o-tabs', 'o-tabs--slider']))
    expect(wrapper.get('[role="tablist"]').attributes('aria-label')).toBe('传输类型')
    expect(tabs).toHaveLength(3)
    expect(tabs[0]?.attributes('aria-selected')).toBe('true')
    expect(tabs[2]?.attributes('aria-disabled')).toBe('true')
    expect(wrapper.get('.o-tabs__indicator').attributes('style')).toContain('translateX(0%)')

    await tabs[1]?.trigger('click')
    await tabs[2]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['file']])
    expect(wrapper.emitted('change')).toEqual([['file']])
  })

  it('moves selection with arrow keys, Home, and End', async () => {
    const wrapper = mount(OTabs, {
      attachTo: document.body,
      props: {
        modelValue: 'text',
        items,
      },
    })
    const first = wrapper.findAll('[role="tab"]')[0]!

    ;(first.element as HTMLElement).focus()
    await first.trigger('keydown', { key: 'ArrowRight' })
    await wrapper.setProps({ modelValue: 'file' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['file'])
    expect(document.activeElement?.textContent).toContain('传输文件')

    await wrapper.findAll('[role="tab"]')[1]?.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['file'])

    await wrapper.findAll('[role="tab"]')[1]?.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['text'])

    wrapper.unmount()
  })

  it('renders line variant and server output', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OTabs, {
            modelValue: 'file',
            items,
            variant: 'line',
            ariaLabel: '传输类型',
          }),
      }),
    )

    expect(html).toContain('class="o-tabs o-tabs--line')
    expect(html).toContain('role="tablist"')
    expect(html).toContain('传输文件')
  })
})
