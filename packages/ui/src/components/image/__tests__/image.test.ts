import { createSSRApp, nextTick, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, expectTypeOf, it } from 'vitest'

import {
  OImage,
  oImageFits,
  oImageProps,
  type OImageEmits,
  type OImageFit,
  type OImageProps,
} from '../index'

const findPreviewMask = (): HTMLElement | null =>
  document.body.querySelector('.o-image__preview-mask')
const findPreviewDialog = (): HTMLElement | null =>
  document.body.querySelector('.o-image__preview-dialog')
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
    expect(publicEmits.load).toEqual([event])
    expectTypeOf(publicProps.fit).toEqualTypeOf<OImageFit | undefined>()
  })

  it('renders native image semantics with safe defaults', () => {
    const wrapper = mount(OImage, {
      props: {
        src: '/photo.jpg',
        alt: 'Gallery photo',
      },
    })
    const image = wrapper.get('img')

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['o-image', 'o-image--contain']))
    expect(image.attributes('src')).toBe('/photo.jpg')
    expect(image.attributes('alt')).toBe('Gallery photo')
    expect(image.attributes('draggable')).toBe('false')
    expect(wrapper.find('.o-image__preview-mask').exists()).toBe(false)
  })

  it('applies fit, width, height, and loading attributes to the image', () => {
    const wrapper = mount(OImage, {
      props: {
        src: '/wide.jpg',
        alt: '',
        fit: 'cover',
        width: '320px',
        height: 180,
        loading: 'lazy',
      },
    })
    const image = wrapper.get('img')
    const element = image.element as HTMLImageElement

    expect(wrapper.classes()).toContain('o-image--cover')
    expect(image.attributes('loading')).toBe('lazy')
    expect(element.style.width).toBe('320px')
    expect(element.style.height).toBe('180px')
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
      },
    })

    await wrapper.get('img').trigger('click')

    const mask = findPreviewMask()
    const dialog = findPreviewDialog()
    const previewImage = findPreviewImage()

    expect(wrapper.classes()).toContain('is-previewing')
    expect(mask?.getAttribute('role')).toBe('presentation')
    expect(dialog?.getAttribute('role')).toBe('dialog')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(previewImage?.getAttribute('src')).toBe('/photo-large.jpg')
    expect(previewImage?.getAttribute('alt')).toBe('Gallery photo')
    expect(wrapper.emitted('previewOpen')).toEqual([[]])

    wrapper.unmount()
  })

  it('closes the preview when the mask is clicked', async () => {
    const wrapper = mount(OImage, {
      attachTo: document.body,
      props: {
        src: '/photo.jpg',
        alt: 'Gallery photo',
      },
    })

    await wrapper.get('img').trigger('click')
    findPreviewMask()?.click()
    await nextTick()

    expect(findPreviewMask()).toBeNull()
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

    await wrapper.get('img').trigger('click')
    findPreviewImage()?.click()
    await nextTick()

    expect(findPreviewMask()).not.toBeNull()

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

    await wrapper.get('img').trigger('click')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(findPreviewMask()).toBeNull()
    expect(wrapper.emitted('previewClose')).toEqual([[]])

    wrapper.unmount()
  })

  it('does not open the preview while disabled or preview is off', async () => {
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

    await disabled.get('img').trigger('click')
    await previewOff.get('img').trigger('click')

    expect(findPreviewMask()).toBeNull()
    expect(disabled.emitted('previewOpen')).toBeUndefined()
    expect(previewOff.emitted('previewOpen')).toBeUndefined()
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
    expect(html).toContain('src="/photo.jpg"')
    expect(html).toContain('alt="Gallery photo"')
    expect(html).not.toContain('o-image__preview-mask')
  })
})
