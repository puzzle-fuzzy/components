import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: 'src',
      outDirs: ['dist'],
      tsconfigPath: './tsconfig.app.json',
      insertTypesEntry: true,
      exclude: ['src/App.vue', 'src/main.ts'],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    copyPublicDir: false,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'OmgUi',
      cssFileName: 'omg-ui',
      formats: ['es', 'umd'],
      fileName: (format) => `omg-ui.${format === 'es' ? 'es.js' : 'umd.cjs'}`,
    },
    rollupOptions: {
      external: ['vue', '@vueuse/core'],
      output: {
        globals: {
          vue: 'Vue',
          '@vueuse/core': 'VueUse',
        },
      },
    },
  },
})
