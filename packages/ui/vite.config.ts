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
        'components/alert/index': fromPackageRoot('src/components/alert/index.ts'),
        'components/aspect-ratio/index': fromPackageRoot('src/components/aspect-ratio/index.ts'),
        'components/avatar/index': fromPackageRoot('src/components/avatar/index.ts'),
        'components/avatar-dropdown/index': fromPackageRoot(
          'src/components/avatar-dropdown/index.ts',
        ),
        'components/avatar-flow/index': fromPackageRoot('src/components/avatar-flow/index.ts'),
        'components/avatar-group/index': fromPackageRoot('src/components/avatar-group/index.ts'),
        'components/badge/index': fromPackageRoot('src/components/badge/index.ts'),
        'components/button/index': fromPackageRoot('src/components/button/index.ts'),
        'components/button-group/index': fromPackageRoot('src/components/button-group/index.ts'),
        'components/card/index': fromPackageRoot('src/components/card/index.ts'),
        'components/checkbox/index': fromPackageRoot('src/components/checkbox/index.ts'),
        'components/code-input/index': fromPackageRoot('src/components/code-input/index.ts'),
        'components/confirm-dialog/index': fromPackageRoot(
          'src/components/confirm-dialog/index.ts',
        ),
        'components/dialog/index': fromPackageRoot('src/components/dialog/index.ts'),
        'components/divider/index': fromPackageRoot('src/components/divider/index.ts'),
        'components/drawer/index': fromPackageRoot('src/components/drawer/index.ts'),
        'components/dropdown/index': fromPackageRoot('src/components/dropdown/index.ts'),
        'components/empty/index': fromPackageRoot('src/components/empty/index.ts'),
        'components/form-dialog/index': fromPackageRoot('src/components/form-dialog/index.ts'),
        'components/image/index': fromPackageRoot('src/components/image/index.ts'),
        'components/input/index': fromPackageRoot('src/components/input/index.ts'),
        'components/kbd/index': fromPackageRoot('src/components/kbd/index.ts'),
        'components/message/index': fromPackageRoot('src/components/message/index.ts'),
        'components/progress/index': fromPackageRoot('src/components/progress/index.ts'),
        'components/radio/index': fromPackageRoot('src/components/radio/index.ts'),
        'components/reference-textarea/index': fromPackageRoot(
          'src/components/reference-textarea/index.ts',
        ),
        'components/skeleton/index': fromPackageRoot('src/components/skeleton/index.ts'),
        'components/spinner/index': fromPackageRoot('src/components/spinner/index.ts'),
        'components/select/index': fromPackageRoot('src/components/select/index.ts'),
        'components/switch/index': fromPackageRoot('src/components/switch/index.ts'),
        'components/tag/index': fromPackageRoot('src/components/tag/index.ts'),
        'components/tabs/index': fromPackageRoot('src/components/tabs/index.ts'),
        'components/textarea/index': fromPackageRoot('src/components/textarea/index.ts'),
        'components/tooltip/index': fromPackageRoot('src/components/tooltip/index.ts'),
        'components/upload/index': fromPackageRoot('src/components/upload/index.ts'),
        'components/widget/index': fromPackageRoot('src/components/widget/index.ts'),
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
