import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { createSSRApp, h, nextTick } from 'vue'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'

import {
  OUpload,
  defaultOUploadLabels,
  formatOUploadFileSize,
  getOUploadStateLabel,
  normalizeOUploadMaxCount,
  normalizeOUploadProgress,
  oUploadFileStates,
  oUploadProps,
  resolveOUploadProgress,
  type OUploadEmits,
  type OUploadFile,
  type OUploadFileState,
  type OUploadLabels,
  type OUploadProps,
  type OUploadSlots,
} from '../index'

const createNativeFile = (name: string, size: number, type = 'text/plain'): File => {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', {
    configurable: true,
    value: size,
  })
  return file
}

const createUploadFile = (
  id: string,
  name: string,
  size?: number,
  state: OUploadFileState = 'queued',
  progress?: number,
): OUploadFile => ({ id, name, progress, size, state })

const setInputFiles = (input: HTMLInputElement, files: readonly File[]): void => {
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: files,
  })
}

const chineseLabels: OUploadLabels = {
  select: '上传附件',
  description: '拖拽文件到这里，或点击选择',
  dragActive: '松开以选择文件',
  add: '添加更多文件',
  clear: '清空',
  list: '已选附件',
  queued: '等待上传',
  uploading: (percentage) => (percentage === undefined ? '上传中' : `${String(percentage)}%`),
  success: '已完成',
  error: '上传失败',
  remove: (name) => `移除 ${name}`,
  progress: (name) => `${name} 上传进度`,
}

describe('OUpload helpers', () => {
  it('keeps public vocabularies, metadata, labels, and emits aligned', () => {
    const uploadFile = createUploadFile('report', 'report.pdf', 1536, 'uploading', 0.4)
    const publicProps: OUploadProps = {
      files: [uploadFile],
      labels: { select: '选择文件' },
      accept: '.pdf',
      multiple: true,
      disabled: false,
      maxCount: 4,
      clearable: true,
    }
    const publicSlots: OUploadSlots = {
      icon: () => null,
      empty: () => null,
      file: ({ file }) => file.name,
    }
    const publicEmits: OUploadEmits = {
      select: [[createNativeFile('report.pdf', 1536)]],
      remove: [uploadFile],
      clear: [],
      dragChange: [true],
    }

    expect(oUploadFileStates).toEqual(['queued', 'uploading', 'success', 'error'])
    expect(oUploadProps.files.default()).toEqual([])
    expect(oUploadProps.labels.default()).toEqual({})
    expect(defaultOUploadLabels.select).toBe('Select files')
    expect('file' in uploadFile).toBe(false)
    expect(publicSlots.file?.({ file: uploadFile })).toBe('report.pdf')
    expect(publicEmits.dragChange).toEqual([true])
    expect(publicProps.files).toHaveLength(1)
    expectTypeOf(publicProps.maxCount).toEqualTypeOf<number | undefined>()
    expectTypeOf(uploadFile.name).toEqualTypeOf<string>()
  })

  it('normalizes limits, progress, state labels, and large file sizes', () => {
    expect(normalizeOUploadMaxCount(undefined)).toBeUndefined()
    expect(normalizeOUploadMaxCount(Number.POSITIVE_INFINITY)).toBeUndefined()
    expect(normalizeOUploadMaxCount(Number.NaN)).toBe(0)
    expect(normalizeOUploadMaxCount(-1)).toBe(0)
    expect(normalizeOUploadMaxCount(2.9)).toBe(2)
    expect(normalizeOUploadProgress(Number.NaN)).toBe(0)
    expect(normalizeOUploadProgress(-1)).toBe(0)
    expect(normalizeOUploadProgress(2)).toBe(1)

    expect(resolveOUploadProgress(createUploadFile('queued', 'queued.txt', 1, 'queued', 0.8))).toBe(
      0,
    )
    expect(
      resolveOUploadProgress(createUploadFile('uploading', 'uploading.txt', 1, 'uploading')),
    ).toBeUndefined()
    expect(resolveOUploadProgress(createUploadFile('success', 'success.txt', 1, 'success'))).toBe(1)
    expect(resolveOUploadProgress(createUploadFile('error', 'error.txt', 1, 'error', 0.25))).toBe(
      0.25,
    )
    expect(
      getOUploadStateLabel(
        createUploadFile('uploading', 'uploading.txt', 1, 'uploading'),
        chineseLabels,
      ),
    ).toBe('上传中')

    expect(formatOUploadFileSize(512)).toBe('512 B')
    expect(formatOUploadFileSize(1536)).toBe('1.5 KiB')
    expect(formatOUploadFileSize(2 * 1024 * 1024)).toBe('2.0 MiB')
    expect(formatOUploadFileSize(2 * 1024 * 1024 * 1024)).toBe('2.0 GiB')
  })
})

