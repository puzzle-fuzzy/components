import { access, readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const packageRoot = resolve(import.meta.dirname, '../..')
const componentManifest = JSON.parse(
  await readFile(resolve(packageRoot, 'component-manifest.json'), 'utf8'),
) as {
  groups: Array<{ components: Array<{ slug: string }> }>
}
const componentSlugs = componentManifest.groups.flatMap((group) =>
  group.components.map(({ slug }) => slug),
)

const collectFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const path = resolve(directory, entry.name)
      return entry.isDirectory() ? collectFiles(path) : [path]
    }),
  )

  return files.flat()
}

interface PackageManifest {
  name: string
  version: string
  private: boolean
  license: string
  main?: string
  exports: Record<string, { import?: string; require?: unknown; types?: string }>
  dependencies: Record<string, string>
  peerDependencies: Record<string, string>
}

describe('@puzzle-fuzzy/ui package contract', () => {
  test('is a public, Vue-only, ESM package', async () => {
    const manifest = JSON.parse(
      await readFile(resolve(packageRoot, 'package.json'), 'utf8'),
    ) as PackageManifest

    expect(manifest.name).toBe('@puzzle-fuzzy/ui')
    expect(manifest.version).toBe('0.1.0')
    expect(manifest.private).toBe(false)
    expect(manifest.license).toBe('MIT')
    expect(manifest.main).toBeUndefined()
    expect(manifest.exports['.']?.require).toBeUndefined()
    expect(manifest.dependencies).toEqual({
      '@floating-ui/dom': 'catalog:',
      'reka-ui': 'catalog:',
      'vue-icons-plus': 'catalog:',
      'vue-virtual-scroller': 'catalog:',
    })
    expect(manifest.peerDependencies).toEqual({ vue: '^3.5.0' })

    const componentSubpaths = componentSlugs.map((slug) => './' + slug)

    for (const subpath of componentSubpaths) {
      expect(manifest.exports[subpath]?.types).toMatch(/^\.\/dist\/.+\.d\.ts$/u)
      expect(manifest.exports[subpath]?.import).toMatch(/^\.\/dist\/.+\.js$/u)
      expect(manifest.exports[subpath]?.require).toBeUndefined()
    }
  })

  test('emits every declared public entry', async () => {
    const expectedFiles = [
      'dist/index.js',
      'dist/index.d.ts',
      'dist/styles.css',
      ...componentSlugs.flatMap((slug) => [
        `dist/components/${slug}/index.js`,
        `dist/components/${slug}/index.d.ts`,
      ]),
    ]

    await expect(
      Promise.all(expectedFiles.map((path) => access(resolve(packageRoot, path)))),
    ).resolves.toBeDefined()
  })

  test('ships virtual-scroller layout through the single public stylesheet', async () => {
    const publicStyles = await readFile(resolve(packageRoot, 'dist/styles.css'), 'utf8')

    expect(publicStyles).toContain('.vue-recycle-scroller')
    expect(publicStyles).toContain('.o-alert')
    expect(publicStyles).toContain('.o-accordion')
    expect(publicStyles).toContain('.o-aspect-ratio')
    expect(publicStyles).toContain('.o-badge')
    expect(publicStyles).toContain('.o-button-group')
    expect(publicStyles).toContain('.o-card')
    expect(publicStyles).toContain('.o-collapsible')
    expect(publicStyles).toContain('.o-empty')
    expect(publicStyles).toContain('.o-field')
    expect(publicStyles).toContain('.o-input-group')
    expect(publicStyles).toContain('.o-kbd')
    expect(publicStyles).toContain('.o-label')
    expect(publicStyles).toContain('.o-popover')
    expect(publicStyles).toContain('.o-progress')
    expect(publicStyles).toContain('.o-skeleton')
    expect(publicStyles).toContain('.o-spinner')
    expect(publicStyles).toContain('.o-switch')
    expect(publicStyles).toContain('.o-tag')
    expect(publicStyles).toContain('.o-tooltip')
    await expect(access(resolve(packageRoot, 'dist/select.css'))).rejects.toThrow()
  })

  test('keeps Reka UI behind the OMG public type boundary', async () => {
    const declarationFiles = (await collectFiles(resolve(packageRoot, 'dist'))).filter((path) =>
      path.endsWith('.d.ts'),
    )
    const declarationSources = await Promise.all(
      declarationFiles.map((path) => readFile(path, 'utf8')),
    )

    expect(declarationSources.some((source) => source.includes('reka-ui'))).toBe(false)

    const interactionChunks = await Promise.all(
      ['accordion', 'collapsible', 'popover'].map(async (slug) => {
        const entry = await readFile(
          resolve(packageRoot, `dist/components/${slug}/index.js`),
          'utf8',
        )
        const chunk = entry.match(/from\s*["']\.\.\/\.\.\/([^"']+\.js)["']/u)?.[1]
        if (!chunk) throw new Error(`Missing implementation chunk for ${slug}`)
        return readFile(resolve(packageRoot, 'dist', chunk), 'utf8')
      }),
    )
    expect(interactionChunks.every((source) => /from\s*["']reka-ui["']/u.test(source))).toBe(true)
    expect(
      interactionChunks.some((source) => source.includes('createContext("AccordionRoot")')),
    ).toBe(false)
  })
})
