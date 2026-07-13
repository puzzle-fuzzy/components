import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const packageRoot = resolve(import.meta.dirname, '../..')

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
    expect(manifest.license).toBe('UNLICENSED')
    expect(manifest.main).toBeUndefined()
    expect(manifest.exports['.']?.require).toBeUndefined()
    expect(manifest.dependencies).toEqual({
      '@floating-ui/dom': 'catalog:',
      'vue-icons-plus': 'catalog:',
      'vue-virtual-scroller': 'catalog:',
    })
    expect(manifest.peerDependencies).toEqual({ vue: '^3.5.0' })

    const componentSubpaths = [
      './avatar',
      './avatar-dropdown',
      './avatar-flow',
      './avatar-group',
      './badge',
      './button',
      './checkbox',
      './code-input',
      './confirm-dialog',
      './dialog',
      './divider',
      './drawer',
      './dropdown',
      './form-dialog',
      './image',
      './input',
      './message',
      './progress',
      './radio',
      './reference-textarea',
      './select',
      './tag',
      './tabs',
      './textarea',
      './upload',
      './widget',
    ]

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
      'dist/components/avatar/index.js',
      'dist/components/avatar/index.d.ts',
      'dist/components/avatar-dropdown/index.js',
      'dist/components/avatar-dropdown/index.d.ts',
      'dist/components/avatar-group/index.js',
      'dist/components/avatar-group/index.d.ts',
      'dist/components/avatar-flow/index.js',
      'dist/components/avatar-flow/index.d.ts',
      'dist/components/badge/index.js',
      'dist/components/badge/index.d.ts',
      'dist/components/button/index.js',
      'dist/components/button/index.d.ts',
      'dist/components/checkbox/index.js',
      'dist/components/checkbox/index.d.ts',
      'dist/components/code-input/index.js',
      'dist/components/code-input/index.d.ts',
      'dist/components/confirm-dialog/index.js',
      'dist/components/confirm-dialog/index.d.ts',
      'dist/components/dialog/index.js',
      'dist/components/dialog/index.d.ts',
      'dist/components/divider/index.js',
      'dist/components/divider/index.d.ts',
      'dist/components/drawer/index.js',
      'dist/components/drawer/index.d.ts',
      'dist/components/dropdown/index.js',
      'dist/components/dropdown/index.d.ts',
      'dist/components/form-dialog/index.js',
      'dist/components/form-dialog/index.d.ts',
      'dist/components/image/index.js',
      'dist/components/image/index.d.ts',
      'dist/components/input/index.js',
      'dist/components/input/index.d.ts',
      'dist/components/message/index.js',
      'dist/components/message/index.d.ts',
      'dist/components/progress/index.js',
      'dist/components/progress/index.d.ts',
      'dist/components/radio/index.js',
      'dist/components/radio/index.d.ts',
      'dist/components/reference-textarea/index.js',
      'dist/components/reference-textarea/index.d.ts',
      'dist/components/select/index.js',
      'dist/components/select/index.d.ts',
      'dist/components/tag/index.js',
      'dist/components/tag/index.d.ts',
      'dist/components/tabs/index.js',
      'dist/components/tabs/index.d.ts',
      'dist/components/textarea/index.js',
      'dist/components/textarea/index.d.ts',
      'dist/components/upload/index.js',
      'dist/components/upload/index.d.ts',
      'dist/components/widget/index.js',
      'dist/components/widget/index.d.ts',
    ]

    await expect(
      Promise.all(expectedFiles.map((path) => access(resolve(packageRoot, path)))),
    ).resolves.toBeDefined()
  })

  test('ships virtual-scroller layout through the single public stylesheet', async () => {
    const publicStyles = await readFile(resolve(packageRoot, 'dist/styles.css'), 'utf8')

    expect(publicStyles).toContain('.vue-recycle-scroller')
    expect(publicStyles).toContain('.o-badge')
    expect(publicStyles).toContain('.o-progress')
    expect(publicStyles).toContain('.o-tag')
    await expect(access(resolve(packageRoot, 'dist/select.css'))).rejects.toThrow()
  })
})
