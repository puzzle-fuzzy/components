# OMG UI Architecture Redesign Implementation Plan

> 实施依据：`docs/superpowers/specs/2026-07-12-omg-ui-architecture-design.md`。每一阶段先建立可失败的合同检查，再改实现，最后运行阶段验证。

**目标：** 将仓库重建为可发布的 Vue 3-only `@puzzle-fuzzy/ui`，统一 pnpm workspace、ESM 公共入口、Less/CSS Variables 主题、组件测试、成品包测试和 VitePress 文档。

**技术栈：** Node 24 LTS、pnpm 11.11、Vue 3.5、TypeScript 6、Vite 8、Vitest 4、Vue Test Utils、jsdom、Less、稳定版 VitePress、Playwright、ESLint、Stylelint、Prettier、publint、ATTW。

**全局约束：**

- 只发布 `@puzzle-fuzzy/ui@0.1.0`，不执行实际 npm publish。
- ESM-only；不输出 CJS、UMD、IIFE、默认导出或兼容 alias。
- Vue 是必需 peer dependency，构建 externalize Vue。
- 使用 `O*`、`.o-*`、`--omg-*` 三层公开命名。
- 只保留根 `pnpm-lock.yaml`，删除全部 Bun lockfile 和 Bun 专用配置。
- 使用 Python 做临时检查/迁移，避免 PowerShell 编码问题；持久文件修改统一使用 patch。

---

## Task 1：建立 pnpm workspace 边界

**文件**

- 修改：`package.json`、`tsconfig.json`、`.gitignore`、`AGENTS.md`、`README.md`
- 新建：`pnpm-workspace.yaml`、`tsconfig.base.json`、`.node-version`
- 移动：`introduction/**` → `apps/docs/**`
- 删除：根和子目录全部 `bun.lock`
- 删除：`packages/ui` 中应用脚手架、starter assets、缓存与子级编辑器配置

**步骤**

1. 记录当前结构检查：三个 Bun lockfile、旧 docs 路径、UI 应用入口都应被识别为不合格。
2. 建立 `apps/docs` 与 `packages/ui` 两个 workspace。
3. 根 manifest 固定 `packageManager: pnpm@11.11.0` 和 Node 24，定义 catalog 与统一脚本。
4. 迁移文档并清理生成文件、模板和 UI 应用脚手架。
5. 删除所有 Bun 指令和锁文件，生成一个 `pnpm-lock.yaml`。
6. 验证：`corepack pnpm install --frozen-lockfile=false`，随后检查 workspace 列表与唯一锁文件。

---

## Task 2：先定义发布包和构建合同

**文件**

- 修改：`packages/ui/package.json`、`packages/ui/vite.config.ts`、`packages/ui/tsconfig.json`
- 新建：`packages/ui/tsconfig.build.json`
- 新建：`packages/ui/tests/package/package-contract.test.ts`
- 删除：`packages/ui/tsconfig.app.json`、`packages/ui/tsconfig.node.json`

**合同**

- public、`0.1.0`、`UNLICENSED`、Vue `^3.5.0` peer。
- 精确 exports：`.`、`./button`、`./avatar`、`./avatar-flow`、`./styles.css`。
- ESM-only；`files` 只含 `dist`；CSS 为唯一 side effect。
- Vite multi-entry 输出根入口和三个组件入口，格式仅 `es`。
- `vue-tsc` 输出对应声明；Vite externalize `vue`。

**验证**

1. 先写 manifest/产物合同测试并确认旧包失败。
2. 修改 manifest 与 Vite/TypeScript 构建配置。
3. 运行 `pnpm --filter @puzzle-fuzzy/ui typecheck` 与 `build`。
4. 检查每个 exports 目标真实存在。

---

## Task 3：建立组件目录和显式导出

**文件**

- 移动三个旧 SFC 与类型文件到：
  - `src/components/button/{src,style,__tests__,index.ts}`
  - `src/components/avatar/{src,style,__tests__,index.ts}`
  - `src/components/avatar-flow/{src,style,__tests__,index.ts}`
- 修改：`packages/ui/src/index.ts`
- 新建：`scripts/check-naming.mjs`

**步骤**

1. 先写命名检查，验证每个组件必须有 `src/O*.vue`、`src/<name>.ts`、`style/index.less`、`__tests__/<name>.test.ts` 和 `index.ts`。
2. 移动文件，不保留旧路径 shim。
3. 类型统一重命名为 `OButtonVariant`、`OAvatarSize`、`OAvatarFlowPhase` 等 `O*` 公共名字。
4. 枚举值用 `as const` 定义并派生联合类型。
5. 根和子入口只做显式 named export。
6. 运行 naming、typecheck 和 build。

---

## Task 4：建立 token 与主题系统

**文件**

- 新建：
  - `packages/ui/src/styles/tokens/primitives.less`
  - `packages/ui/src/styles/tokens/semantic.less`
  - `packages/ui/src/styles/themes/light.less`
  - `packages/ui/src/styles/themes/dark.less`
  - `packages/ui/src/styles/mixins.less`
  - `packages/ui/src/styles/index.less`
- 新建/修改三个组件的 `style/index.less`

**步骤**

1. 盘点现有色值、尺寸、圆角、阴影、层级和动效，去重为 primitive token。
2. 生成 light/dark semantic `--omg-*` 变量。
3. 由组件级 `--omg-button-*`、`--omg-avatar-*`、`--omg-avatar-flow-*` 消费 semantic token。
4. 主题仅使用 `:root`、`[data-omg-theme]` 和系统媒体查询。
5. 删除 `theme` prop、`data-o-theme`、`--o-*`、`.dark` 与通用 `data-theme` 耦合。
6. 为循环动画增加 reduced-motion 静态降级。
7. 运行 Less 构建与 Stylelint。

