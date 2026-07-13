import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import {
  OInputGroup,
  OInputGroupAddon,
  OInputGroupButton,
  OInputGroupInput,
  OInputGroupText,
  OInputGroupTextarea,
  oInputGroupAddonAligns,
  oInputGroupAddonProps,
  oInputGroupButtonProps,
  oInputGroupProps,
  oInputGroupTextProps,
  type OInputGroupAddonAlign,
  type OInputGroupProps,
  type OInputGroupSlots,
} from '../index'

const groupStyles = readFileSync(
  resolve('packages/ui/src/components/input-group/style/index.less'),
  'utf8',
)

describe('OInputGroup family', () => {
  it('keeps public vocabularies, defaults, validators, and types aligned', () => {
    const align: OInputGroupAddonAlign = 'block-end'
    const props: OInputGroupProps = { invalid: true, disabled: false, ariaLabel: 'Search' }
    const slots: OInputGroupSlots = { default: () => h('input') }

    expect(oInputGroupAddonAligns).toEqual([
      'inline-start',
      'inline-end',
      'block-start',
      'block-end',
    ])
    expect(oInputGroupProps.invalid.default).toBe(false)
    expect(oInputGroupProps.disabled.default).toBe(false)
    expect(oInputGroupAddonProps.align.default).toBe('inline-start')
    expect(oInputGroupAddonProps.align.validator(align)).toBe(true)
    expect(oInputGroupAddonProps.align.validator('center')).toBe(false)
    expect(oInputGroupTextProps.tag.default).toBe('span')
    expect(oInputGroupTextProps.tag.validator('div')).toBe(true)
    expect(oInputGroupTextProps.tag.validator('button')).toBe(false)
    expect(oInputGroupButtonProps.size.default).toBe('sm')
    expect(props.ariaLabel).toBe('Search')
    expect(slots.default?.()).toBeTruthy()
  })

  it('renders root state, attrs, four addon alignments, and static text tags', async () => {
    const wrapper = mount(OInputGroup, {
      props: { invalid: true, disabled: true, ariaLabel: 'Amount' },
      attrs: { id: 'amount-group', class: 'consumer-group', 'data-track': 'amount' },
      slots: {
        default: () => [
          ...oInputGroupAddonAligns.map((align) =>
            h(OInputGroupAddon, { align, 'data-test': align }, () => align),
          ),
          h(OInputGroupText, { tag: 'div', id: 'currency' }, () => 'CNY'),
        ],
      },
    })

    expect(wrapper.attributes()).toMatchObject({
      id: 'amount-group',
      role: 'group',
      'aria-label': 'Amount',
      'data-slot': 'input-group',
      'data-invalid': 'true',
      'data-disabled': 'true',
      'data-track': 'amount',
    })
    expect(wrapper.classes()).toContain('consumer-group')
    for (const align of oInputGroupAddonAligns) {
      expect(wrapper.get(`[data-test="${align}"]`).attributes('data-align')).toBe(align)
    }
    expect(wrapper.get('#currency').element.tagName).toBe('DIV')
    expect(wrapper.get('#currency').attributes('data-slot')).toBe('input-group-text')

    await wrapper.setProps({ invalid: false, disabled: false })
    expect(wrapper.attributes('data-invalid')).toBeUndefined()
    expect(wrapper.attributes('data-disabled')).toBeUndefined()
  })

  it('forwards Input props, attrs, slots, events, controlled normalization, and IME behavior', async () => {
    const value = ref('start')
    const onFocus = vi.fn()
    const Harness = defineComponent({
      setup: () => () =>
        h(OInputGroup, null, {
          default: () =>
            h(
              OInputGroupInput,
              {
                modelValue: value.value,
                id: 'query',
                clearable: true,
                'aria-describedby': 'query-help',
                'onUpdate:modelValue': (nextValue: string) => {
                  value.value = nextValue.trim().toUpperCase()
                },
                onFocus,
              },
              {
                prefix: () => h('span', { 'data-test': 'prefix' }, 'P'),
                suffix: () => h('span', { 'data-test': 'suffix' }, 'S'),
              },
            ),
        }),
    })
    const wrapper = mount(Harness)
    const input = wrapper.get('input')

    expect(input.attributes()).toMatchObject({
      id: 'query',
      'aria-describedby': 'query-help',
      'data-slot': 'input-group-input',
    })
    expect(wrapper.get('[data-test="prefix"]').text()).toBe('P')
    expect(wrapper.get('[data-test="suffix"]').text()).toBe('S')

    await input.setValue(' next ')
    await nextTick()
    expect(value.value).toBe('NEXT')
    expect(input.element.value).toBe('NEXT')

    await input.trigger('focus')
    expect(onFocus).toHaveBeenCalledOnce()

    await input.trigger('compositionstart')
    input.element.value = 'n'
    input.element.dispatchEvent(new Event('input', { bubbles: true }))
    expect(value.value).toBe('NEXT')
    input.element.value = '你'
    await input.trigger('compositionend')
    await nextTick()
    await nextTick()
    expect(value.value).toBe('你')
  })

  it('forwards Textarea props, native attrs, autosize, count, and controlled updates', async () => {
    const wrapper = mount(OInputGroupTextarea, {
      props: {
        modelValue: 'accepted',
        autosize: { minRows: 2, maxRows: 5 },
        maxlength: 20,
        showCount: true,
      },
      attrs: { id: 'message', name: 'message', 'aria-describedby': 'message-help' },
    })
    const textarea = wrapper.get('textarea')

    expect(textarea.attributes()).toMatchObject({
      id: 'message',
      name: 'message',
      maxlength: '20',
      'data-slot': 'input-group-textarea',
    })
    expect(textarea.attributes('aria-describedby')?.split(/\s+/u)).toContain('message-help')
    expect(textarea.attributes('style')).toContain('--omg-textarea-min-rows: 2')
    expect(wrapper.get('.o-textarea__count').text()).toBe('8/20')

    await textarea.setValue('rejected')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([['rejected']])
    expect(textarea.element.value).toBe('accepted')
  })

  it('focuses the first enabled field from addon blank space without stealing interactive clicks', async () => {
    const buttonClick = vi.fn()
    const wrapper = mount(OInputGroup, {
      attachTo: document.body,
      slots: {
        default: () => [
          h(OInputGroupInput, { modelValue: '', disabled: true, id: 'disabled-input' }),
          h(OInputGroupTextarea, { modelValue: '', id: 'enabled-textarea' }),
          h(OInputGroupAddon, { 'data-test': 'addon' }, () => [
            h('span', { 'data-test': 'blank' }, 'Unit'),
            h('button', { type: 'button', 'data-test': 'inner', onClick: buttonClick }, 'Action'),
          ]),
        ],
      },
    })
    const textarea = wrapper.get<HTMLTextAreaElement>('#enabled-textarea')

    await wrapper.get('[data-test="blank"]').trigger('click')
    expect(document.activeElement).toBe(textarea.element)

    textarea.element.blur()
    await wrapper.get('[data-test="inner"]').trigger('click')
    expect(buttonClick).toHaveBeenCalledOnce()
    expect(document.activeElement).not.toBe(textarea.element)
    wrapper.unmount()
  })

  it('delegates button slots and click behavior without stealing addon focus', async () => {
    const onClick = vi.fn()
    const wrapper = mount(OInputGroup, {
      attachTo: document.body,
      slots: {
        default: () => [
          h(OInputGroupInput, { modelValue: '', id: 'button-query' }),
          h(OInputGroupAddon, null, () =>
            h(
              OInputGroupButton,
              { onClick, ariaLabel: 'Search' },
              {
                icon: () => h('span', { 'data-test': 'icon' }, 'I'),
                default: () => 'Search',
              },
            ),
          ),
        ],
      },
    })
    const button = wrapper.get<HTMLButtonElement>('[data-slot="input-group-button"]')

    expect(button.classes()).toContain('o-button--sm')
    expect(wrapper.get('[data-test="icon"]').text()).toBe('I')
    await button.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
    expect(document.activeElement).not.toBe(wrapper.get('#button-query').element)
    wrapper.unmount()
  })

  it('owns one border and neutralizes nested control surfaces without focus glow', () => {
    expect(groupStyles).toMatch(
      /\.o-input-group\s*\{[\s\S]*?border:\s*1px solid var\(--omg-color-border\);/u,
    )
    expect(groupStyles).toMatch(/\.o-input-group:focus-within\s*\{[\s\S]*?border-color:/u)
    expect(groupStyles).toContain("[aria-invalid='true']")
    expect(groupStyles).toContain('.o-input__control')
    expect(groupStyles).toContain('.o-textarea__field')
    expect(groupStyles).toContain('box-shadow: none')
    expect(groupStyles).not.toContain('outline:')
    expect(groupStyles).not.toContain('var(--vp-')
  })
})
