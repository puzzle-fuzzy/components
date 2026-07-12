# OMG UI 架构重建设计

- 状态：已确认
- 日期：2026-07-12
- 发布包：`@puzzle-fuzzy/ui`
- 产品名称：OMG UI

## 1. 背景

当前仓库已经有 `OButton`、`OAvatar` 和 `OAvatarFlow` 三个 Vue 组件，但工程仍混合了 Vue 脚手架应用、组件库源码和 VitePress 示例。文档通过源码别名绕过包导出，发布入口全部指向尚未生成的 `dist`，UI 包被标记为 `private`，测试和统一验证命令缺失，并且仓库同时跟踪三个相互漂移的 `bun.lock`。

样式层也尚未形成设计系统。组件分别维护颜色和主题分支，Less 已安装但没有实际使用，`packages/ui/src/style.css` 还包含无法解析的残缺声明。组件 API、文件名、公共类型、CSS 类名和品牌名没有统一合同。

本次重建发生在首次发布前，不保留旧包名、旧目录、UMD、CommonJS、源码别名行为或其他兼容层。

## 2. 目标

1. 建立一个只服务 Vue 3 项目的个人 UI 组件库。
2. 只发布一个公开 npm 包 `@puzzle-fuzzy/ui`。
3. 让组件、类型、主题、样式和文档遵循同一套命名与边界规则。
4. 用一个根命令验证格式、命名、类型、测试、构建、成品包、文档和浏览器行为。
5. 让文档展示与真实 npm 成品包的消费合同保持一致。
6. 为后续新增组件提供可复制的目录、测试和文档模式。

## 3. 非目标

- 不支持 React、Web Components 或原生 JavaScript 包装层。
- 不拆分独立 tokens、composables、icons 或 config npm 包。
- 不提供全局 `app.use()` 安装插件。
- 不输出 UMD、CommonJS、IIFE 或全局变量版本。
- 不为旧的 `@components/ui`、旧文件路径或旧构建产物提供别名。
- 不在本次重建中实际执行 npm 发布。
- 不引入多包版本协调、Changesets 或自动发布机器人。

## 4. 已确认的工程决策

| 主题 | 决策 |
| --- | --- |
| 消费方式 | 独立安装包 |
| npm 包 | `@puzzle-fuzzy/ui` |
| 发布范围 | 公开 npm 包 |
| 品牌 | OMG UI |
| 组件前缀 | `O` |
| CSS 类前缀 | `o-` |
| CSS 变量前缀 | `--omg-` |
| 框架边界 | Vue 3.5+，不可选 peer dependency |
| 包数量 | 一个发布包 |
| 模块格式 | ESM only |
| 包管理与脚本 | Bun |
| Vue SFC 构建 | Vite 作为明确的 Vue 专用例外 |
| 文档 | VitePress 作为明确的 Vue 专用例外 |
| 测试运行器 | `bun test`，不使用 Jest 或 Vitest |
| 许可证 | `UNLICENSED` |

`UNLICENSED` 与公开 npm 可见性是有意组合：包可以从 npm 安装，但公开可见不等于授予第三方复制、修改或再发布权利。

## 5. 目标仓库结构

```text
components/
├─ apps/
│  └─ docs/
│     ├─ docs/
│     ├─ examples/
│     ├─ tests/
│     └─ package.json
├─ packages/
│  └─ ui/
│     ├─ src/
│     │  ├─ components/
│     │  │  ├─ avatar/
│     │  │  ├─ avatar-flow/
│     │  │  └─ button/
│     │  ├─ shared/
│     │  ├─ styles/
│     │  └─ index.ts
│     ├─ tests/
│     │  ├─ package/
│     │  └─ types/
│     ├─ package.json
│     ├─ tsconfig.json
│     └─ vite.config.ts
├─ scripts/
│  └─ check-naming.ts
├─ docs/superpowers/
├─ bunfig.toml
├─ bun.lock
├─ eslint.config.ts
├─ package.json
├─ prettier.config.mjs
├─ stylelint.config.mjs
└─ tsconfig.base.json
```

`apps/docs` 是文档和真实交互示例，不是发布包。`packages/ui` 只保留会进入发布合同的源码、测试和构建配置。根目录只保留一个 `bun.lock`，所有安装命令从仓库根运行。

## 6. 包合同

### 6.1 元数据

`packages/ui/package.json` 使用以下发布原则：

