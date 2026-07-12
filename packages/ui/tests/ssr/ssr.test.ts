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
          }),
      }),
    )

    expect(html).toContain('class="o-avatar-group')
    expect(html).toContain('aria-label="Three participants"')
    expect(html).toContain('data-avatar-group-role="overflow"')
    expect(html).toContain('+1')
  })

  test('renders OAvatarFlow without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OAvatarFlow, {
            accessibleLabel: '正在传输',
            phase: 'transferring',
            receivers,
            sender,
          }),
      }),
    )

    expect(html).toContain('role="status"')
    expect(html).toContain('正在传输')
    expect(html).toContain('data-phase="transferring"')
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
