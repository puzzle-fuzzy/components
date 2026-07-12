import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import { describe, expect, test } from 'vitest'

import {
  OAvatar,
  OAvatarFlow,
  OAvatarGroup,
  OButton,
  OCodeInput,
  ODivider,
  type OAvatarFlowPeer,
  type OAvatarGroupItem,
} from '../../src'

const sender: OAvatarFlowPeer = {
  id: 'sender',
  name: 'OMG UI',
}

const receivers: readonly OAvatarFlowPeer[] = [
  {
    id: 'receiver',
    name: 'Vue',
  },
]

const groupItems: readonly OAvatarGroupItem[] = [
  { id: 'one', name: 'One' },
  { id: 'two', name: 'Two' },
  { id: 'three', name: 'Three' },
]

describe('server rendering', () => {
  test('renders OButton without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(OButton, null, { default: () => 'Save' }),
      }),
    )

    expect(html).toContain('class="o-button')
    expect(html).toContain('type="button"')
  })

  test('renders OAvatar without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(OAvatar, { name: 'OMG UI' }),
      }),
    )

    expect(html).toContain('class="o-avatar')
    expect(html).toContain('OM')
  })

  test('renders OAvatarGroup without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OAvatarGroup, {
            ariaLabel: 'Three participants',
            items: groupItems,
            max: 2,
            overlap: 12,
          }),
      }),
    )

    expect(html).toContain('class="o-avatar-group')
    expect(html).toContain('aria-label="Three participants"')
    expect(html).toContain('--omg-avatar-group-overlap:12px')
    expect(html).toContain('data-avatar-group-role="overflow"')
    expect(html).toContain('+1')
  })

  test('renders OAvatarFlow without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OAvatarFlow, {
            ariaLabel: '传输视觉状态',
            receivers,
            sender,
            state: 'transferring',
          }),
      }),
    )

    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="传输视觉状态"')
    expect(html).toContain('data-state="transferring"')
    expect(html).toContain('o-avatar-flow__dash-line')
    expect(html).not.toContain('aria-live')
  })

  test('renders OCodeInput without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OCodeInput, {
            ariaLabel: 'Verification code',
            modelValue: '123',
          }),
      }),
    )

    expect(html).toContain('class="o-code-input')
    expect(html.match(/class="o-code-input__field"/gu)).toHaveLength(6)
    expect(html).toContain('autocomplete="one-time-code"')
  })

  test('renders ODivider without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(ODivider, null, { default: () => 'Details' }),
      }),
    )

    expect(html).toContain('role="separator"')
    expect(html).toContain('aria-orientation="horizontal"')
    expect(html).toContain('Details')
  })
})
