import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import {
  ODivider,
  oDividerContentPositions,
  oDividerDirections,
  oDividerProps,
  type ODividerContentPosition,
  type ODividerDirection,
  type ODividerProps,
  type ODividerSlots,
} from '../index'

describe('ODivider', () => {
  it('keeps its public vocabularies and types aligned with runtime validation', () => {
    const direction: ODividerDirection = 'vertical'
    const contentPosition: ODividerContentPosition = 'right'
    const publicProps: ODividerProps = {
      contentPosition,
      dashed: true,
      direction,
    }
    const publicSlots: ODividerSlots = {
      default: () => 'Details',
    }

    expect(oDividerDirections).toEqual(['horizontal', 'vertical'])
    expect(oDividerContentPositions).toEqual(['left', 'center', 'right'])
    expect(oDividerProps.direction.validator(publicProps.direction)).toBe(true)
    expect(oDividerProps.direction.validator('diagonal')).toBe(false)
    expect(oDividerProps.direction.validator(null)).toBe(false)
    expect(oDividerProps.contentPosition.validator(publicProps.contentPosition)).toBe(true)
    expect(oDividerProps.contentPosition.validator('start')).toBe(false)
    expect(oDividerProps.contentPosition.validator(undefined)).toBe(false)
    expect(publicSlots.default?.()).toBe('Details')
  })

  it('renders a horizontal semantic separator by default', () => {
    const wrapper = mount(ODivider)

    expect(wrapper.attributes()).toMatchObject({
      role: 'separator',
      'aria-orientation': 'horizontal',
    })
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-divider', 'o-divider--horizontal', 'o-divider--content-center']),
    )
    expect(wrapper.classes()).not.toContain('o-divider--with-content')
    expect(wrapper.findAll('.o-divider__line')).toHaveLength(1)
  })

  it('renders horizontal content in the requested position', () => {
    const wrapper = mount(ODivider, {
      props: { contentPosition: 'left', dashed: true },
      slots: { default: () => 'Details' },
    })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'o-divider--content-left',
        'o-divider--dashed',
        'o-divider--with-content',
      ]),
    )
    expect(wrapper.get('.o-divider__content').text()).toBe('Details')
    expect(wrapper.findAll('.o-divider__line')).toHaveLength(2)
    expect(
      wrapper
        .findAll('.o-divider__line')
        .every((line) => line.attributes('aria-hidden') === 'true'),
    ).toBe(true)
  })

  it('does not render content in vertical mode', () => {
    const wrapper = mount(ODivider, {
      props: { direction: 'vertical' },
      slots: { default: () => 'Ignored' },
    })

    expect(wrapper.attributes('aria-orientation')).toBe('vertical')
    expect(wrapper.classes()).toContain('o-divider--vertical')
    expect(wrapper.classes()).not.toContain('o-divider--with-content')
    expect(wrapper.find('.o-divider__content').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  it('reacts to direction, position, and dashed changes', async () => {
    const wrapper = mount(ODivider, {
      props: { contentPosition: 'right' },
      slots: { default: () => 'Metadata' },
    })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-divider--horizontal', 'o-divider--content-right']),
    )

    await wrapper.setProps({
      contentPosition: 'center',
      dashed: true,
      direction: 'vertical',
    })

    expect(wrapper.attributes('aria-orientation')).toBe('vertical')
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'o-divider--vertical',
        'o-divider--content-center',
        'o-divider--dashed',
      ]),
    )
    expect(wrapper.classes()).not.toContain('o-divider--horizontal')
    expect(wrapper.classes()).not.toContain('o-divider--content-right')
    expect(wrapper.classes()).not.toContain('o-divider--with-content')
  })

  it('forwards consumer attributes, classes, and styles to the separator', () => {
    const wrapper = mount(ODivider, {
      attrs: {
        id: 'details-divider',
        class: 'consumer-divider',
        style: '--omg-divider-color: rebeccapurple',
        'data-track': 'details',
      },
    })

    expect(wrapper.attributes('id')).toBe('details-divider')
    expect(wrapper.attributes('data-track')).toBe('details')
    expect(wrapper.classes()).toContain('consumer-divider')
    expect((wrapper.element as HTMLDivElement).style.getPropertyValue('--omg-divider-color')).toBe(
      'rebeccapurple',
    )
  })
})
