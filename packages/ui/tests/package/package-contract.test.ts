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
    })
    expect(manifest.peerDependencies).toEqual({ vue: '^3.5.0' })

    const componentSubpaths = [
      './avatar',
      './avatar-dropdown',
      './avatar-flow',
      './avatar-group',
      './button',
      './code-input',
      './dialog',
      './divider',
      './dropdown',
      './image',
      './reference-textarea',
      './select',
      './tabs',
      './textarea',
      './upload',
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
      'dist/components/button/index.js',
      'dist/components/button/index.d.ts',
      'dist/components/code-input/index.js',
      'dist/components/code-input/index.d.ts',
      'dist/components/dialog/index.js',
      'dist/components/dialog/index.d.ts',
      'dist/components/divider/index.js',
      'dist/components/divider/index.d.ts',
      'dist/components/dropdown/index.js',
      'dist/components/dropdown/index.d.ts',
      'dist/components/image/index.js',
      'dist/components/image/index.d.ts',
      'dist/components/reference-textarea/index.js',
      'dist/components/reference-textarea/index.d.ts',
      'dist/components/select/index.js',
      'dist/components/select/index.d.ts',
      'dist/components/tabs/index.js',
      'dist/components/tabs/index.d.ts',
      'dist/components/textarea/index.js',
      'dist/components/textarea/index.d.ts',
      'dist/components/upload/index.js',
      'dist/components/upload/index.d.ts',
    ]

    await expect(
      Promise.all(expectedFiles.map((path) => access(resolve(packageRoot, path)))),
    ).resolves.toBeDefined()
  })
})
