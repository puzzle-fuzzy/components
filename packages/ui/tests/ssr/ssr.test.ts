import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import { describe, expect, test } from 'vitest'

import {
  OAvatar,
  OAvatarFlow,
  OAvatarGroup,
  OButton,
  OCodeInput,
  ODialog,
  ODivider,
  OImage,
  OReferenceTextarea,
  OTabs,
  OTextarea,
  OUpload,
  type OAvatarFlowPeer,
  type OAvatarGroupItem,
  type OTabsItem,
  type OUploadFile,
} from '../../src'

const sender: OAvatarFlowPeer = {
  id: 'sender',
  name: 'OMG UI',
}

const receivers: readonly OAvatarFlowPeer[] = [
  {
    id: 'receiver',
    name: 'Vue',
  },
]

const groupItems: readonly OAvatarGroupItem[] = [
  { id: 'one', name: 'One' },
  { id: 'two', name: 'Two' },
  { id: 'three', name: 'Three' },
]

const uploadFiles: OUploadFile[] = [
  {
    id: 'upload',
    file: new File(['upload'], 'upload.txt', { type: 'text/plain' }),
    progress: 1,
    state: 'success',
  },
]

const tabItems: OTabsItem[] = [
  { value: 'text', label: '传输文本' },
  { value: 'file', label: '传输文件' },
]

describe('server rendering', () => {
  test('renders OButton without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(OButton, null, { default: () => 'Save' }),
      }),
    )

    expect(html).toContain('class="o-button')
    expect(html).toContain('type="button"')
  })

  test('renders OAvatar without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(OAvatar, { name: 'OMG UI' }),
      }),
    )

    expect(html).toContain('class="o-avatar')
    expect(html).toContain('OM')
  })

  test('renders OAvatarGroup without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OAvatarGroup, {
            ariaLabel: 'Three participants',
            items: groupItems,
            max: 2,
            overlap: 12,
          }),
      }),
    )

    expect(html).toContain('class="o-avatar-group')
    expect(html).toContain('aria-label="Three participants"')
    expect(html).toContain('--omg-avatar-group-overlap:12px')
    expect(html).toContain('data-avatar-group-role="overflow"')
    expect(html).toContain('+1')
  })

  test('renders OAvatarFlow without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OAvatarFlow, {
            ariaLabel: '传输视觉状态',
            receivers,
            sender,
            state: 'transferring',
          }),
      }),
    )

    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="传输视觉状态"')
    expect(html).toContain('data-state="transferring"')
    expect(html).toContain('o-avatar-flow__dash-line')
    expect(html).not.toContain('aria-live')
  })

  test('renders OCodeInput without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OCodeInput, {
            ariaLabel: 'Verification code',
            modelValue: '123',
          }),
      }),
    )

    expect(html).toContain('class="o-code-input')
    expect(html.match(/class="o-code-input__field"/gu)).toHaveLength(6)
    expect(html).toContain('autocomplete="one-time-code"')
  })

  test('renders closed ODialog without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(ODialog, { open: false, title: '收到文本' }, () => '正文'),
      }),
    )

    expect(html).not.toContain('o-dialog')
  })

  test('renders ODivider without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(ODivider, null, { default: () => 'Details' }),
      }),
    )

    expect(html).toContain('role="separator"')
    expect(html).toContain('aria-orientation="horizontal"')
    expect(html).toContain('Details')
  })

  test('renders OImage without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OImage, {
            src: '/photo.jpg',
            alt: 'Gallery photo',
          }),
      }),
    )

    expect(html).toContain('class="o-image')
    expect(html).toContain('src="/photo.jpg"')
    expect(html).toContain('alt="Gallery photo"')
    expect(html).not.toContain('o-image__preview-mask')
  })

  test('renders OTextarea without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(OTextarea, { modelValue: 'SSR', ariaLabel: '消息' }),
      }),
    )

    expect(html).toContain('class="o-textarea')
    expect(html).toContain('SSR')
  })

  test('renders OReferenceTextarea without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OReferenceTextarea, {
            modelValue: '@[Yxswy](member:yxswy)',
            ariaLabel: '消息',
          }),
      }),
    )

    expect(html).toContain('class="o-reference-textarea')
    expect(html).toContain('Yxswy')
  })

  test('renders OTabs without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OTabs, {
            modelValue: 'text',
            items: tabItems,
            ariaLabel: '传输类型',
          }),
      }),
    )

    expect(html).toContain('class="o-tabs')
    expect(html).toContain('role="tablist"')
    expect(html).toContain('传输文本')
  })

  test('renders OUpload without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OUpload, {
            ariaLabel: 'Upload files',
            files: uploadFiles,
          }),
      }),
    )

    expect(html).toContain('class="o-upload')
    expect(html).toContain('aria-label="Upload files"')
    expect(html).toContain('upload.txt')
    expect(html).toContain('已完成')
  })
})
