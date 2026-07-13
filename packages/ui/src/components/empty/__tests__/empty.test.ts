import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import {
  OEmpty,
  oEmptyMediaVariants,
  oEmptyProps,
  oEmptySizes,
  oEmptyTitleLevels,
  type OEmptyProps,
  type OEmptySlots,
} from '../index'

const emptySource = readFileSync(
  resolve(process.cwd(), 'packages/ui/src/components/empty/src/OEmpty.vue'),
  'utf8',
)
const emptyStyles = readFileSync(
  resolve(process.cwd(), 'packages/ui/src/components/empty/style/index.less'),
  'utf8',
)

describe('OEmpty', () => {
  it('keeps its vocabularies, defaults, validators, and public types aligned', () => {
    const props: OEmptyProps = {
      mediaVariant: 'soft',
      size: 'sm',
      title: 'No projects',
      description: 'Create the first project',
      titleLevel: 4,
    }
    const slots: OEmptySlots = {
      media: () => h('span', 'media'),
      title: () => 'Custom title',
      description: () => 'Custom description',
      default: () => 'Supporting content',
      actions: () => h('button', { type: 'button' }, 'Create'),
    }

    expect(oEmptyMediaVariants).toEqual(['plain', 'soft'])
    expect(oEmptySizes).toEqual(['sm', 'md'])
    expect(oEmptyTitleLevels).toEqual([2, 3, 4])
    expect(oEmptyProps.mediaVariant.default).toBe('plain')
    expect(oEmptyProps.size.default).toBe('md')
    expect(oEmptyProps.titleLevel.default).toBe(3)
    expect(oEmptyProps.mediaVariant.validator(props.mediaVariant)).toBe(true)
    expect(oEmptyProps.mediaVariant.validator('outlined')).toBe(false)
    expect(oEmptyProps.size.validator(props.size)).toBe(true)
    expect(oEmptyProps.size.validator('lg')).toBe(false)
    expect(oEmptyProps.titleLevel.validator(props.titleLevel)).toBe(true)
    expect(oEmptyProps.titleLevel.validator(1)).toBe(false)
    expect(slots.default?.()).toBe('Supporting content')
  })

  it('renders semantic optional sections and every named slot', () => {
    const wrapper = mount(OEmpty, {
      props: {
        mediaVariant: 'soft',
        title: 'No projects',
        description: 'Create the first project',
        titleLevel: 2,
      },
      slots: {
        media: '<span data-test="media">Folder</span>',
        title: '<span>Nothing here</span>',
        description: '<span>Start with a blank project</span>',
        default: '<p>Importing is also available.</p>',
        actions: '<button type="button">Create project</button>',
      },
    })

    expect(wrapper.element.tagName).toBe('SECTION')
    expect(wrapper.attributes('data-slot')).toBe('empty')
    expect(wrapper.get('[data-slot="empty-media"]').text()).toBe('Folder')
    expect(wrapper.get('h2[data-slot="empty-title"]').text()).toBe('Nothing here')
    expect(wrapper.get('[data-slot="empty-description"]').text()).toBe('Start with a blank project')
    expect(wrapper.get('[data-slot="empty-content"]').text()).toBe('Importing is also available.')
    expect(wrapper.get('[data-slot="empty-actions"]').text()).toBe('Create project')
  })

  it('supports all heading levels and prop fallbacks', () => {
    for (const titleLevel of oEmptyTitleLevels) {
      const wrapper = mount(OEmpty, {
        props: { title: 'No results', description: 'Try another query', titleLevel },
      })

      expect(wrapper.get(`h${titleLevel}`).text()).toBe('No results')
      expect(wrapper.get('[data-slot="empty-description"]').text()).toBe('Try another query')
    }
  })

  it('does not invent a live region or render empty optional sections', () => {
    const blank = mount(OEmpty)

    expect(blank.attributes('role')).toBeUndefined()
    expect(blank.attributes('aria-live')).toBeUndefined()
    expect(blank.find('[data-slot="empty-media"]').exists()).toBe(false)
    expect(blank.find('[data-slot="empty-header"]').exists()).toBe(false)
    expect(blank.find('[data-slot="empty-content"]').exists()).toBe(false)
    expect(blank.find('[data-slot="empty-actions"]').exists()).toBe(false)
  })

  it('forwards consumer semantics and wraps long copy', () => {
    const longText = 'No-content-is-available-for-this-personal-workspace'.repeat(4)
    const wrapper = mount(OEmpty, {
      props: { title: 'No results', description: longText, size: 'sm' },
      attrs: {
        id: 'search-empty',
        role: 'status',
        'aria-live': 'polite',
        'data-track': 'search',
      },
    })

    expect(wrapper.attributes()).toMatchObject({
      id: 'search-empty',
      role: 'status',
      'aria-live': 'polite',
      'data-track': 'search',
      'data-size': 'sm',
    })
    expect(wrapper.classes()).toContain('o-empty--sm')
    expect(wrapper.get('[data-slot="empty-description"]').text()).toBe(longText)
  })

  it('uses a borderless responsive composition without handwritten SVG', () => {
    expect(emptySource).not.toMatch(/<svg(?:\s|>)/u)
    expect(emptyStyles).toMatch(/\.o-empty\s*\{[\s\S]*?border:\s*0;/u)
    expect(emptyStyles).toMatch(/\.o-empty\s*\{[^}]*inline-size:\s*100%/su)
    expect(emptyStyles).toContain('.o-empty__header > .o-empty__title')
    expect(emptyStyles).toMatch(/\.o-empty__header\s*>\s*\.o-empty__title\s*\{[^}]*margin:\s*0;/su)
    expect(emptyStyles).toMatch(
      /\.o-empty__header\s*>\s*\.o-empty__title\s*\{[^}]*font-size:\s*var\(--omg-font-size-lg\);/su,
    )
    expect(emptyStyles).toMatch(
      /\.o-empty__header\s*>\s*\.o-empty__title\s*\{[^}]*letter-spacing:\s*normal;/su,
    )
    expect(emptyStyles).toMatch(
      /\.o-empty__header\s*>\s*\.o-empty__title\s*\{[^}]*line-height:\s*1\.3;/su,
    )
    expect(emptyStyles).toContain('overflow-wrap: anywhere')
    expect(emptyStyles).toContain('@container o-empty')
    expect(emptyStyles).toContain('padding-inline')
    expect(emptyStyles).not.toContain('var(--vp-')
  })
})
