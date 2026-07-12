import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { createSSRApp, h, nextTick } from 'vue'
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

const imageSource = readFileSync(resolve('packages/ui/src/components/image/src/OImage.vue'), 'utf8')
const imageStyleSource = readFileSync(
  resolve('packages/ui/src/components/image/style/index.less'),
  'utf8',
)

const findPreviewLayer = (): HTMLElement | null =>
  document.body.querySelector('.o-image__preview-mask')
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
    expect('closeAriaLabel' in oImageProps).toBe(false)
    expect(publicEmits.load).toEqual([event])
    expectTypeOf(publicProps.fit).toEqualTypeOf<OImageFit | undefined>()
  })

  it('owns a Teleport preview without Dialog or a zoom badge dependency', () => {
    expect(imageSource).toContain('<Teleport')
    expect(imageSource).not.toContain("from '../../dialog'")
    expect(imageSource).not.toContain('<ODialog')
    expect(imageSource).not.toContain('LuZoomIn')
    expect(imageSource).not.toContain('o-image__preview-icon')
  })

  it('locks document scrolling while the teleported preview layer exists', () => {
    expect(imageStyleSource).toMatch(
      /html:has\(\.o-image__preview-mask\)\s*\{[^}]*overflow:\s*hidden;/su,
    )
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
    expect(wrapper.find('.o-image__preview-icon').exists()).toBe(false)
    expect(findPreviewLayer()).toBeNull()
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

  it('opens a focused modal preview with the high-resolution source', async () => {
    const wrapper = mount(OImage, {
      attachTo: document.body,
      props: {
        src: '/photo.jpg',
        alt: 'Gallery photo',
        previewSrc: '/photo-large.jpg',
        previewAriaLabel: 'Preview gallery photo',
      },
    })
    const trigger = wrapper.get<HTMLButtonElement>('button.o-image__trigger')

    trigger.element.focus()
    await trigger.trigger('click')
    await nextTick()

    const layer = findPreviewLayer()
    const previewImage = findPreviewImage()

    expect(wrapper.classes()).toContain('is-previewing')
    expect(layer?.getAttribute('role')).toBe('dialog')
    expect(layer?.getAttribute('aria-modal')).toBe('true')
    expect(layer?.getAttribute('aria-label')).toBe('Preview gallery photo')
    expect(layer?.getAttribute('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(layer)
    expect(previewImage?.getAttribute('src')).toBe('/photo-large.jpg')
    expect(previewImage?.getAttribute('alt')).toBe('Gallery photo')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('previewOpen')).toEqual([[]])

    await trigger.trigger('click')
    expect(wrapper.emitted('previewOpen')).toEqual([[]])

    wrapper.unmount()
  })

  it('closes only from the backdrop and restores trigger focus', async () => {
    const wrapper = mount(OImage, {
      attachTo: document.body,
      props: {
        src: '/photo.jpg',
        alt: 'Gallery photo',
      },
    })
    const trigger = wrapper.get<HTMLButtonElement>('button.o-image__trigger')

    trigger.element.focus()
    await trigger.trigger('click')
    findPreviewLayer()?.click()
    await nextTick()

    expect(findPreviewLayer()).toBeNull()
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger.element)
    expect(wrapper.emitted('previewClose')).toEqual([[]])

    wrapper.unmount()
  })

  it('keeps the preview open when its image is clicked', async () => {
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

    expect(findPreviewLayer()).not.toBeNull()
    expect(wrapper.emitted('previewClose')).toBeUndefined()

    wrapper.unmount()
  })

  it('closes with Escape, restores focus, and emits one close transition', async () => {
    const wrapper = mount(OImage, {
      attachTo: document.body,
      props: {
        src: '/photo.jpg',
        alt: 'Gallery photo',
      },
    })
    const trigger = wrapper.get<HTMLButtonElement>('button.o-image__trigger')

    trigger.element.focus()
    await trigger.trigger('click')
    const layer = findPreviewLayer()!
    layer.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    await nextTick()

    expect(findPreviewLayer()).toBeNull()
    expect(document.activeElement).toBe(trigger.element)
    expect(wrapper.emitted('previewClose')).toEqual([[]])

    await wrapper.setProps({ disabled: true })
    expect(wrapper.emitted('previewClose')).toEqual([[]])

    wrapper.unmount()
  })

  it('keeps keyboard focus inside the open preview layer', async () => {
    const wrapper = mount(OImage, {
      attachTo: document.body,
      props: {
        src: '/photo.jpg',
        alt: 'Gallery photo',
      },
    })

    await wrapper.get('button.o-image__trigger').trigger('click')
    const layer = findPreviewLayer()!
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    })
    layer.dispatchEvent(tabEvent)

    expect(tabEvent.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(layer)

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

    expect(findPreviewLayer()).toBeNull()
    expect(disabled.emitted('previewOpen')).toBeUndefined()
    expect(previewOff.emitted('previewOpen')).toBeUndefined()
  })

  it('closes an active preview once when previewing becomes unavailable', async () => {
    const wrapper = mount(OImage, {
      attachTo: document.body,
      props: {
        src: '/photo.jpg',
        alt: 'Gallery photo',
      },
    })

    await wrapper.get('button.o-image__trigger').trigger('click')
    await wrapper.setProps({ disabled: true })
    await wrapper.setProps({ preview: false })
    await nextTick()

    expect(findPreviewLayer()).toBeNull()
    expect(wrapper.emitted('previewClose')).toEqual([[]])
    expect(wrapper.find('button.o-image__trigger').exists()).toBe(false)

    wrapper.unmount()
  })

  it('renders on the server without DOM globals or preview markup', async () => {
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
    expect(html).not.toContain('o-image__preview-mask')
    expect(html).not.toContain('<dialog')
  })
})
