import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { build } from 'vite'

type Rgb = readonly [number, number, number]

const parseRgb = (value: string): Rgb => {
  const channels = value
    .match(/\d+(?:\.\d+)?/gu)
    ?.slice(0, 3)
    .map(Number)
  if (!channels || channels.length !== 3) {
    throw new Error('Expected an RGB color, received: ' + value)
  }

  return channels as unknown as Rgb
}

const relativeLuminance = ([red, green, blue]: Rgb): number => {
  const toLinear = (channel: number) => {
    const normalized = channel / 255
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue)
}

const contrastRatio = (first: string, second: string): number => {
  const lighter = Math.max(relativeLuminance(parseRgb(first)), relativeLuminance(parseRgb(second)))
  const darker = Math.min(relativeLuminance(parseRgb(first)), relativeLuminance(parseRgb(second)))
  return (lighter + 0.05) / (darker + 0.05)
}

const readCssColor = (locator: Locator, property: 'backgroundColor' | 'color' | 'outlineColor') =>
  locator.evaluate((element, name) => getComputedStyle(element)[name], property)

const readSurfaceSnapshot = (locator: Locator) =>
  locator.evaluate((element) => {
    const styles = getComputedStyle(element)
    return {
      background: styles.backgroundColor,
      inlineToken: (element as HTMLElement).style.getPropertyValue('--omg-color-surface'),
      token: styles.getPropertyValue('--omg-color-surface').trim(),
    }
  })

const expectNoSeriousAccessibilityViolations = async (
  page: Page,
  includes: readonly string[] = ['.omg-docs-demo'],
) => {
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  for (const selector of includes) builder = builder.include(selector)

  const results = await builder.analyze()
  const violations = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  )

  expect(violations).toEqual([])
}

const buildInlineDropdownFixture = async (): Promise<string> => {
  const entryId = 'virtual:omg-inline-dropdown-fixture'
  const uiEntry = new URL('../../../../packages/ui/dist/index.js', import.meta.url).href
  const source = `
    import { createApp, h, ref } from 'vue'
    import { ODropdown } from '${uiEntry}'

    const mountTarget = document.querySelector('.omg-docs-demo')
    if (!mountTarget) throw new Error('Expected a docs demo mount target')

    const host = document.createElement('div')
    host.id = 'inline-dropdown-fixture'
    mountTarget.append(host)

    const app = createApp({
      setup() {
        const selected = ref('Nothing selected')
        const items = [
          { value: 'profile', label: 'Inline profile' },
          { value: 'settings', label: 'Inline settings' },
        ]

        return () => h('div', { id: 'inline-dropdown-app' }, [
          h(
            ODropdown,
            {
              items,
              teleported: false,
              triggerAriaLabel: 'Open inline dropdown',
              onSelect: (_value, item) => {
                selected.value = item.label
              },
            },
            { trigger: () => 'Inline actions' },
          ),
          h('output', { id: 'inline-dropdown-feedback' }, 'Selected: ' + selected.value),
        ])
      },
    })
    app.config.idPrefix = 'inline-dropdown-'
    app.mount(host)
  `
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      minify: false,
      target: 'es2022',
      write: false,
      rollupOptions: { input: entryId },
    },
    plugins: [
      {
        name: 'omg-inline-dropdown-fixture',
        resolveId: (id) => (id === entryId ? id : null),
        load: (id) => (id === entryId ? source : null),
      },
    ],
  })
  const buildResults = Array.isArray(result) ? result : [result]
  const output = buildResults.flatMap((entry) => {
    if (!('output' in entry)) throw new Error('Expected a completed fixture build')
    return entry.output
  })
  const entryChunk = output.find((item) => item.type === 'chunk' && item.isEntry)
  if (!entryChunk || entryChunk.type !== 'chunk') {
    throw new Error('Expected an executable inline dropdown fixture')
  }

  return entryChunk.code
}

