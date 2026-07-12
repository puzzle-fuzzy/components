import type { ExtractPublicPropTypes, PropType } from 'vue'

export const oWidgetChartTypes = ['line', 'activity'] as const

export type OWidgetChartType = (typeof oWidgetChartTypes)[number]

const isStringMember = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => typeof value === 'string' && (values as readonly string[]).includes(value)

export const oWidgetProps = {
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number] as PropType<string | number>,
    required: true,
  },
  unit: String,
  chartType: {
    type: String as PropType<OWidgetChartType>,
    default: 'line',
    validator: (value: unknown): value is OWidgetChartType =>
      isStringMember(oWidgetChartTypes, value),
  },
  chartData: {
    type: Array as PropType<number[]>,
    default: (): number[] => [],
  },
} as const

export type OWidgetProps = ExtractPublicPropTypes<typeof oWidgetProps>

export interface OWidgetSlots {
  icon?: () => unknown
  chart?: () => unknown
}
