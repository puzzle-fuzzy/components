import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import { describe, expect, test } from 'vitest'

import { OAvatar, OAvatarFlow, OButton, type OAvatarFlowPeer } from '../../src'

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
})
