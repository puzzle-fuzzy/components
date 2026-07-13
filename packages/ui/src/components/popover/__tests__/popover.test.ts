import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount, type VueWrapper } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { OButton } from '../../button'
import {
  OPopover,
  OPopoverAnchor,
  OPopoverContent,
  OPopoverTrigger,
  oPopoverAlignments,
  oPopoverContentProps,
  oPopoverPositionStrategies,
  oPopoverSides,
  oPopoverStickyBehaviors,
  type OPopoverContentEmits,
  type OPopoverContentProps,
  type OPopoverEmits,
  type OPopoverProps,
  type OPopoverVirtualElement,
} from '../index'

interface MountPopoverOptions {
  readonly rootProps?: Record<string, unknown>
  readonly contentProps?: Record<string, unknown>
  readonly ancestorAttrs?: Record<string, unknown>
  readonly onPointerDownOutside?: (event: Event) => void
  readonly withAnchor?: boolean
}

const settle = async (): Promise<void> => {
  await nextTick()
  await new Promise<void>((resolvePromise) => setTimeout(resolvePromise, 0))
  await nextTick()
  await nextTick()
}

const mountPopover = (options: MountPopoverOptions = {}): VueWrapper =>
  mount(
    {
      inheritAttrs: false,
      setup() {
        return () => {
          const contentProps: Record<string, unknown> = {
            teleported: false,
            ...options.contentProps,
          }
          if (options.onPointerDownOutside) {
            contentProps.onPointerDownOutside = options.onPointerDownOutside
          }

          return h('div', options.ancestorAttrs, [
            h(OPopover, options.rootProps, {
              default: () => [
                h(
                  OPopoverTrigger,
                  { asChild: true },
                  {
                    default: () => h(OButton, { 'aria-label': '打开详情' }, () => '打开'),
                  },
                ),
                options.withAnchor
                  ? h(
                      OPopoverAnchor,
                      { asChild: true },
                      { default: () => h('span', { 'data-test': 'anchor' }, '锚点') },
                    )
                  : null,
                h(OPopoverContent, contentProps, {
                  default: () => [
                    h('label', { for: 'popover-name' }, '名称'),
                    h('input', { id: 'popover-name' }),
                  ],
                }),
              ],
            }),
          ])
        }
      },
    },
    { attachTo: document.body },
  )

afterEach(() => {
  vi.restoreAllMocks()
})

