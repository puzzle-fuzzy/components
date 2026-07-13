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
const componentManifest = JSON.parse(
  await readFile(resolve(packageRoot, 'component-manifest.json'), 'utf8'),
)
const componentEntrypoints = componentManifest.groups.flatMap((group) =>
  group.components.map(({ slug }) => './' + slug),
)

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
    ...componentEntrypoints,
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
  if (!packedFiles.includes('package/LICENSE')) {
    throw new Error('Package tarball must include the MIT license')
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
      '  OAccordion as ORootAccordion,',
      '  OAccordionContent as ORootAccordionContent,',
      '  OAccordionItem as ORootAccordionItem,',
      '  OAccordionTrigger as ORootAccordionTrigger,',
      '  OAlert as ORootAlert,',
      '  OAspectRatio as ORootAspectRatio,',
      '  OAvatarDropdown as ORootAvatarDropdown,',
      '  OBadge as ORootBadge,',
      '  OButton as ORootButton,',
      '  OButtonGroup as ORootButtonGroup,',
      '  OButtonGroupSeparator as ORootButtonGroupSeparator,',
      '  OButtonGroupText as ORootButtonGroupText,',
      '  OCard as ORootCard,',
      '  OCheckbox as ORootCheckbox,',
      '  OCollapsible as ORootCollapsible,',
      '  OCollapsibleContent as ORootCollapsibleContent,',
      '  OCollapsibleTrigger as ORootCollapsibleTrigger,',
      '  OConfirmDialog as ORootConfirmDialog,',
      '  ODialog as ORootDialog,',
      '  ODrawer as ORootDrawer,',
      '  ODropdown as ORootDropdown,',
      '  OEmpty as ORootEmpty,',
      '  OField as ORootField,',
      '  OFieldContent as ORootFieldContent,',
      '  OFieldLabel as ORootFieldLabel,',
      '  OFormDialog as ORootFormDialog,',
      '  OImage as ORootImage,',
      '  OInput as ORootInput,',
      '  OInputGroup as ORootInputGroup,',
      '  OInputGroupAddon as ORootInputGroupAddon,',
      '  OInputGroupInput as ORootInputGroupInput,',
      '  OKbd as ORootKbd,',
      '  OKbdGroup as ORootKbdGroup,',
      '  OMessage as ORootMessage,',
      '  OLabel as ORootLabel,',
      '  OPopover as ORootPopover,',
      '  OPopoverContent as ORootPopoverContent,',
      '  OPopoverTrigger as ORootPopoverTrigger,',
      '  OProgress as ORootProgress,',
      '  ORadio as ORootRadio,',
      '  ORadioGroup as ORootRadioGroup,',
      '  OReferenceTextarea as ORootReferenceTextarea,',
      '  OSkeleton as ORootSkeleton,',
      '  OSpinner as ORootSpinner,',
      '  OSelect as ORootSelect,',
      '  OSwitch as ORootSwitch,',
      '  OTag as ORootTag,',
      '  OTabs as ORootTabs,',
      '  OTextarea as ORootTextarea,',
      '  OTooltip as ORootTooltip,',
      '  OUpload as ORootUpload,',
      '  OWidget as ORootWidget,',
      '  normalizeOAspectRatio,',
      '  normalizeODialogWidth,',
      '  normalizeOSkeletonDimension,',
      '  normalizeOTooltipOffset,',
      '  oMessage as rootMessage,',
      '  type OAlertStatus as ORootAlertStatus,',
      '  type OAccordionValue as ORootAccordionValue,',
      '  type OAspectRatioProps as ORootAspectRatioProps,',
      '  type OButtonGroupOrientation as ORootButtonGroupOrientation,',
      '  type OCardVariant as ORootCardVariant,',
      '  type ODialogCloseReason,',
      '  type ODialogCloseRequest,',
      '  type ODialogWidth,',
      '  type OMessageService,',
      '  type OEmptySize as ORootEmptySize,',
      '  type OKbdSize as ORootKbdSize,',
      '  type OSkeletonVariant as ORootSkeletonVariant,',
      '  type OSpinnerSize as ORootSpinnerSize,',
      '  type OSwitchSize as ORootSwitchSize,',
      '  type OTextareaAutosizeOptions,',
      '  type OTooltipPlacement as ORootTooltipPlacement,',
      '  type OUploadFile,',
      "} from '@puzzle-fuzzy/ui'",
      "import { OAccordion, OAccordionContent, OAccordionItem, OAccordionTrigger, type OAccordionValue } from '@puzzle-fuzzy/ui/accordion'",
      "import { OAlert as OSubpathAlert, type OAlertStatus } from '@puzzle-fuzzy/ui/alert'",
      "import { OAspectRatio, type OAspectRatioProps } from '@puzzle-fuzzy/ui/aspect-ratio'",
      "import { OAvatar } from '@puzzle-fuzzy/ui/avatar'",
      "import { OAvatarDropdown as OSubpathAvatarDropdown } from '@puzzle-fuzzy/ui/avatar-dropdown'",
      "import { OAvatarGroup, type OAvatarGroupItem } from '@puzzle-fuzzy/ui/avatar-group'",
      "import { OAvatarFlow, type OAvatarFlowPeer } from '@puzzle-fuzzy/ui/avatar-flow'",
      "import { OBadge as OSubpathBadge, normalizeOBadgeMax, type OBadgeTone } from '@puzzle-fuzzy/ui/badge'",
      "import { OButton } from '@puzzle-fuzzy/ui/button'",
      "import { OButtonGroup, OButtonGroupSeparator, OButtonGroupText, type OButtonGroupOrientation } from '@puzzle-fuzzy/ui/button-group'",
      "import { OCard, type OCardVariant } from '@puzzle-fuzzy/ui/card'",
      "import { OCheckbox } from '@puzzle-fuzzy/ui/checkbox'",
      "import { OCodeInput } from '@puzzle-fuzzy/ui/code-input'",
      "import { OCollapsible, OCollapsibleContent, OCollapsibleTrigger } from '@puzzle-fuzzy/ui/collapsible'",
      "import { OConfirmDialog } from '@puzzle-fuzzy/ui/confirm-dialog'",
      "import { ODialog, normalizeODialogWidth as normalizeSubpathDialogWidth, oDialogCommonProps, type ODialogCloseReason as OSubpathDialogCloseReason, type ODialogCloseRequest as OSubpathDialogCloseRequest, type ODialogWidth as OSubpathDialogWidth } from '@puzzle-fuzzy/ui/dialog'",
      "import { ODivider } from '@puzzle-fuzzy/ui/divider'",
      "import { ODrawer as OSubpathDrawer } from '@puzzle-fuzzy/ui/drawer'",
      "import { ODropdown as OSubpathDropdown, type ODropdownItem } from '@puzzle-fuzzy/ui/dropdown'",
      "import { OEmpty, type OEmptySize } from '@puzzle-fuzzy/ui/empty'",
      "import { OField, OFieldContent, OFieldLabel, type OFieldOrientation } from '@puzzle-fuzzy/ui/field'",
      "import { OFormDialog } from '@puzzle-fuzzy/ui/form-dialog'",
      "import { OImage } from '@puzzle-fuzzy/ui/image'",
      "import { OInput } from '@puzzle-fuzzy/ui/input'",
      "import { OInputGroup, OInputGroupAddon, OInputGroupInput, type OInputGroupAddonAlign } from '@puzzle-fuzzy/ui/input-group'",
      "import { OKbd, OKbdGroup, type OKbdSize } from '@puzzle-fuzzy/ui/kbd'",
      "import { OLabel } from '@puzzle-fuzzy/ui/label'",
      "import { OMessage as OSubpathMessage, oMessage as subpathMessage, type OMessageStatus } from '@puzzle-fuzzy/ui/message'",
      "import { OProgress as OSubpathProgress, normalizeOProgressValue, type OProgressStatus } from '@puzzle-fuzzy/ui/progress'",
      "import { OPopover, OPopoverContent, OPopoverTrigger, type OPopoverSide } from '@puzzle-fuzzy/ui/popover'",
      "import { ORadio, ORadioGroup, type ORadioValue } from '@puzzle-fuzzy/ui/radio'",
      "import { OReferenceTextarea, type OReferenceTextareaReference } from '@puzzle-fuzzy/ui/reference-textarea'",
      "import { OSelect as OSubpathSelect, type OSelectOption, type OSelectValue } from '@puzzle-fuzzy/ui/select'",
      "import { OSkeleton as OSubpathSkeleton, normalizeOSkeletonLines, type OSkeletonVariant } from '@puzzle-fuzzy/ui/skeleton'",
      "import { OSpinner, type OSpinnerSize } from '@puzzle-fuzzy/ui/spinner'",
      "import { OSwitch as OSubpathSwitch, type OSwitchSize } from '@puzzle-fuzzy/ui/switch'",
      "import { OTag as OSubpathTag, type OTagTone } from '@puzzle-fuzzy/ui/tag'",
      "import { OTabs, type OTabsItem } from '@puzzle-fuzzy/ui/tabs'",
      "import { OTextarea } from '@puzzle-fuzzy/ui/textarea'",
      "import { OTooltip as OSubpathTooltip, normalizeOTooltipDelay, type OTooltipPlacement } from '@puzzle-fuzzy/ui/tooltip'",
      "import { OUpload } from '@puzzle-fuzzy/ui/upload'",
      "import { OWidget as OSubpathWidget } from '@puzzle-fuzzy/ui/widget'",
      '',
      "const sender: OAvatarFlowPeer = { id: 'sender', name: 'OMG UI' }",
      "const receivers: readonly OAvatarFlowPeer[] = [{ id: 'vue', name: 'Vue' }]",
      "const groupItems: readonly OAvatarGroupItem[] = [{ id: 'one', name: 'One' }]",
      "const menuItems: readonly ODropdownItem[] = [{ value: 'profile', label: 'Profile' }]",
      "const selectOptions: readonly OSelectOption[] = [{ value: 1, label: 'One' }]",
      'const virtualSelectOptions: readonly OSelectOption[] = Array.from(',
      '  { length: 120 },',
      '  (_, index) => ({ value: index, label: `Virtual ${String(index + 1)}` }),',
      ')',
      "const tabItems: readonly OTabsItem[] = [{ value: 'one', label: 'One' }]",
      "const references: readonly OReferenceTextareaReference[] = [{ id: 'one', label: 'One' }]",
      "const uploadFiles: readonly OUploadFile[] = [{ id: 'one', name: 'one.txt', state: 'queued' }]",
      'const rootMessageService: OMessageService = rootMessage',
      'const subpathMessageService: OMessageService = subpathMessage',
      "const messageStatus: OMessageStatus = 'success'",
      'const rootAspectRatioProps: ORootAspectRatioProps = { ratio: 4 / 3 }',
      "const rootButtonGroupOrientation: ORootButtonGroupOrientation = 'horizontal'",
      "const rootCardVariant: ORootCardVariant = 'surface'",
      "const rootEmptySize: ORootEmptySize = 'md'",
      "const rootKbdSize: ORootKbdSize = 'sm'",
      "const rootSpinnerSize: ORootSpinnerSize = 'md'",
      'const subpathAspectRatioProps: OAspectRatioProps = { ratio: 1 }',
      "const subpathButtonGroupOrientation: OButtonGroupOrientation = 'vertical'",
      "const subpathCardVariant: OCardVariant = 'muted'",
      "const subpathEmptySize: OEmptySize = 'sm'",
      "const subpathKbdSize: OKbdSize = 'md'",
      "const subpathSpinnerSize: OSpinnerSize = 'lg'",
      "const rootAlertStatus: ORootAlertStatus = 'info'",
      "const rootAccordionValue: ORootAccordionValue = 'root'",
      "const rootSkeletonVariant: ORootSkeletonVariant = 'rect'",
      "const rootSwitchSize: ORootSwitchSize = 'md'",
      "const rootTooltipPlacement: ORootTooltipPlacement = 'top'",
      "const subpathAlertStatus: OAlertStatus = 'warning'",
      "const subpathAccordionValue: OAccordionValue = 'subpath'",
      "const subpathFieldOrientation: OFieldOrientation = 'horizontal'",
      "const subpathInputGroupAddonAlign: OInputGroupAddonAlign = 'inline-start'",
      "const subpathPopoverSide: OPopoverSide = 'bottom'",
      "const subpathSkeletonVariant: OSkeletonVariant = 'circle'",
      "const subpathSwitchSize: OSwitchSize = 'sm'",
      "const subpathTooltipPlacement: OTooltipPlacement = 'bottom-start'",
      'const textareaAutosize: OTextareaAutosizeOptions = { minRows: 2, maxRows: 5 }',
      "const rootDialogReason: ODialogCloseReason = 'programmatic'",
      "const rootDialogRequest: ODialogCloseRequest = { reason: 'mask' }",
      'const rootDialogWidth: ODialogWidth = 640',
      "const subpathDialogReason: OSubpathDialogCloseReason = 'slot'",
      "const subpathDialogRequest: OSubpathDialogCloseRequest = { reason: 'escape' }",
      "const subpathDialogWidth: OSubpathDialogWidth = 'min(92vw, 42rem)'",
      "const badgeTone: OBadgeTone = 'danger'",
      "const progressStatus: OProgressStatus = 'warning'",
      "const tagTone: OTagTone = 'success'",
      'const normalizedRootDialogWidth = normalizeODialogWidth(rootDialogWidth)',
      'const normalizedRootAspectRatio = normalizeOAspectRatio(rootAspectRatioProps.ratio ?? 1)',
      'const normalizedSubpathDialogWidth = normalizeSubpathDialogWidth(subpathDialogWidth)',
      'const normalizedBadgeMax = normalizeOBadgeMax(120.9)',
      'const normalizedProgressValue = normalizeOProgressValue(42)',
      'const normalizedRootSkeletonDimension = normalizeOSkeletonDimension(40.8)',
      'const normalizedRootTooltipOffset = normalizeOTooltipOffset(8.9)',
      'const normalizedSubpathSkeletonLines = normalizeOSkeletonLines(3.8)',
      'const normalizedSubpathTooltipDelay = normalizeOTooltipDelay(120.8)',
      'const commonDialogOpenDefault = oDialogCommonProps.open.default',
      'const checked = ref(false)',
      "const code = ref('')",
      "const inputValue = ref('Package consumer')",
      "const radioValue = ref<ORadioValue>('one')",
      'const selected = ref<OSelectValue>()',
      "const tab = ref('one')",
      "const text = ref('')",
      'void rootMessageService',
      'void normalizedRootAspectRatio',
      'void rootButtonGroupOrientation',
      'void rootCardVariant',
      'void rootEmptySize',
      'void rootKbdSize',
      'void rootSpinnerSize',
      'void subpathAspectRatioProps',
      'void subpathButtonGroupOrientation',
      'void subpathCardVariant',
      'void subpathEmptySize',
      'void subpathKbdSize',
      'void subpathSpinnerSize',
      'void subpathMessageService',
      'void rootDialogReason',
      'void rootDialogRequest',
      'void subpathDialogReason',
      'void subpathDialogRequest',
      'void normalizedRootDialogWidth',
      'void normalizedSubpathDialogWidth',
      'void normalizedBadgeMax',
      'void normalizedProgressValue',
      'void normalizedRootSkeletonDimension',
      'void normalizedRootTooltipOffset',
      'void normalizedSubpathSkeletonLines',
      'void normalizedSubpathTooltipDelay',
      'void rootAlertStatus',
      'void rootAccordionValue',
      'void rootSkeletonVariant',
      'void rootSwitchSize',
      'void rootTooltipPlacement',
      'void subpathAlertStatus',
      'void subpathAccordionValue',
      'void subpathFieldOrientation',
      'void subpathInputGroupAddonAlign',
      'void subpathPopoverSide',
      'void subpathSkeletonVariant',
      'void subpathSwitchSize',
      'void subpathTooltipPlacement',
      'void commonDialogOpenDefault',
      '</script>',
      '',
      '<template>',
      '  <ORootLabel for="root-composed-input">Root label</ORootLabel>',
      '  <ORootField>',
      '    <ORootFieldLabel for="root-field-input">Root field</ORootFieldLabel>',
      '    <ORootFieldContent>',
      '      <ORootInputGroup>',
      '        <ORootInputGroupAddon>https://</ORootInputGroupAddon>',
      '        <ORootInputGroupInput id="root-field-input" v-model="inputValue" />',
      '      </ORootInputGroup>',
      '    </ORootFieldContent>',
      '  </ORootField>',
      '  <ORootAccordion :default-value="rootAccordionValue">',
      '    <ORootAccordionItem value="root">',
      '      <ORootAccordionTrigger>Root accordion</ORootAccordionTrigger>',
      '      <ORootAccordionContent>Root accordion body</ORootAccordionContent>',
      '    </ORootAccordionItem>',
      '  </ORootAccordion>',
      '  <ORootCollapsible default-open>',
      '    <ORootCollapsibleTrigger>Root collapsible</ORootCollapsibleTrigger>',
      '    <ORootCollapsibleContent>Root collapsible body</ORootCollapsibleContent>',
      '  </ORootCollapsible>',
      '  <ORootPopover default-open>',
      '    <ORootPopoverTrigger>Root popover</ORootPopoverTrigger>',
      '    <ORootPopoverContent :teleported="false">Root popover body</ORootPopoverContent>',
      '  </ORootPopover>',
      '  <ORootAlert closable status="info" title="Root alert">Root feedback</ORootAlert>',
      '  <ORootAspectRatio v-bind="rootAspectRatioProps"><span>Root ratio</span></ORootAspectRatio>',
      '  <ORootButtonGroup aria-label="Root grouped actions">',
      '    <ORootButton>Previous</ORootButton>',
      '    <ORootButtonGroupSeparator />',
      '    <ORootButtonGroupText>2 of 4</ORootButtonGroupText>',
      '    <ORootButton>Next</ORootButton>',
      '  </ORootButtonGroup>',
      '  <ORootCard :variant="rootCardVariant" title="Root card">Root card body</ORootCard>',
      '  <ORootEmpty :size="rootEmptySize" title="Root empty" />',
      '  <ORootKbdGroup aria-label="Root shortcut"><ORootKbd :size="rootKbdSize">Ctrl</ORootKbd></ORootKbdGroup>',
      '  <ORootSpinner label="Root loading" :size="rootSpinnerSize" />',
      '  <ORootSkeleton :height="16" :width="160" />',
      '  <ORootSwitch v-model="checked" label="Root switch" />',
      '  <ORootTooltip content="Root tooltip" :teleported="false"><button type="button">Root help</button></ORootTooltip>',
      '  <ORootTag tone="success">Root tag</ORootTag>',
      '  <ORootBadge :value="8" aria-label="Root badge"><span>Inbox</span></ORootBadge>',
      '  <ORootProgress :value="42" aria-label="Root progress" />',
      '  <ORootButton>Root entry</ORootButton>',
      '  <ORootInput v-model="inputValue" aria-label="Root input" clearable />',
      '  <ORootCheckbox v-model="checked" label="Root checkbox" />',
      '  <ORootRadioGroup v-model="radioValue" aria-label="Root radio group">',
      '    <ORootRadio label="Root radio" value="one" />',
      '  </ORootRadioGroup>',
      '  <ORootConfirmDialog',
      '    :open="false"',
      '    cancel-label="Keep"',
      '    confirm-label="Confirm root"',
      '    title="Root confirmation"',
      '  >',
      '    Root confirmation body',
      '  </ORootConfirmDialog>',
      '  <ORootFormDialog :open="false" submit-label="Save root" title="Root form">',
      '    <ORootInput v-model="inputValue" name="rootField" />',
      '  </ORootFormDialog>',
      '  <ORootDialog :open="false" title="Root dialog">Dialog</ORootDialog>',
      '  <ORootDrawer :open="false" title="Root drawer">Drawer</ORootDrawer>',
      '  <ORootImage alt="Root image" preview-aria-label="Preview root image" :preview="false" src="/root.png" />',
      '  <ORootMessage message="Root message" status="success" />',
      '  <ORootReferenceTextarea v-model="text" aria-label="Root reference textarea" :references="references" />',
      '  <ORootTabs v-model="tab" aria-label="Root tabs" :items="tabItems" />',
      '  <ORootTextarea v-model="text" aria-label="Root textarea" :autosize="textareaAutosize" />',
      '  <ORootUpload aria-label="Root upload" :files="uploadFiles" :list-max-height="160" />',
      '  <ORootWidget chart-aria-label="Root widget trend" title="Root widget" value="42" :chart-data="[21, 34, 42]" />',
      '  <ORootDropdown :items="menuItems" trigger-aria-label="Root menu">',
      '    <template #trigger>Root dropdown</template>',
      '  </ORootDropdown>',
      '  <ORootSelect',
      '    v-model="selected"',
      '    aria-label="Root virtual select"',
      '    :open="true"',
      '    :options="virtualSelectOptions"',
      '    :teleported="false"',
      '    :virtual-list-height="144"',
      '    :virtual-threshold="20"',
      '  />',
      '  <ORootAvatarDropdown ariaLabel="Root avatar menu" :items="menuItems" name="Root avatar" />',
      '  <OSubpathAlert :status="subpathAlertStatus" title="Subpath alert" />',
      '  <OLabel for="subpath-composed-input">Subpath label</OLabel>',
      '  <OField :orientation="subpathFieldOrientation">',
      '    <OFieldLabel for="subpath-composed-input">Subpath field</OFieldLabel>',
      '    <OFieldContent>',
      '      <OInputGroup>',
      '        <OInputGroupAddon :align="subpathInputGroupAddonAlign">@</OInputGroupAddon>',
      '        <OInputGroupInput id="subpath-composed-input" v-model="inputValue" />',
      '      </OInputGroup>',
      '    </OFieldContent>',
      '  </OField>',
      '  <OAccordion :default-value="subpathAccordionValue">',
      '    <OAccordionItem value="subpath">',
      '      <OAccordionTrigger>Subpath accordion</OAccordionTrigger>',
      '      <OAccordionContent>Subpath accordion body</OAccordionContent>',
      '    </OAccordionItem>',
      '  </OAccordion>',
      '  <OCollapsible default-open>',
      '    <OCollapsibleTrigger>Subpath collapsible</OCollapsibleTrigger>',
      '    <OCollapsibleContent>Subpath collapsible body</OCollapsibleContent>',
      '  </OCollapsible>',
      '  <OPopover default-open>',
      '    <OPopoverTrigger>Subpath popover</OPopoverTrigger>',
      '    <OPopoverContent :side="subpathPopoverSide" :teleported="false">Subpath popover body</OPopoverContent>',
      '  </OPopover>',
      '  <OAspectRatio v-bind="subpathAspectRatioProps"><span>Subpath ratio</span></OAspectRatio>',
      '  <OButtonGroup :orientation="subpathButtonGroupOrientation">',
      '    <OButtonGroupText>Subpath group</OButtonGroupText>',
      '    <OButtonGroupSeparator />',
      '    <OButton>Action</OButton>',
      '  </OButtonGroup>',
      '  <OCard :variant="subpathCardVariant" title="Subpath card" />',
      '  <OEmpty :size="subpathEmptySize" title="Subpath empty" />',
      '  <OKbdGroup aria-label="Subpath shortcut"><OKbd :size="subpathKbdSize">K</OKbd></OKbdGroup>',
      '  <OSpinner label="Subpath loading" :size="subpathSpinnerSize" />',
      '  <OSubpathSkeleton :variant="subpathSkeletonVariant" />',
      '  <OSubpathSwitch v-model="checked" :size="subpathSwitchSize" label="Subpath switch" />',
      '  <OSubpathTooltip :placement="subpathTooltipPlacement" content="Subpath tooltip" :teleported="false"><button type="button">Subpath help</button></OSubpathTooltip>',
      '  <OButton variant="soft">Button subpath</OButton>',
      '  <OSubpathTag :tone="tagTone">Subpath tag</OSubpathTag>',
      '  <OSubpathBadge :value="8" :tone="badgeTone"><button type="button">Inbox</button></OSubpathBadge>',
      '  <OSubpathProgress :value="42" :status="progressStatus" aria-label="Subpath progress" />',
      '  <OInput v-model="inputValue" aria-label="Subpath input" clearable />',
      '  <OCheckbox v-model="checked" label="Subpath checkbox" />',
      '  <ORadioGroup v-model="radioValue" aria-label="Subpath radio group">',
      '    <ORadio label="Subpath radio" value="one" />',
      '  </ORadioGroup>',
      '  <OConfirmDialog',
      '    :open="false"',
      '    confirm-label="Confirm subpath"',
      '    title="Subpath confirmation"',
      '  />',
      '  <OFormDialog :open="false" submit-label="Save subpath" title="Subpath form">',
      '    <OInput v-model="inputValue" name="subpathField" />',
      '  </OFormDialog>',
      '  <ODialog :open="false" title="Subpath dialog">Dialog</ODialog>',
      '  <OSubpathDrawer :open="false" placement="start" size="24rem" title="Subpath drawer" />',
      '  <OImage alt="Subpath image" preview-aria-label="Preview subpath image" :preview="false" src="/subpath.png" />',
      '  <OSubpathMessage message="Subpath message" :status="messageStatus" />',
      '  <OReferenceTextarea v-model="text" aria-label="Subpath reference textarea" :references="references" />',
      '  <OTabs v-model="tab" aria-label="Subpath tabs" :items="tabItems" />',
      '  <OTextarea v-model="text" aria-label="Subpath textarea" autosize />',
      '  <OUpload aria-label="Subpath upload" :files="uploadFiles" list-max-height="12rem" />',
      '  <OSubpathWidget chart-aria-label="Subpath widget trend" title="Subpath widget" value="8" :chart-data="[3, 5, 8]" />',
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
