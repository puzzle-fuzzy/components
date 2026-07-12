import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'

import { ODialog } from '../../dialog'
import {
  OImage,
  oImageFits,
  oImageProps,
  type OImageEmits,
  type OImageFit,
  type OImageProps,
} from '../index'

const imageSource = readFileSync(resolve('packages/ui/src/components/image/src/OImage.vue'), 'utf8')

const showModal = vi.fn(function (this: HTMLDialogElement): void {
  this.setAttribute('open', '')
})
const closeDialog = vi.fn(function (this: HTMLDialogElement): void {
  this.removeAttribute('open')
  this.dispatchEvent(new Event('close'))
})

let showModalDescriptor: PropertyDescriptor | undefined
let closeDescriptor: PropertyDescriptor | undefined

beforeEach(() => {
  showModalDescriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal')
  closeDescriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close')
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: showModal,
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: closeDialog,
  })
  showModal.mockClear()
  closeDialog.mockClear()
})

afterEach(() => {
  if (showModalDescriptor) {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', showModalDescriptor)
  } else {
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
  }
  if (closeDescriptor) {
    Object.defineProperty(HTMLDialogElement.prototype, 'close', closeDescriptor)
  } else {
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
  }
})

const findPreviewDialog = (): HTMLDialogElement | null =>
  document.body.querySelector('dialog.o-image__preview-dialog')
const findPreviewImage = (): HTMLImageElement | null =>
  document.body.querySelector('.o-image__preview-image')

