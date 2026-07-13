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

const readEffectiveTextColors = (
  locator: Locator,
): Promise<{ readonly background: string; readonly foreground: string }> =>
  locator.evaluate((element) => {
    type Rgba = [red: number, green: number, blue: number, alpha: number]

    const parseColor = (value: string): Rgba => {
      const channels = value.match(/\d+(?:\.\d+)?/gu)?.map(Number)
      if (!channels || channels.length < 3) throw new Error('Expected a computed RGB color')

      return [channels[0]!, channels[1]!, channels[2]!, channels[3] ?? 1]
    }
    const composite = (foreground: Rgba, background: Rgba): Rgba => {
      const alpha = foreground[3] + background[3] * (1 - foreground[3])
      if (alpha === 0) return [0, 0, 0, 0]

      return [
        (foreground[0] * foreground[3] + background[0] * background[3] * (1 - foreground[3])) /
          alpha,
        (foreground[1] * foreground[3] + background[1] * background[3] * (1 - foreground[3])) /
          alpha,
        (foreground[2] * foreground[3] + background[2] * background[3] * (1 - foreground[3])) /
          alpha,
        alpha,
      ]
    }
    const toRgb = ([red, green, blue]: Rgba): string =>
      `rgb(${String(Math.round(red))}, ${String(Math.round(green))}, ${String(Math.round(blue))})`

    const ancestors: Element[] = []
    let current: Element | null = element
    while (current) {
      ancestors.unshift(current)
      current = current.parentElement
    }

    let background: Rgba = [255, 255, 255, 1]
    for (const ancestor of ancestors) {
      background = composite(parseColor(getComputedStyle(ancestor).backgroundColor), background)
    }
    const foreground = composite(parseColor(getComputedStyle(element).color), background)

    return { background: toRgb(background), foreground: toRgb(foreground) }
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

interface TransitionFrameSnapshot {
  readonly opacity: string
  readonly scaleX: number
  readonly scaleY: number
  readonly transform: string
  readonly translateX: number
}

interface TransitionSnapshot {
  readonly frames: readonly TransitionFrameSnapshot[]
  readonly property: string
}

const captureOpacityAndTransformTransitions = (
  locator: Locator,
): Promise<readonly TransitionSnapshot[]> =>
  locator.evaluate(
    (element) =>
      new Promise<readonly TransitionSnapshot[]>((resolve, reject) => {
        let attempts = 0
        const inspect = () => {
          const transitions = element
            .getAnimations()
            .filter(
              (animation): animation is CSSTransition =>
                animation instanceof CSSTransition &&
                (animation.transitionProperty === 'opacity' ||
                  animation.transitionProperty === 'transform'),
            )
          const properties = new Set(transitions.map((transition) => transition.transitionProperty))

          if (properties.has('opacity') && properties.has('transform')) {
            for (const transition of transitions) transition.pause()
            const snapshots = transitions.map((transition) => ({
              frames: (transition.effect as KeyframeEffect).getKeyframes().map((frame) => {
                const transform = String(frame.transform ?? '')
                let matrix = new DOMMatrixReadOnly()
                if (transform && transform !== 'none') {
                  try {
                    matrix = new DOMMatrixReadOnly(transform)
                  } catch {
                    // Keep the identity matrix when the browser exposes an unresolved transform.
                  }
                }

                return {
                  opacity: String(frame.opacity ?? ''),
                  scaleX: Math.hypot(matrix.m11, matrix.m12, matrix.m13),
                  scaleY: Math.hypot(matrix.m21, matrix.m22, matrix.m23),
                  transform,
                  translateX: matrix.m41,
                }
              }),
              property: transition.transitionProperty,
            }))
            for (const transition of transitions) transition.play()
            resolve(snapshots)
            return
          }

          attempts += 1
          if (attempts >= 8) {
            reject(new Error('Expected active opacity and transform transitions'))
            return
          }
          requestAnimationFrame(inspect)
        }

        requestAnimationFrame(inspect)
      }),
  )

const waitForAnimations = (locator: Locator): Promise<void> =>
  locator.evaluate(async (element) => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
    const animations = element.getAnimations()
    await Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)))
  })

const framesFor = (
  snapshots: readonly TransitionSnapshot[],
  property: 'opacity' | 'transform',
): readonly TransitionFrameSnapshot[] =>
  snapshots.find((snapshot) => snapshot.property === property)?.frames ?? []

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

