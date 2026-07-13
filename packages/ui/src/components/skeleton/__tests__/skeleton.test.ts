import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import {
  normalizeOSkeletonDimension,
  normalizeOSkeletonLines,
  OSkeleton,
  oSkeletonProps,
  oSkeletonVariants,
  type OSkeletonProps,
  type OSkeletonSlots,
  type OSkeletonVariant,
} from '../index'

const skeletonStyleSource = readFileSync(
  resolve('packages/ui/src/components/skeleton/style/index.less'),
  'utf8',
)

describe('OSkeleton', () => {
  it('keeps the public vocabulary, validators, and types aligned', () => {
    const variant: OSkeletonVariant = 'circle'
    const props: OSkeletonProps = {
      loading: true,
      animated: false,
      variant,
      width: 40,
      height: '2rem',
      lines: 3,
    }
    const slots: OSkeletonSlots = { default: () => h('p', 'Ready') }

    expect(oSkeletonVariants).toEqual(['text', 'rect', 'circle'])
    expect(oSkeletonProps.loading.default).toBe(true)
    expect(oSkeletonProps.animated.default).toBe(true)
    expect(oSkeletonProps.variant.default).toBe('text')
    expect(oSkeletonProps.lines.default).toBe(1)
    expect(oSkeletonProps.variant.validator(props.variant)).toBe(true)
    expect(oSkeletonProps.variant.validator('avatar')).toBe(false)
    expect(slots.default?.()).toBeTruthy()
  })

  it('normalizes explicit dimensions without inventing invalid CSS values', () => {
    expect(normalizeOSkeletonDimension(40.8)).toBe('40px')
    expect(normalizeOSkeletonDimension(' min(100%, 32rem) ')).toBe('min(100%, 32rem)')
    expect(normalizeOSkeletonDimension(0)).toBeUndefined()
    expect(normalizeOSkeletonDimension(-12)).toBeUndefined()
    expect(normalizeOSkeletonDimension(Number.NaN)).toBeUndefined()
    expect(normalizeOSkeletonDimension(Number.POSITIVE_INFINITY)).toBeUndefined()
    expect(normalizeOSkeletonDimension('   ')).toBeUndefined()
    expect(normalizeOSkeletonDimension(undefined)).toBeUndefined()
  })

  it('normalizes text line counts to finite integers from one through twelve', () => {
    expect(normalizeOSkeletonLines(0)).toBe(1)
    expect(normalizeOSkeletonLines(-4)).toBe(1)
    expect(normalizeOSkeletonLines(3.9)).toBe(3)
    expect(normalizeOSkeletonLines(99)).toBe(12)
    expect(normalizeOSkeletonLines(Number.NaN)).toBe(1)
    expect(normalizeOSkeletonLines(Number.POSITIVE_INFINITY)).toBe(1)
  })

  it('renders normalized text lines as hidden presentation shapes', () => {
    const wrapper = mount(OSkeleton, {
      props: {
        lines: 3,
        width: 240.8,
        height: ' 0.875rem ',
      },
    })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-skeleton', 'o-skeleton--text', 'o-skeleton--animated']),
    )
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('style')).toContain('--omg-skeleton-width: 240px')
    expect(wrapper.attributes('style')).toContain('--omg-skeleton-height: 0.875rem')

    const lines = wrapper.findAll('.o-skeleton__shape')
    expect(lines).toHaveLength(3)
    expect(lines.every((line) => line.attributes('aria-hidden') === 'true')).toBe(true)
    expect(lines.at(-1)?.classes()).toContain('o-skeleton__shape--last')
  })

  it('renders one circle or rectangle regardless of the lines prop', async () => {
    const wrapper = mount(OSkeleton, {
      props: { variant: 'circle', lines: 6, animated: false },
    })

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['o-skeleton', 'o-skeleton--circle']))
    expect(wrapper.classes()).not.toContain('o-skeleton--animated')
    expect(wrapper.findAll('.o-skeleton__shape')).toHaveLength(1)

    await wrapper.setProps({ variant: 'rect', width: '75%', height: 160.9 })

    expect(wrapper.classes()).toContain('o-skeleton--rect')
    expect(wrapper.classes()).not.toContain('o-skeleton--circle')
    expect(wrapper.findAll('.o-skeleton__shape')).toHaveLength(1)
    expect(wrapper.attributes('style')).toContain('--omg-skeleton-width: 75%')
    expect(wrapper.attributes('style')).toContain('--omg-skeleton-height: 160px')
  })

  it('renders only resolved content when loading is false', async () => {
    const wrapper = mount(OSkeleton, {
      props: { loading: true },
      slots: { default: '<article data-test="resolved">Resolved content</article>' },
    })

    expect(wrapper.find('.o-skeleton').exists()).toBe(true)
    expect(wrapper.find('[data-test="resolved"]').exists()).toBe(false)

    await wrapper.setProps({ loading: false })

    expect(wrapper.find('.o-skeleton').exists()).toBe(false)
    expect(wrapper.get('[data-test="resolved"]').text()).toBe('Resolved content')
  })

  it('uses tokenized default geometry, a restrained sweep, and a static motion fallback', () => {
    expect(skeletonStyleSource).toMatch(
      /\.o-skeleton--text\s*\{[\s\S]*?--omg-skeleton-default-width:\s*100%;[\s\S]*?--omg-skeleton-default-height:\s*1em;/u,
    )
    expect(skeletonStyleSource).toMatch(
      /\.o-skeleton--rect\s*\{[\s\S]*?--omg-skeleton-default-width:\s*100%;[\s\S]*?--omg-skeleton-default-height:\s*120px;/u,
    )
    expect(skeletonStyleSource).toMatch(
      /\.o-skeleton--circle\s*\{[\s\S]*?--omg-skeleton-default-width:\s*40px;[\s\S]*?--omg-skeleton-default-height:\s*40px;/u,
    )
    expect(skeletonStyleSource).toContain('background-position')
    expect(skeletonStyleSource).toContain('@media (prefers-reduced-motion: reduce)')
    expect(skeletonStyleSource).toMatch(/\.o-skeleton__shape\s*\{[\s\S]*?border:\s*0;/u)
    expect(skeletonStyleSource).not.toContain('box-shadow')
  })
})
