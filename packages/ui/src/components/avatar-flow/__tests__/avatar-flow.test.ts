import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineComponent, h, useAttrs } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OAvatarFlow from '../src/OAvatarFlow.vue'
import {
  normalizeOAvatarFlowMaxVisibleReceivers,
  type OAvatarFlowPeer,
  type OAvatarFlowPhase,
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
    initials: String,
    name: String,
    shape: String,
    size: String,
    src: String,
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
      accessibleLabel: 'Sender is ready to transfer',
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
  it('renders readonly receivers without mutating the input and exposes overflow', () => {
    const before = receivers.map((receiver) => ({ ...receiver }))
    const wrapper = mountFlow({ maxVisibleReceivers: 2.9 })

    expect(receivers).toEqual(before)
    expect(wrapper.findAll('[data-avatar-flow-role="receiver"]')).toHaveLength(2)
    expect(wrapper.get('[data-avatar-flow-role="overflow"]').text()).toBe('+2')
  })

  it('clamps the visible receiver count to at least one', () => {
    const wrapper = mountFlow({ maxVisibleReceivers: 0 })

    expect(wrapper.findAll('[data-avatar-flow-role="receiver"]')).toHaveLength(1)
    expect(wrapper.get('[data-avatar-flow-role="overflow"]').text()).toBe('+3')
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

  const phaseCases = [
    ['idle', '—', 'Transfer is ready'],
    ['requesting', '…', 'Waiting for receiver approval'],
    ['transferring', '→', 'Transfer is in progress'],
    ['complete', '✓', 'Transfer completed'],
    ['error', '!', 'Transfer failed'],
  ] as const satisfies readonly (readonly [OAvatarFlowPhase, string, string])[]

  it.each(phaseCases)(
    'renders distinct %s phase semantics',
    (phase, markerText, accessibleLabel) => {
      const wrapper = mountFlow({ accessibleLabel, phase })
      const root = wrapper.get('.o-avatar-flow')
      const connector = wrapper.get('.o-avatar-flow__connector')
      const marker = wrapper.get(`[data-marker="${phase}"]`)

      expect(root.attributes('data-phase')).toBe(phase)
      expect(connector.attributes('data-phase')).toBe(phase)
      expect(marker.classes()).toContain(`o-avatar-flow__phase-marker--${phase}`)
      expect(marker.text()).toBe(markerText)
      expect(wrapper.get('.o-avatar-flow__live-status').text()).toBe(accessibleLabel)
    },
  )

  it('renders a real visually hidden polite live status', () => {
    const wrapper = mountFlow({ accessibleLabel: 'Transfer completed for four receivers' })
    const root = wrapper.get('.o-avatar-flow')
    const liveStatus = wrapper.get('.o-avatar-flow__live-status')

    expect(root.attributes('role')).toBe('status')
    expect(root.attributes('aria-live')).toBe('polite')
    expect(root.attributes('aria-atomic')).toBe('true')
    expect(root.attributes('aria-label')).toBeUndefined()
    expect(liveStatus.text()).toBe('Transfer completed for four receivers')
  })

  it('reacts to phase, label, receivers, and max-visible updates', async () => {
    const wrapper = mountFlow({ maxVisibleReceivers: 3 })

    await wrapper.setProps({
      accessibleLabel: 'Transfer failed for one receiver',
      maxVisibleReceivers: 1,
      phase: 'error',
      receivers: Object.freeze([receivers[0]!]),
    })

    expect(wrapper.get('.o-avatar-flow').attributes('data-phase')).toBe('error')
    expect(wrapper.get('[data-marker="error"]').text()).toBe('!')
    expect(wrapper.get('.o-avatar-flow__live-status').text()).toBe(
      'Transfer failed for one receiver',
    )
    expect(wrapper.findAll('[data-avatar-flow-role="receiver"]')).toHaveLength(1)
    expect(wrapper.find('[data-avatar-flow-role="overflow"]').exists()).toBe(false)
  })

  it('uses component tokens, container queries, and a static reduced-motion fallback', () => {
    expect(avatarFlowStyles).toContain('@container o-avatar-flow')
    expect(avatarFlowStyles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(avatarFlowStyles).not.toMatch(/@media\s*\([^)]*(?:max|min)-width/)
    expect(avatarFlowStyles).not.toMatch(/--o-(?!mg-)/)
    expect(avatarFlowStyles).not.toMatch(/#[\da-f]{3,8}\b/iu)
  })
})