test('keeps icon-only buttons square and accessibly named at every size', async ({ page }) => {
  await page.goto('/components/button')

  const demo = page.getByRole('region', { name: 'Icon-only buttons' })
  for (const [name, expectedSize] of [
    ['新建', 32],
    ['设置', 38],
    ['删除', 46],
  ] as const) {
    const button = demo.getByRole('button', { name, exact: true })
    const bounds = await button.boundingBox()

    expect(bounds).not.toBeNull()
    expect(bounds?.width).toBe(expectedSize)
    expect(bounds?.height).toBe(expectedSize)
  }

  await expect(demo.getByRole('button', { name: '正在保存', exact: true })).toBeDisabled()
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
  await expect(menu).toHaveCSS('opacity', '1')
  await expect(menu).toHaveCSS('border-left-width', '0px')
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
  await expect(listbox).toHaveCSS('border-left-width', '0px')
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

test('virtualizes long select collections without breaking active descendants', async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 320 })
  await page.goto('/components/select')

  const trigger = page.getByRole('combobox', { name: '选择大型数据项' })
  await trigger.press('ArrowDown')
  await trigger.press('End')

  await expect(trigger).toHaveAttribute('aria-activedescendant', /-option-499$/u)
  const activeOptionId = await trigger.getAttribute('aria-activedescendant')
  expect(activeOptionId).not.toBeNull()
  const activeOption = page.locator(`[id="${activeOptionId}"]`)
  await expect(activeOption).toHaveText('大型选项 500')
  await expect(activeOption).toHaveAttribute('aria-setsize', '500')
  await expect(activeOption).toHaveAttribute('aria-posinset', '500')

  const renderedOptions = await page.getByRole('listbox').getByRole('option').count()
  expect(renderedOptions).toBeLessThan(100)

  const panelBox = await page.getByRole('listbox').boundingBox()
  const virtualListBox = await page.locator('.o-select__virtual-list').boundingBox()
  expect(panelBox).not.toBeNull()
  expect(virtualListBox).not.toBeNull()
  expect(virtualListBox!.height).toBeLessThanOrEqual(panelBox!.height)

  await trigger.press('Enter')
  await expect(trigger).toContainText('大型选项 500')
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
  await expect(lightPanel).toHaveCSS('border-top-style', 'none')
  await expect(lightPanel).toHaveCSS('border-top-width', '0px')
  await expect(lightPanel).not.toHaveCSS('box-shadow', 'none')
  const lightPanelColors = await lightPanel.evaluate((element) => {
    const styles = getComputedStyle(element)
    return {
      background: styles.backgroundColor,
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
  await expect(darkPanel).toHaveCSS('border-top-style', 'none')
  await expect(darkPanel).toHaveCSS('border-top-width', '0px')
  await expect(darkPanel).not.toHaveCSS('box-shadow', 'none')
  const darkPanelColors = await darkPanel.evaluate((element) => {
    const styles = getComputedStyle(element)
    return {
      background: styles.backgroundColor,
      text: styles.color,
    }
  })
  expect(darkPanelColors.background).not.toBe(lightPanelColors.background)
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
  await expect(selectIndicators).toHaveCount(3)
  for (const indicator of await selectIndicators.all()) {
    await expect(indicator).toHaveCSS('transition-duration', '0s')
  }
  await page.getByRole('combobox', { name: '选择展示项' }).click()
  await expect(page.locator('.o-select__panel')).toHaveCSS('transition-duration', '0s')

  await page.goto('/components/upload')
  await expect(page.locator('.o-upload__file-progress-bar').first()).toHaveCSS(
    'transition-duration',
    '0s',
  )
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

test('reports the controlled Dialog lifecycle, close reason, and native focus return', async ({
  page,
}) => {
  await page.goto('/components/dialog')

  await expect(page.getByRole('heading', { level: 1, name: 'Dialog 对话框' })).toBeVisible()
  const demo = page.getByRole('region', { name: 'Dialog controlled lifecycle' })
  const trigger = demo.getByRole('button', { name: '打开基础弹窗', exact: true })
  const feedback = demo.locator('.omg-dialog-basic-event')

  await trigger.click()
  const dialog = page.getByRole('dialog', { name: '工作区设置' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute('data-state', 'open')
  await expect(feedback).toHaveText('完成打开')
  await expect(dialog.getByRole('button', { name: '关闭工作区设置弹窗' })).toBeFocused()
  await expectNoSeriousAccessibilityViolations(page, ['dialog.o-dialog[open]'])

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(feedback).toHaveText('完成关闭：escape')
  await expect(trigger).toBeFocused()

  await trigger.click()
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: '取消', exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect(feedback).toHaveText('完成关闭：slot')
  await expect(trigger).toBeFocused()
})

test('keeps Dialog surfaces borderless across widths, fullscreen, and a 320x640 viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/components/dialog')

  const sizes = page.getByRole('region', { name: 'Dialog widths and fullscreen surfaces' })
  await sizes.getByRole('button', { name: '打开紧凑弹窗', exact: true }).click()
  const compact = page.getByRole('dialog', { name: '紧凑提示' })
  await expect(compact).toBeVisible()
  await expect(compact).toHaveAttribute('data-state', 'open')
  await expect(compact).toHaveCSS('border-top-width', '0px')
  await expect(compact).toHaveCSS('border-right-width', '0px')
  await expect(compact).toHaveCSS('border-bottom-width', '0px')
  await expect(compact).toHaveCSS('border-left-width', '0px')
  let bounds = await compact.boundingBox()
  expect(Math.round(bounds?.width ?? 0)).toBe(360)
  await compact.getByRole('button', { name: '知道了', exact: true }).click()
  await expect(compact).toBeHidden()

  await sizes.getByRole('button', { name: '打开宽内容弹窗', exact: true }).click()
  const wide = page.getByRole('dialog', { name: '宽内容画布' })
  await expect(wide).toBeVisible()
  await expect(wide).toHaveAttribute('data-state', 'open')
  bounds = await wide.boundingBox()
  expect(Math.round(bounds?.width ?? 0)).toBe(704)
  await wide.getByRole('button', { name: '关闭宽内容', exact: true }).click()
  await expect(wide).toBeHidden()

  await sizes.getByRole('button', { name: '打开全屏弹窗', exact: true }).click()
  const fullscreen = page.getByRole('dialog', { name: '全屏工作面' })
  await expect(fullscreen).toBeVisible()
  await expect(fullscreen).toHaveAttribute('data-state', 'open')
  await expect(fullscreen).toHaveClass(/o-dialog--fullscreen/u)
  bounds = await fullscreen.boundingBox()
  expect(Math.round(bounds?.width ?? 0)).toBe(1280)
  expect(Math.round(bounds?.height ?? 0)).toBe(720)
  expect(Math.round(bounds?.x ?? -1)).toBe(0)
  expect(Math.round(bounds?.y ?? -1)).toBe(0)
  await fullscreen.getByRole('button', { name: '退出全屏', exact: true }).click()
  await expect(fullscreen).toBeHidden()

  await page.setViewportSize({ width: 320, height: 640 })
  await sizes.getByRole('button', { name: '打开紧凑弹窗', exact: true }).click()
  await expect(compact).toBeVisible()
  await expect(compact).toHaveAttribute('data-state', 'open')
  bounds = await compact.boundingBox()
  expect(Math.round(bounds?.width ?? 0)).toBe(288)
  expect(Math.round(bounds?.x ?? -1)).toBe(16)
  expect(bounds?.height ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(608)
  await compact.getByRole('button', { name: '知道了', exact: true }).click()
  await expect(compact).toBeHidden()
})

test('scrolls only the Dialog body and applies preserve or destroy mount policies', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 640 })
  await page.goto('/components/dialog')

  const content = page.getByRole('region', { name: 'Dialog scrolling and content mounting' })
  const persistentTrigger = content.getByRole('button', {
    name: '打开保留状态的长内容',
    exact: true,
  })
  await persistentTrigger.click()
  const persistent = page.getByRole('dialog', { name: '保留挂载状态' })
  const persistentInput = persistent.getByRole('textbox', { name: '保留的本地输入' })
  const persistentBody = persistent.locator('.o-dialog__body')
  await expect(persistent).toBeVisible()
  expect(
    await persistentBody.evaluate((element) => element.scrollHeight > element.clientHeight),
  ).toBe(true)
  await expect(persistent.locator('.o-dialog__header')).toBeVisible()
  await expect(persistent.locator('.o-dialog__footer')).toBeVisible()
  await persistentInput.fill('保留这段界面文本')
  await persistent.getByRole('button', { name: '增加', exact: true }).click()
  await persistent.getByRole('button', { name: '增加', exact: true }).click()
  await expect(persistent.getByText('本地计数：2', { exact: true })).toBeVisible()
  await persistent.getByRole('button', { name: '关闭并保留', exact: true }).click()
  await expect(persistent).toBeHidden()

  await persistentTrigger.click()
  await expect(persistentInput).toHaveValue('保留这段界面文本')
  await expect(persistent.getByText('本地计数：2', { exact: true })).toBeVisible()
  await persistent.getByRole('button', { name: '关闭并保留', exact: true }).click()
  await expect(persistent).toBeHidden()

  const destroyTrigger = content.getByRole('button', {
    name: '打开关闭后销毁的内容',
    exact: true,
  })
  await destroyTrigger.click()
  const destroyed = page.getByRole('dialog', { name: '关闭后销毁内容' })
  await expect(destroyed).toBeVisible()
  await destroyed.getByRole('textbox', { name: '关闭后重置的本地输入' }).fill('临时界面文本')
  await destroyed.getByRole('button', { name: '增加', exact: true }).click()
  await expect(destroyed.getByText('本地计数：1', { exact: true })).toBeVisible()
  await destroyed.getByRole('button', { name: '关闭并销毁', exact: true }).click()
  await expect(destroyed).toBeHidden()
  await expect(destroyed.locator('.omg-dialog-mount-state')).toHaveCount(0)

  await destroyTrigger.click()
  await expect(destroyed.getByRole('textbox', { name: '关闭后重置的本地输入' })).toHaveValue('')
  await expect(destroyed.getByText('本地计数：0', { exact: true })).toBeVisible()
  await destroyed.getByRole('button', { name: '关闭并销毁', exact: true }).click()
  await expect(destroyed).toBeHidden()
})

test('supports Dialog initial focus, rejected close requests, dark RTL, reduced motion, and axe', async ({
  page,
}) => {
  await page.goto('/components/dialog')

  const custom = page.getByRole('region', { name: 'Dialog custom slots and initial focus' })
  const focusTrigger = custom.getByRole('button', {
    name: '打开插槽与焦点示例',
    exact: true,
  })
  await focusTrigger.click()
  const focusDialog = page.getByRole('dialog', { name: '显示资料' })
  const displayName = focusDialog.getByRole('textbox', { name: '显示名称' })
  await expect(focusDialog).toBeVisible()
  await expect(displayName).toBeFocused()
  await expect(
    focusDialog.getByRole('button', { name: '关闭显示资料弹窗' }).locator('svg'),
  ).toBeVisible()
  await expectNoSeriousAccessibilityViolations(page, ['dialog.o-dialog[open]'])
  await focusDialog.getByRole('button', { name: '完成', exact: true }).click()
  await expect(focusDialog).toBeHidden()
  await expect(focusTrigger).toBeFocused()

  const behavior = page.getByRole('region', {
    name: 'Dialog close policies, dark theme, and RTL',
  })
  await behavior.getByRole('button', { name: '打开锁定弹窗', exact: true }).click()
  const locked = page.getByRole('dialog', { name: '锁定的展示面' })
  await expect(locked).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(locked).toBeVisible()
  await page.mouse.click(4, 4)
  await expect(locked).toBeVisible()
  await locked.getByRole('button', { name: '明确关闭', exact: true }).click()
  await expect(locked).toBeHidden()

  await behavior.getByRole('button', { name: '打开策略弹窗', exact: true }).click()
  const guarded = page.getByRole('dialog', { name: '关闭策略' })
  await expect(guarded).toBeVisible()
  await guarded.getByRole('button', { name: '请求关闭策略弹窗' }).click()
  await expect(guarded).toBeVisible()
  await expect(guarded.getByText('已拒绝关闭：请先选择「允许关闭」')).toBeVisible()
  const allowClose = guarded.getByRole('checkbox', { name: '允许关闭' })
  await guarded.getByText('允许关闭', { exact: true }).click()
  await expect(allowClose).toBeChecked()
  await guarded.getByRole('button', { name: '请求关闭策略弹窗' }).click()
  await expect(guarded).toBeHidden()

  await behavior.getByRole('button', { name: '打开深色 RTL 弹窗', exact: true }).click()
  const darkRtl = page.getByRole('dialog', { name: '深色 RTL 展示' })
  await expect(darkRtl).toBeVisible()
  await expect(darkRtl).toHaveAttribute('data-omg-theme', 'dark')
  await expect(darkRtl).toHaveAttribute('dir', 'rtl')
  await expect(darkRtl).toHaveCSS('background-color', 'rgb(20, 24, 33)')
  await expect(darkRtl).toHaveCSS('border-left-width', '0px')
  await expectNoSeriousAccessibilityViolations(page, ['dialog.o-dialog[open]'])
  await darkRtl.getByRole('button', { name: '完成', exact: true }).click()
  await expect(darkRtl).toBeHidden()

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await focusTrigger.click()
  await expect(focusDialog).toBeVisible()
  expect(await focusDialog.evaluate((element) => element.getAnimations().length)).toBe(0)
  await focusDialog.getByRole('button', { name: '完成', exact: true }).click()
  await expect(focusDialog).toBeHidden()
})

test('renders accessible borderless Tag tones, variants, sizes, truncation, and close controls', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/components/tag')

  await expect(page.getByRole('heading', { level: 1, name: 'Tag 标签' })).toBeVisible()
  const basic = page.getByRole('region', { name: 'Tag tones variants and sizes' })
  const tones = ['neutral', 'brand', 'success', 'warning', 'danger'] as const

  for (const tone of tones) {
    await expect(basic.locator(`.o-tag--soft.o-tag--${tone}`).first()).toBeVisible()
    await expect(basic.locator(`.o-tag--solid.o-tag--${tone}`).first()).toBeVisible()
  }
  await expect(basic.locator('.o-tag--soft')).toHaveCount(9)
  await expect(basic.locator('.o-tag--solid')).toHaveCount(5)

  const small = basic.locator('.o-tag--sm').filter({ hasText: 'Small' })
  const medium = basic.locator('.o-tag--md').filter({ hasText: 'Medium' })
  expect(Math.round((await small.boundingBox())?.height ?? 0)).toBe(24)
  expect(Math.round((await medium.boundingBox())?.height ?? 0)).toBe(30)
  await expect(basic.locator('.o-tag__icon')).toHaveAttribute('aria-hidden', 'true')
  await expect(basic.locator('.o-tag__icon svg')).toBeVisible()

  const longContent = basic.locator('.tag-basic-long .o-tag__content')
  await expect(longContent).toHaveCSS('overflow', 'hidden')
  await expect(longContent).toHaveCSS('text-overflow', 'ellipsis')
  expect(await longContent.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(
    true,
  )

  const allTagBorders = await basic.locator('.o-tag').evaluateAll((tags) =>
    tags.map((tag) => {
      const styles = getComputedStyle(tag)
      return [
        styles.borderTopWidth,
        styles.borderRightWidth,
        styles.borderBottomWidth,
        styles.borderLeftWidth,
      ]
    }),
  )
  expect(allTagBorders.every((widths) => widths.every((width) => width === '0px'))).toBe(true)

  const lightContrasts: { ratio: number; tone: (typeof tones)[number] }[] = []
  for (const tone of tones) {
    const colors = await readEffectiveTextColors(
      basic.locator(`.o-tag--soft.o-tag--${tone}`).first(),
    )
    lightContrasts.push({ ratio: contrastRatio(colors.foreground, colors.background), tone })
  }
  await basic.evaluate((element) => {
    element.setAttribute('data-omg-theme', 'dark')
    ;(element as HTMLElement).style.background = 'var(--omg-color-surface)'
  })
  const darkContrasts: { ratio: number; tone: (typeof tones)[number] }[] = []
  for (const tone of tones) {
    const colors = await readEffectiveTextColors(
      basic.locator(`.o-tag--soft.o-tag--${tone}`).first(),
    )
    darkContrasts.push({ ratio: contrastRatio(colors.foreground, colors.background), tone })
  }
  expect([
    ...lightContrasts
      .filter(({ ratio }) => ratio < 4.5)
      .map((result) => ({ ...result, theme: 'light' })),
    ...darkContrasts
      .filter(({ ratio }) => ratio < 4.5)
      .map((result) => ({ ...result, theme: 'dark' })),
  ]).toEqual([])

  const closable = page.getByRole('region', { name: 'Closable tags' })
  const vueClose = closable.getByRole('button', { name: '移除Vue标签', exact: true })
  await expect(vueClose).toBeVisible()
  await expect(vueClose).toHaveCSS('border-left-width', '0px')
  await vueClose.click()
  await expect(vueClose).toHaveCount(0)
  await closable.getByRole('button', { name: '恢复标签', exact: true }).click()
  await expect(closable.getByRole('button', { name: '移除Vue标签', exact: true })).toBeVisible()

  await expectNoSeriousAccessibilityViolations(page)
})

test('renders Badge limits, zero and dot semantics, composition, RTL, and borderless markers', async ({
  page,
}) => {
  await page.goto('/components/badge')

  await expect(page.getByRole('heading', { level: 1, name: 'Badge 徽标' })).toBeVisible()
  const values = page.getByRole('region', { name: 'Badge values tones and zero visibility' })
  await expect(values.getByRole('img', { name: '120 条消息' })).toHaveText('99+')
  const tones = values.getByRole('region', { name: '独立 Badge 与全部 tone' })
  await expect(tones.locator('.o-badge--neutral .o-badge__marker')).toBeVisible()
  await expect(tones.locator('.o-badge--brand .o-badge__marker')).toBeVisible()
  await expect(tones.locator('.o-badge--success .o-badge__marker')).toBeVisible()
  await expect(tones.locator('.o-badge--warning .o-badge__marker')).toBeVisible()
  await expect(tones.locator('.o-badge--danger .o-badge__marker')).toBeVisible()

  const zeroBadge = values.locator('.o-badge').filter({ hasText: '零值' })
  await expect(zeroBadge.locator('.o-badge__marker')).toHaveCount(0)
  await values.getByRole('button', { name: '显示零值', exact: true }).click()
  await expect(zeroBadge.locator('.o-badge__marker')).toHaveText('0')
  await values.getByRole('button', { name: '隐藏零值', exact: true }).click()
  await expect(zeroBadge.locator('.o-badge__marker')).toHaveCount(0)

  const decorativeDot = values.locator('.o-badge__marker--dot')
  await expect(decorativeDot).toHaveAttribute('aria-hidden', 'true')
  await expect(decorativeDot).not.toHaveAttribute('role', 'img')

  const composition = page.getByRole('region', {
    name: 'Badge composition and logical positioning',
  })
  await expect(composition.getByRole('button', { name: '通知', exact: true })).toBeVisible()
  await expect(composition.getByRole('img', { name: '8 条未读通知' })).toHaveText('8')
  await expect(composition.getByRole('img', { name: 'Yxswy', exact: true })).toBeVisible()
  await expect(composition.getByRole('img', { name: 'Yxswy 在线', exact: true })).toBeVisible()

  const rtlMarker = composition
    .getByRole('region', { name: '从右到左 Badge 组合' })
    .getByRole('img', { name: '12 条未读消息' })
  expect(
    await rtlMarker.evaluate(
      (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).e,
    ),
  ).toBeLessThan(0)

  const markerBorders = await page.locator('.o-badge__marker').evaluateAll((markers) =>
    markers.map((marker) => {
      const styles = getComputedStyle(marker)
      return [
        styles.borderTopWidth,
        styles.borderRightWidth,
        styles.borderBottomWidth,
        styles.borderLeftWidth,
      ]
    }),
  )
  expect(markerBorders.every((widths) => widths.every((width) => width === '0px'))).toBe(true)

  await expectNoSeriousAccessibilityViolations(page)
})

test('renders clamped and named Progress states with transform, RTL, dark, and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/components/progress')

  await expect(page.getByRole('heading', { level: 1, name: 'Progress 进度条' })).toBeVisible()
  const basic = page.getByRole('region', { name: 'Progress values clamping sizes and labels' })
  const sixtyEightItem = basic.locator('.progress-basic-item').filter({ hasText: '输入 68' })
  const sixtyEight = sixtyEightItem.getByRole('progressbar', { name: '68%' })
  await expect(sixtyEight).toHaveAttribute('aria-valuenow', '68')
  const visibleLabel = sixtyEight.locator('.o-progress__label')
  const visibleLabelId = await visibleLabel.getAttribute('id')
  expect(visibleLabelId).not.toBeNull()
  await expect(sixtyEight).toHaveAttribute('aria-labelledby', visibleLabelId!)
  await expect
    .poll(() =>
      sixtyEight
        .locator('.o-progress__fill')
        .evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a),
    )
    .toBeCloseTo(0.68, 2)

  const zero = basic
    .locator('.progress-basic-item')
    .filter({ hasText: '输入 -20 → 渲染 0' })
    .getByRole('progressbar', { name: '0%' })
  const hundred = basic
    .locator('.progress-basic-item')
    .filter({ hasText: '输入 140 → 渲染 100' })
    .getByRole('progressbar', { name: '100%' })
  await expect(zero).toHaveAttribute('aria-valuenow', '0')
  await expect(hundred).toHaveAttribute('aria-valuenow', '100')

  const completeNormal = basic
    .locator('.progress-basic-item')
    .filter({ hasText: '输入 100' })
    .getByRole('progressbar', { name: '100%' })
  await expect(completeNormal).toHaveClass(/o-progress--normal/u)
  await expect(completeNormal).not.toHaveClass(/o-progress--success/u)
  await expect(basic.getByRole('progressbar', { name: '同步进度' })).toHaveAttribute(
    'aria-valuenow',
    '42',
  )
  await expect(basic.getByRole('progressbar', { name: '文件导入进度' })).toContainText('已导入 73%')

  const states = page.getByRole('region', { name: 'Progress states indeterminate dark and RTL' })
  const indeterminate = states.getByRole('progressbar', { name: '正在同步' })
  await expect(indeterminate).toHaveClass(/o-progress--normal/u)
  await expect(indeterminate).toHaveClass(/o-progress--indeterminate/u)
  await expect(indeterminate).not.toHaveAttribute('aria-valuenow')
  await expect(indeterminate.locator('.o-progress__fill')).not.toHaveCSS('animation-name', 'none')

  const rtl = states.locator('.progress-states-panel-rtl')
  const rtlProgress = rtl.getByRole('progressbar', { name: '64%' })
  const rtlOrigin = await rtlProgress.locator('.o-progress__fill').evaluate((element) => ({
    origin: Number.parseFloat(getComputedStyle(element).transformOrigin),
    width: Number.parseFloat(getComputedStyle(element).width),
  }))
  expect(rtlOrigin.origin).toBeCloseTo(rtlOrigin.width, 1)

  const darkPanel = states.locator('.progress-states-panel-dark[data-omg-theme="dark"]')
  const darkProgress = darkPanel.getByRole('progressbar', { name: '深色主题构建进度' })
  await expect(darkProgress).toBeVisible()
  await expect(darkPanel).toHaveCSS('background-color', 'rgb(20, 24, 33)')
  await expect(darkProgress.locator('.o-progress__fill')).not.toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  )
  await expectNoSeriousAccessibilityViolations(page)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  const indeterminateFill = indeterminate.locator('.o-progress__fill')
  await expect(indeterminateFill).toHaveCSS('animation-name', 'none')
  await expect(indeterminateFill).toHaveCSS('transform', 'none')
})

