import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const fromPackageRoot = (path: string) => resolve(import.meta.dirname, path)
const componentManifest = JSON.parse(
  readFileSync(fromPackageRoot('component-manifest.json'), 'utf8'),
) as {
  groups: Array<{ components: Array<{ slug: string }> }>
}
const componentEntries = Object.fromEntries(
  componentManifest.groups.flatMap((group) =>
    group.components.map(({ slug }) => [
      `components/${slug}/index`,
      fromPackageRoot(`src/components/${slug}/index.ts`),
    ]),
  ),
)

export default defineConfig({
  plugins: [vue()],
  build: {
    copyPublicDir: false,
    cssCodeSplit: true,
    sourcemap: false,
    lib: {
      entry: {
        index: fromPackageRoot('src/index.ts'),
        styles: fromPackageRoot('src/styles/index.less'),
        ...componentEntries,
      },
      cssFileName: 'styles',
      fileName: (_format, entryName) => entryName + '.js',
      formats: ['es'],
    },
    rolldownOptions: {
      external: (id) => id === 'vue' || id === 'reka-ui' || id.startsWith('reka-ui/'),
    },
  },
})