describe('OPopover', () => {
  it('keeps the runtime vocabulary and OMG-owned public types aligned', () => {
    const rootProps: OPopoverProps = { defaultOpen: true, modal: true }
    const contentProps: OPopoverContentProps = {
      side: 'right',
      align: 'end',
      sideOffset: 12,
      alignOffset: 2,
      avoidCollisions: false,
      collisionPadding: { top: 4, left: 8 },
      sticky: 'always',
      positionStrategy: 'fixed',
      teleported: false,
    }
    const virtualReference: OPopoverVirtualElement = {
      getBoundingClientRect: () => new DOMRect(0, 0, 20, 20),
    }
    const rootEmits: OPopoverEmits = { 'update:open': [true] }
    const contentEmits: OPopoverContentEmits = {
      escapeKeyDown: [new KeyboardEvent('keydown')],
      pointerDownOutside: [
        new CustomEvent('outside', {
          detail: { originalEvent: new PointerEvent('pointerdown') },
        }),
      ],
      focusOutside: [
        new CustomEvent('outside', {
          detail: { originalEvent: new FocusEvent('focusin') },
        }),
      ],
      interactOutside: [
        new CustomEvent('outside', {
          detail: { originalEvent: new PointerEvent('pointerdown') },
        }),
      ],
      openAutoFocus: [new Event('open')],
      closeAutoFocus: [new Event('close')],
    }

    expect(rootProps).toEqual({ defaultOpen: true, modal: true })
    expect(contentProps.positionStrategy).toBe('fixed')
    expect(virtualReference.getBoundingClientRect().width).toBe(20)
    expect(rootEmits['update:open']).toEqual([true])
    expect(contentEmits.pointerDownOutside[0].detail.originalEvent).toBeInstanceOf(PointerEvent)
    expect(oPopoverSides).toEqual(['top', 'right', 'bottom', 'left'])
    expect(oPopoverAlignments).toEqual(['start', 'center', 'end'])
    expect(oPopoverStickyBehaviors).toEqual(['partial', 'always'])
    expect(oPopoverPositionStrategies).toEqual(['absolute', 'fixed'])
    expect(oPopoverContentProps.side.default).toBe('bottom')
    expect(oPopoverContentProps.sideOffset.default).toBe(8)
    expect(oPopoverContentProps.collisionPadding.default).toBe(8)
    expect(oPopoverContentProps.teleported.default).toBe(true)
  })

  it('opens from an asChild OButton trigger and exposes stable slots', async () => {
    const wrapper = mountPopover()
    const trigger = wrapper.get('[data-slot="popover-trigger"]')

    expect(trigger.element.tagName).toBe('BUTTON')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-controls')).toMatch(/^o-popover-.+-content$/u)
    await trigger.trigger('click')
    await settle()

    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('[data-slot="popover-content"]').attributes('role')).toBe('dialog')
    expect(wrapper.find('#popover-name').exists()).toBe(true)
  })

  it('only emits an open request until a controlled parent writes the value back', async () => {
    const wrapper = mount(OPopover, {
      attachTo: document.body,
      props: { open: false },
      slots: {
        default: () => [
          h(
            OPopoverTrigger,
            { asChild: true },
            { default: () => h('button', { type: 'button' }, '打开') },
          ),
          h(OPopoverContent, { teleported: false }, { default: () => h('span', '受控内容') }),
        ],
      },
    })

    await wrapper.get('[data-slot="popover-trigger"]').trigger('click')
    await settle()
    expect(wrapper.find('[data-slot="popover-content"]').exists()).toBe(false)
    expect(wrapper.emitted('update:open')).toEqual([[true]])

    await wrapper.setProps({ open: true })
    await settle()
    expect(wrapper.find('[data-slot="popover-content"]').exists()).toBe(true)
  })

  it('closes on Escape and restores focus to the trigger', async () => {
    const wrapper = mountPopover({ rootProps: { defaultOpen: true } })
    await settle()
    const trigger = wrapper.get<HTMLButtonElement>('[data-slot="popover-trigger"]')
    wrapper.get<HTMLInputElement>('#popover-name').element.focus()

    document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))
    await settle()

    expect(wrapper.find('[data-slot="popover-content"]').exists()).toBe(false)
    expect(wrapper.findComponent(OPopover).emitted('update:open')).toEqual([[false]])
    expect(document.activeElement).toBe(trigger.element)
  })

  it('forwards cancelable outside events and respects preventDefault', async () => {
    const handleOutside = vi.fn((event: Event) => event.preventDefault())
    const wrapper = mountPopover({
      rootProps: { defaultOpen: true },
      onPointerDownOutside: handleOutside,
    })
    await settle()

    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }),
    )
    await settle()

    expect(handleOutside).toHaveBeenCalledOnce()
    expect(handleOutside.mock.calls[0]?.[0].defaultPrevented).toBe(true)
    expect(wrapper.find('[data-slot="popover-content"]').exists()).toBe(true)
  })

  it('supports a custom anchor without adding a nested interactive element', async () => {
    const wrapper = mountPopover({ rootProps: { defaultOpen: true }, withAnchor: true })
    await settle()

    expect(wrapper.get('[data-slot="popover-anchor"]').element.tagName).toBe('SPAN')
    expect(wrapper.get('[data-test="anchor"]').text()).toBe('锚点')
    expect(wrapper.find('[data-slot="popover-content"]').exists()).toBe(true)
  })

  it('teleports to body and custom targets while preserving inline mode', async () => {
    const target = document.createElement('div')
    target.id = 'popover-target'
    document.body.append(target)

    const custom = mountPopover({
      rootProps: { defaultOpen: true },
      contentProps: { teleported: true, teleportTo: target },
    })
    await settle()
    expect(target.querySelector('[data-slot="popover-content"]')).not.toBeNull()
    custom.unmount()

    const bodyPopover = mountPopover({
      rootProps: { defaultOpen: true },
      contentProps: { teleported: true },
    })
    await settle()
    expect(document.body.querySelector('[data-slot="popover-content"]')).not.toBeNull()
    bodyPopover.unmount()

    const inline = mountPopover({ rootProps: { defaultOpen: true } })
    await settle()
    expect(inline.find('[data-slot="popover-content"]').exists()).toBe(true)
  })

  it('mirrors local theme, language, direction and divergent OMG tokens after teleport', async () => {
    const wrapper = mountPopover({
      rootProps: { defaultOpen: true },
      ancestorAttrs: {
        'data-omg-theme': 'dark',
        lang: 'zh-CN',
        dir: 'rtl',
        style: '--omg-color-surface: #2d2d2d',
      },
      contentProps: { teleported: true },
    })
    await settle()
    const trigger = wrapper.get<HTMLElement>('[data-slot="popover-trigger"]')
    trigger.element.style.setProperty('--omg-color-surface', '#2d2d2d')
    await settle()
    const content = document.body.querySelector<HTMLElement>('[data-slot="popover-content"]')
    const floatingWrapper = content?.parentElement

    expect(floatingWrapper?.dataset.omgTheme).toBe('dark')
    expect(floatingWrapper?.lang).toBe('zh-CN')
    expect(content?.dir).toBe('rtl')
    expect(floatingWrapper?.style.getPropertyValue('--omg-color-surface')).toBe('#2d2d2d')
    wrapper.unmount()
  })

  it('uses modal background isolation and releases it after unmount', async () => {
    const wrapper = mountPopover({ rootProps: { defaultOpen: true, modal: true } })
    await settle()

    expect(document.body.style.pointerEvents).toBe('none')
    wrapper.unmount()
    await settle()
    expect(document.body.style.pointerEvents).toBe('')
  })

  it('keeps the floating surface opaque, borderless, width-neutral and reduced-motion safe', () => {
    const styles = readFileSync(
      resolve('packages/ui/src/components/popover/style/index.less'),
      'utf8',
    )
    const declarations = readFileSync(
      resolve('packages/ui/src/components/popover/src/popover.ts'),
      'utf8',
    )

    expect(styles).toMatch(/\.o-popover__content\s*\{[^}]*border:\s*0/su)
    expect(styles).toContain('background: var(--omg-color-surface)')
    expect(styles).toContain('box-shadow: var(--omg-shadow-message)')
    expect(styles).toContain('var(--omg-z-index-dropdown)')
    expect(styles).toMatch(/prefers-reduced-motion:\s*reduce/su)
    expect(styles).not.toContain('inline-size: 288px')
    expect(styles).not.toContain('width: 288px')
    expect(styles).not.toContain('inline-size: 18rem')
    expect(styles).not.toContain('width: 18rem')
    expect(styles).not.toContain('--vp-')
    expect(declarations).not.toContain("from 'reka-ui'")
  })
})