test('renders the built package examples and synchronizes theme state', async ({ page }) => {
  await page.goto('/components/button')

  await expect(page.getByRole('heading', { level: 1, name: 'Button 按钮' })).toBeVisible()
  const solidButton = page.getByRole('button', { name: 'Solid', exact: true })
  await expect(solidButton).toBeVisible()
  await expect(page.getByRole('button', { name: 'Saving' })).toBeDisabled()
  await expect(page.locator('.omg-example-theme[data-omg-theme="light"] .o-button')).toBeVisible()
  await expect(page.locator('.omg-example-theme[data-omg-theme="dark"] .o-button')).toBeVisible()

  const focusRing = await solidButton.evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--omg-color-focus-ring'),
  )
  const demoBackground = await readCssColor(
    page.locator('.omg-docs-demo').first(),
    'backgroundColor',
  )
  expect(contrastRatio(focusRing, demoBackground)).toBeGreaterThanOrEqual(3)

  const html = page.locator('html')
  await expect(html).toHaveAttribute('data-omg-theme', /^(light|dark)$/u)
  const initialTheme = await html.getAttribute('data-omg-theme')
  await page.locator('.VPSwitchAppearance:visible').click()
  await expect(html).not.toHaveAttribute('data-omg-theme', initialTheme ?? '')

  await expectNoSeriousAccessibilityViolations(page)
})

test('renders avatar semantics and status labels', async ({ page }) => {
  await page.goto('/components/avatar')

  await expect(page.getByRole('heading', { level: 1, name: 'Avatar 头像' })).toBeVisible()
  await expect(
    page
      .getByRole('region', { name: 'Avatar sizes and shapes' })
      .getByRole('img', { name: 'Yxswy' }),
  ).toBeVisible()
  await expect(page.getByText('在线', { exact: true })).toBeAttached()

  const onlineStatus = page.locator('.o-avatar__status--online').first()
  const statusSymbol = onlineStatus.locator('.o-avatar__status-symbol')
  expect(
    contrastRatio(
      await readCssColor(statusSymbol, 'color'),
      await readCssColor(onlineStatus, 'backgroundColor'),
    ),
  ).toBeGreaterThanOrEqual(3)

  await expectNoSeriousAccessibilityViolations(page)
})

test('renders avatar groups with stacking and overflow', async ({ page }) => {
  await page.goto('/components/avatar-group')

  await expect(page.getByRole('heading', { level: 1, name: 'Avatar Group 头像组' })).toBeVisible()
  const group = page.getByRole('group', { name: '五位项目成员，重叠十二像素', exact: true })
  await expect(group).toBeVisible()
  await expect(group.locator('[data-avatar-group-role="item"]')).toHaveCount(3)
  await expect(group.locator('[data-avatar-group-role="overflow"]')).toContainText('+2')
  await expect
    .poll(() =>
      group.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--omg-avatar-group-overlap').trim(),
      ),
    )
    .toBe('12px')

  await expectNoSeriousAccessibilityViolations(page)
})

test('renders three purposeful avatar flow visual states', async ({ page }) => {
  await page.goto('/components/avatar-flow')

  await expect(page.getByRole('heading', { level: 1, name: 'Avatar Flow 头像流' })).toBeVisible()
  for (const state of ['loading', 'connected', 'transferring']) {
    await expect(page.locator('.o-avatar-flow[data-state="' + state + '"]')).toBeVisible()
  }

  const loading = page.locator('.o-avatar-flow[data-state="loading"]')
  const connected = page.locator('.o-avatar-flow[data-state="connected"]')
  const transferring = page.locator('.o-avatar-flow[data-state="transferring"]')

  await expect(loading.locator('.o-avatar-flow__dot')).toHaveCount(3)
  await expect(loading.locator('.o-avatar-flow__dot').first()).not.toHaveCSS(
    'animation-name',
    'none',
  )
  const loadingTransforms = await loading
    .locator('.o-avatar-flow__dot')
    .first()
    .evaluate((element) => {
      const animation = element.getAnimations()[0]
      if (!animation) throw new Error('Expected the loading dot animation')

      const sampleTransform = (time: number) => {
        animation.currentTime = time
        const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform)

        return {
          scaleX: matrix.a,
          scaleY: matrix.d,
          translateX: matrix.e,
          translateY: matrix.f,
        }
      }

      animation.pause()
      return {
        start: sampleTransform(0),
        peak: sampleTransform(270),
      }
    })
  expect(loadingTransforms.start.translateX).toBeCloseTo(0)
  expect(loadingTransforms.start.translateY).toBeCloseTo(0)
  expect(loadingTransforms.peak.translateX).toBeCloseTo(0)
  expect(loadingTransforms.peak.translateY).toBeCloseTo(0)
  expect(loadingTransforms.peak.scaleX).toBeGreaterThan(loadingTransforms.start.scaleX)
  expect(loadingTransforms.peak.scaleY).toBeGreaterThan(loadingTransforms.start.scaleY)
  await expect(connected.locator('.o-avatar-flow__line')).toBeVisible()
  await expect(connected.locator('.o-avatar-flow__line')).toHaveCSS('animation-name', 'none')
  const dashLine = transferring.locator('.o-avatar-flow__dash-line')
  await expect(dashLine).toBeVisible()
  await expect(dashLine).not.toHaveCSS('animation-name', 'none')
  const [startPosition, middlePosition] = await dashLine.evaluate((element) => {
    const animation = element.getAnimations()[0]
    if (!animation) throw new Error('Expected the transfer dash animation')

    animation.pause()
    animation.currentTime = 0
    const start = Number.parseFloat(getComputedStyle(element).backgroundPositionX)
    animation.currentTime = 350
    const middle = Number.parseFloat(getComputedStyle(element).backgroundPositionX)

    return [start, middle]
  })
  expect(middlePosition).toBeGreaterThan(startPosition)

  await expectNoSeriousAccessibilityViolations(page)
})