describe('OImage', () => {
  it('keeps public vocabularies and types aligned with runtime validation', () => {
    const publicProps: OImageProps = {
      src: '/photo.jpg',
      alt: 'Gallery photo',
      previewSrc: '/photo-large.jpg',
      fit: 'cover',
      width: '320px',
      height: 180,
      preview: true,
      previewAriaLabel: 'Preview gallery photo',
      closeAriaLabel: 'Close gallery preview',
      disabled: false,
    }
    const event = new Event('load')
    const publicEmits: OImageEmits = {
      load: [event],
      error: [event],
      previewOpen: [],
      previewClose: [],
    }

    expect(oImageFits).toEqual(['contain', 'cover', 'fill', 'none', 'scale-down'])
    expect(oImageProps.fit.validator(publicProps.fit)).toBe(true)
    expect(oImageProps.fit.validator('stretch')).toBe(false)
    expect(oImageProps.preview.default).toBe(true)
    expect(oImageProps.previewAriaLabel.default).toBe('Preview image')
    expect(oImageProps.closeAriaLabel.default).toBe('Close image preview')
    expect(publicEmits.load).toEqual([event])
    expectTypeOf(publicProps.fit).toEqualTypeOf<OImageFit | undefined>()
  })

  it('renders a native preview button with an explicit accessible name', () => {
    const wrapper = mount(OImage, {
      props: {
        src: '/photo.jpg',
        alt: 'Gallery photo',
        previewAriaLabel: 'Preview gallery photo',
      },
    })
    const image = wrapper.get('img')
    const trigger = wrapper.get('button.o-image__trigger')

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['o-image', 'o-image--contain']))
    expect(trigger.attributes()).toMatchObject({
      'aria-expanded': 'false',
      'aria-haspopup': 'dialog',
      'aria-label': 'Preview gallery photo',
      type: 'button',
    })
    expect(image.attributes('src')).toBe('/photo.jpg')
    expect(image.attributes('alt')).toBe('Gallery photo')
    expect(image.attributes('draggable')).toBe('false')
    expect(wrapper.get('.o-image__preview-icon').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('.o-image__preview-icon').element.tagName.toLowerCase()).toBe('svg')
    expect(wrapper.get('dialog').attributes('open')).toBeUndefined()
  })

  it('uses the standard Lucide preview affordance', () => {
    expect(imageSource).toContain("import { LuZoomIn } from 'vue-icons-plus/lu'")
    expect(imageSource).toContain('<LuZoomIn')
    expect(imageSource).not.toContain('<svg')
  })

  it('forwards native image attributes and uses numeric dimensions as native attributes', () => {
    const wrapper = mount(OImage, {
      attrs: {
        decoding: 'async',
        'data-image-id': 'hero',
      },
      props: {
        src: '/wide.jpg',
        alt: '',
        fit: 'cover',
        width: 320,
        height: 180,
        loading: 'lazy',
      },
    })
    const image = wrapper.get('img')
    const element = image.element as HTMLImageElement

    expect(wrapper.classes()).toContain('o-image--cover')
    expect(image.attributes('loading')).toBe('lazy')
    expect(image.attributes('decoding')).toBe('async')
    expect(image.attributes('data-image-id')).toBe('hero')
    expect(image.attributes('width')).toBe('320')
    expect(image.attributes('height')).toBe('180')
    expect(wrapper.attributes('data-image-id')).toBeUndefined()
    expect(element.style.width).toBe('320px')
    expect(element.style.height).toBe('180px')
  })

  it('keeps CSS dimensions out of invalid native width and height attributes', () => {
    const wrapper = mount(OImage, {
      props: {
        src: '/wide.jpg',
        alt: 'Wide photo',
        width: '50%',
        height: 'auto',
      },
    })
    const image = wrapper.get('img')

    expect(image.attributes('width')).toBeUndefined()
    expect(image.attributes('height')).toBeUndefined()
    expect((image.element as HTMLImageElement).style.width).toBe('50%')
    expect((image.element as HTMLImageElement).style.height).toBe('auto')
  })

  it('emits load and error events from the native image', async () => {
    const wrapper = mount(OImage, {
      props: {
        src: '/photo.jpg',
        alt: 'Gallery photo',
      },
    })
    const image = wrapper.get('img')

    await image.trigger('load')
    await image.trigger('error')

    expect(wrapper.emitted('load')?.[0]?.[0]).toBeInstanceOf(Event)
    expect(wrapper.emitted('error')?.[0]?.[0]).toBeInstanceOf(Event)
  })

  it('opens a fullscreen preview when the image is clicked', async () => {
    const wrapper = mount(OImage, {
      attachTo: document.body,
      props: {
        src: '/photo.jpg',
        alt: 'Gallery photo',
        previewSrc: '/photo-large.jpg',
        previewAriaLabel: 'Preview gallery photo',
        closeAriaLabel: 'Close gallery preview',
      },
    })

    await wrapper.get('button.o-image__trigger').trigger('click')
    await nextTick()

    const dialog = findPreviewDialog()
    const previewImage = findPreviewImage()
    const dialogComponent = wrapper.getComponent(ODialog)

    expect(wrapper.classes()).toContain('is-previewing')
    expect(dialog?.open).toBe(true)
    expect(dialog?.getAttribute('aria-label')).toBe('Preview gallery photo')
    expect(dialog?.classList.contains('o-image__preview-dialog')).toBe(true)
    expect(dialogComponent.props()).toMatchObject({
      closeAriaLabel: 'Close gallery preview',
      closeOnEsc: true,
      closeOnMask: true,
      showClose: false,
    })
    expect(previewImage?.getAttribute('src')).toBe('/photo-large.jpg')
    expect(previewImage?.getAttribute('alt')).toBe('Gallery photo')
    expect(wrapper.get('button.o-image__trigger').attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('previewOpen')).toEqual([[]])

    wrapper.unmount()
  })

  it('closes the preview through the backdrop click', async () => {
    const wrapper = mount(OImage, {
      attachTo: document.body,
      props: {
        src: '/photo.jpg',
        alt: 'Gallery photo',
      },
    })

    await wrapper.get('button.o-image__trigger').trigger('click')
    const dialog = findPreviewDialog()!
    dialog.dispatchEvent(new MouseEvent('click', { clientX: 9999, clientY: 9999, bubbles: true }))
    await nextTick()

    expect(findPreviewDialog()?.open).toBe(false)
    expect(wrapper.emitted('previewClose')).toEqual([[]])

    wrapper.unmount()
  })

  it('does not close when the preview image itself is clicked', async () => {
    const wrapper = mount(OImage, {
      attachTo: document.body,
      props: {
        src: '/photo.jpg',
        alt: 'Gallery photo',
      },
    })

    await wrapper.get('button.o-image__trigger').trigger('click')
    findPreviewImage()?.click()
    await nextTick()

    expect(findPreviewDialog()?.open).toBe(true)

    wrapper.unmount()
  })

  it('closes the preview with Escape', async () => {
    const wrapper = mount(OImage, {
      attachTo: document.body,
      props: {
        src: '/photo.jpg',
        alt: 'Gallery photo',
      },
    })

    await wrapper.get('button.o-image__trigger').trigger('click')
    findPreviewDialog()?.dispatchEvent(new Event('cancel', { cancelable: true }))
    await nextTick()

    expect(findPreviewDialog()?.open).toBe(false)
    expect(wrapper.emitted('previewClose')).toEqual([[]])

    wrapper.unmount()
  })

  it('uses a disabled native button and a plain image when preview is off', async () => {
    const disabled = mount(OImage, {
      props: {
        src: '/photo.jpg',
        alt: 'Gallery photo',
        disabled: true,
      },
    })
    const previewOff = mount(OImage, {
      props: {
        src: '/photo.jpg',
        alt: 'Gallery photo',
        preview: false,
      },
    })

    expect(disabled.get('button.o-image__trigger').attributes('disabled')).toBeDefined()
    expect(previewOff.find('button.o-image__trigger').exists()).toBe(false)

    await disabled.get('button.o-image__trigger').trigger('click')
    await previewOff.get('img').trigger('click')

    expect(disabled.get('dialog').attributes('open')).toBeUndefined()
    expect(previewOff.get('dialog').attributes('open')).toBeUndefined()
    expect(disabled.emitted('previewOpen')).toBeUndefined()
    expect(previewOff.emitted('previewOpen')).toBeUndefined()
  })

  it('closes an active preview when it becomes disabled', async () => {
    const wrapper = mount(OImage, {
      attachTo: document.body,
      props: {
        src: '/photo.jpg',
        alt: 'Gallery photo',
      },
    })

    await wrapper.get('button.o-image__trigger').trigger('click')
    await wrapper.setProps({ disabled: true })
    await nextTick()

    expect(findPreviewDialog()?.open).toBe(false)
    expect(wrapper.emitted('previewClose')).toEqual([[]])
    expect(wrapper.get('button.o-image__trigger').attributes('disabled')).toBeDefined()

    wrapper.unmount()
  })

  it('renders on the server without DOM globals', async () => {
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
    expect(html).toContain('type="button"')
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).toContain('src="/photo.jpg"')
    expect(html).toContain('alt="Gallery photo"')
    expect(html).toContain('<dialog')
    expect(html).not.toContain(' open')
  })
})
