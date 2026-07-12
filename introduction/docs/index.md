---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "OMG UI"
  text: "你的 Vue 组件库"
  tagline: 在 VitePress 中展示组件能力，组件自身支持日夜主题适配。
  actions:
    - theme: brand
      text: 查看 Button
      link: /components/button

features:
  - title: Library mode
    details: packages/ui 使用 Vite lib 模式输出 ESM、UMD、CSS 和类型声明。
  - title: Theme aware
    details: 组件可跟随外部暗色环境，也可通过自身 prop 独立指定 light 或 dark。
  - title: VitePress as showcase
    details: 文档站只负责展示组件，不接管组件库的主题状态。
---