test('opens and closes the image fullscreen preview', async ({ page }) => {
  await page.goto('/components/image')

  await expect(page.getByRole('heading', { level: 1, name: 'Image 图片' })).toBeVisible()
  const imageDemo = page.getByRole('region', { name: 'Image demos' })
  const previewTrigger = imageDemo.getByRole('button', {
    name: '预览山谷与蓝绿色坡地插画',
  })

  await previewTrigger.evaluate((element) => {
    const image = element.closest('.o-image')
    image?.setAttribute('data-omg-theme', 'dark')
    image?.setAttribute('lang', 'zh-CN')
    image?.setAttribute('dir', 'rtl')
    element.style.setProperty('--omg-radius-md', '19px')
  })

  await previewTrigger.focus()
  await page.keyboard.press('Enter')

  const dialog = page.getByRole('dialog', { name: '预览山谷与蓝绿色坡地插画' })
  await expect(dialog).toBeVisible()
  const previewImage = dialog.getByRole('img', { name: '山谷与蓝绿色坡地插画' })
  await expect(previewImage).toBeVisible()
  await expect(dialog).toBeFocused()
  await expect(dialog).toHaveAttribute('data-omg-theme', 'dark')
  await expect(dialog).toHaveAttribute('lang', 'zh-CN')
  await expect(dialog).toHaveAttribute('dir', 'rtl')
  await expect(dialog).toHaveCSS('--omg-radius-md', '19px')
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden')
  await expect(page.getByRole('button', { name: /关闭图片预览/u })).toHaveCount(0)
  await expectNoSeriousAccessibilityViolations(page, ['.o-image__preview-mask'])

  await previewImage.click()
  await expect(dialog).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(previewTrigger).toBeFocused()
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')

  await previewTrigger.click()
  await expect(dialog).toBeVisible()
  await dialog.click({ position: { x: 4, y: 4 } })
  await expect(dialog).toBeHidden()
  await expect(previewTrigger).toBeFocused()
  await expectNoSeriousAccessibilityViolations(page)
})

