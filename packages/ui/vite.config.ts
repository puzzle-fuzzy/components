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
        'components/avatar-dropdown/index': fromPackageRoot(
          'src/components/avatar-dropdown/index.ts',
        ),
        'components/avatar-flow/index': fromPackageRoot('src/components/avatar-flow/index.ts'),
        'components/avatar-group/index': fromPackageRoot('src/components/avatar-group/index.ts'),
        'components/button/index': fromPackageRoot('src/components/button/index.ts'),
        'components/code-input/index': fromPackageRoot('src/components/code-input/index.ts'),
        'components/divider/index': fromPackageRoot('src/components/divider/index.ts'),
        'components/dropdown/index': fromPackageRoot('src/components/dropdown/index.ts'),
        'components/select/index': fromPackageRoot('src/components/select/index.ts'),
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