---

## Task 5：重构并测试 OButton

**文件**

- 修改：`components/button/src/OButton.vue`、`components/button/src/button.ts`
- 新建：`components/button/__tests__/button.test.ts`

**先写测试**

- 默认 type/button、variant/size/tone class。
- default/icon slots、attrs/class/style 透传。
- click emit。
- disabled 和 loading 不 emit click。
- loading 的 native disabled、`aria-busy` 与 spinner。
- prop 更新和 runtime validator。

**实现**

- 类型化 Props/Slots/Emits。
- 默认 `type="button"`。
- 显式 `handleClick` 保护 disabled/loading。
- 使用 BEM 和 data/state class，不包含 SFC 内联样式。
- 删除 `min-width: max-content`，增加 focus-visible 和 reduced-motion。

---

## Task 6：重构并测试 OAvatar

**文件**

- 修改：`components/avatar/src/OAvatar.vue`、`components/avatar/src/avatar.ts`
- 新建：`components/avatar/__tests__/avatar.test.ts`

**先写测试**

- initials 纯函数与空白/多词/Unicode。
- 无 src、加载成功、加载失败、src 更新后的恢复。
- `load`、`error` emits。
- alt/name/initials/空 alt 的可访问语义。
- fallback slot、size、shape、status、statusLabel。

**实现**

- 删除 `@vueuse/core/useImage`。
- 只使用真实 `img` 事件维护错误状态。
- watcher 在 src 改变时重置。
- fallback slot 提供 initials 与 error 状态。
- 状态添加非颜色标记和可选隐藏标签。

---

## Task 7：重构并测试 OAvatarFlow

**文件**

- 修改：`components/avatar-flow/src/OAvatarFlow.vue`、`components/avatar-flow/src/avatar-flow.ts`
- 新建：`components/avatar-flow/__tests__/avatar-flow.test.ts`

**先写测试**

- readonly receivers 不被修改。
- max visible 的取整、下限、overflow。
- 空 receivers。
- sender/receiver/overflow 的 size 与 shape。
- 五个 phase 的 data、图形和状态文本。
- accessible live status。
- 响应式 props 更新。

**实现**

- 纯函数标准化 `maxVisibleReceivers`。
- 五阶段使用明确的 DOM/data 状态。
- 可访问文本作为真实 visually-hidden 内容。
- 使用容器查询调整窄容器。
- reduced-motion 禁止循环动画。

---

## Task 8：补齐质量工具与测试基础设施

**文件**

- 新建：`vitest.config.ts`、`tests/setup.ts`
- 新建：`eslint.config.mjs`、`stylelint.config.mjs`、`prettier.config.mjs`
- 新建：`packages/ui/tests/ssr/ssr.test.ts`
- 修改：根与 UI scripts

**步骤**

1. Vitest 复用 Vue plugin，环境用 jsdom，coverage 使用 V8。
2. 配置 Vue Test Utils 全局清理。
3. 配置 ESLint flat config、Vue parser 与 typescript-eslint。
4. 配置 Stylelint 解析 Vue 与 Less。
5. Prettier 覆盖 TS/Vue/Less/JSON/YAML/Markdown。
6. SSR 测试对三个组件执行 `renderToString`。
7. 根 `check` 串行执行 format、lint、styles、naming、typecheck、test。

---

## Task 9：重建 VitePress 文档

**文件**

- 修改：`apps/docs/package.json`、`apps/docs/docs/.vitepress/config.mts`
- 新建：`apps/docs/docs/.vitepress/theme/index.ts`、`theme/custom.less`
- 新建真实示例：`apps/docs/examples/{button,avatar,avatar-flow}/*.vue`
- 重写：主页和三个组件页面
- 删除：模板 Markdown 与失效链接

**步骤**

1. 文档依赖改为 `@puzzle-fuzzy/ui: workspace:*`。
2. dev 精确 alias 根入口、子入口和 styles 到源码；production 不 alias。
3. 主题入口导入 styles，并同步 VitePress dark state 到 `data-omg-theme`。
4. 页面引用真实示例并覆盖公开 API、CSS Variables、可访问性和边界。
5. `docs:build` 先 build UI，再解析真实 package exports。

---

## Task 10：成品包、E2E 与 CI

**文件**

- 新建：`scripts/test-package.mjs`
- 新建：`apps/docs/playwright.config.ts`
- 新建：`apps/docs/tests/e2e/components.spec.ts`
- 新建：`.github/workflows/ci.yml`

**步骤**

1. `pnpm pack` UI workspace 到临时目录。
2. 对 tarball 运行 publint 与 ATTW。
3. 创建临时 Vue/Vite consumer，安装 tarball，执行 typecheck/build。
4. 安装 Playwright Chromium，针对构建后 docs 运行关键行为与 axe。
5. CI 固定 Node 24 + pnpm 11.11，frozen install 后运行 `pnpm verify`。
6. 不创建 publish workflow，不保存 npm token。

---

## Task 11：最终验证与审计

按顺序运行：

```text
corepack pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm lint:styles
pnpm check:naming
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build
pnpm test:ssr
pnpm test:package
pnpm docs:build
pnpm test:e2e
pnpm verify
```

最后检查：

- `git status` 中没有意外缓存、dist、报告或 tarball。
- `git grep` 不再出现 `@components/ui`、`data-o-theme`、`--o-`、旧主题 prop 或 Bun 指令。
- package tarball 只包含允许文件。
- 文档不存在源码捷径的 production alias。
- 所有 package exports 和声明都从临时 consumer 成功解析。