test('keeps fixed textareas scrollable and grows autosize textareas within their bounds', async ({
  page,
}) => {
  await page.goto('/components/textarea')

  await expect(page.getByRole('heading', { level: 1, name: 'Textarea 多行输入' })).toBeVisible()
  const fixedTextarea = page.getByRole('textbox', { name: '固定三行' })
  const growingTextarea = page.getByRole('textbox', { name: '按内容增长' })
  const fixedHeight = await fixedTextarea.evaluate(
    (element) => element.getBoundingClientRect().height,
  )
  const growingHeight = await growingTextarea.evaluate(
    (element) => element.getBoundingClientRect().height,
  )

  await fixedTextarea.fill(
    Array.from({ length: 12 }, (_, index) => `固定行 ${index + 1}`).join('\n'),
  )

  await expect(fixedTextarea).toHaveCSS('resize', 'none')
  await expect
    .poll(() => fixedTextarea.evaluate((element) => element.getBoundingClientRect().height))
    .toBeCloseTo(fixedHeight, 0)
  expect(
    await fixedTextarea.evaluate((element) => element.scrollHeight > element.clientHeight),
  ).toBe(true)

  await growingTextarea.fill(
    Array.from({ length: 5 }, (_, index) => `自动增长行 ${index + 1}`).join('\n'),
  )
  await expect
    .poll(() => growingTextarea.evaluate((element) => element.getBoundingClientRect().height))
    .toBeGreaterThan(growingHeight)

  await growingTextarea.fill(
    Array.from({ length: 12 }, (_, index) => `达到上限后的行 ${index + 1}`).join('\n'),
  )

  await expect(growingTextarea).toHaveCSS('resize', 'none')
  expect(
    await growingTextarea.evaluate((element) => element.scrollHeight > element.clientHeight),
  ).toBe(true)
  await expect(fixedTextarea.locator('xpath=..').getByText('/120', { exact: false })).toBeVisible()

  await expectNoSeriousAccessibilityViolations(page)
})