test('supports dropdown pointer and keyboard interactions', async ({ page }) => {
  await page.goto('/components/dropdown')

  await expect(page.getByRole('heading', { level: 1, name: 'Dropdown 下拉菜单' })).toBeVisible()
  const trigger = page.getByRole('button', { name: '打开操作菜单', exact: true })
  await trigger.click()

  const menu = page.getByRole('menu', { name: '打开操作菜单' })
  const profileItem = page.getByRole('menuitem', { name: '个人资料' })
  const disabledItem = page.getByRole('menuitem', { name: '偏好设置（已停用）' })
  const signOutItem = page.getByRole('menuitem', { name: '退出示例' })
  await expect(menu).toBeVisible()
  await expect(disabledItem).toBeDisabled()
  await expectNoSeriousAccessibilityViolations(page, ['.omg-docs-demo', '.o-dropdown__panel'])

  await trigger.press('ArrowDown')
  await expect(profileItem).toBeFocused()
  await profileItem.press('ArrowDown')
  await expect(signOutItem).toBeFocused()
  await signOutItem.press('Enter')
  await expect(page.getByText('最近选择：退出示例', { exact: true })).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()

  await trigger.click()
  await expect(menu).toBeVisible()
  await page.getByRole('heading', { level: 1, name: 'Dropdown 下拉菜单' }).click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(menu).toBeHidden()

  await trigger.click()
  await trigger.press('ArrowDown')
  await expect(profileItem).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()
})

for (const openingCase of [
  {
    name: 'focuses the first enabled dropdown item after click opens a closed menu',
    shortcut: undefined,
    expectedItem: '个人资料',
  },
  {
    name: 'focuses the first enabled dropdown item after ArrowDown opens a closed menu',
    shortcut: 'ArrowDown',
    expectedItem: '个人资料',
  },
  {
    name: 'focuses the last enabled dropdown item after ArrowUp opens a closed menu',
    shortcut: 'ArrowUp',
    expectedItem: '退出示例',
  },
] as const) {
  test(openingCase.name, async ({ page }) => {
    await page.goto('/components/dropdown')

    const trigger = page.getByRole('button', { name: '打开操作菜单', exact: true })
    if (openingCase.shortcut) {
      await trigger.press(openingCase.shortcut)
    } else {
      await trigger.click()
    }

    await expect(page.getByRole('menu', { name: '打开操作菜单' })).toBeVisible()
    await expect(
      page.getByRole('menuitem', { name: openingCase.expectedItem, exact: true }),
    ).toBeFocused()
  })
}

for (const tabCase of [
  {
    name: 'moves focus after the dropdown root when tabbing forward from a menu item',
    shortcut: 'Tab',
    destination: 'After dropdown',
  },
  {
    name: 'moves focus before the dropdown root when tabbing backward from a menu item',
    shortcut: 'Shift+Tab',
    destination: 'Before dropdown',
  },
] as const) {
  test(tabCase.name, async ({ page }) => {
    await page.goto('/components/dropdown')

    const dropdown = page.locator('.omg-docs-demo .o-dropdown').first()
    await dropdown.evaluate((element) => {
      const before = document.createElement('button')
      before.type = 'button'
      before.textContent = 'Before dropdown'

      const after = document.createElement('button')
      after.type = 'button'
      after.textContent = 'After dropdown'

      element.before(before)
      element.after(after)
    })

    const trigger = dropdown.getByRole('button', { name: '打开操作菜单', exact: true })
    await trigger.press('ArrowDown')
    const firstItem = page.getByRole('menuitem', { name: '个人资料' })
    await expect(firstItem).toBeFocused()

    await firstItem.press(tabCase.shortcut)
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByRole('button', { name: tabCase.destination, exact: true })).toBeFocused()
  })
}

