/* eslint-disable vue/one-component-per-file -- Local component stubs keep module mocks deterministic. */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { DOMWrapper, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref, useAttrs } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('vue-icons-plus/lu', () => {
  const createIcon = (name: string) =>
    defineComponent({
      name,
      inheritAttrs: false,
      setup() {
        const attrs = useAttrs()

        return () => h('svg', { ...attrs, 'data-icon': name })
      },
    })

  return {
    LuCheck: createIcon('LuCheck'),
    LuChevronDown: createIcon('LuChevronDown'),
    LuX: createIcon('LuX'),
  }
})

vi.mock('vue-virtual-scroller', () => ({
  RecycleScroller: defineComponent({
    name: 'RecycleScroller',
    inheritAttrs: false,
    props: {
      items: { type: Array, default: () => [] },
      itemSize: Number,
      keyField: [String, Function],
      prerender: Number,
      buffer: Number,
    },
    setup(props, { attrs, expose, slots }) {
      const start = ref(0)
      const scrollToItem = vi.fn((index: number) => {
        start.value = Math.max(0, Math.min(index, props.items.length - 1))
      })
      expose({ scrollToItem })

      return () =>
        h(
          'div',
          { ...attrs, 'data-recycle-scroller': '', 'data-virtual-start': start.value },
          props.items
            .slice(start.value, start.value + 8)
            .map((item, offset) =>
              slots.default?.({ active: true, index: start.value + offset, item }),
            ),
        )
    },
  }),
}))

import {
  OSelect,
  normalizeOSelectVirtualListHeight,
  normalizeOSelectVirtualThreshold,
  oSelectPlacements,
  oSelectProps,
  oSelectSizes,
  oSelectVariants,
  type OSelectEmits,
  type OSelectOption,
  type OSelectProps,
  type OSelectSlots,
  type OSelectValue,
  type OSelectVariant,
} from '../index'

const selectStyles = readFileSync(
  resolve('packages/ui/src/components/select/style/index.less'),
  'utf8',
)
const selectSource = readFileSync(
  resolve('packages/ui/src/components/select/src/OSelect.vue'),
  'utf8',
)

const options = Object.freeze<readonly OSelectOption[]>([
  Object.freeze({ value: 'alpha', label: 'Alpha' }),
  Object.freeze({ value: 'beta', label: 'Beta', disabled: true }),
  Object.freeze({ value: 3, label: 'Gamma' }),
])

const mountSelect = (overrides: Partial<OSelectProps> = {}) =>
  mount(OSelect, {
    attachTo: document.body,
    props: {
      options,
      ...overrides,
    },
  })

const getListbox = (): HTMLElement => {
  const element = document.body.querySelector<HTMLElement>('[role="listbox"]')
  if (!element) throw new Error('Expected a teleported listbox')
  return element
}

const getOptions = (): HTMLElement[] =>
  Array.from(document.body.querySelectorAll<HTMLElement>('[role="option"]'))

