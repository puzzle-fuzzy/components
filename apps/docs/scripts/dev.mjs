import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const packageRoot = dirname(fileURLToPath(import.meta.resolve('vitepress/package.json')))
const cliPath = resolve(packageRoot, 'bin/vitepress.js')

const child = spawn(process.execPath, [cliPath, 'dev', 'docs'], {
  cwd: resolve(import.meta.dirname, '..'),
  env: {
    ...process.env,
    OMG_UI_DOCS_SOURCE: '1',
  },
  stdio: 'inherit',
})

const exitCode = await new Promise((resolveExitCode) => {
  child.once('exit', (code) => resolveExitCode(code ?? 1))
})

process.exitCode = exitCode
