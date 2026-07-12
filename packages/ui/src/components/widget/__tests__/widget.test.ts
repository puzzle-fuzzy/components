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
    const publicProps: OWidgetProps = {
      title: '花费',
      value: 85,
      unit: '元',
      chartType: 'line',
      chartData: [42, 58, 45, 72, 60, 85, 78],
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

    expect(wrapper.find('.o-widget__chart-svg--line').exists()).toBe(true)
    expect(wrapper.find('.o-widget__chart-svg--activity').exists()).toBe(false)
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

    expect(wrapper.find('.o-widget__chart-svg--activity').exists()).toBe(true)
    expect(wrapper.find('.o-widget__chart-svg--line').exists()).toBe(false)
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
        icon: '<span class="custom-icon"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" /></span>',
        chart: '<div class="custom-chart">Custom Chart</div>',
      },
    })

    expect(wrapper.find('.custom-icon').exists()).toBe(true)
    expect(wrapper.find('.custom-chart').exists()).toBe(true)
    expect(wrapper.text()).toContain('Custom Chart')
  })
})
