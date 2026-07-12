import { access, readdir, readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'

const repositoryRoot = resolve(import.meta.dirname, '..')
const componentsRoot = resolve(repositoryRoot, 'packages/ui/src/components')
const docsThemePath = resolve(repositoryRoot, 'apps/docs/docs/.vitepress/theme/custom.less')
const expectedComponents = [
  'avatar',
  'avatar-dropdown',
  'avatar-flow',
  'avatar-group',
  'button',
  'checkbox',
  'code-input',
  'confirm-dialog',
  'dialog',
  'divider',
  'dropdown',
  'form-dialog',
  'image',
  'input',
  'radio',
  'reference-textarea',
  'select',
  'tabs',
  'textarea',
  'upload',
]

const toComponentName = (directory) =>
  'O' +
  directory
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')

const errors = []

const uiSourceRoot = resolve(repositoryRoot, 'packages/ui/src')
const docsExamplesRoot = resolve(repositoryRoot, 'apps/docs/examples')
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
      if (/<svg\b/iu.test(templateSource)) {
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
