import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import {
  DEFAULT_O_ASPECT_RATIO,
  normalizeOAspectRatio,
  OAspectRatio,
  oAspectRatioProps,
  type OAspectRatioProps,
  type OAspectRatioSlots,
} from '../index'

const aspectRatioStyles = readFileSync(
  resolve('packages/ui/src/components/aspect-ratio/style/index.less'),
  'utf8',
)

describe('OAspectRatio', () => {
  it('publishes stable defaults and public types', () => {
    const props: OAspectRatioProps = { ratio: 1 }
    const slots: OAspectRatioSlots = { default: () => h('img', { alt: 'Preview' }) }

    expect(DEFAULT_O_ASPECT_RATIO).toBe(16 / 9)
    expect(oAspectRatioProps.ratio.default).toBe(DEFAULT_O_ASPECT_RATIO)
    expect(props.ratio).toBe(1)
    expect(slots.default?.()).toBeTruthy()
  })

  it.each([
    [1, 1],
    [16 / 9, 16 / 9],
    [0, 16 / 9],
    [-1, 16 / 9],
    [Number.NaN, 16 / 9],
    [Number.POSITIVE_INFINITY, 16 / 9],
    [Number.NEGATIVE_INFINITY, 16 / 9],
  ] as const)('normalizes ratio %s to %s', (value, expected) => {
    expect(normalizeOAspectRatio(value)).toBe(expected)
  })

  it('renders a normalized custom property and its default content', () => {
    const wrapper = mount(OAspectRatio, {
      props: { ratio: 4 / 3 },
      slots: { default: '<div data-test="content">Preview</div>' },
    })

    expect(wrapper.attributes('data-slot')).toBe('aspect-ratio')
    expect(wrapper.classes()).toContain('o-aspect-ratio')
    expect(wrapper.attributes('style')).toContain('--omg-aspect-ratio: 1.3333333333333333')
    expect(wrapper.get('[data-test="content"]').text()).toBe('Preview')
  })

  it('falls back for invalid runtime values and forwards consumer attributes', () => {
    const wrapper = mount(OAspectRatio, {
      props: { ratio: Number.NaN },
      attrs: {
        id: 'media-frame',
        class: 'consumer-frame',
        'data-track': 'preview',
      },
    })

    expect(wrapper.attributes()).toMatchObject({
      id: 'media-frame',
      'data-track': 'preview',
    })
    expect(wrapper.classes()).toContain('consumer-frame')
    expect(wrapper.attributes('style')).toContain(`--omg-aspect-ratio: ${String(16 / 9)}`)
  })

  it('uses native aspect-ratio without imposing visual clipping or decoration', () => {
    expect(aspectRatioStyles).toMatch(
      /\.o-aspect-ratio\s*\{[\s\S]*?aspect-ratio:\s*var\(--omg-aspect-ratio\);/u,
    )
    expect(aspectRatioStyles).not.toMatch(/\boverflow\s*:/u)
    expect(aspectRatioStyles).not.toMatch(/\bborder(?:-radius)?\s*:/u)
    expect(aspectRatioStyles).not.toMatch(/\bbackground(?:-color)?\s*:/u)
  })
})
