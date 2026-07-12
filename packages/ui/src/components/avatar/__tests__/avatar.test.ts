import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { OAvatar, oAvatarShapes, oAvatarSizes, oAvatarStatuses } from '../index'
import type {
  OAvatarEmits,
  OAvatarFallbackSlotProps,
  OAvatarProps,
  OAvatarSize,
  OAvatarSlots,
} from '../index'
import { getOAvatarInitials, oAvatarProps } from '../src/avatar'

describe('getOAvatarInitials', () => {
  it('prefers explicit initials, removes whitespace, uppercases and limits to three graphemes', () => {
    expect(getOAvatarInitials({ initials: ' a b c d ', name: 'Ignored Name' })).toBe('ABC')
  })

  it('derives initials from at most three name parts', () => {
    expect(getOAvatarInitials({ name: 'Ada King Lovelace Byron' })).toBe('AKL')
    expect(getOAvatarInitials({ name: 'éclair' })).toBe('É')
  })

  it('keeps emoji grapheme clusters intact', () => {
    expect(getOAvatarInitials({ initials: '👩🏽‍💻 👍🏽 a b' })).toBe('👩🏽‍💻👍🏽A')
    expect(getOAvatarInitials({ name: '👩🏽‍💻 Developer' })).toBe('👩🏽‍💻D')
  })

  it('falls back to Unicode code points when Intl.Segmenter is unavailable', () => {
    const segmenterDescriptor = Object.getOwnPropertyDescriptor(Intl, 'Segmenter')
    Object.defineProperty(Intl, 'Segmenter', { configurable: true, value: undefined })

    try {
      expect(getOAvatarInitials({ initials: 'a b c d' })).toBe('ABC')
    } finally {
      if (segmenterDescriptor) {
        Object.defineProperty(Intl, 'Segmenter', segmenterDescriptor)
      } else {
        Reflect.deleteProperty(Intl, 'Segmenter')
      }
    }
  })

  it('returns an empty string for blank input', () => {
    expect(getOAvatarInitials({ initials: '  ', name: '  ' })).toBe('')
    expect(getOAvatarInitials({})).toBe('')
  })
})