- `name` 为 `@puzzle-fuzzy/ui`。
- 初始版本为 `0.1.0`。
- `private` 为 `false`。
- `type` 为 `module`。
- `files` 只包含 `dist` 和必要说明文件。
- `publishConfig.access` 为 `public`。
- `license` 为 `UNLICENSED`。
- `vue` 以 `^3.5.0` 同时出现在 peer dependency 和开发依赖中；peer 不可选。
- `@vueuse/core` 不作为初始运行时依赖。
- `sideEffects` 只标记实际发布的 CSS 入口。

npm 无法检查安装方是否真的是 Vue 项目。因此“只允许 Vue 项目”通过不可选 Vue peer dependency、纯 Vue 组件 API 和不提供框架中立入口来落实。

### 6.2 导出

根入口是推荐入口，同时提供稳定的组件子路径：

```text
@puzzle-fuzzy/ui
@puzzle-fuzzy/ui/button
@puzzle-fuzzy/ui/avatar
@puzzle-fuzzy/ui/avatar-flow
@puzzle-fuzzy/ui/styles.css
```

对应成品结构：

```text
dist/
├─ index.js
├─ index.d.ts
├─ styles.css
└─ components/
   ├─ button/index.js
   ├─ button/index.d.ts
   ├─ avatar/index.js
   ├─ avatar/index.d.ts
   ├─ avatar-flow/index.js
   └─ avatar-flow/index.d.ts
```

包不提供默认导出。每个 `exports` 条目都同时声明 `types` 和 `import`，不声明 `require`。消费者只需在应用入口导入一次 `@puzzle-fuzzy/ui/styles.css`。

## 7. 组件目录与命名合同

每个组件遵循同一结构：

```text
components/button/
├─ OButton.vue
├─ button.types.ts
├─ button.constants.ts
├─ button.test.ts
└─ index.ts
```

规则如下：

- 组件目录使用 kebab-case。
- Vue SFC 使用 PascalCase，并带 `O` 品牌前缀。
- 支持文件使用 kebab-case 和职责后缀。
- 公开组件使用 `OButton`、`OAvatar`、`OAvatarFlow`。
- 公开类型使用完整组件前缀，例如 `OButtonProps`、`OButtonVariant`、`OAvatarFlowPhase`。
- 共享类型使用品牌前缀，例如 `OThemeMode`。
- 布尔变量以 `is`、`has`、`can` 或 `should` 开头。
- 数量使用 `*Count`，例如 `overflowCount`。
- 事件处理函数以 `handle` 开头。
- 稳定词汇表使用语义化 camelCase 常量和 `as const`，联合类型从常量派生。
- 组件显式声明 `defineProps`、`defineEmits` 和 `defineSlots`。
- 根入口和组件入口使用显式导出，不使用无约束的 `export *`。
- 一个组件引用另一个组件时，只能通过对方目录的 `index.ts`，不能深层导入内部文件。

`check:naming` 脚本扫描组件目录并验证这些规则；ESLint 负责变量命名和禁止跨边界深层导入。

## 8. 样式与主题合同

### 8.1 文件职责

```text
styles/
├─ tokens.less
├─ themes.less
├─ mixins.less
└─ index.less
```

- `tokens.less` 定义原始色阶、尺寸、间距、圆角、层级和动效参数。
- `themes.less` 将原始值映射为 light/dark 语义 CSS 变量。
- `mixins.less` 只服务库内部的尺寸、状态和主题生成。
- `index.less` 是唯一公开样式入口并汇总组件样式。

Less 只承担编译期生成和复用。消费者可覆盖的运行时合同全部使用 `--omg-*` CSS Custom Properties。组件内部不得直接写品牌色、状态色、圆角、阴影或动效时长字面量。

### 8.2 Token 层级

Token 分三层：

1. Primitive：原始色阶、数值尺寸和时间。
2. Semantic：`--omg-color-text`、`--omg-color-surface`、`--omg-color-danger` 等主题语义。
3. Component：`--omg-button-background`、`--omg-avatar-size` 等组件局部语义。

### 8.3 主题优先级

主题优先级从高到低为：

1. 组件实例的 `theme` prop。
2. 最近祖先的 `data-omg-theme="light|dark"`。
3. 根节点显式 `data-omg-theme`。
4. 没有任何显式主题时的 `prefers-color-scheme`。

VitePress 主题适配只存在于文档应用中：文档主题变化时更新根节点 `data-omg-theme`。组件库本身不识别 VitePress 的 `.dark` 类，也不修改宿主主题。

所有非必要动画提供 `prefers-reduced-motion: reduce` 静态表现。文字和图标对比度由 token 组合保证，普通文字目标不低于 4.5:1。

## 9. 组件行为合同

### 9.1 OButton

