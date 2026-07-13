import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'

import {
  normalizeOProgressValue,
  OProgress,
  oProgressProps,
  oProgressSizes,
  oProgressStatuses,
  type OProgressLabelSlotProps,
  type OProgressProps,
  type OProgressSize,
  type OProgressSlots,
  type OProgressStatus,
} from '../index'

const progressSource = readFileSync(
  resolve(process.cwd(), 'packages/ui/src/components/progress/src/OProgress.vue'),
  'utf8',
)
const progressStyles = readFileSync(
  resolve(process.cwd(), 'packages/ui/src/components/progress/style/index.less'),
  'utf8',
)

describe('normalizeOProgressValue', () => {
  it.each([
    [undefined, undefined],
    [Number.NaN, undefined],
    [Number.POSITIVE_INFINITY, undefined],
    [-20, 0],
    [42.8, 42.8],
    [140, 100],
  ] as const)('normalizes progress value %s to %s', (value, expected) => {
    expect(normalizeOProgressValue(value)).toBe(expected)
  })
})

describe('OProgress', () => {
  it('publishes stable vocabularies, runtime validation, and public types', () => {
    const publicProps: OProgressProps = {
      value: 48,
      status: 'warning',
      size: 'sm',
      showLabel: true,
      label: '上传进度',
      ariaLabel: '文件上传进度',
    }
    const publicSlots: OProgressSlots = {
      label: ({ value }) => `${String(value)}%`,
    }

    expect(oProgressStatuses).toEqual(['normal', 'success', 'warning', 'error'])
    expect(oProgressSizes).toEqual(['sm', 'md'])
    expect(oProgressProps.status.validator('success')).toBe(true)
    expect(oProgressProps.status.validator('complete')).toBe(false)
    expect(oProgressProps.size.validator('sm')).toBe(true)
    expect(oProgressProps.size.validator('lg')).toBe(false)
    expectTypeOf<OProgressProps['status']>().toEqualTypeOf<OProgressStatus | undefined>()
    expectTypeOf<OProgressProps['size']>().toEqualTypeOf<OProgressSize | undefined>()
    expectTypeOf<
      Parameters<NonNullable<OProgressSlots['label']>>[0]
    >().toEqualTypeOf<OProgressLabelSlotProps>()
    expect(publicProps.value).toBe(48)
    expect(publicSlots.label?.({ value: 48, indeterminate: false, status: 'normal' })).toBe('48%')
  })

  it('renders determinate progress without inferring success', () => {
    const wrapper = mount(OProgress, {
      props: { value: 100, ariaLabel: '文件处理进度', showLabel: true },
    })

    expect(wrapper.attributes()).toMatchObject({
      role: 'progressbar',
      'aria-label': '文件处理进度',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-valuenow': '100',
    })
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-progress', 'o-progress--normal', 'o-progress--md']),
    )
    expect(wrapper.classes()).not.toContain('o-progress--success')
    expect(wrapper.get('.o-progress__label').text()).toBe('100%')
    expect(wrapper.get('.o-progress__fill').attributes('style')).toContain('--o-progress-value: 1')
  })

  it('renders indeterminate semantics and custom label slot props', () => {
    const wrapper = mount(OProgress, {
      props: { status: 'warning', showLabel: true, ariaLabel: '同步状态' },
      slots: {
        label: ({ indeterminate, status }: OProgressLabelSlotProps) =>
          `${String(indeterminate)}:${status}`,
      },
    })

    expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-progress--warning', 'o-progress--indeterminate']),
    )
    expect(wrapper.get('.o-progress__label').text()).toBe('true:warning')
    expect(wrapper.get('.o-progress__fill').attributes('style')).toBeUndefined()
  })

  it('uses the visible default label as its accessible name', () => {
    const wrapper = mount(OProgress, { props: { value: 68, showLabel: true } })
    const label = wrapper.get('.o-progress__label')

    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(wrapper.attributes('aria-labelledby')).toBe(label.attributes('id'))
    expect(label.text()).toBe('68%')
  })

  it('uses the string label as both visible content and accessible name', () => {
    const wrapper = mount(OProgress, {
      props: { value: 39.5, label: '资料整理', showLabel: true },
    })

    expect(wrapper.attributes('aria-label')).toBe('资料整理')
    expect(wrapper.attributes('aria-labelledby')).toBeUndefined()
    expect(wrapper.get('.o-progress__label').text()).toBe('资料整理')
  })

  it('warns when a custom label slot has no explicit accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const wrapper = mount(OProgress, {
      props: { showLabel: true },
      slots: { label: () => '自定义阶段' },
    })

    expect(warn).toHaveBeenCalledOnce()
    expect(warn).toHaveBeenCalledWith(
      '[OMG UI][OProgress] Provide ariaLabel when using the label slot.',
    )
    expect(wrapper.attributes('aria-label')).toBe('Progress')
    warn.mockRestore()
  })

  it('reacts to values, status, and size while forwarding consumer attributes', async () => {
    const wrapper = mount(OProgress, {
      attrs: {
        id: 'upload-progress',
        class: 'consumer-progress',
        'data-track': 'upload',
      },
      props: { value: -10, status: 'error', size: 'sm' },
    })

    expect(wrapper.attributes('id')).toBe('upload-progress')
    expect(wrapper.attributes('data-track')).toBe('upload')
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['consumer-progress', 'o-progress--error', 'o-progress--sm']),
    )
    expect(wrapper.attributes('aria-valuenow')).toBe('0')
    expect(wrapper.get('.o-progress__fill').attributes('style')).toContain('--o-progress-value: 0')

    await wrapper.setProps({ value: 140, status: 'success', size: 'md' })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['o-progress--success', 'o-progress--md']),
    )
    expect(wrapper.classes()).not.toContain('o-progress--error')
    expect(wrapper.classes()).not.toContain('o-progress--sm')
    expect(wrapper.attributes('aria-valuenow')).toBe('100')
    expect(wrapper.get('.o-progress__fill').attributes('style')).toContain('--o-progress-value: 1')
  })

  it('uses transform-based motion, RTL origins, and a reduced-motion fallback', () => {
    expect(progressSource).not.toContain('<svg')
    expect(progressStyles).toContain('transform: scaleX(var(--o-progress-value, 0));')
    expect(progressStyles).not.toMatch(/transition:\s*[^;]*\b(?:width|inline-size)\b/u)
    expect(progressStyles).toContain('.o-progress:dir(rtl) .o-progress__fill')
    expect(progressStyles).toContain("[dir='rtl'] .o-progress .o-progress__fill")
    expect(progressStyles).toMatch(/\[dir='rtl'\][^{]*\{[^}]*transform-origin: right center;/su)
    expect(progressStyles).toContain('@keyframes o-progress-indeterminate')
    expect(progressStyles).toMatch(
      /\.o-progress--indeterminate:dir\(rtl\)[^{]*\{[^}]*animation-direction: reverse;/su,
    )
    expect(progressStyles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(progressStyles).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none;[\s\S]*transform: none;/u,
    )
  })
})
