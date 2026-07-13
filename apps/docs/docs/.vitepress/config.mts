import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

interface ComponentManifest {
  groups: Array<{
    id: string
    label: string
    components: Array<{ slug: string; label: string }>
  }>
}

const useSource = process.env.OMG_UI_DOCS_SOURCE === '1'
const fromRepository = (path: string) =>
  fileURLToPath(new URL('../../../../' + path, import.meta.url))
const componentManifest = JSON.parse(
  readFileSync(fromRepository('packages/ui/component-manifest.json'), 'utf8'),
) as ComponentManifest
const components = componentManifest.groups.flatMap((group) => group.components)

const sourceAliases = useSource
  ? [
      {
        find: /^@puzzle-fuzzy\/ui$/,
        replacement: fromRepository('packages/ui/src/index.ts'),
      },
      ...components.map(({ slug }) => ({
        find: new RegExp(`^@puzzle-fuzzy/ui/${slug}$`),
        replacement: fromRepository(`packages/ui/src/components/${slug}/index.ts`),
      })),
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
      { text: '组件', link: '/components/' },
    ],
    sidebar: [
      {
        text: '开始',
        items: [{ text: '组件总览', link: '/components/' }],
      },
      ...componentManifest.groups.map((group) => ({
        text: group.label,
        items: group.components.map(({ slug, label }) => ({
          text: label,
          link: `/components/${slug}`,
        })),
      })),
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
