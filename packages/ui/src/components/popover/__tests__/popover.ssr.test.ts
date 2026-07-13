import { renderToString, type SSRContext } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import { describe, expect, it } from 'vitest'

import { OPopover, OPopoverContent, OPopoverTrigger } from '../index'

const renderOpenPopover = (teleported: boolean, context?: SSRContext) =>
  renderToString(
    createSSRApp({
      render: () =>
        h(OPopover, { defaultOpen: true }, () => [
          h(OPopoverTrigger, null, () => 'Open details'),
          h(OPopoverContent, { teleported }, () => 'Popover details'),
        ]),
    }),
    context,
  )

describe('OPopover SSR', () => {
  it('renders initially open inline content without DOM globals', async () => {
    const html = await renderOpenPopover(false)

    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('data-slot="popover-content"')
    expect(html).toContain('Popover details')
  })

  it('renders a safe teleported placeholder without throwing', async () => {
    const context: SSRContext = {}
    const html = await renderOpenPopover(true, context)
    const teleportedHtml = Object.values(context.teleports ?? {}).join('')

    expect(html).toContain('aria-expanded="true"')
    expect(html).not.toContain('Popover details')
    expect(teleportedHtml).not.toContain('Popover details')
  })
})