test('preserves local font and overlay layer for a teleported dropdown panel', async ({ page }) => {
  await page.goto('/components/dropdown')

  const dropdown = page.locator('.omg-docs-demo .o-dropdown').first()
  await dropdown.evaluate((element) => {
    const context = element.parentElement
    if (!context) throw new Error('Expected a local dropdown context')

    context.style.fontFamily = '"Courier New", monospace'
    context.style.setProperty('--omg-z-index-dropdown', '4321')
  })

  const trigger = dropdown.getByRole('button', { name: '打开操作菜单', exact: true })
  const triggerContext = await trigger.evaluate((element) => {
    const styles = getComputedStyle(element)
    return {
      fontFamily: styles.fontFamily,
      overlayZIndex: styles.getPropertyValue('--omg-z-index-dropdown').trim(),
    }
  })
  expect(triggerContext.overlayZIndex).toBe('4321')

  await trigger.click()
  const panel = page.getByRole('menu', { name: '打开操作菜单' })
  await expect(panel).toBeVisible()
  expect(await panel.evaluate((element) => element.parentElement === document.body)).toBe(true)
  await expect(panel).toHaveCSS('font-family', triggerContext.fontFamily)
  await expect(panel).toHaveCSS('z-index', triggerContext.overlayZIndex)
})

test('keeps an open default dropdown panel synchronized with system color scheme changes', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/components/dropdown')

  const html = page.locator('html')
  await expect(html).toHaveAttribute('data-omg-theme', 'light')
  const dropdown = page.locator('.omg-docs-demo .o-dropdown').first()
  expect(
    await dropdown.evaluate(
      (element) => element.closest('[data-omg-theme]') === document.documentElement,
    ),
  ).toBe(true)

  const trigger = dropdown.getByRole('button', { name: '打开操作菜单', exact: true })
  await trigger.press('ArrowDown')
  const panel = page.getByRole('menu', { name: '打开操作菜单' })
  await expect(panel).toBeVisible()

  const lightTrigger = await readSurfaceSnapshot(trigger)
  const lightPanel = await readSurfaceSnapshot(panel)
  expect(lightTrigger.token).not.toBe('')
  expect(lightPanel.token).toBe(lightTrigger.token)
  expect(lightPanel.background).toBe(lightTrigger.background)
  expect(lightPanel.inlineToken).toBe('')

  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(html).toHaveAttribute('data-omg-theme', 'dark')
  await expect
    .poll(async () => (await readSurfaceSnapshot(trigger)).token)
    .not.toBe(lightTrigger.token)

  const darkTrigger = await readSurfaceSnapshot(trigger)
  const darkPanel = await readSurfaceSnapshot(panel)
  expect(darkTrigger.background).not.toBe(lightTrigger.background)
  expect(darkPanel.token).toBe(darkTrigger.token)
  expect(darkPanel.background).toBe(darkTrigger.background)
  expect(darkPanel.token).not.toBe(lightPanel.token)
  expect(darkPanel.background).not.toBe(lightPanel.background)
  expect(darkPanel.inlineToken).toBe('')
  await expect(panel).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
})

test('keeps a non-teleported dropdown panel inside its root and interactive', async ({ page }) => {
  await page.goto('/components/dropdown')
  const bundle = await buildInlineDropdownFixture()
  await page.addScriptTag({ content: bundle, type: 'module' })

  const fixture = page.locator('#inline-dropdown-fixture')
  const dropdown = fixture.locator('.o-dropdown')
  const trigger = fixture.getByRole('button', { name: 'Open inline dropdown', exact: true })
  await expect(dropdown).toBeVisible()

  await trigger.press('ArrowDown')
  const panel = dropdown.getByRole('menu', { name: 'Open inline dropdown' })
  await expect(panel).toBeVisible()
  expect(
    await panel.evaluate((element) => element.parentElement?.classList.contains('o-dropdown')),
  ).toBe(true)

  await panel.getByRole('menuitem', { name: 'Inline settings' }).click()
  await expect(fixture.locator('#inline-dropdown-feedback')).toHaveText('Selected: Inline settings')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()
})

