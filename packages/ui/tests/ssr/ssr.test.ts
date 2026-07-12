import { renderToString, type SSRContext } from '@vue/server-renderer'
import { createSSRApp, h, nextTick, type VNode } from 'vue'
import { describe, expect, test, vi } from 'vitest'

import {
  OAvatar,
  OAvatarDropdown,
  OAvatarFlow,
  OAvatarGroup,
  OButton,
  OCheckbox,
  OCodeInput,
  OConfirmDialog,
  ODialog,
  ODivider,
  ODropdown,
  OFormDialog,
  OImage,
  OInput,
  ORadio,
  ORadioGroup,
  OReferenceTextarea,
  OSelect,
  OTabs,
  OTextarea,
  OUpload,
  type OAvatarFlowPeer,
  type OAvatarGroupItem,
  type ODropdownItem,
  type OSelectOption,
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

const dropdownItems: readonly ODropdownItem[] = [{ value: 'profile', label: 'Profile' }]

const selectOptions: readonly OSelectOption[] = [{ value: 1, label: 'One' }]

const virtualSelectOptions: readonly OSelectOption[] = Array.from({ length: 120 }, (_, index) => ({
  value: index,
  label: `Virtual option ${String(index + 1)}`,
}))

const openFloatingHydrationCases: readonly {
  name: string
  role: 'listbox' | 'menu'
  render: () => VNode
}[] = [
  {
    name: 'ODropdown',
    role: 'menu',
    render: () =>
      h(
        ODropdown,
        { items: dropdownItems, open: true, triggerAriaLabel: 'Hydration menu' },
        { trigger: () => 'Account' },
      ),
  },
  {
    name: 'OSelect',
    role: 'listbox',
    render: () => h(OSelect, { modelValue: 1, open: true, options: selectOptions }),
  },
  {
    name: 'OAvatarDropdown',
    role: 'menu',
    render: () =>
      h(OAvatarDropdown, {
        ariaLabel: 'Hydration avatar menu',
        items: dropdownItems,
        name: 'OMG UI',
        open: true,
      }),
  },
]

const uploadFiles: readonly OUploadFile[] = [
  {
    id: 'upload',
    name: 'upload.txt',
    size: 6,
    progress: 1,
    state: 'success',
  },
]

const tabItems: readonly OTabsItem[] = [
  { value: 'text', label: '传输文本' },
  { value: 'file', label: '传输文件' },
]

describe('server rendering', () => {
  test.each(openFloatingHydrationCases)(
    'hydrates an initially open $name without duplicate floating content',
    async ({ render, role }) => {
      const Root = { render }
      const serverContext: SSRContext = {}
      const html = await renderToString(createSSRApp(Root), serverContext)
      const teleportedHtml = serverContext.teleports?.body ?? ''

      expect(html).toContain(`role="${role}"`)
      expect(teleportedHtml).not.toContain(`role="${role}"`)

      const container = document.createElement('div')
      container.innerHTML = html
      document.body.append(container)
      if (teleportedHtml) document.body.insertAdjacentHTML('beforeend', teleportedHtml)

      const hydrationMessages: string[] = []
      const recordHydrationMessage = (...messages: unknown[]): void => {
        hydrationMessages.push(messages.map(String).join(' '))
      }
      const warn = vi.spyOn(console, 'warn').mockImplementation(recordHydrationMessage)
      const error = vi.spyOn(console, 'error').mockImplementation(recordHydrationMessage)
      const app = createSSRApp(Root)

      try {
        app.mount(container)
        await nextTick()
        await nextTick()

        const panels = document.body.querySelectorAll<HTMLElement>(`[role="${role}"]`)
        expect(panels).toHaveLength(1)
        expect(panels[0]?.parentElement).toBe(document.body)

        const panelId = panels[0]?.id
        expect(panelId).toBeTruthy()
        expect(document.querySelectorAll(`[id="${panelId}"]`)).toHaveLength(1)
        expect(hydrationMessages.filter((message) => /hydration|mismatch/iu.test(message))).toEqual(
          [],
        )
      } finally {
        app.unmount()
        warn.mockRestore()
        error.mockRestore()
        document.body.replaceChildren()
      }
    },
  )

  test('hydrates an initially open ODialog with stable labels and one native surface', async () => {
    const Root = {
      render: () => h(ODialog, { open: true, title: 'Hydration dialog' }, () => 'Body'),
    }
    const html = await renderToString(createSSRApp(Root))
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.append(container)

    const serverDialog = container.querySelector<HTMLDialogElement>('.o-dialog')
    const serverLabelId = serverDialog?.getAttribute('aria-labelledby')
    expect(serverLabelId).toBeTruthy()
    expect(container.querySelector(`#${serverLabelId}`)?.textContent).toBe('Hydration dialog')
    expect(serverDialog?.hasAttribute('open')).toBe(false)

    const originalShowModal = Object.getOwnPropertyDescriptor(
      HTMLDialogElement.prototype,
      'showModal',
    )
    const showModal = vi.fn(function (this: HTMLDialogElement): void {
      this.setAttribute('open', '')
    })
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: showModal,
    })

    const hydrationMessages: string[] = []
    const recordHydrationMessage = (...messages: unknown[]): void => {
      hydrationMessages.push(messages.map(String).join(' '))
    }
    const warn = vi.spyOn(console, 'warn').mockImplementation(recordHydrationMessage)
    const error = vi.spyOn(console, 'error').mockImplementation(recordHydrationMessage)
    const app = createSSRApp(Root)

    try {
      app.mount(container)
      await nextTick()

      const hydratedDialogs = container.querySelectorAll<HTMLDialogElement>('.o-dialog')
      expect(hydratedDialogs).toHaveLength(1)
      expect(hydratedDialogs[0]?.open).toBe(true)
      expect(hydratedDialogs[0]?.getAttribute('aria-labelledby')).toBe(serverLabelId)
      expect(showModal).toHaveBeenCalledOnce()
      expect(hydrationMessages.filter((message) => /hydration|mismatch/iu.test(message))).toEqual(
        [],
      )
    } finally {
      app.unmount()
      warn.mockRestore()
      error.mockRestore()
      document.body.replaceChildren()
      if (originalShowModal) {
        Object.defineProperty(HTMLDialogElement.prototype, 'showModal', originalShowModal)
      } else {
        Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
      }
    }
  })

  test('renders OButton without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(OButton, null, { default: () => 'Save' }),
      }),
    )

    expect(html).toContain('class="o-button')
    expect(html).toContain('type="button"')
  })

  test('renders an accessibly named icon-only OButton without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(
            OButton,
            { iconOnly: true, 'aria-label': 'Settings' },
            { icon: () => h('span', { class: 'test-icon' }) },
          ),
      }),
    )

    expect(html).toContain('o-button--icon-only')
    expect(html).toContain('aria-label="Settings"')
    expect(html).toContain('aria-hidden="true"')
  })

  test('renders OInput controls and standard icons without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OInput, {
            modelValue: 'secret',
            type: 'password',
            clearable: true,
            showPassword: true,
            ariaLabel: 'Password',
          }),
      }),
    )

    expect(html).toContain('class="o-input')
    expect(html).toContain('type="password"')
    expect(html).toContain('aria-label="Password"')
    expect(html).toContain('o-input__clear')
    expect(html).toContain('o-input__password-toggle')
  })

  test('renders OCheckbox with stable native label association without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(OCheckbox, { modelValue: true, label: 'Accept terms' }),
      }),
    )
    const container = document.createElement('div')
    container.innerHTML = html
    const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]')
    const label = container.querySelector<HTMLLabelElement>('label')

    expect(input?.id).toBeTruthy()
    expect(input?.checked).toBe(true)
    expect(input?.getAttribute('aria-checked')).toBe('true')
    expect(label?.htmlFor).toBe(input?.id)
    expect(label?.textContent).toContain('Accept terms')
  })

  test('renders ORadioGroup with shared native names and numeric values without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(
            ORadioGroup,
            { modelValue: 2, ariaLabel: 'Density', orientation: 'horizontal' },
            {
              default: () => [
                h(ORadio, { value: 1, label: 'Compact' }),
                h(ORadio, { value: 2, label: 'Comfortable' }),
              ],
            },
          ),
      }),
    )
    const container = document.createElement('div')
    container.innerHTML = html
    const group = container.querySelector('[role="radiogroup"]')
    const radios = [...container.querySelectorAll<HTMLInputElement>('input[type="radio"]')]

    expect(group?.getAttribute('aria-label')).toBe('Density')
    expect(group?.getAttribute('aria-orientation')).toBe('horizontal')
    expect(radios).toHaveLength(2)
    expect(new Set(radios.map((radio) => radio.name)).size).toBe(1)
    expect(radios[0]?.checked).toBe(false)
    expect(radios[1]?.checked).toBe(true)
    expect(radios[1]?.value).toBe('2')
  })

  test('renders OConfirmDialog composition without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(
            OConfirmDialog,
            {
              open: false,
              title: 'Delete record',
              tone: 'danger',
              confirmLabel: 'Delete',
              cancelLabel: 'Keep',
            },
            { default: () => 'This action cannot be undone.' },
          ),
      }),
    )

    expect(html).toContain('o-confirm-dialog--danger')
    expect(html).toContain('o-dialog')
    expect(html).toContain('Delete record')
    expect(html).toContain('This action cannot be undone.')
    expect(html).toContain('>Keep<')
    expect(html).toContain('>Delete<')
  })

  test('renders OFormDialog with a stable external submit association without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(
            OFormDialog,
            { open: false, title: 'Edit profile', submitLabel: 'Save' },
            {
              default: () =>
                h(OInput, {
                  modelValue: 'OMG UI',
                  name: 'displayName',
                  ariaLabel: 'Display name',
                }),
            },
          ),
      }),
    )
    const container = document.createElement('div')
    container.innerHTML = html
    const form = container.querySelector<HTMLFormElement>('form.o-form-dialog__form')
    const submit = container.querySelector<HTMLButtonElement>('button[type="submit"]')

    expect(form?.id).toBeTruthy()
    expect(form?.querySelector('input[name="displayName"]')).not.toBeNull()
    expect(submit?.getAttribute('form')).toBe(form?.id)
    expect(submit?.textContent).toContain('Save')
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

  test('renders OAvatarDropdown without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OAvatarDropdown, {
            ariaLabel: 'Avatar menu',
            items: dropdownItems,
            name: 'OMG UI',
          }),
      }),
    )

    expect(html).toContain('aria-label="Avatar menu"')
    expect(html).toContain('aria-haspopup="menu"')
    expect(html).toContain('class="o-avatar')
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

  test('renders a closed native ODialog surface without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(ODialog, { open: false, title: '收到文本' }, () => '正文'),
      }),
    )

    expect(html).toContain('<dialog')
    expect(html).toContain('class="o-dialog')
    expect(html).not.toContain(' open')
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

  test('renders ODropdown without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(
            ODropdown,
            { items: dropdownItems, triggerAriaLabel: 'Account menu' },
            { trigger: () => 'Account' },
          ),
      }),
    )

    expect(html).toContain('aria-haspopup="menu"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('Account')
  })

  test('renders OSelect without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OSelect, {
            ariaLabel: 'Number',
            modelValue: 1,
            options: selectOptions,
          }),
      }),
    )

    expect(html).toContain('role="combobox"')
    expect(html).toContain('aria-label="Number"')
    expect(html).toContain('One')
  })

  test('prerenders a bounded virtual OSelect window without DOM globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(OSelect, {
            modelValue: 0,
            open: true,
            options: virtualSelectOptions,
            teleported: false,
            virtual: true,
            virtualThreshold: 20,
            virtualListHeight: 144,
            ariaLabel: 'Virtual number',
          }),
      }),
    )
    const container = document.createElement('div')
    container.innerHTML = html
    const options = container.querySelectorAll('[role="option"]')

    expect(container.querySelector('.o-select__virtual-list')).not.toBeNull()
    expect(options.length).toBeGreaterThan(0)
    expect(options.length).toBeLessThan(virtualSelectOptions.length)
    expect(options[0]?.getAttribute('aria-setsize')).toBe('120')
    expect(options[0]?.textContent).toContain('Virtual option 1')
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
            modelValue: 'SSR',
            ariaLabel: '消息',
            references: [{ id: 'one', label: 'Yxswy' }],
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
            'aria-label': 'Upload files',
            files: uploadFiles,
            labels: { success: '已完成' },
          }),
      }),
    )

    expect(html).toContain('class="o-upload')
    expect(html).toContain('aria-label="Upload files"')
    expect(html).toContain('upload.txt')
    expect(html).toContain('已完成')
  })
})
