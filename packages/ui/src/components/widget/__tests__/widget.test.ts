import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import {
  OWidget,
  oWidgetChartTypes,
  oWidgetProps,
  type OWidgetChartType,
  type OWidgetProps,
} from '../index'

describe('OWidget', () => {
  it('keeps public vocabularies and types aligned with runtime validation', () => {
    const chartData = [42, 58, 45, 72, 60, 85, 78] as const
    const publicProps: OWidgetProps = {
      title: '花费',
      value: 85,
      unit: '元',
      chartType: 'line',
      chartData,
      chartAriaLabel: '近 7 天花费趋势',
    }

    expect(oWidgetChartTypes).toEqual(['line', 'activity'])
    expect(oWidgetProps.chartType.validator(publicProps.chartType)).toBe(true)
    expect(oWidgetProps.chartType.validator('pie')).toBe(false)
    const chartType: OWidgetChartType | undefined = publicProps.chartType
    expect(chartType).toBe('line')
  })

  it('renders title, value, and unit', () => {
    const wrapper = mount(OWidget, {
      props: {
        title: '花费',
        value: 85,
        unit: '元',
      },
    })

    expect(wrapper.classes()).toContain('o-widget')
    expect(wrapper.text()).toContain('花费')
    expect(wrapper.text()).toContain('85')
    expect(wrapper.text()).toContain('元')
  })

  it('renders a line chart SVG when chartType is line with enough data', () => {
    const wrapper = mount(OWidget, {
      props: {
        title: '花费',
        value: 85,
        unit: '元',
        chartType: 'line',
        chartData: [42, 58, 45, 72, 60, 85, 78],
      },
    })

    const chart = wrapper.find('.o-widget__chart-svg--line')

    expect(chart.exists()).toBe(true)
    expect(chart.attributes('data-omg-visualization')).toBe('line')
    expect(chart.attributes('aria-hidden')).toBe('true')
    expect(chart.attributes('role')).toBeUndefined()
    expect(wrapper.find('.o-widget__chart-svg--activity').exists()).toBe(false)
  })

  it('exposes a named line chart as an accessible image', () => {
    const wrapper = mount(OWidget, {
      props: {
        title: '花费',
        value: 85,
        chartAriaLabel: ' 近 7 天花费趋势 ',
        chartData: [42, 58, 45],
      },
    })
    const chart = wrapper.find('.o-widget__chart-svg--line')

    expect(chart.attributes('role')).toBe('img')
    expect(chart.attributes('aria-label')).toBe('近 7 天花费趋势')
    expect(chart.attributes('aria-hidden')).toBeUndefined()
  })

  it('ignores non-finite line values and only renders with two usable points', async () => {
    const wrapper = mount(OWidget, {
      props: {
        title: '花费',
        value: 85,
        chartData: [Number.NaN, 10, Number.POSITIVE_INFINITY, 20, Number.NEGATIVE_INFINITY],
      },
    })

    const chart = wrapper.find('.o-widget__chart-svg--line')
    const line = chart.find('path[fill="none"]')

    expect(chart.exists()).toBe(true)
    expect(line.attributes('d')).not.toMatch(/NaN|Infinity/u)
    expect(line.attributes('d')?.match(/[ML]/gu)).toHaveLength(2)

    await wrapper.setProps({ chartData: [Number.NaN, 10, Number.POSITIVE_INFINITY] })

    expect(wrapper.find('.o-widget__chart-svg--line').exists()).toBe(false)
  })

  it('renders an activity dot chart when chartType is activity', () => {
    const wrapper = mount(OWidget, {
      props: {
        title: '活跃程度',
        value: 8,
        unit: '天',
        chartType: 'activity',
        chartData: [1, 1, 0, 1, 1, 1, 0],
      },
    })

    const chart = wrapper.find('.o-widget__chart-svg--activity')

    expect(chart.exists()).toBe(true)
    expect(chart.attributes('data-omg-visualization')).toBe('activity')
    expect(chart.attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.o-widget__chart-svg--line').exists()).toBe(false)
  })

  it('caps the activity visualization at two seven-point rows', () => {
    const wrapper = mount(OWidget, {
      props: {
        title: '活跃程度',
        value: 14,
        chartType: 'activity',
        chartData: Array.from({ length: 20 }, (_, index) => index % 2),
      },
    })

    expect(wrapper.findAll('.o-widget__chart-svg--activity circle')).toHaveLength(14)
  })

  it('hides chart when chartData is empty', () => {
    const wrapper = mount(OWidget, {
      props: {
        title: '花费',
        value: 85,
        unit: '元',
      },
    })

    expect(wrapper.find('.o-widget__chart-svg').exists()).toBe(false)
  })

  it('hides line chart when chartData has fewer than 2 points', () => {
    const wrapper = mount(OWidget, {
      props: {
        title: '花费',
        value: 85,
        unit: '元',
        chartType: 'line',
        chartData: [42],
      },
    })

    expect(wrapper.find('.o-widget__chart-svg--line').exists()).toBe(false)
  })

  it('accepts custom icon and chart via slots', () => {
    const wrapper = mount(OWidget, {
      props: {
        title: '花费',
        value: 85,
        unit: '元',
      },
      slots: {
        icon: '<span class="custom-icon" aria-hidden="true">IC</span>',
        chart: '<div class="custom-chart">Custom Chart</div>',
      },
    })

    expect(wrapper.find('.custom-icon').exists()).toBe(true)
    expect(wrapper.find('.custom-chart').exists()).toBe(true)
    expect(wrapper.text()).toContain('Custom Chart')
  })
})
