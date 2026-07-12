import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import '@puzzle-fuzzy/ui/styles.css'
import DemoBlock from './components/DemoBlock.vue'
import OmgLayout from './components/OmgLayout.vue'
import './custom.less'

export default {
  extends: DefaultTheme,
  Layout: OmgLayout,
  enhanceApp({ app }) {
    app.component('DemoBlock', DemoBlock)
  },
} satisfies Theme
