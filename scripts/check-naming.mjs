import { access, readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const repositoryRoot = resolve(import.meta.dirname, '..')
const componentsRoot = resolve(repositoryRoot, 'packages/ui/src/components')
const docsThemePath = resolve(repositoryRoot, 'apps/docs/docs/.vitepress/theme/custom.less')
const expectedComponents = [
  'avatar',
  'avatar-flow',
  'avatar-group',
  'button',
  'code-input',
  'dialog',
  'divider',
  'image',
  'reference-textarea',
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
