/* eslint-disable vue/one-component-per-file -- Small colocated component doubles keep this composition test self-contained. */
import { defineComponent, h, nextTick, useAttrs } from 'vue'
import { mount } from '@vue/test-utils'
import type { ComponentMountingOptions } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { oAvatarProps } from '../../avatar'
import OAvatarDropdown from '../src/OAvatarDropdown.vue'
import { oAvatarDropdownProps } from '../src/avatar-dropdown'
import type { ODropdownItem } from '../../dropdown'

const items = Object.freeze<readonly ODropdownItem[]>([
  Object.freeze({ value: 'profile', label: 'Profile' }),
  Object.freeze({ value: 'sign-out', label: 'Sign out', tone: 'danger' }),
])

const ODropdownStub = defineComponent({
  name: 'ODropdown',
  inheritAttrs: false,
  props: {
    disabled: Boolean,
    items: Array,
    open: Boolean,
    placement: String,
    showIndicator: Boolean,
    teleported: Boolean,
    teleportTo: [String, Object],
    triggerAriaLabel: String,
  },
  emits: ['select', 'update:open'],
  setup(props, { emit, slots }) {
    const attrs = useAttrs()

    return () => {
      const menuItems = props.items as readonly ODropdownItem[] | undefined
      const firstItem = menuItems?.[0]

      return h('div', { ...attrs, class: ['dropdown-stub', attrs.class] }, [
        h(
          'button',
          {
            class: 'dropdown-trigger-stub',
            disabled: props.disabled,
            onClick: () => emit('update:open', !props.open),
            type: 'button',
          },
          slots.trigger?.({ open: Boolean(props.open) }),
        ),
        firstItem ? slots.item?.({ item: firstItem }) : slots.empty?.(),
      ])
    }
  },
})

const OAvatarStub = defineComponent({
  name: 'OAvatar',
  props: {
    alt: String,
    backgroundColor: String,
    initials: String,
    name: String,
    shape: String,
    size: String,
    src: String,
    stacked: Boolean,
    status: String,
    statusLabel: String,
    textColor: String,
  },
  emits: ['error', 'load'],
  setup(_props, { slots }) {
    return () =>
      h('span', { class: 'avatar-stub' }, slots.fallback?.({ initials: 'OM', hasError: false }))
  },
})

const mountAvatarDropdown = (
  props: Record<string, unknown> = {},
  slots: NonNullable<ComponentMountingOptions<typeof OAvatarDropdown>['slots']> = {},
) =>
  mount(OAvatarDropdown, {
    props: {
      ariaLabel: 'Open account menu',
      items,
      name: 'Yxswy',
      ...props,
    },
    slots,
    global: {
      stubs: {
        OAvatar: OAvatarStub,
        ODropdown: ODropdownStub,
      },
    },
  })

describe('OAvatarDropdown', () => {
  it('extends every Avatar prop without changing the base Avatar contract', () => {
    for (const propName of Object.keys(oAvatarProps)) {
      expect(oAvatarDropdownProps).toHaveProperty(propName)
    }

    expect(oAvatarDropdownProps.ariaLabel.required).toBe(true)
    expect(oAvatarDropdownProps.open.default).toBeUndefined()
    expect(oAvatarDropdownProps.placement.default).toBe('bottom-start')
    expect(oAvatarDropdownProps.showIndicator.default).toBe(true)
    expect(oAvatarDropdownProps.teleported.default).toBe(true)
    expect(oAvatarDropdownProps.teleportTo.default).toBe('body')
    expect(oAvatarProps).not.toHaveProperty('items')
    expect(oAvatarProps).not.toHaveProperty('open')
    expect(oAvatarProps).not.toHaveProperty('disabled')
  })

  it('forwards dropdown and avatar presentation props', () => {
    const wrapper = mountAvatarDropdown({
      backgroundColor: '#1d4ed8',
      disabled: true,
      open: true,
      placement: 'bottom-end',
      shape: 'rounded',
      showIndicator: false,
      size: 'lg',
      stacked: true,
      status: 'online',
      statusLabel: 'Online',
      textColor: '#ffffff',
      teleported: false,
      teleportTo: '#dialog-floating-root',
    })
    const dropdown = wrapper.getComponent(ODropdownStub)
    const avatar = wrapper.getComponent(OAvatarStub)

    expect(dropdown.props()).toMatchObject({
      disabled: true,
      items,
      open: true,
      placement: 'bottom-end',
      showIndicator: false,
      teleported: false,
      teleportTo: '#dialog-floating-root',
      triggerAriaLabel: 'Open account menu',
    })
    expect(avatar.props()).toMatchObject({
      backgroundColor: '#1d4ed8',
      name: 'Yxswy',
      shape: 'rounded',
      size: 'lg',
      stacked: true,
      status: 'online',
      statusLabel: 'Online',
      textColor: '#ffffff',
    })
    expect(wrapper.classes()).toContain('o-avatar-dropdown')
    expect(wrapper.classes()).toContain('o-avatar-dropdown--rounded')
  })

  it('forwards open and selection events without adding business behavior', async () => {
    const wrapper = mountAvatarDropdown()
    const dropdown = wrapper.getComponent(ODropdownStub)

    dropdown.vm.$emit('update:open', true)
    dropdown.vm.$emit('select', items[0]!.value, items[0])
    await nextTick()

    expect(wrapper.emitted('update:open')).toEqual([[true]])
    expect(wrapper.emitted('select')).toEqual([['profile', items[0]]])
  })

  it('forwards Avatar load and error events', async () => {
    const wrapper = mountAvatarDropdown()
    const avatar = wrapper.getComponent(OAvatarStub)
    const loadEvent = new Event('load')
    const errorEvent = new Event('error')

    avatar.vm.$emit('load', loadEvent)
    avatar.vm.$emit('error', errorEvent)
    await nextTick()

    expect(wrapper.emitted('load')).toEqual([[loadEvent]])
    expect(wrapper.emitted('error')).toEqual([[errorEvent]])
  })

  it('forwards fallback and item slots', () => {
    const wrapper = mountAvatarDropdown(
      {},
      {
        fallback: ({ initials }: { initials: string }) =>
          h('strong', { class: 'fallback' }, initials),
        item: ({ item }: { item: ODropdownItem }) => h('em', { class: 'item' }, item.label),
      },
    )

    expect(wrapper.get('.fallback').text()).toBe('OM')
    expect(wrapper.get('.item').text()).toBe('Profile')
  })

  it('forwards the empty slot for an empty menu', () => {
    const wrapper = mountAvatarDropdown(
      { items: Object.freeze([]) },
      { empty: () => h('span', { class: 'empty' }, 'No actions') },
    )

    expect(wrapper.get('.empty').text()).toBe('No actions')
  })
})
