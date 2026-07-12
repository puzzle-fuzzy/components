import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineComponent, h, useAttrs } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OAvatarFlow from '../src/OAvatarFlow.vue'
import {
  normalizeOAvatarFlowMaxVisibleReceivers,
  oAvatarFlowProps,
  oAvatarFlowStates,
  type OAvatarFlowPeer,
  type OAvatarFlowProps,
} from '../src/avatar-flow'

const avatarFlowStyles = readFileSync(
  resolve('packages/ui/src/components/avatar-flow/style/index.less'),
  'utf8',
)

const OAvatarStub = defineComponent({
  name: 'OAvatar',
  inheritAttrs: false,
  props: {
    alt: String,
    backgroundColor: String,
    initials: String,
    name: String,
    shape: String,
    size: String,
    src: String,
    stacked: Boolean,
    textColor: String,
  },
  setup(props, { slots }) {
    const attrs = useAttrs()

    return () =>
      h(
        'span',
        {
          ...attrs,
          class: ['avatar-stub', attrs.class],
          'data-shape': props.shape,
          'data-size': props.size,
        },
        slots.fallback?.(),
      )
  },
})

const sender = Object.freeze<OAvatarFlowPeer>({
  id: 'sender',
  name: 'Sender',
  initials: 'SE',
})

const receivers = Object.freeze<readonly OAvatarFlowPeer[]>([
  Object.freeze({ id: 'receiver-a', name: 'Receiver A', initials: 'A' }),
  Object.freeze({ id: 'receiver-b', name: 'Receiver B', initials: 'B' }),
  Object.freeze({ id: 'receiver-c', name: 'Receiver C', initials: 'C' }),
  Object.freeze({ id: 'receiver-d', name: 'Receiver D', initials: 'D' }),
])

function mountFlow(overrides: Partial<OAvatarFlowProps> = {}) {
  return mount(OAvatarFlow, {
    props: {
      ariaLabel: 'Sender and receivers',
      receivers,
      sender,
      ...overrides,
    },
    global: {
      stubs: {
        OAvatar: OAvatarStub,
      },
    },
  })
}

describe('normalizeOAvatarFlowMaxVisibleReceivers', () => {
  it.each([
    [undefined, 3],
    [Number.NaN, 3],
    [Number.POSITIVE_INFINITY, 3],
    [-4, 1],
    [0, 1],
    [1.9, 1],
    [3.8, 3],
  ])('normalizes %s to %i', (value, expected) => {
    expect(normalizeOAvatarFlowMaxVisibleReceivers(value)).toBe(expected)
  })
})

