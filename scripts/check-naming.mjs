import { access, readdir, readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'

const repositoryRoot = resolve(import.meta.dirname, '..')
const componentsRoot = resolve(repositoryRoot, 'packages/ui/src/components')
const docsThemePath = resolve(repositoryRoot, 'apps/docs/docs/.vitepress/theme/custom.less')
const docsConfigPath = resolve(repositoryRoot, 'apps/docs/docs/.vitepress/config.mts')
const docsOverviewPath = resolve(repositoryRoot, 'apps/docs/docs/components/index.md')
const docsComponentsRoot = resolve(repositoryRoot, 'apps/docs/docs/components')
const docsExamplesRoot = resolve(repositoryRoot, 'apps/docs/examples')
const docsE2ePath = resolve(repositoryRoot, 'apps/docs/tests/e2e/components.spec.ts')
const expectedComponents = [
  'avatar',
  'avatar-dropdown',
  'avatar-flow',
  'avatar-group',
  'badge',
  'button',
  'checkbox',
  'code-input',
  'confirm-dialog',
  'dialog',
  'divider',
  'drawer',
  'dropdown',
  'form-dialog',
  'image',
  'input',
  'message',
  'progress',
  'radio',
  'reference-textarea',
  'select',
  'tag',
  'tabs',
  'textarea',
  'upload',
  'widget',
]

const toComponentName = (directory) =>
  'O' +
  directory
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')

const errors = []

const uiSourceRoot = resolve(repositoryRoot, 'packages/ui/src')
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

const docsTheme = await readFile(docsThemePath, 'utf8')
const docsConfig = await readFile(docsConfigPath, 'utf8')
const docsOverview = await readFile(docsOverviewPath, 'utf8')
const docsE2e = await readFile(docsE2ePath, 'utf8')
if (/--vp-c-brand-[\w-]+\s*:/u.test(docsTheme)) {
  errors.push('docs theme must not override VitePress brand variables')
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

  const sourceAlias = 'find: /^@puzzle-fuzzy\\/ui\\/' + directory + '$/'
  if (!docsConfig.includes(sourceAlias)) {
    errors.push(directory + ': missing VitePress source alias')
  }
  if (!docsConfig.includes("link: '/components/" + directory + "'")) {
    errors.push(directory + ': missing VitePress sidebar entry')
  }
  if (!docsOverview.includes('](/components/' + directory + ')')) {
    errors.push(directory + ': missing component overview link')
  }
  if (!docsE2e.includes("page.goto('/components/" + directory + "')")) {
    errors.push(directory + ': missing Playwright route visit')
  }

  if (directory === 'drawer' || directory === 'message') {
    try {
      await access(resolve(docsExamplesRoot, directory, 'Basic.vue'))
    } catch {
      errors.push(directory + ': missing Basic.vue capability example')
    }
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

const rootEntries = await readdir(componentsRoot, { withFileTypes: true })
for (const entry of rootEntries) {
  if (!entry.isDirectory() || !expectedComponents.includes(entry.name)) {
    errors.push('components root contains unsupported entry: ' + entry.name)
  }
}

if (errors.length > 0) {
  console.error(
    ['OMG UI naming contract failed:', ...errors.map((error) => '- ' + error)].join('\n'),
  )
  process.exitCode = 1
} else {
  console.log('OMG UI naming contract passed for ' + expectedComponents.length + ' components.')
}
