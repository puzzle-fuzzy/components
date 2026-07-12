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
  exports: Record<string, { require?: unknown }>
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
    expect(manifest.peerDependencies).toEqual({ vue: '^3.5.0' })
  })

  test('emits every declared public entry', async () => {
    const expectedFiles = [
      'dist/index.js',
      'dist/index.d.ts',
      'dist/styles.css',
      'dist/components/avatar/index.js',
      'dist/components/avatar/index.d.ts',
      'dist/components/avatar-flow/index.js',
      'dist/components/avatar-flow/index.d.ts',
      'dist/components/button/index.js',
      'dist/components/button/index.d.ts',
    ]

    await expect(
      Promise.all(expectedFiles.map((path) => access(resolve(packageRoot, path)))),
    ).resolves.toBeDefined()
  })
})
