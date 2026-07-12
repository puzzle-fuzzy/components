import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, markRaw, nextTick, type VNodeChild } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

const floatingMocks = vi.hoisted(() => ({
  autoUpdate: vi.fn((_reference: Element, _floating: HTMLElement, update: () => void) => {
    update()
    return vi.fn()
  }),
  computePosition: vi.fn(async () => ({ x: 12, y: 24, placement: 'bottom-start' })),
  flip: vi.fn(() => ({ name: 'flip' })),
  offset: vi.fn(() => ({ name: 'offset' })),
  shift: vi.fn(() => ({ name: 'shift' })),
  size: vi.fn(() => ({ name: 'size' })),
}))

vi.mock('@floating-ui/dom', () => floatingMocks)

import {
  ODropdown,
  oDropdownPlacements,
  oDropdownProps,
  type ODropdownEmits,
  type ODropdownItem,
  type ODropdownProps,
  type ODropdownSlots,
} from '../index'

const TestIcon = markRaw(
  defineComponent({
    name: 'TestIcon',
    setup: () => () => h('span', { 'data-test': 'item-icon' }),
  }),
)

const componentSource = readFileSync(
  resolve('packages/ui/src/components/dropdown/src/ODropdown.vue'),
  'utf8',
)
const componentStyles = readFileSync(
  resolve('packages/ui/src/components/dropdown/style/index.less'),
  'utf8',
)

const items = [
  { value: 'profile', label: 'Profile', icon: TestIcon },
  { value: 'billing', label: 'Billing', disabled: true },
  {
    value: 'sign-out',
    label: 'Sign out',
    tone: 'danger',
    dividerBefore: true,
  },
] as const satisfies readonly ODropdownItem[]

interface MountDropdownOptions {
  readonly props?: Partial<ODropdownProps>
  readonly attrs?: Record<string, unknown>
  readonly slots?: {
    readonly trigger?: string | ((props: { open: boolean }) => VNodeChild)
    readonly item?: string | ((props: { item: ODropdownItem }) => VNodeChild)
    readonly empty?: string | (() => VNodeChild)
  }
}

const mountedWrappers: VueWrapper[] = []

const mountDropdown = (options: MountDropdownOptions = {}): VueWrapper => {
  const wrapper = mount(ODropdown, {
    attachTo: document.body,
    props: { items, ...options.props },
    slots: { trigger: 'Actions', ...options.slots },
    ...(options.attrs ? { attrs: options.attrs } : {}),
  })
  mountedWrappers.push(wrapper)
  return wrapper
}

const trigger = (wrapper: VueWrapper): HTMLButtonElement =>
  wrapper.get<HTMLButtonElement>('.o-dropdown__trigger').element

const menu = (): HTMLElement | null =>
  document.body.querySelector<HTMLElement>('.o-dropdown__panel')

const menuItems = (): HTMLButtonElement[] =>
  Array.from(document.body.querySelectorAll<HTMLButtonElement>('.o-dropdown__item'))

const menuItem = (index: number): HTMLButtonElement => {
  const item = menuItems()[index]
  if (!item) throw new Error(`Missing menu item at index ${index}`)
  return item
}

const press = async (element: Element, key: string): Promise<KeyboardEvent> => {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key })
  element.dispatchEvent(event)
  await nextTick()
  return event
}

const clickTrigger = async (wrapper: VueWrapper): Promise<void> => {
  await wrapper.get('.o-dropdown__trigger').trigger('click')
  await nextTick()
}

afterEach(() => {
  for (const wrapper of mountedWrappers.splice(0)) wrapper.unmount()
  document.body.replaceChildren()
  vi.clearAllMocks()
})

