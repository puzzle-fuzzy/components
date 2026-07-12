import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

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

const expectNoSeriousAccessibilityViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .include('.omg-docs-demo')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const violations = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  )

  expect(violations).toEqual([])
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

test('stops avatar flow animation when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/components/avatar-flow')

  await expect(page.locator('.o-avatar-flow__dot').first()).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.o-avatar-flow__dash-line')).toHaveCSS('animation-name', 'none')
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