describe('OUpload', () => {
  it('renders keyboard and drag selection semantics with configurable labels', () => {
    const wrapper = mount(OUpload, {
      props: {
        accept: '.png,.jpg',
        labels: chineseLabels,
        multiple: true,
      },
    })
    const dropzone = wrapper.get('.o-upload__dropzone')
    const input = wrapper.get('input[type="file"]')

    expect(dropzone.attributes()).toMatchObject({
      'aria-label': '上传附件',
      role: 'button',
      tabindex: '0',
    })
    expect(wrapper.get('.o-upload__title').text()).toBe('上传附件')
    expect(wrapper.get('.o-upload__description').text()).toBe('拖拽文件到这里，或点击选择')
    expect(input.attributes()).toMatchObject({ accept: '.png,.jpg', 'aria-hidden': 'true' })
    expect(input.attributes('aria-label')).toBeUndefined()
    expect(input.attributes('multiple')).toBeDefined()
    expect(wrapper.find('.o-upload__list').exists()).toBe(false)
  })

  it('emits every selected input file only when multiple is enabled and resets the input', async () => {
    const wrapper = mount(OUpload, { props: { multiple: true } })
    const nativeFiles = [createNativeFile('first.txt', 100), createNativeFile('second.txt', 200)]
    const input = wrapper.get('input[type="file"]')
    const element = input.element as HTMLInputElement

    setInputFiles(element, nativeFiles)
    Object.defineProperty(element, 'value', {
      configurable: true,
      value: 'C:\\fakepath\\first.txt',
      writable: true,
    })
    await input.trigger('change')

    expect(wrapper.emitted('select')).toEqual([[nativeFiles]])
    expect(element.value).toBe('')
  })

  it('limits both picker and drop selection to one file when multiple is false', async () => {
    const inputWrapper = mount(OUpload)
    const dropWrapper = mount(OUpload)
    const nativeFiles = [createNativeFile('first.txt', 100), createNativeFile('second.txt', 200)]
    const input = inputWrapper.get('input[type="file"]')

    setInputFiles(input.element as HTMLInputElement, nativeFiles)
    await input.trigger('change')
    await dropWrapper.get('.o-upload__dropzone').trigger('drop', {
      dataTransfer: { files: nativeFiles },
    })

    expect(inputWrapper.emitted('select')).toEqual([[[nativeFiles[0]]]])
    expect(dropWrapper.emitted('select')).toEqual([[[nativeFiles[0]]]])
  })

  it('emits kebab-case drag state and clears it when disabled dynamically', async () => {
    const wrapper = mount(OUpload, { props: { labels: chineseLabels } })
    const files = [createNativeFile('drop.txt', 300)]
    const dropzone = wrapper.get('.o-upload__dropzone')

    await dropzone.trigger('dragenter', { dataTransfer: { files } })

    expect(wrapper.classes()).toContain('is-dragging')
    expect(wrapper.get('.o-upload__title').text()).toBe('松开以选择文件')
    expect(wrapper.emitted('dragChange')).toEqual([[true]])

    await wrapper.setProps({ disabled: true })
    await nextTick()

    expect(wrapper.classes()).not.toContain('is-dragging')
    expect(wrapper.emitted('dragChange')).toEqual([[true], [false]])

    await dropzone.trigger('drop', { dataTransfer: { files } })
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('renders list semantics and consistent determinate and indeterminate progress', async () => {
    const files = [
      createUploadFile('queued', 'queued.txt', 512, 'queued'),
      createUploadFile('uploading', 'uploading.mov', 2 * 1024 * 1024, 'uploading'),
      createUploadFile('progress', 'progress.mov', 4 * 1024 * 1024, 'uploading', 0.42),
      createUploadFile('success', 'success.zip', 1024, 'success'),
      createUploadFile('error', 'error.png', undefined, 'error'),
    ]
    const wrapper = mount(OUpload, {
      props: {
        clearable: true,
        files,
        labels: chineseLabels,
      },
    })

    const list = wrapper.get('.o-upload__list')
    const inputClick = vi.spyOn(
      wrapper.get<HTMLInputElement>('input[type="file"]').element,
      'click',
    )
    expect(list.element.tagName).toBe('UL')
    expect(list.attributes('aria-label')).toBe('已选附件')
    expect(list.findAll('li')).toHaveLength(5)
    expect(wrapper.findAll('.o-upload__file')).toHaveLength(5)
    expect(wrapper.findAll('.o-upload__file').every((row) => row.element.tagName === 'LI')).toBe(
      true,
    )
    expect(wrapper.get('.o-upload__actions').element.tagName).toBe('DIV')

    await wrapper.get('.o-upload__dropzone').trigger('click')
    expect(inputClick).not.toHaveBeenCalled()
    await wrapper.get('.o-upload__add').trigger('click')
    expect(inputClick).toHaveBeenCalledOnce()

    expect(wrapper.get('[data-upload-file-id="uploading"]').text()).toContain('上传中')
    expect(wrapper.get('[data-upload-file-id="progress"]').text()).toContain('42%')
    expect(wrapper.get('[data-upload-file-id="success"]').text()).toContain('已完成')
    expect(wrapper.get('[data-upload-file-id="error"]').text()).toContain('上传失败')
    expect(wrapper.find('[data-upload-file-id="error"] .o-upload__file-size').exists()).toBe(false)

    const queuedProgress = wrapper.get('[data-upload-file-id="queued"] .o-upload__file-progress')
    const uploadingProgress = wrapper.get(
      '[data-upload-file-id="uploading"] .o-upload__file-progress',
    )
    const determinateProgress = wrapper.get(
      '[data-upload-file-id="progress"] .o-upload__file-progress',
    )
    const successProgress = wrapper.get('[data-upload-file-id="success"] .o-upload__file-progress')
    const errorProgress = wrapper.get('[data-upload-file-id="error"] .o-upload__file-progress')

    expect(queuedProgress.attributes('aria-valuenow')).toBe('0')
    expect(uploadingProgress.attributes('aria-valuenow')).toBeUndefined()
    expect(uploadingProgress.attributes('aria-valuetext')).toBe('上传中')
    expect(determinateProgress.attributes('aria-valuenow')).toBe('42')
    expect(successProgress.attributes('aria-valuenow')).toBe('100')
    expect(successProgress.attributes('aria-valuetext')).toBe('已完成')
    expect(errorProgress.attributes('aria-valuenow')).toBeUndefined()
    expect(
      wrapper
        .get('[data-upload-file-id="progress"] .o-upload__file-progress-bar')
        .attributes('style'),
    ).toContain('--omg-upload-progress: 0.42')

    await wrapper.get('[aria-label="移除 progress.mov"]').trigger('click')
    await wrapper.get('.o-upload__clear').trigger('click')

    expect(wrapper.emitted('remove')).toEqual([[files[2]]])
    expect(wrapper.emitted('clear')).toEqual([[]])
    expect(wrapper.get('.o-upload__clear').text()).toBe('清空')
  })

  it('normalizes maxCount and marks selection unavailable at the limit', async () => {
    const nativeFiles = [
      createNativeFile('first.txt', 100),
      createNativeFile('second.txt', 200),
      createNativeFile('third.txt', 300),
    ]
    const limited = mount(OUpload, {
      props: {
        files: [createUploadFile('existing', 'existing.txt', 100)],
        maxCount: 2.9,
        multiple: true,
      },
    })
    const limitedInput = limited.get('input[type="file"]')

    setInputFiles(limitedInput.element as HTMLInputElement, nativeFiles)
    await limitedInput.trigger('change')
    expect(limited.emitted('select')).toEqual([[[nativeFiles[0]]]])

    const unavailable = mount(OUpload, { props: { maxCount: 0 } })
    const dropzone = unavailable.get('.o-upload__dropzone')
    const input = unavailable.get('input[type="file"]')

    expect(dropzone.attributes()).toMatchObject({
      'aria-disabled': 'true',
      role: 'button',
      tabindex: '-1',
    })
    expect(input.attributes('disabled')).toBeDefined()
    setInputFiles(input.element as HTMLInputElement, nativeFiles)
    await input.trigger('change')
    await dropzone.trigger('drop', { dataTransfer: { files: nativeFiles } })
    expect(unavailable.emitted('select')).toBeUndefined()
  })

  it('suppresses selection and controls while disabled', async () => {
    const file = createUploadFile('disabled', 'disabled.txt', 128)
    const nativeFile = createNativeFile('disabled.txt', 128)
    const wrapper = mount(OUpload, {
      props: {
        clearable: true,
        disabled: true,
        files: [file],
        labels: chineseLabels,
      },
    })
    const input = wrapper.get('input[type="file"]')
    const dropzone = wrapper.get('.o-upload__dropzone')

    setInputFiles(input.element as HTMLInputElement, [nativeFile])
    await input.trigger('change')
    await dropzone.trigger('dragenter', { dataTransfer: { files: [nativeFile] } })
    await dropzone.trigger('drop', { dataTransfer: { files: [nativeFile] } })

    expect(dropzone.attributes('aria-disabled')).toBe('true')
    expect(dropzone.attributes('tabindex')).toBe('-1')
    expect(input.attributes('disabled')).toBeDefined()
    expect(wrapper.find('[aria-label="移除 disabled.txt"]').exists()).toBe(false)
    expect(wrapper.find('.o-upload__clear').exists()).toBe(false)
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('dragChange')).toBeUndefined()
  })

  it('renders controlled metadata on the server without constructing File', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OUpload, {
            files: [createUploadFile('ssr', 'ssr.txt', 1024, 'success')],
            labels: chineseLabels,
          }),
      }),
    )

    expect(html).toContain('class="o-upload')
    expect(html).toContain('aria-label="上传附件"')
    expect(html).toContain('ssr.txt')
    expect(html).toContain('已完成')
    expect(html).toContain('aria-valuenow="100"')
  })
})