describe('OSelect public model', () => {
  it('keeps types, defaults, and runtime validators aligned', () => {
    const value: OSelectValue = 3
    const publicProps: OSelectProps = {
      ariaLabel: 'Greek letter',
      clearable: true,
      disabled: false,
      modelValue: value,
      open: false,
      options,
      placement: 'bottom-end',
      placeholder: 'Choose a letter',
      size: 'lg',
      variant: 'outline',
      teleported: false,
      teleportTo: 'body',
      virtual: true,
      virtualListHeight: 288,
      virtualThreshold: 100,
    }
    const publicEmits: OSelectEmits = {
      change: [3, options[2]!],
      clear: [],
      'update:modelValue': [undefined],
      'update:open': [true],
    }
    const publicSlots: OSelectSlots = {
      empty: () => 'No choices',
      option: ({ option, selected, active }) =>
        `${option.label}:${String(selected)}:${String(active)}`,
    }
    const variant: OSelectVariant = 'outline'

    expect(oSelectSizes).toEqual(['sm', 'md', 'lg'])
    expect(oSelectVariants).toEqual(['soft', 'outline'])
    expect(oSelectProps.variant.default).toBe('soft')
    expect(oSelectProps.variant.validator(variant)).toBe(true)
    expect(oSelectProps.variant.validator('filled')).toBe(false)
    expect(oSelectPlacements).toEqual(['bottom-start', 'bottom-end'])
    expect(oSelectProps.size.default).toBe('md')
    expect(oSelectProps.placeholder.default).toBe('Select')
    expect(oSelectProps.clearAriaLabel.default).toBe('Clear selection')
    expect(oSelectProps.placement.default).toBe('bottom-start')
    expect(oSelectProps.teleported.default).toBe(true)
    expect(oSelectProps.teleportTo.default).toBe('body')
    expect(oSelectProps.virtual.default).toBe(true)
    expect(oSelectProps.virtualThreshold.default).toBe(100)
    expect(oSelectProps.virtualListHeight.default).toBe(288)
    expect(normalizeOSelectVirtualThreshold(10.9)).toBe(10)
    expect(normalizeOSelectVirtualThreshold(0)).toBe(1)
    expect(normalizeOSelectVirtualListHeight(360.8)).toBe(360)
    expect(normalizeOSelectVirtualListHeight(Number.NaN)).toBe(288)
    expect(oSelectProps.size.validator(publicProps.size)).toBe(true)
    expect(oSelectProps.size.validator('xl')).toBe(false)
    expect(oSelectProps.placement.validator(publicProps.placement)).toBe(true)
    expect(oSelectProps.placement.validator('top')).toBe(false)
    expect(publicEmits.change).toEqual([3, options[2]])
    expect(publicSlots.option?.({ option: options[0]!, selected: true, active: false })).toBe(
      'Alpha:true:false',
    )
  })
})