describe('ODropdown', () => {
  it('keeps the public types aligned with the runtime props', () => {
    const publicProps: ODropdownProps = {
      items,
      open: true,
      disabled: false,
      placement: 'bottom-end',
      teleported: false,
      teleportTo: 'body',
      triggerAriaLabel: 'Account actions',
      showIndicator: false,
    }
    const publicSlots: ODropdownSlots = {
      trigger: ({ open }) => (open ? 'Close' : 'Open'),
      item: ({ item }) => item.label,
      empty: () => 'Nothing here',
    }
    const publicEmits: ODropdownEmits = {
      'update:open': [true],
      select: ['profile', items[0]],
    }

    expect(oDropdownProps.placement.default).toBe('bottom-start')
    expect(oDropdownPlacements).toEqual(['bottom-start', 'bottom-end'])
    expect(oDropdownProps.placement.validator('bottom-end')).toBe(true)
    expect(oDropdownProps.placement.validator('top-start')).toBe(false)
    expect(oDropdownProps.showIndicator.default).toBe(true)
    expect(oDropdownProps.teleported.default).toBe(true)
    expect(oDropdownProps.teleportTo.default).toBe('body')
    expect(publicProps.placement).toBe('bottom-end')
    expect(publicSlots.trigger?.({ open: false })).toBe('Open')
    expect(publicEmits.select).toEqual(['profile', items[0]])
  })

  it('renders a native menu button and teleports the menu', async () => {
    const wrapper = mountDropdown({ attrs: { id: 'account-menu' } })
    const button = wrapper.get('.o-dropdown__trigger')

    expect(wrapper.attributes('id')).toBe('account-menu')
    expect(button.attributes()).toMatchObject({
      type: 'button',
      'aria-haspopup': 'menu',
      'aria-expanded': 'false',
    })
    expect(button.attributes('aria-controls')).toBeUndefined()
    expect(menu()).toBeNull()

    await clickTrigger(wrapper)

    expect(wrapper.attributes('data-open')).toBe('true')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(button.attributes('aria-controls')).toBe(menu()?.id)
    expect(menu()?.getAttribute('role')).toBe('menu')
    expect(menu()?.getAttribute('aria-labelledby')).toBe(button.attributes('id'))
    expect(menu()?.closest('body')).toBe(document.body)
    expect(menuItems()).toHaveLength(3)
    expect(menuItems().every((item) => item.getAttribute('role') === 'menuitem')).toBe(true)
    expect(document.activeElement).toBe(menuItem(0))
  })

  it('can render in place or teleport to a consumer target', async () => {
    const inline = mountDropdown({ props: { teleported: false } })
    await clickTrigger(inline)
    expect(inline.element.contains(menu())).toBe(true)

    inline.unmount()
    document.body.replaceChildren()

    const target = document.createElement('div')
    target.id = 'dialog-floating-root'
    document.body.append(target)
    const targeted = mountDropdown({ props: { teleportTo: target } })
    await clickTrigger(targeted)

    expect(target.contains(menu())).toBe(true)
  })

  it('opens from ArrowDown and cycles through enabled items', async () => {
    const wrapper = mountDropdown()
    const event = await press(trigger(wrapper), 'ArrowDown')

    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(menuItem(0))

    await press(menuItem(0), 'ArrowDown')
    expect(document.activeElement).toBe(menuItem(2))

    await press(menuItem(2), 'ArrowDown')
    expect(document.activeElement).toBe(menuItem(0))

    await press(menuItem(0), 'ArrowUp')
    expect(document.activeElement).toBe(menuItem(2))
  })

  it('opens from ArrowUp on the last enabled item', async () => {
    const wrapper = mountDropdown()

    await press(trigger(wrapper), 'ArrowUp')

    expect(document.activeElement).toBe(menuItem(2))
  })

  it('supports Home and End navigation without focusing disabled items', async () => {
    const wrapper = mountDropdown()
    await press(trigger(wrapper), 'ArrowDown')

    await press(menuItem(0), 'End')
    expect(document.activeElement).toBe(menuItem(2))

    await press(menuItem(2), 'Home')
    expect(document.activeElement).toBe(menuItem(0))
  })

  it.each([
    { key: 'Enter', value: 'profile' },
    { key: ' ', value: 'sign-out' },
  ])('selects the active item with $key and restores trigger focus', async ({ key, value }) => {
    const wrapper = mountDropdown()
    await press(trigger(wrapper), key === 'Enter' ? 'ArrowDown' : 'ArrowUp')
    const activeItem = document.activeElement as HTMLButtonElement
    const event = await press(activeItem, key)

    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.emitted('select')?.[0]).toEqual([value, expect.objectContaining({ value })])
    expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(trigger(wrapper))
  })

  it('closes with Escape and restores trigger focus', async () => {
    const wrapper = mountDropdown()
    await press(trigger(wrapper), 'ArrowDown')
    const event = await press(menuItem(0), 'Escape')

    expect(event.defaultPrevented).toBe(true)
    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(trigger(wrapper))
  })

  it.each([
    { key: 'Escape', prevented: true },
    { key: 'Tab', prevented: false },
  ])('closes with $key while focus remains on the open trigger', async ({ key, prevented }) => {
    const wrapper = mountDropdown()
    await clickTrigger(wrapper)
    trigger(wrapper).focus()

    const event = await press(trigger(wrapper), key)

    expect(event.defaultPrevented).toBe(prevented)
    expect(menu()).toBeNull()
  })

  it('leaves Escape and Tab untouched while the trigger menu is closed', async () => {
    const wrapper = mountDropdown()

    const escapeEvent = await press(trigger(wrapper), 'Escape')
    const tabEvent = await press(trigger(wrapper), 'Tab')

    expect(escapeEvent.defaultPrevented).toBe(false)
    expect(tabEvent.defaultPrevented).toBe(false)
    expect(wrapper.emitted('update:open')).toBeUndefined()
  })

  it('closes on Tab without preventing native focus movement or restoring focus', async () => {
    const wrapper = mountDropdown()
    await press(trigger(wrapper), 'ArrowDown')
    const event = await press(menuItem(0), 'Tab')

    expect(event.defaultPrevented).toBe(false)
    expect(menu()).toBeNull()
    // The component synchronously returns focus to the trigger so the browser's
    // unprevented Tab default continues from the trigger's document position.
    expect(document.activeElement).toBe(trigger(wrapper))
  })

  it('closes on an outside pointerdown without restoring focus', async () => {
    const outside = document.createElement('button')
    document.body.append(outside)
    const wrapper = mountDropdown()
    await press(trigger(wrapper), 'ArrowDown')
    outside.focus()

    outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    await nextTick()

    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(outside)
  })

  it('keeps pointerdown inside the trigger or menu open', async () => {
    const wrapper = mountDropdown()
    await clickTrigger(wrapper)

    trigger(wrapper).dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    menuItems()[0]?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    await nextTick()

    expect(menu()).not.toBeNull()
  })

  it('ignores disabled triggers and disabled item selection', async () => {
    const disabledWrapper = mountDropdown({ props: { items, disabled: true } })
    const disabledTrigger = trigger(disabledWrapper)

    expect(disabledTrigger.disabled).toBe(true)
    await press(disabledTrigger, 'ArrowDown')
    expect(menu()).toBeNull()

    disabledWrapper.unmount()
    document.body.replaceChildren()

    const wrapper = mountDropdown()
    await clickTrigger(wrapper)
    const disabledItem = menuItems()[1]
    expect(disabledItem?.disabled).toBe(true)
    disabledItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(wrapper.emitted('select')).toBeUndefined()
    expect(menu()).not.toBeNull()
  })

  it('hides a controlled panel while disabled and closes when disabled dynamically', async () => {
    const controlled = mountDropdown({ props: { disabled: true, items, open: true } })

    expect(trigger(controlled).getAttribute('aria-expanded')).toBe('false')
    expect(menu()).toBeNull()
    expect(controlled.emitted('select')).toBeUndefined()

    controlled.unmount()
    document.body.replaceChildren()

    const wrapper = mountDropdown()
    await clickTrigger(wrapper)
    expect(menu()).not.toBeNull()

    await wrapper.setProps({ disabled: true })
    expect(menu()).toBeNull()
    expect(wrapper.emitted('update:open')).toEqual([[true], [false]])

    await wrapper.setProps({ disabled: false })
    expect(menu()).toBeNull()
  })

  it('keeps the active item by value when items are reordered', async () => {
    const wrapper = mountDropdown()
    await press(trigger(wrapper), 'ArrowUp')
    expect(document.activeElement).toBe(menuItem(2))

    await wrapper.setProps({ items: [items[2], items[0], items[1]] })
    await nextTick()

    expect(menuItem(0).textContent).toContain('Sign out')
    expect(menuItem(0).tabIndex).toBe(0)
    expect(document.activeElement).toBe(menuItem(0))
  })

  it('falls back to the first enabled item when the active item is removed', async () => {
    const wrapper = mountDropdown()
    await press(trigger(wrapper), 'ArrowUp')

    await wrapper.setProps({ items: [items[0], items[1]] })
    await nextTick()

    expect(menuItems()).toHaveLength(2)
    expect(menuItem(0).textContent).toContain('Profile')
    expect(menuItem(0).tabIndex).toBe(0)
    expect(document.activeElement).toBe(menuItem(0))
  })

  it('falls back when the active item becomes disabled', async () => {
    const wrapper = mountDropdown()
    await press(trigger(wrapper), 'ArrowDown')

    await wrapper.setProps({
      items: [{ ...items[0], disabled: true }, items[1], items[2]],
    })
    await nextTick()

    expect(menuItem(0).disabled).toBe(true)
    expect(menuItem(2).textContent).toContain('Sign out')
    expect(menuItem(2).tabIndex).toBe(0)
    expect(document.activeElement).toBe(menuItem(2))
  })

  it.each([
    {
      label: 'all items are removed',
      nextItems: Object.freeze<readonly ODropdownItem[]>([]),
    },
    {
      label: 'all items become disabled',
      nextItems: items.map((item) => ({ ...item, disabled: true })),
    },
  ])('returns focus to the trigger when $label', async ({ nextItems }) => {
    const wrapper = mountDropdown()
    await press(trigger(wrapper), 'ArrowDown')

    await wrapper.setProps({ items: nextItems })
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(trigger(wrapper))
    })

    expect(menu()).not.toBeNull()
    expect(menuItems().every((item) => item.tabIndex === -1)).toBe(true)
    const escape = await press(trigger(wrapper), 'Escape')
    expect(escape.defaultPrevented).toBe(true)
    expect(menu()).toBeNull()
  })

  it('renders danger, divider, icon, and disabled presentation', async () => {
    const wrapper = mountDropdown()
    await clickTrigger(wrapper)
    const renderedItems = menuItems()

    expect(renderedItems[0]?.querySelector('[data-test="item-icon"]')).not.toBeNull()
    expect(renderedItems[1]?.classList.contains('o-dropdown__item--default')).toBe(true)
    expect(renderedItems[2]?.classList).toContain('o-dropdown__item--danger')
    expect(renderedItems[2]?.classList).toContain('o-dropdown__item--divided')
  })

  it('renders trigger, item, and empty slots with typed slot props', async () => {
    const wrapper = mountDropdown({
      slots: {
        trigger: ({ open }: { open: boolean }) =>
          h('span', { 'data-test': 'trigger-state' }, String(open)),
        item: ({ item }: { item: ODropdownItem }) =>
          h('span', { 'data-value': item.value }, `Custom ${item.label}`),
      },
    })

    expect(wrapper.get('[data-test="trigger-state"]').text()).toBe('false')
    await clickTrigger(wrapper)
    expect(wrapper.get('[data-test="trigger-state"]').text()).toBe('true')
    expect(menuItems()[0]?.textContent).toContain('Custom Profile')

    wrapper.unmount()
    document.body.replaceChildren()

    const emptyWrapper = mountDropdown({
      props: { items: [] },
      slots: { empty: '<span data-test="empty-menu">No actions</span>' },
    })
    await clickTrigger(emptyWrapper)

    expect(document.body.querySelector('[data-test="empty-menu"]')?.textContent).toBe('No actions')
    expect(document.body.querySelectorAll('[role="menuitem"]')).toHaveLength(0)
  })

  it('opens an empty menu from the keyboard without selecting or moving focus', async () => {
    const wrapper = mountDropdown({ props: { items: [] } })
    trigger(wrapper).focus()

    await press(trigger(wrapper), 'ArrowDown')
    const enterEvent = await press(menu() as HTMLElement, 'Enter')

    expect(menu()).not.toBeNull()
    expect(document.activeElement).toBe(trigger(wrapper))
    expect(enterEvent.defaultPrevented).toBe(true)
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('supports indicator visibility and an explicit trigger accessible name', () => {
    const wrapper = mountDropdown({
      props: { items, showIndicator: false, triggerAriaLabel: 'Account actions' },
    })

    expect(wrapper.get('.o-dropdown__trigger').attributes('aria-label')).toBe('Account actions')
    expect(wrapper.find('.o-dropdown__indicator').exists()).toBe(false)
  })

  it('uses the standardized Lucide icon for its default indicator', () => {
    const wrapper = mountDropdown()

    expect(wrapper.find('.o-dropdown__indicator').exists()).toBe(true)
    expect(wrapper.get('.o-dropdown__indicator').attributes('aria-hidden')).toBe('true')
    expect(componentSource).toContain("from 'vue-icons-plus/lu'")
  })

  it('supports uncontrolled trigger toggling', async () => {
    const wrapper = mountDropdown()

    await clickTrigger(wrapper)
    expect(menu()).not.toBeNull()
    await clickTrigger(wrapper)

    expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
    expect(menu()).toBeNull()
  })

  it('emits without mutating controlled open state', async () => {
    const wrapper = mountDropdown({ props: { items, open: true } })

    expect(menu()).not.toBeNull()
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(menuItem(0))
    })
    await clickTrigger(wrapper)

    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(menu()).not.toBeNull()

    await wrapper.setProps({ open: false })
    await nextTick()
    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(trigger(wrapper))
  })

  it('does not steal focus when controlled open closes after focus already moved outside', async () => {
    const outside = document.createElement('button')
    document.body.append(outside)
    const wrapper = mountDropdown({ props: { items, open: true } })
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(menuItem(0))
    })

    outside.focus()
    await wrapper.setProps({ open: false })

    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(outside)
  })

  it('focuses the first enabled item when controlled open changes externally', async () => {
    const wrapper = mountDropdown({ props: { items, open: false } })
    trigger(wrapper).focus()

    await wrapper.setProps({ open: true })
    await nextTick()

    expect(menu()).not.toBeNull()
    expect(menuItem(0).tabIndex).toBe(0)
    expect(document.activeElement).toBe(menuItem(0))
    expect(wrapper.emitted('update:open')).toBeUndefined()
  })

  it('keeps menu focus state when a controlled parent rejects close', async () => {
    const wrapper = mountDropdown({ props: { items, open: true } })
    await nextTick()
    const activeItem = menuItem(0)
    activeItem.focus()

    activeItem.click()
    await nextTick()

    expect(wrapper.emitted('select')).toEqual([['profile', items[0]]])
    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(menu()).not.toBeNull()
    expect(activeItem.tabIndex).toBe(0)
    expect(document.activeElement).toBe(activeItem)
    expect(document.activeElement).not.toBe(trigger(wrapper))
  })

  it('emits the exact selected value and item from pointer selection', async () => {
    const wrapper = mountDropdown()
    await clickTrigger(wrapper)

    menuItems()[0]?.click()
    await nextTick()

    expect(wrapper.emitted('select')).toEqual([['profile', items[0]]])
    expect(document.activeElement).toBe(trigger(wrapper))
  })

  it('keeps panel and chevron motion restrained and reduced-motion safe', () => {
    expect(componentStyles).toContain('var(--omg-duration-fast)')
    expect(componentStyles).toContain('z-index: var(--omg-z-index-dropdown)')
    expect(componentStyles).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*transition: none/u,
    )
    expect(componentStyles).not.toContain('--vp-c-brand-')
  })
})