- Props：`variant`、`size`、`tone`、`theme`、`type`、`loading`、`disabled`。
- Slots：`default`、`icon`。
- Emits：类型化 `click`。
- `type` 默认值固定为 `button`。
- `loading` 同时设置原生 disabled 与 `aria-busy`，保留按钮文字的可访问性。
- disabled 或 loading 时不发出业务 click。
- 不使用 `min-width: max-content`，允许长文案、国际化和消费者宽度约束。
- 所有 tone/variant 组合由测试验证可见状态和可访问名称。

### 9.2 OAvatar

- 使用真实 `<img>` 的 `load` 和 `error` 事件，不创建第二个预加载图片请求。
- `src` 变化时重置加载和错误状态。
- 图片失败后确定性回退到 initials。
- initials 计算是独立纯函数并有单元测试。
- Emits：`load`、`error`。
- Slot：类型化 fallback slot。
- 可访问名称优先级为显式 `alt`、`name`、`initials`；显式空 `alt` 表示装饰性头像。
- 不生成无信息量的默认“Avatar”名称。
- 状态点同时使用颜色与形状/符号区分。
- `statusLabel` 是可选的本地化可访问文字；状态具有业务意义时由消费者提供。

### 9.3 OAvatarFlow

五个 phase 都有真实语义和视觉差异：

- `idle`：静态中性连接线。
- `requesting`：等待/请求标记。
- `transferring`：方向性流动点。
- `complete`：成功连接线和非颜色成功标记。
- `error`：错误连接线和非颜色错误标记。

其他合同：

- `receivers` 接受 readonly 数组。
- `maxVisibleReceivers` 标准化为至少 1 的整数。
- 没有 receiver 时只展示 sender。
- overflow 头像跟随当前 `size` 和 `shape`。
- 组件使用容器查询调整窄容器间距，不依赖整个 viewport。
- `accessibleLabel` 是必填 prop，并作为 `role="status"` 内真实的视觉隐藏文本渲染。
- phase 变化时，消费者同步更新 `accessibleLabel`，使 live region 播报完整的本地化状态。
- reduced-motion 环境使用静态方向与状态标记，不播放循环动画。

## 10. 数据流与异常策略

组件采用单向、局部的数据流：

```text
Props → 标准化 computed 状态 → 语义化 DOM/data 属性 → CSS tokens
```

- 组件不修改输入对象或数组。
- 组件不持有全局 store 或跨组件状态。
- 组件模块顶层不访问 `window`、`document` 或 `Image`，保持 Vue SSR 可导入。
- 图片失败、空 receiver 和非法显示数量属于可预期 UI 状态，采用确定性降级而不是抛异常。
- TypeScript 负责静态合同，Vue runtime validator 在开发环境报告非法枚举值。
- 构建、导出或安装合同错误必须让验证命令非零退出，不能静默忽略。

## 11. 测试设计

### 11.1 Bun 组件测试

组件测试使用：

- `bun test`
- `@vue/test-utils`
- HappyDOM
- Bun preload 中注册的 Vue SFC loader
- `vue/compiler-sfc`，其版本随 Vue runtime 保持一致

SFC loader 只服务测试，编译 `<script setup>` 和 template，并保留可映射的源码信息。测试不依赖 Jest 或 Vitest。

组件测试覆盖：

- OButton 默认值、slots、attrs、click、loading、disabled、aria 状态和所有 variant/tone。
- OAvatar initials、装饰模式、src 更新、load/error、fallback 和 statusLabel。
- OAvatarFlow 五阶段、空 receivers、readonly 输入、数量标准化、overflow、尺寸、主题和 live status。
- shared helpers、常量词汇表和主题映射。

`bunfig.toml` 在 CI coverage 命令中启用 coverage、跳过测试文件并设置统一 `coverageThreshold = 0.9`。未达到 90% 的行、函数或语句覆盖率时测试失败。

### 11.2 类型测试

`packages/ui/tests/types/*.test-d.ts` 与 `vue-tsc --noEmit` 验证：

- 所有公开 Props、Emits 和 Slots 的推断。
- readonly receivers 可用，非法 phase、size、tone 和 variant 被拒绝。
- 根入口和每个组件子入口的类型一致。
- 不泄漏内部文件类型或未声明依赖。

### 11.3 成品包测试

`test:package` 执行以下闭环：

1. 构建 `@puzzle-fuzzy/ui`。
2. 使用 `bun pm pack` 生成 tarball。
3. 在系统临时目录创建最小 Vue 消费项目。
4. 从 tarball 安装包。
5. 分别导入根入口、三个组件子入口和 `styles.css`。
6. 运行类型检查和生产构建。
7. 检查 tarball 不包含源码演示、缓存或未声明文件。