describe('OSelect behavior', () => {
  it('virtualizes only long option collections and keeps complete-set ARIA metadata', async () => {
    const longOptions = Array.from({ length: 101 }, (_, index) => ({
      value: `option-${String(index)}`,
      label: `Option ${String(index)}`,
    }))
    const wrapper = mountSelect({ open: true, options: longOptions, teleported: false })
    await nextTick()

    expect(wrapper.find('[data-recycle-scroller]').exists()).toBe(true)
    expect(wrapper.findAll('[role="option"]')).toHaveLength(8)
    expect(wrapper.get('[role="option"]').attributes()).toMatchObject({
      'aria-posinset': '1',
      'aria-setsize': '101',
    })

    await wrapper.findAll('[role="option"]')[4]!.trigger('pointerenter')
    expect(wrapper.get('[role="combobox"]').attributes('aria-activedescendant')).toContain(
      'option-4',
    )

    await wrapper.get('[role="combobox"]').trigger('keydown', { key: 'End' })
    await nextTick()
    await nextTick()

    expect(wrapper.get('[data-recycle-scroller]').attributes('data-virtual-start')).toBe('100')
    expect(wrapper.get('[role="option"]').attributes('aria-posinset')).toBe('101')
    expect(wrapper.get('[role="combobox"]').attributes('aria-activedescendant')).toContain(
      'option-100',
    )

    wrapper.unmount()

    const nativeWrapper = mountSelect({
      open: true,
      options: longOptions,
      teleported: false,
      virtual: false,
    })
    await nextTick()
    expect(nativeWrapper.find('[data-recycle-scroller]').exists()).toBe(false)
    expect(nativeWrapper.findAll('[role="option"]')).toHaveLength(101)
  })

  it('renders a closed select-only combobox with safe defaults', () => {
    const wrapper = mountSelect()
    const trigger = wrapper.get('[role="combobox"]')

    expect(trigger.element.tagName).toBe('BUTTON')
    expect(trigger.attributes()).toMatchObject({
      type: 'button',
      role: 'combobox',
      'aria-haspopup': 'listbox',
      'aria-expanded': 'false',
      'aria-autocomplete': 'none',
    })
    expect(trigger.attributes('aria-controls')).toBeUndefined()
    expect(trigger.attributes('aria-activedescendant')).toBeUndefined()
    expect(trigger.text()).toContain('Select')
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-select', 'o-select--md', 'o-select--soft']),
    )
    expect(document.body.querySelector('[role="listbox"]')).toBeNull()
  })

  it('renders soft by default and outline on request', () => {
    const soft = mountSelect()
    const outline = mountSelect({ variant: 'outline' })

    expect(soft.classes()).toContain('o-select--soft')
    expect(outline.classes()).toContain('o-select--outline')
  })

  it.each([
    ['alpha', 'Alpha'],
    [3, 'Gamma'],
  ] as const)('renders the selected label for model value %s', (modelValue, label) => {
    const wrapper = mountSelect({ modelValue })

    expect(wrapper.get('.o-select__value').text()).toBe(label)
    expect(wrapper.get('.o-select__value').classes()).not.toContain('o-select__value--placeholder')
  })

  it('reacts to model and placeholder updates', async () => {
    const wrapper = mountSelect({ placeholder: 'Choose' })

    expect(wrapper.get('.o-select__value').text()).toBe('Choose')
    expect(wrapper.get('.o-select__value').classes()).toContain('o-select__value--placeholder')

    await wrapper.setProps({ modelValue: 3 })
    expect(wrapper.get('.o-select__value').text()).toBe('Gamma')

    await wrapper.setProps({ modelValue: undefined })
    expect(wrapper.get('.o-select__value').text()).toBe('Choose')
  })

  it('opens and wraps with arrows while skipping disabled options', async () => {
    const wrapper = mountSelect()
    const trigger = wrapper.get('[role="combobox"]')
    ;(trigger.element as HTMLButtonElement).focus()

    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toMatch(/-option-0$/u)
    expect(document.activeElement).toBe(trigger.element)

    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toMatch(/-option-2$/u)

    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toMatch(/-option-0$/u)

    await trigger.trigger('keydown', { key: 'ArrowUp' })
    expect(trigger.attributes('aria-activedescendant')).toMatch(/-option-2$/u)
    expect(document.activeElement).toBe(trigger.element)
    expect(wrapper.emitted('update:open')).toEqual([[true]])
  })

  it('opens upward at the last option and supports Home and End', async () => {
    const wrapper = mountSelect()
    const trigger = wrapper.get('[role="combobox"]')

    await trigger.trigger('keydown', { key: 'ArrowUp' })
    expect(trigger.attributes('aria-activedescendant')).toMatch(/-option-2$/u)

    await trigger.trigger('keydown', { key: 'Home' })
    expect(trigger.attributes('aria-activedescendant')).toMatch(/-option-0$/u)

    await trigger.trigger('keydown', { key: 'End' })
    expect(trigger.attributes('aria-activedescendant')).toMatch(/-option-2$/u)
  })

  it('keeps the keyboard-active option visible without moving DOM focus', async () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'scrollIntoView',
    )
    const scrollIntoView = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })

    try {
      const wrapper = mountSelect()
      const trigger = wrapper.get('[role="combobox"]')
      ;(trigger.element as HTMLButtonElement).focus()

      await trigger.trigger('keydown', { key: 'ArrowDown' })
      await nextTick()

      expect(scrollIntoView).toHaveBeenCalledTimes(1)
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
      expect(document.activeElement).toBe(trigger.element)
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalDescriptor)
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
      }
    }
  })

  it.each(['Enter', ' '] as const)('selects the active option with %s', async (key) => {
    const wrapper = mountSelect()
    const trigger = wrapper.get('[role="combobox"]')
    ;(trigger.element as HTMLButtonElement).focus()

    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key })

    expect(wrapper.emitted('update:modelValue')).toEqual([['alpha']])
    expect(wrapper.emitted('change')).toEqual([['alpha', options[0]]])
    expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger.element)
  })

  it.each(['Enter', ' '] as const)(
    'opens at the selected option with %s without selecting immediately',
    async (key) => {
      const wrapper = mountSelect({ modelValue: 3 })
      const trigger = wrapper.get('[role="combobox"]')

      await trigger.trigger('keydown', { key })

      expect(trigger.attributes('aria-expanded')).toBe('true')
      expect(trigger.attributes('aria-activedescendant')).toMatch(/-option-2$/u)
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    },
  )

  it('closes with Escape and keeps Tab navigation unblocked', async () => {
    const wrapper = mountSelect()
    const trigger = wrapper.get('[role="combobox"]')
    ;(trigger.element as HTMLButtonElement).focus()

    await trigger.trigger('click')
    await trigger.trigger('keydown', { key: 'Escape' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger.element)

    await trigger.trigger('click')
    const tabEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Tab',
    })
    trigger.element.dispatchEvent(tabEvent)
    await nextTick()

    expect(tabEvent.defaultPrevented).toBe(false)
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('teleports complete listbox semantics and exposes the active descendant', async () => {
    const wrapper = mountSelect({ ariaLabel: 'Letter', modelValue: 3 })
    const trigger = wrapper.get('[role="combobox"]')

    await trigger.trigger('click')
    const listbox = getListbox()
    const renderedOptions = getOptions()

    expect(trigger.attributes('aria-label')).toBe('Letter')
    expect(trigger.attributes('aria-controls')).toBe(listbox.id)
    expect(trigger.attributes('aria-activedescendant')).toBe(renderedOptions[2]!.id)
    expect(document.body.contains(listbox)).toBe(true)
    expect(wrapper.element.contains(listbox)).toBe(false)
    expect(renderedOptions).toHaveLength(3)
    expect(renderedOptions[0]!.getAttribute('aria-selected')).toBe('false')
    expect(renderedOptions[1]!.getAttribute('aria-disabled')).toBe('true')
    expect(renderedOptions[2]!.getAttribute('aria-selected')).toBe('true')
    expect(renderedOptions[2]!.classList).toContain('is-active')
    expect(renderedOptions[2]!.classList).toContain('is-selected')
  })

  it('selects a numeric option by click and ignores disabled options', async () => {
    const wrapper = mountSelect()
    const trigger = wrapper.get('[role="combobox"]')
    ;(trigger.element as HTMLButtonElement).focus()

    await trigger.trigger('click')
    const renderedOptions = getOptions()
    await new DOMWrapper(renderedOptions[1]!).trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(trigger.attributes('aria-expanded')).toBe('true')

    await new DOMWrapper(renderedOptions[2]!).trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[3]])
    expect(wrapper.emitted('change')).toEqual([[3, options[2]]])
    expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
    expect(document.activeElement).toBe(trigger.element)
  })

  it('renders clear and trigger as sibling buttons and clears without opening', async () => {
    const wrapper = mountSelect({ clearable: true, modelValue: 'alpha' })
    const trigger = wrapper.get('[role="combobox"]')
    const clear = wrapper.get('.o-select__clear')

    expect(clear.element.tagName).toBe('BUTTON')
    expect(clear.attributes('aria-label')).toBe('Clear selection')
    expect(wrapper.classes()).toContain('is-clearable')
    expect(clear.element.parentElement).toBe(trigger.element.parentElement)
    expect(trigger.element.contains(clear.element)).toBe(false)

    await clear.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[undefined]])
    expect(wrapper.emitted('clear')).toEqual([[]])
    expect(wrapper.emitted('update:open')).toBeUndefined()
    expect(document.activeElement).toBe(trigger.element)
  })

  it('renders default and custom empty content', async () => {
    const wrapper = mountSelect({ options: Object.freeze([]) })
    await wrapper.get('[role="combobox"]').trigger('click')
    expect(getListbox().querySelector('.o-select__empty')?.textContent).toBe('No options')

    wrapper.unmount()
    const custom = mount(OSelect, {
      attachTo: document.body,
      props: { options: Object.freeze([]) },
      slots: { empty: () => 'Nothing available' },
    })
    await custom.get('[role="combobox"]').trigger('click')
    expect(getListbox().querySelector('.o-select__empty')?.textContent).toBe('Nothing available')
  })

  it('keeps empty and all-disabled lists open without fake selections or duplicate open requests', async () => {
    const allDisabled = Object.freeze<readonly OSelectOption[]>([
      Object.freeze({ value: 'disabled', label: 'Disabled', disabled: true }),
    ])

    for (const currentOptions of [Object.freeze<readonly OSelectOption[]>([]), allDisabled]) {
      const wrapper = mountSelect({ options: currentOptions })
      const trigger = wrapper.get('[role="combobox"]')

      await trigger.trigger('keydown', { key: 'ArrowDown' })
      await trigger.trigger('keydown', { key: 'Enter' })

      expect(trigger.attributes('aria-expanded')).toBe('true')
      expect(trigger.attributes('aria-activedescendant')).toBeUndefined()
      expect(wrapper.emitted('update:open')).toEqual([[true]])
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      wrapper.unmount()
    }
  })

  it('does not interact while disabled', async () => {
    const wrapper = mountSelect({ clearable: true, disabled: true, modelValue: 'alpha' })
    const trigger = wrapper.get('[role="combobox"]')

    expect(trigger.attributes('disabled')).toBeDefined()
    expect(wrapper.find('.o-select__clear').exists()).toBe(false)
    await trigger.trigger('click')
    await trigger.trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.emitted('update:open')).toBeUndefined()
    expect(document.body.querySelector('[role="listbox"]')).toBeNull()
  })

  it('hides a controlled panel while disabled and closes when disabled dynamically', async () => {
    const controlled = mountSelect({ disabled: true, open: true })
    const controlledTrigger = controlled.get('[role="combobox"]')

    expect(controlledTrigger.attributes('aria-expanded')).toBe('false')
    expect(document.body.querySelector('[role="listbox"]')).toBeNull()

    controlled.unmount()
    document.body.replaceChildren()

    const wrapper = mountSelect()
    const trigger = wrapper.get('[role="combobox"]')
    await trigger.trigger('click')
    expect(getListbox()).toBeTruthy()

    await wrapper.setProps({ disabled: true })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.body.querySelector('[role="listbox"]')).toBeNull()
    expect(wrapper.emitted('update:open')).toEqual([[true], [false]])

    await wrapper.setProps({ disabled: false })
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('keeps the active option by value when options are reordered', async () => {
    const wrapper = mountSelect()
    const trigger = wrapper.get('[role="combobox"]')
    await trigger.trigger('keydown', { key: 'ArrowUp' })

    await wrapper.setProps({ options: [options[2]!, options[0]!, options[1]!] })

    expect(trigger.attributes('aria-activedescendant')).toMatch(/-option-0$/u)
    expect(getOptions()[0]?.textContent).toContain('Gamma')
    expect(getOptions()[0]?.classList).toContain('is-active')
  })

  it('can render in place or teleport to a consumer target', async () => {
    const inline = mountSelect({ teleported: false })
    await inline.get('[role="combobox"]').trigger('click')
    expect(inline.element.contains(getListbox())).toBe(true)

    inline.unmount()
    document.body.replaceChildren()

    const target = document.createElement('div')
    document.body.append(target)
    const targeted = mountSelect({ teleportTo: target })
    await targeted.get('[role="combobox"]').trigger('click')
    expect(target.contains(getListbox())).toBe(true)
  })

  it('requests but does not mutate controlled open state', async () => {
    const wrapper = mountSelect({ open: false })
    const trigger = wrapper.get('[role="combobox"]')

    await trigger.trigger('click')
    expect(wrapper.emitted('update:open')).toEqual([[true]])
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.body.querySelector('[role="listbox"]')).toBeNull()

    await wrapper.setProps({ open: true })
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(trigger.attributes('aria-activedescendant')).toMatch(/-option-0$/u)

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
    expect(trigger.attributes('aria-expanded')).toBe('true')

    await wrapper.setProps({ open: false })
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('closes an uncontrolled panel on outside pointerdown', async () => {
    const wrapper = mountSelect()
    const trigger = wrapper.get('[role="combobox"]')

    await trigger.trigger('click')
    expect(getListbox()).toBeTruthy()

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    await nextTick()

    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
    expect(document.body.querySelector('[role="listbox"]')).toBeNull()
  })

  it('provides selected and active state to the option slot', async () => {
    const wrapper = mount(OSelect, {
      attachTo: document.body,
      props: { modelValue: 3, open: true, options },
      slots: {
        option: ({ option, selected, active }) =>
          h(
            'span',
            {
              'data-active': String(active),
              'data-option': String(option.value),
              'data-selected': String(selected),
            },
            option.label,
          ),
      },
    })
    await nextTick()

    const gamma = getListbox().querySelector<HTMLElement>('[data-option="3"]')
    const alpha = getListbox().querySelector<HTMLElement>('[data-option="alpha"]')
    expect(gamma?.dataset).toMatchObject({ active: 'true', selected: 'true' })
    expect(alpha?.dataset).toMatchObject({ active: 'false', selected: 'false' })

    await wrapper.get('[role="combobox"]').trigger('keydown', { key: 'Home' })
    expect(alpha?.dataset.active).toBe('true')
    expect(gamma?.dataset.active).toBe('false')
  })

  it('uses only vue-icons-plus/lu and renders all built-in icons', () => {
    const wrapper = mountSelect({ clearable: true, modelValue: 3 })

    expect(selectSource).toContain(
      "import { LuCheck, LuChevronDown, LuX } from 'vue-icons-plus/lu'",
    )
    expect(selectSource).not.toMatch(/from ['"]vue-icons-plus['"]/u)
    expect(wrapper.find('[data-icon="LuChevronDown"]').exists()).toBe(true)
    expect(wrapper.find('[data-icon="LuX"]').exists()).toBe(true)
    expect(wrapper.find('[data-icon="LuCheck"]').exists()).toBe(false)
  })

  it('renders the selected check icon in the teleported panel', async () => {
    const wrapper = mountSelect({ modelValue: 3 })
    await wrapper.get('[role="combobox"]').trigger('click')

    expect(getListbox().querySelector('[data-icon="LuCheck"]')).not.toBeNull()
  })

  it('forwards consumer attributes to the root without leaking them to the trigger', () => {
    const wrapper = mount(OSelect, {
      attrs: {
        class: 'consumer-select',
        'data-track': 'letter',
        id: 'letter-select',
        style: '--consumer-order: 1;',
      },
      props: { options },
    })

    expect(wrapper.attributes('id')).toBe('letter-select')
    expect(wrapper.attributes('data-track')).toBe('letter')
    expect(wrapper.classes()).toContain('consumer-select')
    expect(wrapper.attributes('style')).toContain('--consumer-order: 1')
    expect(wrapper.get('[role="combobox"]').attributes('data-track')).toBeUndefined()
  })
})

describe('OSelect styles', () => {
  it('keeps clear and indicator inside one stable trailing rail', () => {
    expect(selectStyles).toContain('--omg-select-rail-size: 28px')
    expect(selectStyles).toContain('padding-inline: var(--omg-space-3) var(--omg-select-rail-size)')
    expect(selectStyles).toContain(
      'inset-inline-end: calc((var(--omg-select-rail-size) - 24px) / 2)',
    )
    expect(selectStyles).toContain('inline-size: 24px')
    expect(selectStyles).toContain('block-size: 24px')
    expect(selectStyles).toContain('font-size: var(--omg-font-size-md)')
    expect(selectStyles).toContain('padding: 0 var(--omg-space-3)')
    expect(selectStyles).toMatch(
      /@media \(hover: none\), \(pointer: coarse\)[\s\S]*inline-size:\s*44px/u,
    )
    expect(selectStyles).toMatch(
      /@media \(hover: none\), \(pointer: coarse\)[\s\S]*\.o-select__trigger\s*\{[^}]*min-block-size:\s*44px/iu,
    )
    expect(selectStyles).toMatch(
      /@media \(hover: none\), \(pointer: coarse\)[\s\S]*\.o-select\.is-clearable \.o-select__clear\s*\{[^}]*inline-size:\s*44px;[^}]*block-size:\s*44px/iu,
    )
    expect(selectStyles).toMatch(
      /@media \(hover: none\), \(pointer: coarse\)[\s\S]*--omg-select-rail-size:\s*44px/u,
    )
    expect(selectStyles).toMatch(
      /@media \(hover: none\), \(pointer: coarse\)[\s\S]*padding-inline-end:\s*var\(--omg-select-rail-size\)/u,
    )
    expect(selectStyles).toMatch(
      /\.o-select\.is-clearable \.o-select__clear\s*\{[^}]*inset-inline-end:\s*0;/su,
    )
    expect(selectStyles).not.toContain('&::before')
  })

  it('uses the shared control scale and restrained tokenized surface', () => {
    expect(selectStyles).toContain('--omg-select-height: var(--omg-control-height-md)')
    expect(selectStyles).toContain('--omg-select-height: var(--omg-control-height-sm)')
    expect(selectStyles).toContain('--omg-select-height: var(--omg-control-height-lg)')
    expect(selectStyles).toContain('min-inline-size: 180px')
    expect(selectStyles).toContain('box-shadow: var(--omg-shadow-sm)')
    expect(selectStyles).toContain('background: var(--omg-color-neutral-soft)')
    expect(selectStyles).toContain('z-index: var(--omg-z-index-dropdown)')
    expect(selectStyles).not.toMatch(/--o-(?!mg-)/u)
    expect(selectStyles).not.toMatch(/--vp-/u)
    expect(selectStyles).not.toMatch(/#[\da-f]{3,8}\b/iu)
  })

  it('keeps the trigger boundary without outlining the floating panel', () => {
    const triggerStyles = selectStyles.slice(
      selectStyles.indexOf('  &__trigger {'),
      selectStyles.indexOf('  &__value {'),
    )
    const panelStyles = selectStyles.slice(
      selectStyles.indexOf('.o-select__panel {'),
      selectStyles.indexOf('.o-select__panel.is-virtualized'),
    )

    expect(triggerStyles).toContain('border: 1px solid var(--omg-field-border-color)')
    expect(panelStyles).not.toMatch(/^\s*border\s*:/mu)
    expect(panelStyles).toContain('background: var(--omg-color-surface)')
    expect(panelStyles).toContain('box-shadow: var(--omg-shadow-sm)')
  })

  it('has visible focus, panel motion, and a reduced-motion fallback', () => {
    const panelEnterMotion = selectStyles.slice(
      selectStyles.indexOf('.o-select-panel-enter-from'),
      selectStyles.indexOf('@media (prefers-reduced-motion: reduce)'),
    )

    expect(selectStyles).toMatch(/&__trigger[\s\S]*&:focus-visible/u)
    expect(selectStyles).toContain(
      '--omg-field-focus-shadow: 0 0 0 2px var(--omg-color-brand-soft)',
    )
    expect(selectStyles).toContain('.o-select-panel-enter-active')
    expect(selectStyles).toContain('.o-select-panel-leave-active')
    expect(selectStyles).toMatch(
      /@media \(forced-colors: active\)[\s\S]*\.o-select__clear:focus-visible[\s\S]*Highlight/u,
    )
    expect(selectStyles).toMatch(/transition:\s*transform var\(--omg-duration-fast\)/u)
    expect(panelEnterMotion).toContain('transform: scale(0.98)')
    expect(panelEnterMotion).not.toContain('translateY')
    expect(selectStyles).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*transition: none/u,
    )
  })
})
