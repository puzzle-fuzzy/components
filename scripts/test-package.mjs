import { mkdtemp, readFile, readdir, realpath, rm, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join, relative, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { list as listTarball } from 'tar'

const repositoryRoot = resolve(import.meta.dirname, '..')
const packageRoot = resolve(repositoryRoot, 'packages/ui')
const temporaryRoot = await mkdtemp(join(tmpdir(), 'omg-ui-package-'))
const npmExecPath = process.env.npm_execpath

const run = (command, args, cwd = repositoryRoot) => {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      FORCE_COLOR: '0',
    },
    stdio: 'pipe',
  })

  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)

  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(command + ' exited with status ' + String(result.status))
  }
}

const runPnpm = (args, cwd = repositoryRoot) => {
  if (npmExecPath) {
    run(process.execPath, [npmExecPath, ...args], cwd)
    return
  }

  run(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', args, cwd)
}

try {
  runPnpm(['--dir', packageRoot, 'pack', '--pack-destination', temporaryRoot])
  runPnpm(['exec', 'vitest', 'run', 'packages/ui/tests/package'])

  const tarballName = (await readdir(temporaryRoot)).find((file) => file.endsWith('.tgz'))
  if (!tarballName) {
    throw new Error('pnpm pack did not produce a tarball')
  }

  const tarballPath = resolve(temporaryRoot, tarballName)
  runPnpm(['exec', 'publint', 'run', tarballPath, '--strict'])
  runPnpm([
    'exec',
    'attw',
    tarballPath,
    '--profile',
    'esm-only',
    '--entrypoints',
    '.',
    './avatar',
    './avatar-dropdown',
    './avatar-flow',
    './avatar-group',
    './button',
    './code-input',
    './dialog',
    './divider',
    './dropdown',
    './image',
    './reference-textarea',
    './select',
    './tabs',
    './textarea',
    './upload',
    // Vue SFC declarations intentionally target TypeScript's bundler resolution.
    // Node16 cannot model internal .vue.d.ts files, while the supported bundler profile can.
    '--ignore-rules',
    'internal-resolution-error',
    '--no-emoji',
  ])

  const packedFiles = []
  await listTarball({
    file: tarballPath,
    onReadEntry: (entry) => packedFiles.push(entry.path),
  })
  const forbiddenSegments = [
    'package/src/',
    '/tests/',
    '/apps/',
    '/.vitepress/',
    'bun.lock',
    'pnpm-lock',
  ]
  const forbiddenFile = packedFiles.find(
    (file) =>
      forbiddenSegments.some((segment) => file.includes(segment)) ||
      file.endsWith('.vue') ||
      file.endsWith('.map') ||
      (file.endsWith('.ts') && !file.endsWith('.d.ts')),
  )
  if (forbiddenFile) {
    throw new Error('Forbidden file in package tarball: ' + forbiddenFile)
  }

  const consumerRoot = resolve(temporaryRoot, 'consumer')
  const sourceRoot = resolve(consumerRoot, 'src')
  await mkdir(sourceRoot, { recursive: true })

  const consumerManifest = {
    name: 'omg-ui-package-consumer',
    private: true,
    type: 'module',
    dependencies: {
      '@puzzle-fuzzy/ui': 'file:' + tarballPath,
      vue: '^3.5.39',
    },
    devDependencies: {
      '@types/node': '^24.13.3',
      '@vitejs/plugin-vue': '^6.0.7',
      typescript: '~6.0.3',
      vite: '^8.1.1',
      'vue-tsc': '^3.3.5',
    },
  }

  await writeFile(
    resolve(consumerRoot, 'package.json'),
    JSON.stringify(consumerManifest, null, 2) + '\n',
    'utf8',
  )
  await writeFile(
    resolve(consumerRoot, 'index.html'),
    [
      '<!doctype html>',
      '<html lang="en">',
      '  <head><meta charset="UTF-8"><title>OMG UI package consumer</title></head>',
      '  <body><div id="app"></div><script type="module" src="/src/main.ts"></script></body>',
      '</html>',
      '',
    ].join('\n'),
    'utf8',
  )
  await writeFile(
    resolve(consumerRoot, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          strict: true,
          noEmit: true,
          lib: ['ESNext', 'DOM', 'DOM.Iterable'],
          types: ['node', 'vite/client'],
        },
        include: ['src/**/*.ts', 'src/**/*.vue', 'vite.config.ts'],
      },
      null,
      2,
    ) + '\n',
    'utf8',
  )
  await writeFile(
    resolve(consumerRoot, 'vite.config.ts'),
    [
      "import vue from '@vitejs/plugin-vue'",
      "import { defineConfig } from 'vite'",
      '',
      'export default defineConfig({ plugins: [vue()] })',
      '',
    ].join('\n'),
    'utf8',
  )
  await writeFile(
    resolve(sourceRoot, 'main.ts'),
    [
      "import { createApp } from 'vue'",
      "import App from './App.vue'",
      "import '@puzzle-fuzzy/ui/styles.css'",
      '',
      "createApp(App).mount('#app')",
      '',
    ].join('\n'),
    'utf8',
  )
  await writeFile(
    resolve(sourceRoot, 'App.vue'),
    [
      '<script setup lang="ts">',
      "import { ref } from 'vue'",
      'import {',
      '  OAvatarDropdown as ORootAvatarDropdown,',
      '  OButton as ORootButton,',
      '  ODialog as ORootDialog,',
      '  ODropdown as ORootDropdown,',
      '  OImage as ORootImage,',
      '  OReferenceTextarea as ORootReferenceTextarea,',
      '  OSelect as ORootSelect,',
      '  OTabs as ORootTabs,',
      '  OTextarea as ORootTextarea,',
      '  OUpload as ORootUpload,',
      "} from '@puzzle-fuzzy/ui'",
      "import { OAvatar } from '@puzzle-fuzzy/ui/avatar'",
      "import { OAvatarDropdown as OSubpathAvatarDropdown } from '@puzzle-fuzzy/ui/avatar-dropdown'",
      "import { OAvatarGroup, type OAvatarGroupItem } from '@puzzle-fuzzy/ui/avatar-group'",
      "import { OAvatarFlow, type OAvatarFlowPeer } from '@puzzle-fuzzy/ui/avatar-flow'",
      "import { OButton } from '@puzzle-fuzzy/ui/button'",
      "import { OCodeInput } from '@puzzle-fuzzy/ui/code-input'",
      "import { ODialog } from '@puzzle-fuzzy/ui/dialog'",
      "import { ODivider } from '@puzzle-fuzzy/ui/divider'",
      "import { ODropdown as OSubpathDropdown, type ODropdownItem } from '@puzzle-fuzzy/ui/dropdown'",
      "import { OImage } from '@puzzle-fuzzy/ui/image'",
      "import { OReferenceTextarea, type OReferenceTextareaReference } from '@puzzle-fuzzy/ui/reference-textarea'",
      "import { OSelect as OSubpathSelect, type OSelectOption, type OSelectValue } from '@puzzle-fuzzy/ui/select'",
      "import { OTabs, type OTabsItem } from '@puzzle-fuzzy/ui/tabs'",
      "import { OTextarea } from '@puzzle-fuzzy/ui/textarea'",
      "import { OUpload } from '@puzzle-fuzzy/ui/upload'",
      '',
      "const sender: OAvatarFlowPeer = { id: 'sender', name: 'OMG UI' }",
      "const receivers: readonly OAvatarFlowPeer[] = [{ id: 'vue', name: 'Vue' }]",
      "const groupItems: readonly OAvatarGroupItem[] = [{ id: 'one', name: 'One' }]",
      "const menuItems: readonly ODropdownItem[] = [{ value: 'profile', label: 'Profile' }]",
      "const selectOptions: readonly OSelectOption[] = [{ value: 1, label: 'One' }]",
      "const tabItems: readonly OTabsItem[] = [{ value: 'one', label: 'One' }]",
      "const references: readonly OReferenceTextareaReference[] = [{ id: 'one', label: 'One' }]",
      "const code = ref('')",
      'const selected = ref<OSelectValue>()',
      "const tab = ref('one')",
      "const text = ref('')",
      '</script>',
      '',
      '<template>',
      '  <ORootButton>Root entry</ORootButton>',
      '  <ORootDialog :open="false" title="Root dialog">Dialog</ORootDialog>',
      '  <ORootImage alt="Root image" preview-aria-label="Preview root image" :preview="false" src="/root.png" />',
      '  <ORootReferenceTextarea v-model="text" aria-label="Root reference textarea" :references="references" />',
      '  <ORootTabs v-model="tab" aria-label="Root tabs" :items="tabItems" />',
      '  <ORootTextarea v-model="text" aria-label="Root textarea" />',
      '  <ORootUpload aria-label="Root upload" />',
      '  <ORootDropdown :items="menuItems" trigger-aria-label="Root menu">',
      '    <template #trigger>Root dropdown</template>',
      '  </ORootDropdown>',
      '  <ORootSelect v-model="selected" aria-label="Root select" :options="selectOptions" />',
      '  <ORootAvatarDropdown ariaLabel="Root avatar menu" :items="menuItems" name="Root avatar" />',
      '  <OButton variant="soft">Button subpath</OButton>',
      '  <ODialog :open="false" title="Subpath dialog">Dialog</ODialog>',
      '  <OImage alt="Subpath image" preview-aria-label="Preview subpath image" :preview="false" src="/subpath.png" />',
      '  <OReferenceTextarea v-model="text" aria-label="Subpath reference textarea" :references="references" />',
      '  <OTabs v-model="tab" aria-label="Subpath tabs" :items="tabItems" />',
      '  <OTextarea v-model="text" aria-label="Subpath textarea" />',
      '  <OUpload aria-label="Subpath upload" />',
      '  <OAvatar name="Avatar subpath" />',
      '  <OSubpathDropdown :items="menuItems" trigger-aria-label="Subpath menu">',
      '    <template #trigger>Subpath dropdown</template>',
      '  </OSubpathDropdown>',
      '  <OSubpathSelect v-model="selected" aria-label="Subpath select" :options="selectOptions" />',
      '  <OSubpathAvatarDropdown',
      '    ariaLabel="Subpath avatar menu"',
      '    :items="menuItems"',
      '    name="Subpath avatar"',
      '  />',
      '  <OAvatarGroup aria-label="Package avatars" :items="groupItems" :overlap="10" />',
      '  <OAvatarFlow',
      '    ariaLabel="Package consumer smoke test"',
      '    :receivers="receivers"',
      '    :sender="sender"',
      '    state="transferring"',
      '  />',
      '  <OCodeInput v-model="code" aria-label="Package code" />',
      '  <ODivider>Package divider</ODivider>',
      '</template>',
      '',
    ].join('\n'),
    'utf8',
  )

  runPnpm(['install', '--ignore-scripts'], consumerRoot)
  runPnpm(['exec', 'vue-tsc', '--noEmit'], consumerRoot)
  runPnpm(['exec', 'vite', 'build'], consumerRoot)

  const manifest = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'))
  const relativeTarball = relative(temporaryRoot, tarballPath)
  console.log(
    'Package smoke test passed for ' +
      manifest.name +
      '@' +
      manifest.version +
      ' (' +
      relativeTarball +
      ', ' +
      packedFiles.length +
      ' files).',
  )
} finally {
  const resolvedTempDirectory = await realpath(tmpdir())
  const resolvedTemporaryRoot = await realpath(temporaryRoot).catch(() => temporaryRoot)
  const relativeTemporaryRoot = relative(resolvedTempDirectory, resolvedTemporaryRoot)
  const isSafeTemporaryRoot =
    relativeTemporaryRoot !== '' &&
    !relativeTemporaryRoot.startsWith('..') &&
    !relativeTemporaryRoot.includes(':')

  if (!isSafeTemporaryRoot || !basename(resolvedTemporaryRoot).startsWith('omg-ui-package-')) {
    console.error(
      'Refusing to remove unverified temporary directory: ' +
        pathToFileURL(resolvedTemporaryRoot).href,
    )
    process.exitCode = 1
  } else {
    await rm(resolvedTemporaryRoot, { recursive: true, force: true })
  }
}