test('clears text and toggles password visibility in native inputs', async ({ page }) => {
  await page.goto('/components/input')

  await expect(page.getByRole('heading', { level: 1, name: 'Input 单行输入' })).toBeVisible()
  const searchInput = page.getByRole('searchbox', { name: '搜索组件' })
  await searchInput.fill('dialog')

  const clearButton = page.getByRole('button', { name: '清除搜索词' })
  await expect(clearButton).toBeVisible()
  await clearButton.click()
  await expect(searchInput).toHaveValue('')
  await expect(searchInput).toBeFocused()

  const passwordInput = page.getByLabel('密码', { exact: true })
  await expect(passwordInput).toHaveAttribute('type', 'password')
  const showPassword = page.getByRole('button', { name: '显示密码' })
  await showPassword.click()
  await expect(passwordInput).toHaveAttribute('type', 'text')
  await expect(page.getByRole('button', { name: '隐藏密码' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('button', { name: '隐藏密码' }).click()
  await expect(passwordInput).toHaveAttribute('type', 'password')

  await expectNoSeriousAccessibilityViolations(page)
})

test('updates native checkbox mixed and checked states from the keyboard', async ({ page }) => {
  await page.goto('/components/checkbox')

  await expect(page.getByRole('heading', { level: 1, name: 'Checkbox 复选框' })).toBeVisible()
  const selectAll = page.getByRole('checkbox', { name: '选择全部能力' })
  const design = page.getByRole('checkbox', { name: '组件设计' })
  const testing = page.getByRole('checkbox', { name: '自动化测试' })

  await expect(selectAll).toHaveAttribute('aria-checked', 'mixed')
  expect(await selectAll.evaluate((element: HTMLInputElement) => element.indeterminate)).toBe(true)
  await expect(design).toBeChecked()
  await expect(testing).not.toBeChecked()

  await testing.focus()
  await testing.press('Space')
  await expect(testing).toBeChecked()
  await expect(selectAll).toBeChecked()
  await expect(page.getByText('当前选择：design、testing', { exact: true })).toBeVisible()

  await selectAll.focus()
  await selectAll.press('Space')
  await expect(selectAll).not.toBeChecked()
  await expect(design).not.toBeChecked()
  await expect(testing).not.toBeChecked()
  await expect(page.getByText('当前选择：无', { exact: true })).toBeVisible()

  await expectNoSeriousAccessibilityViolations(page)
})

test('keeps radio groups native, named, and keyboard-operable', async ({ page }) => {
  await page.goto('/components/radio')

  await expect(page.getByRole('heading', { level: 1, name: 'Radio 单选框' })).toBeVisible()
  const channelGroup = page.getByRole('radiogroup', { name: '通知方式' })
  const email = channelGroup.getByRole('radio', { name: '邮件' })
  const message = channelGroup.getByRole('radio', { name: '短信' })
  const disabled = channelGroup.getByRole('radio', { name: '电话（不可用）' })

  await expect(email).toBeChecked()
  await expect(message).not.toBeChecked()
  await expect(disabled).toBeDisabled()
  expect(await email.getAttribute('name')).toBe(await message.getAttribute('name'))

  await email.focus()
  await email.press('ArrowRight')
  await expect(message).toBeChecked()
  await expect(message).toBeFocused()
  await expect(page.getByText('当前通知方式：sms', { exact: true })).toBeVisible()

  await expectNoSeriousAccessibilityViolations(page)
})

test('handles safe cancel and consumer-controlled confirmation in confirm dialogs', async ({
  page,
}) => {
  await page.goto('/components/confirm-dialog')

  await expect(
    page.getByRole('heading', { level: 1, name: 'ConfirmDialog 确认弹窗' }),
  ).toBeVisible()
  const neutralTrigger = page.getByRole('button', { name: '打开确认弹窗' })
  await neutralTrigger.click()

  const neutralDialog = page.getByRole('dialog', { name: '发布当前更改？' })
  await expect(neutralDialog).toBeVisible()
  await expect(neutralDialog.getByRole('button', { name: '返回' })).toBeFocused()
  await expect(neutralDialog).toHaveCSS('border-top-width', '0px')
  await expectNoSeriousAccessibilityViolations(page, ['.o-confirm-dialog'])

  await neutralDialog.getByRole('button', { name: '返回' }).click()
  await expect(neutralDialog).toBeHidden()
  await expect(neutralTrigger).toBeFocused()

  await neutralTrigger.click()
  await neutralDialog.getByRole('button', { name: '继续' }).click()
  await expect(neutralDialog).toBeHidden()

  const dangerTrigger = page.getByRole('button', { name: '打开危险确认' })
  await dangerTrigger.click()
  const dangerDialog = page.getByRole('dialog', { name: '删除这个项目？' })
  await expect(dangerDialog.locator('.o-confirm-dialog__signal svg')).toBeVisible()
  await expect(dangerDialog.getByRole('button', { name: '取消' })).toBeFocused()
  await dangerDialog.getByRole('button', { name: '确认删除' }).click()
  await expect(dangerDialog).toBeHidden()
})

test('preserves native validation and form state in form dialogs', async ({ page }) => {
  await page.goto('/components/form-dialog')

  await expect(page.getByRole('heading', { level: 1, name: 'FormDialog 表单弹窗' })).toBeVisible()
  const trigger = page.getByRole('button', { name: '编辑资料' })
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: '编辑资料' })
  const displayName = dialog.getByRole('textbox', { name: '显示名称' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: '取消' })).toBeFocused()
  await expectNoSeriousAccessibilityViolations(page, ['.o-form-dialog'])

  await displayName.fill('')
  await dialog.getByRole('button', { name: '保存' }).click()
  await expect(dialog).toBeVisible()
  expect(
    await displayName.evaluate((element: HTMLInputElement) => element.validity.valueMissing),
  ).toBe(true)
  await expect(displayName).toBeFocused()

  await displayName.fill('Codex')
  await dialog.getByText('站内消息', { exact: true }).click()
  await dialog.getByText('接收产品更新', { exact: true }).click()
  await expect(dialog.getByRole('radio', { name: '站内消息' })).toBeChecked()
  await expect(dialog.getByRole('checkbox', { name: '接收产品更新' })).not.toBeChecked()
  await dialog.getByRole('button', { name: '保存' }).click()
  await expect(dialog).toBeHidden()

  await trigger.click()
  await expect(dialog.getByRole('textbox', { name: '显示名称' })).toHaveValue('Codex')
  await expect(dialog.getByRole('radio', { name: '站内消息' })).toBeChecked()
  await expect(dialog.getByRole('checkbox', { name: '接收产品更新' })).not.toBeChecked()
  await dialog.getByRole('button', { name: '取消' }).click()
  await expect(trigger).toBeFocused()
})

