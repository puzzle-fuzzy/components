import { access, readdir, readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import {
  flattenComponentManifest,
  pushExactSetErrors,
  readComponentManifest,
} from './component-manifest.mjs'

const repositoryRoot = resolve(import.meta.dirname, '..')
const componentsRoot = resolve(repositoryRoot, 'packages/ui/src/components')
const uiSourceRoot = resolve(repositoryRoot, 'packages/ui/src')
const docsThemePath = resolve(repositoryRoot, 'apps/docs/docs/.vitepress/theme/custom.less')
const docsConfigPath = resolve(repositoryRoot, 'apps/docs/docs/.vitepress/config.mts')
const docsOverviewPath = resolve(repositoryRoot, 'apps/docs/docs/components/index.md')
const docsComponentsRoot = resolve(repositoryRoot, 'apps/docs/docs/components')
const docsExamplesRoot = resolve(repositoryRoot, 'apps/docs/examples')
const docsE2ePath = resolve(repositoryRoot, 'apps/docs/tests/e2e/components.spec.ts')
const packagePath = resolve(repositoryRoot, 'packages/ui/package.json')
const rootIndexPath = resolve(repositoryRoot, 'packages/ui/src/index.ts')
const stylesIndexPath = resolve(repositoryRoot, 'packages/ui/src/styles/index.less')
const viteConfigPath = resolve(repositoryRoot, 'packages/ui/vite.config.ts')

const manifest = await readComponentManifest(repositoryRoot)
const components = flattenComponentManifest(manifest)
const expectedComponents = components.map(({ slug }) => slug)
const errors = []

const toComponentName = (directory) =>
  'O' +
  directory
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')

const forbiddenIconPackages = ['lucide-vue-next', '@heroicons', '@fortawesome', '@iconify']

const collectFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const path = resolve(directory, entry.name)
      return entry.isDirectory() ? collectFiles(path) : [path]
    }),
  )

  return files.flat()
}

const collectMatches = (source, expression) =>
  [...source.matchAll(expression)].map((match) => match[1]).filter(Boolean)

for (const root of [uiSourceRoot, docsExamplesRoot]) {
  for (const file of await collectFiles(root)) {
    if (file.endsWith('.svg')) {
      errors.push('raw SVG is not allowed: ' + relative(repositoryRoot, file))
      continue
    }

    if (!/\.(?:ts|vue)$/u.test(file)) continue

    const source = await readFile(file, 'utf8')
    if (file.endsWith('.vue')) {
      const templateSource = source.match(/<template\b[^>]*>([\s\S]*)<\/template>/iu)?.[1] ?? ''
      const inlineSvgTags = templateSource.match(/<svg\b(?:[^>"']|"[^"]*"|'[^']*')*>/giu) ?? []
      const hasUnmarkedInlineSvg = inlineSvgTags.some(
        (tag) => !/\sdata-omg-visualization(?:\s|=|\/?>)/iu.test(tag),
      )

      if (hasUnmarkedInlineSvg) {
        errors.push('inline SVG is not allowed: ' + relative(repositoryRoot, file))
      }
    }

    for (const match of source.matchAll(/from\s+['"]([^'"]+)['"]/gu)) {
      const importSource = match[1]
      if (!importSource) continue

      if (importSource.startsWith('vue-icons-plus') && importSource !== 'vue-icons-plus/lu') {
        errors.push('unsupported vue-icons-plus entry in ' + relative(repositoryRoot, file))
      }

      if (forbiddenIconPackages.some((name) => importSource.startsWith(name))) {
        errors.push('unsupported icon package in ' + relative(repositoryRoot, file))
      }
    }
  }
}

const [docsTheme, docsConfig, docsOverview, docsE2e, rootIndex, stylesIndex, viteConfig] =
  await Promise.all(
    [
      docsThemePath,
      docsConfigPath,
      docsOverviewPath,
      docsE2ePath,
      rootIndexPath,
      stylesIndexPath,
      viteConfigPath,
    ].map((path) => readFile(path, 'utf8')),
  )
const packageJson = JSON.parse(await readFile(packagePath, 'utf8'))

if (/--vp-c-brand-[\w-]+\s*:/u.test(docsTheme)) {
  errors.push('docs theme must not override VitePress brand variables')
}
if (!docsConfig.includes('component-manifest.json')) {
  errors.push('VitePress config must derive component navigation from component-manifest.json')
}
if (!docsE2e.includes('component-manifest.json') || !docsE2e.includes('componentRoutes')) {
  errors.push('Playwright route smoke must derive routes from component-manifest.json')
}
if (!viteConfig.includes('component-manifest.json') || !viteConfig.includes('componentEntries')) {
  errors.push('Vite config must derive component entries from component-manifest.json')
}

for (const directory of expectedComponents) {
  const componentName = toComponentName(directory)
  const requiredFiles = [
    'src/' + componentName + '.vue',
    'src/' + directory + '.ts',
    'style/index.less',
    '__tests__/' + directory + '.test.ts',
    'index.ts',
  ]

  for (const file of requiredFiles) {
    try {
      await access(resolve(componentsRoot, directory, file))
    } catch {
      errors.push(directory + ': missing ' + file)
    }
  }

  try {
    await access(resolve(docsComponentsRoot, directory + '.md'))
  } catch {
    errors.push(directory + ': missing docs page')
  }

  try {
    const entry = await readFile(resolve(componentsRoot, directory, 'index.ts'), 'utf8')
    if (entry.includes('export *')) {
      errors.push(directory + ': index.ts must use explicit exports')
    }
  } catch {
    // Missing entry is already reported above.
  }
}

const rootEntries = (await readdir(componentsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
const docsPages = (await readdir(docsComponentsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md')
  .map((entry) => entry.name.slice(0, -3))
const packageSubpaths = Object.keys(packageJson.exports)
  .filter((key) => key !== '.' && key !== './styles.css')
  .map((key) => key.slice(2))
const rootExportComponents = collectMatches(rootIndex, /from\s+['"]\.\/components\/([^'"]+)['"]/gu)
const styleComponents = collectMatches(
  stylesIndex,
  /@import\s+['"]\.\.\/components\/([^/'"]+)\/style\/index\.less['"]/gu,
)
const overviewComponents = collectMatches(docsOverview, /\]\(\/components\/([^)]+)\)/gu)

for (const [label, actual] of [
  ['component directories', rootEntries],
  ['component docs pages', docsPages],
  ['package component exports', packageSubpaths],
  ['root component exports', rootExportComponents],
  ['component style imports', styleComponents],
  ['component overview links', overviewComponents],
]) {
  pushExactSetErrors(errors, label, actual, expectedComponents)
}

if (errors.length > 0) {
  console.error(
    ['OMG UI naming contract failed:', ...errors.map((error) => '- ' + error)].join('\n'),
  )
  process.exitCode = 1
} else {
  console.log('OMG UI naming contract passed for ' + expectedComponents.length + ' components.')
}