test('preserves local font and overlay layer for a teleported select panel', async ({ page }) => {
  await page.goto('/components/select')

  const select = page.locator('.omg-docs-demo .o-select').first()
  await select.evaluate((element) => {
    const context = element.parentElement
    if (!context) throw new Error('Expected a local select context')

    context.style.fontFamily = '"Lucida Console", monospace'
    context.style.setProperty('--omg-z-index-dropdown', '4322')
  })

  const trigger = select.getByRole('combobox', { name: '选择展示项' })
  const triggerContext = await trigger.evaluate((element) => {
    const styles = getComputedStyle(element)
    return {
      fontFamily: styles.fontFamily,
      overlayZIndex: styles.getPropertyValue('--omg-z-index-dropdown').trim(),
    }
  })
  expect(triggerContext.overlayZIndex).toBe('4322')

  await trigger.click()
  const panel = page.locator('.o-select__panel')
  await expect(panel).toBeVisible()
  expect(await panel.evaluate((element) => element.parentElement === document.body)).toBe(true)
  await expect(panel).toHaveCSS('font-family', triggerContext.fontFamily)
  await expect(panel).toHaveCSS('z-index', triggerContext.overlayZIndex)
})

test('supports select active descendants, selection, clearing, and viewport positioning', async ({
  page,
}) => {
  await page.goto('/components/select')

  await expect(page.getByRole('heading', { level: 1, name: 'Select 选择器' })).toBeVisible()
  const trigger = page.getByRole('combobox', { name: '选择展示项' })
  await trigger.focus()
  await trigger.press('ArrowDown')
  await trigger.press('ArrowDown')

  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-activedescendant', /-option-2$/u)
  const activeOptionId = await trigger.getAttribute('aria-activedescendant')
  expect(activeOptionId).not.toBeNull()
  await expect(page.locator(`[id="${activeOptionId}"]`)).toHaveText('进阶选项')
  await expect(page.getByRole('option', { name: '停用选项' })).toHaveAttribute(
    'aria-disabled',
    'true',
  )

  const panelBox = await listbox.boundingBox()
  const viewport = page.viewportSize()
  expect(panelBox).not.toBeNull()
  expect(viewport).not.toBeNull()
  expect(panelBox!.x).toBeGreaterThanOrEqual(0)
  expect(panelBox!.y).toBeGreaterThanOrEqual(0)
  expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(viewport!.width)
  expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(viewport!.height)
  await expectNoSeriousAccessibilityViolations(page, ['.omg-docs-demo', '.o-select__panel'])

  await trigger.press('Enter')
  await expect(page.getByText('当前选择：进阶选项', { exact: true })).toBeVisible()
  await expect(trigger).toContainText('进阶选项')
  await expect(trigger).toBeFocused()

  await page.getByRole('button', { name: 'Clear selection' }).click()
  await expect(page.getByText('当前选择：未选择', { exact: true })).toBeVisible()
  await expect(trigger).toContainText('选择一个选项')
  await expect(trigger).toBeFocused()
})

