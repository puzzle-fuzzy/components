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
  await expect(page.getByRole('img', { name: 'Yxswy' })).toBeVisible()
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

test('renders all flow phases and disables looping motion when requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/components/avatar-flow')

  await expect(page.getByRole('heading', { level: 1, name: 'Avatar Flow 头像流' })).toBeVisible()
  for (const phase of ['idle', 'requesting', 'transferring', 'complete', 'error']) {
    await expect(page.locator('.o-avatar-flow[data-phase="' + phase + '"]')).toBeVisible()
  }

  const particle = page.locator('.o-avatar-flow__particle').first()
  await expect(particle).toBeVisible()
  await expect(particle).toHaveCSS('animation-name', 'none')

  await expectNoSeriousAccessibilityViolations(page)
})
