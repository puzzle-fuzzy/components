import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import {
  OCard,
  oCardProps,
  oCardSizes,
  oCardTitleLevels,
  oCardVariants,
  type OCardProps,
  type OCardSlots,
} from '../index'

const cardSource = readFileSync(
  resolve(process.cwd(), 'packages/ui/src/components/card/src/OCard.vue'),
  'utf8',
)
const cardStyles = readFileSync(
  resolve(process.cwd(), 'packages/ui/src/components/card/style/index.less'),
  'utf8',
)

describe('OCard', () => {
  it('keeps its vocabularies, defaults, validators, and public types aligned', () => {
    const props: OCardProps = {
      variant: 'muted',
      size: 'sm',
      title: 'Project',
      description: 'Personal UI',
      titleLevel: 2,
    }
    const slots: OCardSlots = {
      title: () => 'Custom title',
      description: () => 'Custom description',
      action: () => h('button', { type: 'button' }, 'Open'),
      default: () => 'Body',
      footer: () => 'Footer',
    }

    expect(oCardVariants).toEqual(['surface', 'muted', 'ghost'])
    expect(oCardSizes).toEqual(['sm', 'md'])
    expect(oCardTitleLevels).toEqual([2, 3, 4])
    expect(oCardProps.variant.default).toBe('surface')
    expect(oCardProps.size.default).toBe('md')
    expect(oCardProps.titleLevel.default).toBe(3)
    expect(oCardProps.variant.validator(props.variant)).toBe(true)
    expect(oCardProps.variant.validator('outlined')).toBe(false)
    expect(oCardProps.size.validator(props.size)).toBe(true)
    expect(oCardProps.size.validator('lg')).toBe(false)
    expect(oCardProps.titleLevel.validator(props.titleLevel)).toBe(true)
    expect(oCardProps.titleLevel.validator(1)).toBe(false)
    expect(slots.default?.()).toBe('Body')
  })

  it('renders semantic sections, headings, and all named slots', () => {
    const wrapper = mount(OCard, {
      props: { title: 'Project', description: 'Personal UI', titleLevel: 2 },
      slots: {
        action: '<button type="button">Open</button>',
        default: 'Body',
        footer: 'Footer',
      },
    })

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('data-slot')).toBe('card')
    expect(wrapper.get('[data-slot="card-header"]')).toBeTruthy()
    expect(wrapper.get('h2[data-slot="card-title"]').text()).toBe('Project')
    expect(wrapper.get('[data-slot="card-description"]').text()).toBe('Personal UI')
    expect(wrapper.get('[data-slot="card-action"]').text()).toBe('Open')
    expect(wrapper.get('[data-slot="card-content"]').text()).toBe('Body')
    expect(wrapper.get('[data-slot="card-footer"]').text()).toBe('Footer')
  })

  it('lets named copy slots override props and supports every heading level', () => {
    for (const titleLevel of oCardTitleLevels) {
      const wrapper = mount(OCard, {
        props: {
          title: 'Fallback title',
          description: 'Fallback description',
          titleLevel,
        },
        slots: {
          title: '<span>Slotted title</span>',
          description: '<span>Slotted description</span>',
        },
      })

      expect(wrapper.get(`h${titleLevel}`).text()).toBe('Slotted title')
      expect(wrapper.get('[data-slot="card-description"]').text()).toBe('Slotted description')
    }
  })

  it('omits optional header, content, and footer sections when they are empty', () => {
    const blank = mount(OCard)
    const titleOnly = mount(OCard, { props: { title: 'Only a title' } })

    expect(blank.find('[data-slot="card-header"]').exists()).toBe(false)
    expect(blank.find('[data-slot="card-content"]').exists()).toBe(false)
    expect(blank.find('[data-slot="card-footer"]').exists()).toBe(false)
    expect(titleOnly.get('[data-slot="card-header"]').text()).toBe('Only a title')
    expect(titleOnly.find('[data-slot="card-description"]').exists()).toBe(false)
    expect(titleOnly.find('[data-slot="card-action"]').exists()).toBe(false)
  })

  it('forwards consumer attrs and preserves long wrapping copy', () => {
    const longText = 'Personal-component-library-with-a-very-long-unbroken-description'.repeat(4)
    const wrapper = mount(OCard, {
      props: { description: longText, variant: 'ghost', size: 'sm' },
      attrs: {
        id: 'project-card',
        'aria-label': 'Project summary',
        'data-track': 'project',
      },
    })

    expect(wrapper.attributes()).toMatchObject({
      id: 'project-card',
      'aria-label': 'Project summary',
      'data-track': 'project',
      'data-variant': 'ghost',
      'data-size': 'sm',
    })
    expect(wrapper.classes()).toContain('o-card--ghost')
    expect(wrapper.classes()).toContain('o-card--sm')
    expect(wrapper.get('[data-slot="card-description"]').text()).toBe(longText)
  })

  it('uses a borderless responsive surface without handwritten SVG', () => {
    expect(cardSource).not.toMatch(/<svg(?:\s|>)/u)
    expect(cardStyles).toMatch(/\.o-card\s*\{[\s\S]*?border:\s*0;/u)
    expect(cardStyles).toContain('.o-card__copy > .o-card__title')
    expect(cardStyles).toMatch(/\.o-card__copy\s*>\s*\.o-card__title\s*\{[^}]*margin:\s*0;/su)
    expect(cardStyles).toMatch(
      /\.o-card__copy\s*>\s*\.o-card__title\s*\{[^}]*font-size:\s*var\(--omg-font-size-lg\);/su,
    )
    expect(cardStyles).toMatch(
      /\.o-card__copy\s*>\s*\.o-card__title\s*\{[^}]*letter-spacing:\s*normal;/su,
    )
    expect(cardStyles).toMatch(
      /\.o-card__copy\s*>\s*\.o-card__title\s*\{[^}]*line-height:\s*1\.3;/su,
    )
    expect(cardStyles).toContain('overflow-wrap: anywhere')
    expect(cardStyles).toContain('@container o-card')
    expect(cardStyles).toContain('padding-inline')
    expect(cardStyles).not.toContain('var(--vp-')
  })
})
