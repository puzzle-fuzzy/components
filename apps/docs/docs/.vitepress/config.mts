import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

const useSource = process.env.OMG_UI_DOCS_SOURCE === '1'
const fromRepository = (path: string) =>
  fileURLToPath(new URL('../../../../' + path, import.meta.url))

const sourceAliases = useSource
  ? [
      {
        find: /^@puzzle-fuzzy\/ui$/,
        replacement: fromRepository('packages/ui/src/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/button$/,
        replacement: fromRepository('packages/ui/src/components/button/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/avatar$/,
        replacement: fromRepository('packages/ui/src/components/avatar/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/avatar-dropdown$/,
        replacement: fromRepository('packages/ui/src/components/avatar-dropdown/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/avatar-group$/,
        replacement: fromRepository('packages/ui/src/components/avatar-group/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/avatar-flow$/,
        replacement: fromRepository('packages/ui/src/components/avatar-flow/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/code-input$/,
        replacement: fromRepository('packages/ui/src/components/code-input/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/dialog$/,
        replacement: fromRepository('packages/ui/src/components/dialog/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/divider$/,
        replacement: fromRepository('packages/ui/src/components/divider/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/dropdown$/,
        replacement: fromRepository('packages/ui/src/components/dropdown/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/image$/,
        replacement: fromRepository('packages/ui/src/components/image/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/reference-textarea$/,
        replacement: fromRepository('packages/ui/src/components/reference-textarea/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/select$/,
        replacement: fromRepository('packages/ui/src/components/select/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/tabs$/,
        replacement: fromRepository('packages/ui/src/components/tabs/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/textarea$/,
        replacement: fromRepository('packages/ui/src/components/textarea/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/upload$/,
        replacement: fromRepository('packages/ui/src/components/upload/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/widget$/,
        replacement: fromRepository('packages/ui/src/components/widget/index.ts'),
      },
      {
        find: /^@puzzle-fuzzy\/ui\/styles\.css$/,
        replacement: fromRepository('packages/ui/src/styles/index.less'),
      },
    ]
  : []

export default defineConfig({
  title: 'OMG UI',
  description: 'A personal, Vue 3-only component library',
  lang: 'zh-CN',
  cleanUrls: true,
  vite: {
    resolve: {
      alias: sourceAliases,
    },
  },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '组件', link: '/components/button' },
    ],
    sidebar: [
      {
        text: '组件',
        items: [
          { text: 'Button 按钮', link: '/components/button' },
          { text: 'Avatar 头像', link: '/components/avatar' },
          { text: 'Avatar Group 头像组', link: '/components/avatar-group' },
          { text: 'Avatar Dropdown 头像下拉', link: '/components/avatar-dropdown' },
          { text: 'Avatar Flow 头像流', link: '/components/avatar-flow' },
          { text: 'Code Input 验证码输入', link: '/components/code-input' },
          { text: 'Dialog 对话框', link: '/components/dialog' },
          { text: 'Divider 分割线', link: '/components/divider' },
          { text: 'Dropdown 下拉菜单', link: '/components/dropdown' },
          { text: 'Image 图片', link: '/components/image' },
          { text: 'Reference Textarea 引用输入', link: '/components/reference-textarea' },
          { text: 'Select 选择器', link: '/components/select' },
          { text: 'Tabs 标签页', link: '/components/tabs' },
          { text: 'Textarea 多行输入', link: '/components/textarea' },
          { text: 'Upload 文件上传', link: '/components/upload' },
          { text: 'Widget 小组件', link: '/components/widget' },
        ],
      },
    ],
    outline: {
      level: [2, 3],
      label: '本页目录',
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
  },
})
