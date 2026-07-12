import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, expectTypeOf, it } from 'vitest'

import {
  OUpload,
  formatOUploadFileSize,
  normalizeOUploadProgress,
  oUploadFileStates,
  oUploadProps,
  type OUploadEmits,
  type OUploadFile,
  type OUploadFileState,
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
  size: number,
  state: OUploadFileState = 'queued',
  progress = 0,
): OUploadFile => ({
  id,
  file: createNativeFile(name, size),
  progress,
  state,
})

const setInputFiles = (input: HTMLInputElement, files: readonly File[]): void => {
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: files,
  })
}

describe('OUpload helpers', () => {
  it('keeps public vocabularies and helpers stable', () => {
    const uploadFile = createUploadFile('report', 'report.pdf', 1536, 'uploading', 0.4)
    const publicProps: OUploadProps = {
      files: [uploadFile],
      title: '选择文件',
      description: '拖拽到这里',
      dragTitle: '松开以上传',
      actionText: '继续添加',
      accept: '.pdf',
      multiple: true,
      disabled: false,
      maxCount: 4,
      empty: false,
      clearable: true,
    }
    const publicSlots: OUploadSlots = {
      icon: () => null,
      empty: () => null,
      file: ({ file }) => file.file.name,
    }
    const publicEmits: OUploadEmits = {
      select: [[uploadFile.file]],
      remove: [uploadFile],
      clear: [],
      dragChange: [true],
    }

    expect(oUploadFileStates).toEqual(['queued', 'uploading', 'success', 'error'])
    expect(oUploadProps.files.default()).toEqual([])
    expect('default' in oUploadProps.accept).toBe(false)
    expect(normalizeOUploadProgress(Number.NaN)).toBe(0)
    expect(normalizeOUploadProgress(-1)).toBe(0)
    expect(normalizeOUploadProgress(2)).toBe(1)
    expect(formatOUploadFileSize(512)).toBe('512 B')
    expect(formatOUploadFileSize(1536)).toBe('1.5 KiB')
    expect(formatOUploadFileSize(2 * 1024 * 1024)).toBe('2.0 MiB')
    expect(publicSlots.file?.({ file: uploadFile })).toBe('report.pdf')
    expect(publicEmits.select).toEqual([[uploadFile.file]])
    expect(publicProps.files).toHaveLength(1)
    expectTypeOf(publicProps.maxCount).toEqualTypeOf<number | undefined>()
  })
})