test('renders consumer-controlled textarea references', async ({ page }) => {
  await page.goto('/components/reference-textarea')

  await expect(
    page.getByRole('heading', { level: 1, name: 'Reference Textarea 引用输入' }),
  ).toBeVisible()
  await expect(page.getByText('需求说明', { exact: true })).toBeVisible()
  await expect(page.getByText('界面预览', { exact: true })).toBeVisible()
  await expect(page.locator('.o-reference-textarea__references')).toHaveCSS(
    'list-style-type',
    'none',
  )
  await expect(page.locator('.o-reference-textarea__thumbnail')).toBeVisible()

  const textarea = page.getByRole('textbox', { name: '消息正文' })
  await textarea.fill('普通文本')
  await expect(textarea).toHaveValue('普通文本')
  await expect(page.locator('.o-reference-textarea__reference')).toHaveCount(2)

  await expectNoSeriousAccessibilityViolations(page)
})

test('switches tabs with slider and line variants', async ({ page }) => {
  await page.goto('/components/tabs')

  await expect(page.getByRole('heading', { level: 1, name: 'Tabs 标签页' })).toBeVisible()
  const transferTabs = page.getByRole('tablist', { name: '传输类型' })
  const textTab = transferTabs.getByRole('tab', { name: '传输文本' })
  const fileTab = transferTabs.getByRole('tab', { name: '传输文件' })
  const sliderIndicator = transferTabs.locator('.o-tabs__indicator')
  const initialIndicatorStyle = await sliderIndicator.getAttribute('style')

  await expect(textTab).toHaveAttribute('aria-selected', 'true')
  await textTab.focus()
  await page.keyboard.press('ArrowRight')
  await expect(fileTab).toHaveAttribute('aria-selected', 'true')
  await expect(fileTab).toBeFocused()
  await expect.poll(() => sliderIndicator.getAttribute('style')).not.toBe(initialIndicatorStyle)
  await expect(page.getByRole('tabpanel', { name: '传输文件' })).toContainText('选择并传输')

  const contentTabs = page.getByRole('tablist', { name: '内容视图' })
  await expect(contentTabs.getByRole('tab', { name: '禁用' })).toBeDisabled()
  await contentTabs.getByRole('tab', { name: '动态' }).click()
  await expect(contentTabs.getByRole('tab', { name: '动态' })).toHaveAttribute(
    'aria-selected',
    'true',
  )

  const fillTabs = page.getByRole('tablist', { name: '占满标签' })
  await expect(fillTabs.locator('..')).toHaveClass(/o-tabs--fill/u)
  const fillWidths = await fillTabs
    .getByRole('tab')
    .evaluateAll((tabs) => tabs.map((tab) => Math.round(tab.getBoundingClientRect().width)))
  expect(new Set(fillWidths).size).toBe(1)

  await expectNoSeriousAccessibilityViolations(page)
})

test('renders compact border-light Widget visualizations', async ({ page }) => {
  await page.goto('/components/widget')

  await expect(page.getByRole('heading', { level: 1, name: 'Widget 小组件' })).toBeVisible()
  const demo = page.getByRole('region', { name: 'Widget demos' })
  const widgets = demo.locator('.o-widget')
  const firstWidget = widgets.first()
  const firstIcon = firstWidget.locator('.o-widget__icon')

  await expect(widgets).toHaveCount(6)
  await expect(firstWidget).toContainText('花费')
  await expect(firstWidget).toContainText('85')
  await expect(firstWidget).toHaveCSS('border-left-width', '0px')
  await expect(firstWidget).toHaveCSS('border-radius', '35px')
  await expect(firstWidget).toHaveCSS('backdrop-filter', 'blur(20px)')
  await expect(firstIcon).toHaveCSS('border-left-width', '0px')

  const bounds = await firstWidget.boundingBox()
  expect(bounds).not.toBeNull()
  expect(bounds?.width).toBe(160)
  expect(bounds?.height).toBe(130)

  const iconBackground = await firstIcon.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  )
  expect(iconBackground).not.toBe('transparent')
  expect(iconBackground).not.toBe('rgba(0, 0, 0, 0)')
  await expect(demo.getByRole('img', { name: '近 7 天花费趋势' })).toBeVisible()
  await expect(demo.getByRole('img', { name: '最近两周活跃记录' })).toBeVisible()

  await expectNoSeriousAccessibilityViolations(page)
})