describe('OAvatarFlow', () => {
  it('publishes exactly three visual states', () => {
    expect(oAvatarFlowStates).toEqual(['loading', 'connected', 'transferring'])
    expect(oAvatarFlowProps.state.default).toBe('connected')
    expect(oAvatarFlowProps.state.validator('loading')).toBe(true)
    expect(oAvatarFlowProps.state.validator('idle')).toBe(false)
    expect(oAvatarFlowProps.ariaLabel.required).toBe(true)
    expect(oAvatarFlowProps).not.toHaveProperty('phase')
    expect(oAvatarFlowProps).not.toHaveProperty('accessibleLabel')
  })

  it('renders readonly receivers through OAvatarGroup without mutating input', () => {
    const before = receivers.map((receiver) => ({ ...receiver }))
    const wrapper = mountFlow({ maxVisibleReceivers: 2.9 })

    expect(receivers).toEqual(before)
    expect(wrapper.findAll('[data-avatar-group-role="item"]')).toHaveLength(2)
    expect(wrapper.get('[data-avatar-group-role="overflow"]').text()).toBe('+2')
  })

  it('clamps the visible receiver count to at least one', () => {
    const wrapper = mountFlow({ maxVisibleReceivers: 0 })

    expect(wrapper.findAll('[data-avatar-group-role="item"]')).toHaveLength(1)
    expect(wrapper.get('[data-avatar-group-role="overflow"]').text()).toBe('+3')
  })

  it('renders only the sender when receivers are empty', () => {
    const wrapper = mountFlow({ receivers: Object.freeze([]) })

    expect(wrapper.findAll('.avatar-stub')).toHaveLength(1)
    expect(wrapper.find('[data-avatar-flow-role="sender"]').exists()).toBe(true)
    expect(wrapper.find('.o-avatar-flow__connector').exists()).toBe(false)
    expect(wrapper.find('.o-avatar-flow__receivers').exists()).toBe(false)
  })

  it('passes size and shape to sender, receivers, and overflow avatar', () => {
    const wrapper = mountFlow({
      maxVisibleReceivers: 2,
      shape: 'rounded',
      size: 'lg',
    })
    const avatars = wrapper.findAll('.avatar-stub')

    expect(avatars).toHaveLength(4)
    for (const avatar of avatars) {
      expect(avatar.attributes('data-size')).toBe('lg')
      expect(avatar.attributes('data-shape')).toBe('rounded')
    }
  })

  it('renders animated dots for loading', () => {
    const wrapper = mountFlow({ state: 'loading' })

    expect(wrapper.get('.o-avatar-flow').attributes('data-state')).toBe('loading')
    expect(wrapper.get('.o-avatar-flow__connector').attributes('data-state')).toBe('loading')
    expect(wrapper.findAll('.o-avatar-flow__dot')).toHaveLength(3)
    expect(wrapper.find('.o-avatar-flow__line').exists()).toBe(false)
    expect(wrapper.find('.o-avatar-flow__dash-line').exists()).toBe(false)
  })

  it('renders a static solid line for connected', () => {
    const wrapper = mountFlow({ state: 'connected' })

    expect(wrapper.get('.o-avatar-flow').attributes('data-state')).toBe('connected')
    expect(wrapper.find('.o-avatar-flow__line').exists()).toBe(true)
    expect(wrapper.find('.o-avatar-flow__dots').exists()).toBe(false)
    expect(wrapper.find('.o-avatar-flow__dash-line').exists()).toBe(false)
  })

  it('renders a moving dashed line for transferring', () => {
    const wrapper = mountFlow({ state: 'transferring' })

    expect(wrapper.get('.o-avatar-flow').attributes('data-state')).toBe('transferring')
    expect(wrapper.find('.o-avatar-flow__dash-line').exists()).toBe(true)
    expect(wrapper.find('.o-avatar-flow__line').exists()).toBe(false)
    expect(wrapper.find('.o-avatar-flow__dots').exists()).toBe(false)
  })

  it('uses image semantics without a live region', () => {
    const wrapper = mountFlow({ ariaLabel: 'Loading avatar connection' })
    const root = wrapper.get('.o-avatar-flow')

    expect(root.attributes('role')).toBe('img')
    expect(root.attributes('aria-label')).toBe('Loading avatar connection')
    expect(root.attributes('aria-live')).toBeUndefined()
    expect(root.attributes('aria-atomic')).toBeUndefined()
    expect(wrapper.find('.o-avatar-flow__live-status').exists()).toBe(false)
  })

  it('reacts to state, label, receivers, and max-visible updates', async () => {
    const wrapper = mountFlow({ maxVisibleReceivers: 3, state: 'transferring' })

    await wrapper.setProps({
      ariaLabel: 'One connected receiver',
      maxVisibleReceivers: 1,
      state: 'connected',
      receivers: Object.freeze([receivers[0]!]),
    })

    expect(wrapper.get('.o-avatar-flow').attributes('data-state')).toBe('connected')
    expect(wrapper.get('.o-avatar-flow').attributes('aria-label')).toBe('One connected receiver')
    expect(wrapper.find('.o-avatar-flow__line').exists()).toBe(true)
    expect(wrapper.find('.o-avatar-flow__dots').exists()).toBe(false)
    expect(wrapper.find('.o-avatar-flow__dash-line').exists()).toBe(false)
    expect(wrapper.findAll('[data-avatar-group-role="item"]')).toHaveLength(1)
    expect(wrapper.find('[data-avatar-group-role="overflow"]').exists()).toBe(false)
  })

  it('uses component tokens, state animations, and reduced-motion fallbacks', () => {
    const legacyMarkerClass = ['o-avatar-flow', '__phase-marker'].join('')
    const legacyParticleClass = ['o-avatar-flow', '__particle'].join('')

    expect(avatarFlowStyles).toContain('@container o-avatar-flow')
    expect(avatarFlowStyles).not.toMatch(/@media\s*\([^)]*(?:max|min)-width/)
    expect(avatarFlowStyles).not.toContain(legacyMarkerClass)
    expect(avatarFlowStyles).not.toContain(legacyParticleClass)
    expect(avatarFlowStyles).toContain('@keyframes o-avatar-flow-loading')
    expect(avatarFlowStyles).toContain('@keyframes o-avatar-flow-transfer')
    expect(avatarFlowStyles).toContain('animation: o-avatar-flow-loading')
    expect(avatarFlowStyles).toContain('animation: o-avatar-flow-transfer')
    expect(avatarFlowStyles).toContain('repeating-linear-gradient')
    expect(avatarFlowStyles).not.toContain('--omg-avatar-flow-dot-lift')
    expect(avatarFlowStyles).not.toContain('translateY')
    expect(avatarFlowStyles).toContain('transform: scale(0.7)')
    expect(avatarFlowStyles).toContain('transform: scale(1)')
    expect(avatarFlowStyles).toMatch(
      /\.o-avatar-flow__dot:nth-child\(2\)[\s\S]*animation-delay:\s*-600ms/u,
    )
    expect(avatarFlowStyles).toMatch(
      /\.o-avatar-flow__dot:nth-child\(3\)[\s\S]*animation-delay:\s*-300ms/u,
    )
    expect(avatarFlowStyles).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*animation:\s*none/u,
    )
    expect(avatarFlowStyles).not.toMatch(/--o-(?!mg-)/)
    expect(avatarFlowStyles).not.toMatch(/#[\da-f]{3,8}\b/iu)
  })
})