该测试禁止直接引用 `packages/ui/src`。

### 11.4 浏览器测试

Playwright 从构建后的 VitePress 站点验证：

- light/dark 显式主题。
- 系统主题 fallback。
- 窄容器与长文案。
- reduced-motion。
- 键盘和 focus-visible。
- axe 可访问性规则。

整页视觉截图不作为核心门禁，避免操作系统字体和渲染差异导致无意义失败。

## 12. 质量门禁

### 12.1 工具

- ESLint flat config：Vue、TypeScript、变量命名、未使用代码、禁止 `any` 和边界导入。
- Stylelint：Vue/Less 语法、重复声明和 token 使用。
- Prettier：TypeScript、Vue、Less、JSON、Markdown。
- `check:naming`：文件、目录和职责后缀。
- TypeScript：`strict`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`、`noUnusedLocals`、`noUnusedParameters`、`verbatimModuleSyntax`。

### 12.2 根命令

```text
bun run check
  format:check
  lint
  lint:styles
  check:naming
  typecheck
  bun test

bun run verify
  check
  build
  test:package
  docs:build
  test:e2e
```

窄范围开发时可以运行包级命令；提交前和 CI 必须运行根 `verify`。

## 13. 文档设计

每个组件页面必须包含：

1. 安装与样式导入。
2. 基础用法。
3. 完整 variants、sizes、tones、themes 和 states。
4. Props 表。
5. Emits 表。
6. Slots 表。
7. 可访问性说明。
8. 真实边界案例。

交互示例存放在 `apps/docs/examples` 的真实 `.vue` 文件中，VitePress 页面和浏览器测试共同复用。共享 preview 样式只存在于文档主题，不复制到每个 Markdown 页面。

`docs:dev` 可以显式将包入口映射到源码以获得 HMR。`docs:build` 在 UI 包构建完成后解析真实 package exports，不使用源码别名。成品包合同由 `test:package` 再做独立验证。

删除 VitePress 模板页面、模板 GitHub 链接、已提交的 `.vitepress/cache` 和重复示例样式。

## 14. 构建、CI 与发布

- Vite 只负责编译 Vue SFC、Less、ESM 和类型入口。
- 构建 externalize `vue`，不打包 Vue runtime。
- 构建失败、声明缺失或 CSS 缺失都使命令失败。
- `prepack` 自动构建包。
- `prepublishOnly` 从仓库根运行完整 `verify`。
- GitHub Actions 在 push 和 pull request 上执行 `bun install --frozen-lockfile` 与 `bun run verify`。
- 安装使用 Bun isolated linker，阻止 workspace 幽灵依赖。
- 首次实际发布由用户明确触发；本次架构重建只让包达到可发布状态。

## 15. 清理范围

以下内容直接删除，不提供兼容层：

- `introduction` 旧目录，内容迁移到 `apps/docs`。
- `packages/ui/index.html`、`src/main.ts`、`src/App.vue`。
- `HelloWorld.vue`、Vite/Vue starter assets、favicon 和未使用 icons。
- 演示用途且已损坏的 `src/style.css`。
- `packages/ui/bun.lock` 与 `introduction/bun.lock`。
- 已跟踪的 `.vitepress/cache`。
- Vite 模板 README、失效的根 README 指令和 React JSX 根配置。
- UMD/CJS 构建设置与对应 package exports。
- 仅用于当前 `useImage` 的 `@vueuse/core` 依赖。

## 16. 完成标准

架构重建完成时必须同时满足：

1. 工作区只有一个根 `bun.lock`。
2. `packages/ui` 不包含应用入口或脚手架资产。
3. 三个组件遵循统一目录、命名、类型、slots 和 emits 合同。
4. 所有主题值来自 `--omg-*` token，显式主题优先级正确。
5. OAvatarFlow 五个阶段具有不同的视觉和可访问表现。
6. `bun test` 有真实组件测试并达到 90% coverage threshold。
7. `bun run check` 全部通过。
8. `bun run verify` 全部通过。
9. tarball 临时 Vue 消费项目可以导入根入口、子入口、类型和样式并完成生产构建。
10. VitePress 文档覆盖所有公开 API，并通过浏览器可访问性验证。
11. 包元数据为公开、ESM-only、Vue 3.5+、`0.1.0`、`UNLICENSED`。
12. 没有旧包名、旧入口、兼容 shim 或未声明运行时依赖。