test('renders upload selection and file list states', async ({ page }) => {
  await page.goto('/components/upload')

  await expect(page.getByRole('heading', { level: 1, name: 'Upload 文件上传' })).toBeVisible()
  const uploadDemo = page.getByRole('region', { name: 'Upload click and drag selection' })
  const uploadZone = uploadDemo.getByRole('button', { name: '上传项目附件', exact: true })
  await expect(uploadZone).toBeVisible()
  await expect(uploadZone).toHaveAttribute('tabindex', '0')

  const fileChooserPromise = page.waitForEvent('filechooser')
  await uploadZone.click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles({
    name: 'contract.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('contract'),
  })

  const uploadedFile = uploadDemo.locator('[data-upload-file-id*="contract.pdf"]')
  await expect(uploadedFile).toContainText('contract.pdf')
  await expect(uploadedFile).toHaveCSS('border-left-width', '0px')
  await expect(uploadDemo.getByRole('list', { name: '已选项目附件' })).toBeVisible()
  await expect(uploadDemo.locator('.o-upload__list')).toHaveCSS('list-style-type', 'none')
  await expect(
    uploadDemo.locator(
      '[data-upload-file-id*="contract.pdf"][role="listitem"], li[data-upload-file-id*="contract.pdf"]',
    ),
  ).toHaveCount(1)

  const statesDemo = page.getByRole('region', { name: 'Upload file list states' })
  await expect(statesDemo.getByRole('list', { name: '文件上传状态' })).toBeVisible()
  await expect(statesDemo.locator('[data-upload-file-id="footage"]')).toContainText('58%')
  await expect(statesDemo.locator('[data-upload-file-id="archive"]')).toContainText('已完成')
  await expect(statesDemo.locator('[data-upload-file-id="poster"]')).toContainText('上传失败')

  await expectNoSeriousAccessibilityViolations(page)
})

test('renders opaque top-right Message statuses, stacks, and scoped themes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/components/message')

  await page.getByRole('button', { name: '显示普通消息', exact: true }).click()
  await page.getByRole('button', { name: '显示成功消息', exact: true }).click()
  await page.getByRole('button', { name: '显示警告消息', exact: true }).click()
  await page.getByRole('button', { name: '显示错误消息', exact: true }).click()

  const host = page.locator('.o-message-host')
  const messages = host.locator('.o-message')
  const success = host.getByRole('status').filter({ hasText: '保存成功' })
  await expect(host).toHaveCount(1)
  await expect(messages).toHaveCount(4)
  await expect(success).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(success).toHaveCSS('border-left-width', '0px')
  expect(await success.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none')

  const hostBounds = await host.boundingBox()
  expect(hostBounds).not.toBeNull()
  expect(Math.round((hostBounds?.x ?? 0) + (hostBounds?.width ?? 0))).toBe(1264)
  const iconMarkup = await host
    .locator('.o-message__icon svg')
    .evaluateAll((icons) => icons.map((icon) => icon.innerHTML))
  expect(new Set(iconMarkup).size).toBe(4)

  await page.evaluate(() => {
    document.documentElement.dir = 'rtl'
  })
  const rtlBounds = await host.boundingBox()
  expect(Math.round((rtlBounds?.x ?? 0) + (rtlBounds?.width ?? 0))).toBe(1264)
  await page.evaluate(() => {
    document.documentElement.removeAttribute('dir')
  })

  await page.getByRole('button', { name: '关闭全部消息', exact: true }).click()
  await expect(host).toHaveCount(0)

  await page.getByRole('button', { name: '显示三条消息', exact: true }).click()
  const stackItems = page.locator('.o-message-host__item')
  await expect(stackItems).toHaveCount(3)
  const stackBoxes = await stackItems.evaluateAll((items) =>
    items.map((item) => {
      const bounds = item.getBoundingClientRect()
      return { bottom: bounds.bottom, top: bounds.top }
    }),
  )
  expect(Math.round(stackBoxes[1]!.top - stackBoxes[0]!.bottom)).toBe(10)
  expect(Math.round(stackBoxes[2]!.top - stackBoxes[1]!.bottom)).toBe(10)

  await page.getByRole('button', { name: '关闭全部消息', exact: true }).click()
  await expect(host).toHaveCount(0)
  await page.getByRole('button', { name: '显示长消息', exact: true }).click()
  const longItem = page.locator('.o-message-host__item').filter({ hasText: '长文本换行' })
  await waitForAnimations(longItem)
  const longMessage = longItem.getByRole('status')
  const longBounds = await longMessage.boundingBox()
  expect(longBounds).not.toBeNull()
  expect(longBounds?.width).toBeLessThanOrEqual(360)
  expect(Math.round((longBounds?.x ?? 0) + (longBounds?.width ?? 0))).toBe(1264)

  await page.getByRole('button', { name: '关闭全部消息', exact: true }).click()
  await expect(host).toHaveCount(0)
  await page.getByRole('button', { name: '显示浅色消息', exact: true }).click()
  await expect(host.getByRole('status').filter({ hasText: '白色消息表面' })).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  )
  await page.getByRole('button', { name: '关闭全部消息', exact: true }).click()
  await expect(host).toHaveCount(0)
  await page.getByRole('button', { name: '显示深色消息', exact: true }).click()
  const darkMessage = host.getByRole('status').filter({ hasText: '深色消息表面' })
  await expect(darkMessage).toHaveCSS('background-color', 'rgb(45, 45, 45)')
  await expect(darkMessage).toHaveCSS('border-left-width', '0px')

  await expectNoSeriousAccessibilityViolations(page, ['.omg-docs-demo', '.o-message-host'])
  await page.getByRole('button', { name: '关闭全部消息', exact: true }).click()
  await expect(host).toHaveCount(0)
})

