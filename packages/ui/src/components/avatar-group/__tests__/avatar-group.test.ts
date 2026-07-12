import { mount } from '@vue/test-utils'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { OAvatar } from '../../avatar'
import { OAvatarGroup, normalizeOAvatarGroupMax, normalizeOAvatarGroupOverlap } from '../index'
import type { OAvatarGroupItem, OAvatarGroupOverlap, OAvatarGroupProps } from '../index'

const items = Object.freeze<readonly OAvatarGroupItem[]>([
  Object.freeze({
    id: 'one',
    name: 'One',
    backgroundColor: '#111111',
    textColor: '#ffffff',
  }),
  Object.freeze({ id: 'two', name: 'Two' }),
  Object.freeze({ id: 'three', name: 'Three' }),
])

describe('normalizeOAvatarGroupMax', () => {
  it.each([
    [undefined, 3, 3],
    [Number.NaN, 3, 3],
    [Number.POSITIVE_INFINITY, 3, 3],
    [-4, 3, 1],
    [0, 3, 1],
    [1.9, 3, 1],
    [8, 3, 8],
  ])('normalizes %s with %i items to %i', (value, itemCount, expected) => {
    expect(normalizeOAvatarGroupMax(value, itemCount)).toBe(expected)
  })
})

describe('normalizeOAvatarGroupOverlap', () => {
  it.each([
    [undefined, undefined],
    [12, '12px'],
    [2.5, '2.5px'],
    [-4, '0px'],
    [Number.NaN, undefined],
    [Number.POSITIVE_INFINITY, undefined],
    [Number.NEGATIVE_INFINITY, undefined],
    ['', undefined],
    ['   ', undefined],
    ['0', '0'],
    ['0.75rem', '0.75rem'],
    ['  12px  ', '12px'],
  ] as const)('normalizes overlap %s to %s', (value, expected) => {
    expect(normalizeOAvatarGroupOverlap(value)).toBe(expected)
  })
})

describe('OAvatarGroup', () => {
  it('publishes a readonly typed item contract', () => {
    expectTypeOf<OAvatarGroupProps['items']>().toEqualTypeOf<readonly OAvatarGroupItem[]>()
    expectTypeOf<OAvatarGroupProps['overlap']>().toEqualTypeOf<OAvatarGroupOverlap | undefined>()
  })

  it('applies numeric and string overlap through a local CSS variable', async () => {
    const wrapper = mount(OAvatarGroup, {
      attrs: { style: { color: 'red' } },
      props: { items, overlap: 12 },
    })
    const root = wrapper.element as HTMLElement

    expect(root.style.getPropertyValue('--omg-avatar-group-overlap')).toBe('12px')
    expect(root.style.color).toBe('red')

    await wrapper.setProps({ overlap: '0.75rem' })

    expect(root.style.getPropertyValue('--omg-avatar-group-overlap')).toBe('0.75rem')
    expect(root.style.color).toBe('red')
  })

  it('does not emit an inline override when overlap is absent or invalid', () => {
    expect(mount(OAvatarGroup, { props: { items } }).attributes('style')).toBeUndefined()
    expect(
      mount(OAvatarGroup, {
        props: { items, overlap: Number.POSITIVE_INFINITY },
      }).attributes('style'),
    ).toBeUndefined()
  })

  it('keeps the same overlap variable in forward and reverse stacking directions', async () => {
    const wrapper = mount(OAvatarGroup, { props: { items, overlap: 10 } })
    const root = wrapper.element as HTMLElement

    expect(root.style.getPropertyValue('--omg-avatar-group-overlap')).toBe('10px')

    await wrapper.setProps({ reverse: true })

    expect(wrapper.classes()).toContain('o-avatar-group--reverse')
    expect(root.style.getPropertyValue('--omg-avatar-group-overlap')).toBe('10px')
  })

  it('renders typed items as stacked avatars and forwards presentation props', () => {
    const wrapper = mount(OAvatarGroup, {
      props: { items, shape: 'rounded', size: 'sm' },
    })
    const avatars = wrapper.findAllComponents(OAvatar)

    expect(avatars).toHaveLength(3)
    expect(avatars[0]?.props()).toMatchObject({
      backgroundColor: '#111111',
      name: 'One',
      shape: 'rounded',
      size: 'sm',
      stacked: true,
      textColor: '#ffffff',
    })
    expect(avatars[0]?.attributes('style')).toEqual(
      expect.stringContaining('--omg-avatar-background: #111111'),
    )
    expect(avatars[0]?.attributes('style')).toEqual(expect.stringContaining('z-index: 1'))
    expect(avatars.map((avatar) => avatar.props('name'))).toEqual(['One', 'Two', 'Three'])
  })

  it('appends a decorative overflow avatar after max visible items', () => {
    const wrapper = mount(OAvatarGroup, {
      props: { ariaLabel: '3 participants', items, max: 2 },
    })

    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-label')).toBe('3 participants')
    expect(wrapper.findAll('[data-avatar-group-role="item"]')).toHaveLength(2)
    expect(wrapper.get('[data-avatar-group-role="overflow"]').text()).toBe('+1')
    expect(wrapper.findAllComponents(OAvatar).at(-1)?.props('alt')).toBe('')
  })

  it('keeps DOM order stable while reversing only visual stacking direction', () => {
    const wrapper = mount(OAvatarGroup, {
      props: { items, max: 2, reverse: true },
    })

    expect(wrapper.classes()).toContain('o-avatar-group--reverse')
    expect(
      wrapper
        .findAllComponents(OAvatar)
        .filter((avatar) => avatar.attributes('data-avatar-group-role') === 'item')
        .map((avatar) => avatar.props('name')),
    ).toEqual(['One', 'Two'])
  })

  it('does not mutate a frozen items collection', () => {
    const before = items.map((item) => ({ ...item }))

    mount(OAvatarGroup, { props: { items, max: 2 } })

    expect(items).toEqual(before)
  })

  it('treats an unnamed image as decorative instead of omitting alt', () => {
    const wrapper = mount(OAvatarGroup, {
      props: {
        items: [{ id: 'decorative', src: '/decorative.png' }],
      },
    })

    expect(wrapper.getComponent(OAvatar).props('alt')).toBe('')
  })
})