test('opens and selects from avatar dropdown triggers', async ({ page }) => {
  await page.goto('/components/avatar-dropdown')

  await expect(
    page.getByRole('heading', { level: 1, name: 'Avatar Dropdown 头像下拉' }),
  ).toBeVisible()
  const lightTheme = page.locator('.omg-example-theme[data-omg-theme="light"]')
  const darkTheme = page.locator('.omg-example-theme[data-omg-theme="dark"]')
  const lightTrigger = page.getByRole('button', { name: '打开头像菜单', exact: true })
  const darkTrigger = page.getByRole('button', { name: '打开深色头像菜单', exact: true })

  await expect(lightTheme.locator('.o-avatar-dropdown .o-avatar')).toBeVisible()
  await expect(darkTheme.locator('.o-avatar-dropdown .o-avatar')).toBeVisible()
  await expect(lightTrigger).toHaveCSS('border-top-style', 'solid')
  await expect(lightTrigger).toHaveCSS('border-top-width', '1px')
  await expect(darkTrigger).toHaveCSS('border-top-style', 'solid')
  await expect(darkTrigger).toHaveCSS('border-top-width', '1px')

  await lightTrigger.click()
  const lightPanel = page.getByRole('menu', { name: '打开头像菜单' })
  await expect(lightPanel).toBeVisible()
  await expect(lightPanel).toHaveAttribute('data-omg-theme', 'light')
  await expect(lightPanel).toHaveCSS('border-top-style', 'solid')
  await expect(lightPanel).toHaveCSS('border-top-width', '1px')
  const lightPanelColors = await lightPanel.evaluate((element) => {
    const styles = getComputedStyle(element)
    return {
      background: styles.backgroundColor,
      border: styles.borderTopColor,
      text: styles.color,
    }
  })
  await page.getByRole('menuitem', { name: '个人资料' }).click()
  await expect(page.getByText('最近选择：个人资料', { exact: true })).toBeVisible()
  await expect(lightTrigger).toBeFocused()
  await expect(lightPanel).toHaveCount(0)

  await darkTrigger.click()
  const darkPanel = page.getByRole('menu', { name: '打开深色头像菜单' })
  await expect(darkPanel).toBeVisible()
  await expect(darkPanel).toHaveAttribute('data-omg-theme', 'dark')
  await expect(darkPanel).toHaveCSS('border-top-style', 'solid')
  await expect(darkPanel).toHaveCSS('border-top-width', '1px')
  const darkPanelColors = await darkPanel.evaluate((element) => {
    const styles = getComputedStyle(element)
    return {
      background: styles.backgroundColor,
      border: styles.borderTopColor,
      text: styles.color,
    }
  })
  expect(darkPanelColors.background).not.toBe(lightPanelColors.background)
  expect(darkPanelColors.border).not.toBe(lightPanelColors.border)
  expect(darkPanelColors.text).not.toBe(lightPanelColors.text)
  await expectNoSeriousAccessibilityViolations(page, ['.omg-docs-demo', '.o-dropdown__panel'])
})

test('stops flow, panel, and chevron motion when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/components/avatar-flow')

  await expect(page.locator('.o-avatar-flow__dot').first()).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.o-avatar-flow__dash-line')).toHaveCSS('animation-name', 'none')

  await page.goto('/components/dropdown')
  const dropdownIndicators = page.locator('.o-dropdown__indicator')
  await expect(dropdownIndicators).toHaveCount(2)
  for (const indicator of await dropdownIndicators.all()) {
    await expect(indicator).toHaveCSS('transition-duration', '0s')
  }
  await page.getByRole('button', { name: '打开操作菜单' }).click()
  await expect(page.locator('.o-dropdown__panel')).toHaveCSS('transition-duration', '0s')

  await page.goto('/components/select')
  const selectIndicators = page.locator('.o-select__indicator')
  await expect(selectIndicators).toHaveCount(2)
  for (const indicator of await selectIndicators.all()) {
    await expect(indicator).toHaveCSS('transition-duration', '0s')
  }
  await page.getByRole('combobox', { name: '选择展示项' }).click()
  await expect(page.locator('.o-select__panel')).toHaveCSS('transition-duration', '0s')
})

test('accepts a complete six-digit code by paste', async ({ page }) => {
  await page.goto('/components/code-input')

  await expect(page.getByRole('heading', { level: 1, name: 'Code Input 验证码输入' })).toBeVisible()
  const codeGroup = page.getByRole('group', { name: '六位验证码' })
  const inputs = codeGroup.locator('input')
  await expect(inputs).toHaveCount(6)

  const fieldBox = await inputs.first().boundingBox()
  expect(fieldBox).not.toBeNull()
  expect(fieldBox!.height).toBeGreaterThan(fieldBox!.width)
  await inputs.first().focus()
  await expect(inputs.first()).toHaveCSS('outline-style', 'none')
  await expect(inputs.first()).toHaveCSS('border-top-width', '2px')

  await inputs.first().evaluate((element) => {
    const clipboardData = new DataTransfer()
    clipboardData.setData('text', '123456')
    element.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, clipboardData }))
  })

  for (const [index, digit] of Array.from('123456').entries()) {
    await expect(inputs.nth(index)).toHaveValue(digit)
  }
  await expect(page.getByText('已完成：123456')).toBeVisible()

  await expectNoSeriousAccessibilityViolations(page)
})

test('renders horizontal and vertical divider semantics', async ({ page }) => {
  await page.goto('/components/divider')

  await expect(page.getByRole('heading', { level: 1, name: 'Divider 分割线' })).toBeVisible()
  await expect(page.locator('[role="separator"][aria-orientation="horizontal"]')).toHaveCount(4)
  await expect(page.locator('[role="separator"][aria-orientation="vertical"]')).toHaveCount(2)

  await expectNoSeriousAccessibilityViolations(page)
})
