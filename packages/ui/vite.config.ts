import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const fromPackageRoot = (path: string) => resolve(import.meta.dirname, path)

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
        'components/avatar/index': fromPackageRoot('src/components/avatar/index.ts'),
        'components/avatar-flow/index': fromPackageRoot('src/components/avatar-flow/index.ts'),
        'components/button/index': fromPackageRoot('src/components/button/index.ts'),
      },
      cssFileName: 'styles',
      fileName: (_format, entryName) => entryName + '.js',
      formats: ['es'],
    },
    rolldownOptions: {
      external: ['vue'],
    },
  },
})