describe('OUpload', () => {
  it('renders click and drag selection semantics with an empty state', () => {
    const wrapper = mount(OUpload, {
      props: {
        accept: '.png,.jpg',
        multiple: true,
        title: '点击选择文件',
        description: '拖拽文件到这里，或点击选择',
        ariaLabel: '上传附件',
      },
    })
    const dropzone = wrapper.get('.o-upload__dropzone')
    const input = wrapper.get('input[type="file"]')

    expect(dropzone.attributes('role')).toBe('button')
    expect(dropzone.attributes('tabindex')).toBe('0')
    expect(dropzone.attributes('aria-label')).toBe('上传附件')
    expect(wrapper.get('.o-upload__title').text()).toBe('点击选择文件')
    expect(wrapper.get('.o-upload__description').text()).toBe('拖拽文件到这里，或点击选择')
    expect(input.attributes('accept')).toBe('.png,.jpg')
    expect(input.attributes('multiple')).toBeDefined()
    expect(wrapper.find('.o-upload__list').exists()).toBe(false)
  })

  it('emits selected files from the native input and resets the input value', async () => {
    const wrapper = mount(OUpload)
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

  it('emits dropped files and toggles the active drag state', async () => {
    const wrapper = mount(OUpload, {
      props: {
        dragTitle: '松开以上传',
      },
    })
    const files = [createNativeFile('drop.txt', 300)]
    const dropzone = wrapper.get('.o-upload__dropzone')
    const dataTransfer = { files }

    await dropzone.trigger('dragenter', { dataTransfer })

    expect(wrapper.classes()).toContain('is-dragging')
    expect(wrapper.get('.o-upload__title').text()).toBe('松开以上传')
    expect(wrapper.emitted('dragChange')).toEqual([[true]])

    await dropzone.trigger('drop', { dataTransfer })

    expect(wrapper.classes()).not.toContain('is-dragging')
    expect(wrapper.emitted('select')).toEqual([[files]])
    expect(wrapper.emitted('dragChange')).toEqual([[true], [false]])
  })

  it('renders upload rows with progress, state labels, remove, and clear actions', async () => {
    const files = [
      createUploadFile('queued', 'queued.txt', 512, 'queued'),
      createUploadFile('uploading', 'uploading.mov', 2 * 1024 * 1024, 'uploading', 0.42),
      createUploadFile('success', 'success.zip', 1024, 'success', 1),
      createUploadFile('error', 'error.png', 1536, 'error', 0.25),
    ]
    const wrapper = mount(OUpload, {
      props: {
        files,
        clearable: true,
      },
    })

    expect(wrapper.find('.o-upload__empty').exists()).toBe(false)
    expect(wrapper.get('.o-upload__list').attributes('aria-label')).toBe('Selected files')
    expect(wrapper.findAll('.o-upload__file')).toHaveLength(4)
    expect(wrapper.get('[data-upload-file-id="uploading"]').text()).toContain('uploading.mov')
    expect(wrapper.get('[data-upload-file-id="uploading"]').text()).toContain('2.0 MiB')
    expect(wrapper.get('[data-upload-file-id="uploading"]').text()).toContain('42%')
    expect(wrapper.get('[data-upload-file-id="success"]').text()).toContain('已完成')
    expect(wrapper.get('[data-upload-file-id="error"]').text()).toContain('上传失败')
    expect(
      wrapper.get('[data-upload-file-id="uploading"] .o-upload__file-progress').attributes(),
    ).toMatchObject({
      'aria-valuenow': '42',
      role: 'progressbar',
    })

    await wrapper.get('[aria-label="移除 uploading.mov"]').trigger('click')
    await wrapper.get('.o-upload__clear').trigger('click')

    expect(wrapper.emitted('remove')).toEqual([[files[1]]])
    expect(wrapper.emitted('clear')).toEqual([[]])
  })

  it('limits selectable files with maxCount while keeping existing controlled files', async () => {
    const wrapper = mount(OUpload, {
      props: {
        files: [createUploadFile('existing', 'existing.txt', 100)],
        maxCount: 2,
        multiple: true,
      },
    })
    const nativeFiles = [
      createNativeFile('first.txt', 100),
      createNativeFile('second.txt', 200),
      createNativeFile('third.txt', 300),
    ]
    const input = wrapper.get('input[type="file"]')

    setInputFiles(input.element as HTMLInputElement, nativeFiles)
    await input.trigger('change')

    expect(wrapper.emitted('select')).toEqual([[[nativeFiles[0]]]])
  })

  it('suppresses selection and controls while disabled', async () => {
    const file = createUploadFile('disabled', 'disabled.txt', 128)
    const wrapper = mount(OUpload, {
      props: {
        disabled: true,
        files: [file],
        clearable: true,
      },
    })
    const input = wrapper.get('input[type="file"]')
    const dropzone = wrapper.get('.o-upload__dropzone')

    setInputFiles(input.element as HTMLInputElement, [file.file])
    await input.trigger('change')
    await dropzone.trigger('dragenter', { dataTransfer: { files: [file.file] } })
    await dropzone.trigger('drop', { dataTransfer: { files: [file.file] } })

    expect(dropzone.attributes('aria-disabled')).toBe('true')
    expect(dropzone.attributes('tabindex')).toBe('-1')
    expect(input.attributes('disabled')).toBeDefined()
    expect(wrapper.find('[aria-label="移除 disabled.txt"]').exists()).toBe(false)
    expect(wrapper.find('.o-upload__clear').exists()).toBe(false)
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('dragChange')).toBeUndefined()
  })

  it('renders on the server without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OUpload, {
            files: [createUploadFile('ssr', 'ssr.txt', 1024, 'success', 1)],
            ariaLabel: 'Upload files',
          }),
      }),
    )

    expect(html).toContain('class="o-upload')
    expect(html).toContain('aria-label="Upload files"')
    expect(html).toContain('ssr.txt')
    expect(html).toContain('已完成')
  })
})