test('runs Message right-entry, scale-fade exit, and reduced-motion cleanup', async ({ page }) => {
  await page.goto('/components/message')
  await page.getByRole('button', { name: '显示持久消息', exact: true }).click()

  const item = page.locator('.o-message-host__item').filter({ hasText: '这条消息会一直保留' })
  await expect(item).toBeVisible()
  const enterSnapshots = await captureOpacityAndTransformTransitions(item)
  const enterOpacity = framesFor(enterSnapshots, 'opacity')
  const enterTransform = framesFor(enterSnapshots, 'transform')
  expect(enterOpacity.some((frame) => frame.opacity === '0')).toBe(true)
  expect(
    enterTransform.some(
      (frame) =>
        frame.translateX > 0 || /translate(?:X)?\(\s*calc\(\s*100%\s*\+\s*/u.test(frame.transform),
    ),
  ).toBe(true)

  await waitForAnimations(item)
  const leaveSnapshotsPromise = captureOpacityAndTransformTransitions(item)
  await item.getByRole('button', { name: '关闭这条持久消息' }).click()
  const leaveSnapshots = await leaveSnapshotsPromise
  const leaveOpacity = framesFor(leaveSnapshots, 'opacity')
  const leaveTransform = framesFor(leaveSnapshots, 'transform')
  expect(leaveOpacity.some((frame) => frame.opacity === '0')).toBe(true)
  expect(leaveTransform.some((frame) => frame.scaleX < 1 && frame.scaleY < 1)).toBe(true)
  expect(leaveTransform.every((frame) => Math.abs(frame.translateX) < 0.5)).toBe(true)
  await expect(page.locator('.o-message-host')).toHaveCount(0)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('button', { name: '显示持久消息', exact: true }).click()
  const reducedItem = page.locator('.o-message-host__item').filter({
    hasText: '这条消息会一直保留',
  })
  await expect(reducedItem).toBeVisible()
  expect(await reducedItem.evaluate((element) => element.getAnimations().length)).toBe(0)
  await reducedItem.getByRole('button', { name: '关闭这条持久消息' }).click()
  await expect(page.locator('.o-message-host')).toHaveCount(0)
})

test('opens a controlled borderless Drawer with native modal focus and close motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/components/drawer')

  const trigger = page.getByRole('button', { name: '从右侧打开', exact: true })
  await trigger.click()
  const drawer = page.getByRole('dialog', { name: '项目设置' })
  const drawerElement = page.locator('dialog.o-drawer--end').filter({ hasText: '项目设置' })
  await expect(drawer).toBeVisible()
  await expect(drawerElement).toHaveAttribute('open', '')
  await expect(drawerElement).toHaveCSS('border-left-width', '0px')
  await expect(drawerElement).toHaveCSS('border-right-width', '0px')
  expect(await drawerElement.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(
    'none',
  )
  await waitForAnimations(drawerElement)

  const bounds = await drawerElement.boundingBox()
  expect(bounds).not.toBeNull()
  expect(Math.round(bounds?.width ?? 0)).toBe(400)
  expect(Math.round(bounds?.height ?? 0)).toBe(720)
  expect(Math.round((bounds?.x ?? 0) + (bounds?.width ?? 0))).toBe(1280)
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden')

  const close = drawer.getByRole('button', { name: '关闭项目设置面板' })
  await expect(close).toBeFocused()

  await waitForAnimations(drawerElement)
  const leaveSnapshotsPromise = captureOpacityAndTransformTransitions(drawerElement)
  await page.keyboard.press('Escape')
  const leaveSnapshots = await leaveSnapshotsPromise
  await expect(drawerElement).not.toHaveAttribute('open', '')
  await expect(drawerElement).toBeVisible()
  expect(framesFor(leaveSnapshots, 'opacity').some((frame) => frame.opacity === '0')).toBe(true)
  expect(framesFor(leaveSnapshots, 'transform').some((frame) => frame.transform !== 'none')).toBe(
    true,
  )
  await expect(drawerElement).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')

  await trigger.click()
  await expect(drawer).toBeVisible()
  await page.mouse.click(120, 120)
  await expect(drawerElement).toBeHidden()

  await trigger.click()
  await expect(drawer).toBeVisible()
  await expectNoSeriousAccessibilityViolations(page, ['dialog.o-drawer'])
  await close.click()
  await expect(drawerElement).toBeHidden()
})

test('supports Drawer logical placement, scrolling, locked dismissal, and reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/components/drawer')

  await page.getByRole('button', { name: '从起始侧打开', exact: true }).click()
  const startDrawer = page.locator('dialog.o-drawer--start[open]')
  await expect(startDrawer).toBeVisible()
  await waitForAnimations(startDrawer)
  let bounds = await startDrawer.boundingBox()
  expect(Math.round(bounds?.x ?? -1)).toBe(0)
  expect(Math.round(bounds?.width ?? 0)).toBe(320)
  expect(await startDrawer.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(
    'none',
  )
  await startDrawer.locator('.o-dialog__close').click()
  await expect(startDrawer).toBeHidden()

  await page.getByRole('button', { name: '在 RTL 中从起始侧打开', exact: true }).click()
  const rtlDrawer = page.locator('dialog.o-drawer--start[open]').filter({
    hasText: 'RTL 起始侧面板',
  })
  await expect(rtlDrawer).toBeVisible()
  await waitForAnimations(rtlDrawer)
  bounds = await rtlDrawer.boundingBox()
  expect(Math.round((bounds?.x ?? 0) + (bounds?.width ?? 0))).toBe(1280)
  await expect(rtlDrawer).toHaveCSS('background-color', 'rgb(20, 24, 33)')
  await rtlDrawer.getByRole('button', { name: '关闭 RTL 起始侧面板' }).click()
  await expect(rtlDrawer).toBeHidden()

  await page.getByRole('button', { name: '打开滚动面板', exact: true }).click()
  const scrollDrawer = page.locator('dialog.o-drawer[open]').filter({ hasText: '组件设置' })
  await expect(scrollDrawer).toBeVisible()
  await waitForAnimations(scrollDrawer)
  const body = scrollDrawer.locator('.o-dialog__body')
  expect(await body.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)
  await expect(scrollDrawer.locator('.o-dialog__header')).toBeVisible()
  await expect(scrollDrawer.locator('.o-dialog__footer')).toBeVisible()
  const select = scrollDrawer.getByRole('combobox', { name: '抽屉内选择器' })
  await select.click()
  const listbox = scrollDrawer.getByRole('listbox')
  await expect(listbox).toBeVisible()
  await listbox.getByRole('option', { name: '紧凑' }).click()
  await scrollDrawer.getByRole('button', { name: '关闭组件设置', exact: true }).click()
  await expect(scrollDrawer).toBeHidden()

  await page.getByRole('button', { name: '打开锁定面板', exact: true }).click()
  const lockedDrawer = page.getByRole('dialog', { name: '锁定面板' })
  await expect(lockedDrawer).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(lockedDrawer).toBeVisible()
  await page.mouse.click(120, 120)
  await expect(lockedDrawer).toBeVisible()
  await expectNoSeriousAccessibilityViolations(page, ['dialog.o-drawer'])
  await lockedDrawer.getByRole('button', { name: '关闭锁定面板', exact: true }).click()
  await expect(lockedDrawer).toBeHidden()

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 320, height: 640 })
  await page.getByRole('button', { name: '从起始侧打开', exact: true }).click()
  const compactDrawer = page.locator('dialog.o-drawer--start[open]')
  await expect(compactDrawer).toBeVisible()
  bounds = await compactDrawer.boundingBox()
  expect(Math.round(bounds?.x ?? -1)).toBe(0)
  expect(Math.round(bounds?.width ?? 0)).toBe(320)
  expect(await compactDrawer.evaluate((element) => element.getAnimations().length)).toBe(0)
  await compactDrawer.locator('.o-dialog__close').click()
  await expect(compactDrawer).toBeHidden()
})