describe('OAvatar', () => {
  it('publishes stable O-prefixed contracts from the component entry', () => {
    expect(oAvatarSizes).toEqual(['xs', 'sm', 'md', 'lg', 'xl'])
    expect(oAvatarShapes).toEqual(['circle', 'rounded', 'square'])
    expect(oAvatarStatuses).toEqual(['online', 'away', 'busy', 'offline'])
    expectTypeOf<OAvatarProps['size']>().toEqualTypeOf<OAvatarSize | undefined>()
    expectTypeOf<OAvatarEmits['load']>().toEqualTypeOf<[event: Event]>()
    expectTypeOf<
      Parameters<NonNullable<OAvatarSlots['fallback']>>[0]
    >().toEqualTypeOf<OAvatarFallbackSlotProps>()
  })

  it('renders a semantic initials fallback with defaults and forwards attrs', () => {
    const wrapper = mount(OAvatar, {
      attrs: {
        class: 'consumer-avatar',
        id: 'profile-avatar',
        style: 'outline: 0;',
      },
      props: { name: 'Ada Lovelace' },
    })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-avatar', 'o-avatar--md', 'o-avatar--circle', 'consumer-avatar']),
    )
    expect(wrapper.attributes('id')).toBe('profile-avatar')
    expect(wrapper.attributes('style')).toContain('outline: 0')
    expect(wrapper.attributes('data-state')).toBe('ready')
    expect(wrapper.find('img').exists()).toBe(false)

    const fallback = wrapper.get('.o-avatar__fallback')
    expect(fallback.text()).toBe('AL')
    expect(fallback.attributes('role')).toBe('img')
    expect(fallback.attributes('aria-label')).toBe('Ada Lovelace')
  })

  it('uses the real image load event to finish loading and emit', async () => {
    const wrapper = mount(OAvatar, {
      props: { src: '/ada.png', alt: 'Ada Lovelace' },
    })

    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('data-state')).toBe('loading')
    expect(wrapper.find('.o-avatar__fallback').exists()).toBe(true)

    const image = wrapper.get('img')
    expect(image.attributes('src')).toBe('/ada.png')
    expect(image.attributes('alt')).toBe('Ada Lovelace')
    await image.trigger('load')

    expect(wrapper.emitted('load')).toHaveLength(1)
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
    expect(wrapper.attributes('data-state')).toBe('ready')
    expect(wrapper.get('img').classes()).toContain('o-avatar__image--loaded')
    expect(wrapper.find('.o-avatar__fallback').exists()).toBe(false)
  })

  it('falls back after the real image error event and emits', async () => {
    const wrapper = mount(OAvatar, {
      props: { src: '/missing.png', name: 'Grace Hopper' },
    })

    await wrapper.get('img').trigger('error')

    expect(wrapper.emitted('error')).toHaveLength(1)
    expect(wrapper.attributes('data-state')).toBe('error')
    expect(wrapper.classes()).toContain('is-error')
    expect(wrapper.find('img').exists()).toBe(false)

    const fallback = wrapper.get('.o-avatar__fallback')
    expect(fallback.text()).toBe('GH')
    expect(fallback.attributes('role')).toBe('img')
    expect(fallback.attributes('aria-label')).toBe('Grace Hopper')
  })

  it('resets image state when src changes after an error', async () => {
    const wrapper = mount(OAvatar, {
      props: { src: '/broken.png', name: 'Lin Chen' },
    })

    await wrapper.get('img').trigger('error')
    await wrapper.setProps({ src: '/working.png' })
    await nextTick()

    expect(wrapper.attributes('data-state')).toBe('loading')
    expect(wrapper.classes()).not.toContain('is-error')
    expect(wrapper.get('img').attributes('src')).toBe('/working.png')
    expect(wrapper.get('.o-avatar__fallback').attributes('aria-hidden')).toBe('true')

    await wrapper.get('img').trigger('load')
    expect(wrapper.attributes('data-state')).toBe('ready')
    expect(wrapper.find('.o-avatar__fallback').exists()).toBe(false)
  })

  it('applies accessible-name priority: alt, then name, then initials', () => {
    const explicitAltWrapper = mount(OAvatar, {
      props: {
        src: '/avatar.png',
        alt: 'Explicit alternative',
        name: 'Ignored Name',
        initials: 'IN',
      },
    })

    expect(explicitAltWrapper.get('img').attributes('alt')).toBe('Explicit alternative')

    const nameWrapper = mount(OAvatar, {
      props: { src: '/avatar.png', name: 'Preferred Name', initials: 'IN' },
    })
    expect(nameWrapper.get('img').attributes('alt')).toBe('Preferred Name')

    const initialsWrapper = mount(OAvatar, {
      props: { src: '/avatar.png', initials: 'in' },
    })
    expect(initialsWrapper.get('img').attributes('alt')).toBe('IN')
  })

  it('keeps an explicit empty alt decorative, including after an error', async () => {
    const wrapper = mount(OAvatar, {
      props: { src: '/decorative.png', alt: '', name: 'Not an accessible name' },
    })

    expect(wrapper.get('img').attributes('alt')).toBe('')
    await wrapper.get('img').trigger('error')

    const fallback = wrapper.get('.o-avatar__fallback')
    expect(fallback.attributes('role')).toBeUndefined()
    expect(fallback.attributes('aria-label')).toBeUndefined()
    expect(fallback.attributes('aria-hidden')).toBe('true')
  })

  it('provides deterministic state to the fallback slot', async () => {
    const wrapper = mount(OAvatar, {
      props: { src: '/broken.png', name: 'Katherine Johnson' },
      slots: {
        fallback: ({ initials, hasError }: { initials: string; hasError: boolean }) =>
          h('strong', { 'data-error': String(hasError) }, initials),
      },
    })

    expect(wrapper.get('strong').text()).toBe('KJ')
    expect(wrapper.get('strong').attributes('data-error')).toBe('false')

    await wrapper.get('img').trigger('error')
    expect(wrapper.get('strong').attributes('data-error')).toBe('true')
  })

  it('renders size, shape, status, a non-color marker and localized status text', async () => {
    const wrapper = mount(OAvatar, {
      props: {
        initials: 'PU',
        size: 'xl',
        shape: 'square',
        status: 'busy',
        statusLabel: '请勿打扰',
      },
    })

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['o-avatar--xl', 'o-avatar--square']))
    expect(wrapper.attributes('data-size')).toBe('xl')
    expect(wrapper.attributes('data-shape')).toBe('square')

    const status = wrapper.get('.o-avatar__status')
    expect(status.classes()).toContain('o-avatar__status--busy')
    expect(status.attributes('data-status')).toBe('busy')
    expect(status.get('[data-status-marker="busy"]').attributes('aria-hidden')).toBe('true')
    expect(status.get('.o-avatar__status-label').text()).toBe('请勿打扰')

    await wrapper.setProps({ size: 'sm', shape: 'rounded', status: 'online' })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['o-avatar--sm', 'o-avatar--rounded']))
    expect(wrapper.get('.o-avatar__status').attributes('data-status')).toBe('online')
  })

  it('applies local fallback colors through OMG CSS variables', () => {
    const wrapper = mount(OAvatar, {
      props: {
        backgroundColor: '#123456',
        name: 'OMG UI',
        textColor: '#ffffff',
      },
    })

    expect(wrapper.attributes('style')).toContain('--omg-avatar-background: #123456')
    expect(wrapper.attributes('style')).toContain('--omg-avatar-color: #ffffff')
  })

  it('marks an avatar as stackable without changing the default avatar', () => {
    expect(mount(OAvatar, { props: { name: 'One', stacked: true } }).classes()).toContain(
      'o-avatar--stacked',
    )
    expect(mount(OAvatar, { props: { name: 'One' } }).classes()).not.toContain('o-avatar--stacked')
  })

  it('reuses the public enum sources for runtime prop validation', () => {
    expect(oAvatarProps.size.validator('md')).toBe(true)
    expect(oAvatarProps.size.validator('huge')).toBe(false)
    expect(oAvatarProps.shape.validator('rounded')).toBe(true)
    expect(oAvatarProps.shape.validator('hexagon')).toBe(false)
    expect(oAvatarProps.status.validator('offline')).toBe(true)
    expect(oAvatarProps.status.validator('unknown')).toBe(false)
  })
})
