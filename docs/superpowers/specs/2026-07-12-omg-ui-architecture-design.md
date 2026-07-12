# OMG UI 架构重建设计

- 状态：已确认（按用户授权参考主流 Vue UI 库择优）
- 日期：2026-07-12
- 品牌：OMG UI
- 发布包：`@puzzle-fuzzy/ui`
- 适用范围：Vue 3 项目

## 1. 最终选型

OMG UI 不做 Element Plus 或 Naive UI 的缩小复刻，而是选择两者中适合个人组件库的部分：

- 采用 Element Plus 的 workspace 边界、组件自治目录、静态主题变量、真实示例和成品包验证思路。
- 采用两者共同的强类型公共入口、行为测试、SSR 验证和 Vue peer dependency。
- 不复制 Element Plus 的内部构建包、ESM/CJS/UMD 多矩阵、独立主题包和多包发布流程。
- 不复制 Naive UI 的运行时 CSS-in-JS、复杂 theme object、Provider 注入体系和兼容产物矩阵。
- 不再强制 Bun。开发工具链统一为 Node LTS、pnpm、Vite 与 Vitest，构建和测试共享官方 Vue SFC 转换链路。

最终路线是：**Element Plus 式工程边界 + 原生 Vue 强类型 API + Less/CSS Variables 主题 + 小型 ESM-only 发布包**。

## 2. 当前问题

当前仓库已经有 `OButton`、`OAvatar` 和 `OAvatarFlow`，但存在以下结构性问题：

1. `packages/ui` 混入 `App.vue`、`main.ts`、`index.html`、HelloWorld、Vite/Vue 素材等应用脚手架。
2. 文档通过源码 alias 使用组件，掩盖了真实 package exports 是否可用。
3. UI 包仍是 `private: true`、`0.0.0`，入口指向未验证的 ESM/UMD 产物。
4. 根目录和两个子目录分别维护 Bun lockfile，依赖状态会漂移。
5. 没有统一 lint、格式、类型、组件测试、SSR、成品包测试和 CI 门禁。
6. 组件、类型、CSS 类、CSS 变量和品牌命名不一致。
7. 色值、暗色逻辑和动效分散在各 SFC，尚未形成 token 系统。
8. `OAvatar` 为同一图片创建预加载和真实 `img` 两条加载链路。
9. `OAvatarFlow` 声明五个阶段，但多数阶段没有清晰的视觉和无障碍语义。
10. `packages/ui/src/style.css` 存在残缺 CSS，缓存与模板内容也被提交。

项目尚未发布，因此本次直接建立新合同，不保留旧包名、旧路径、旧主题 prop、CJS、UMD 或兼容 shim。

## 3. 目标与非目标

### 目标

1. 只发布一个 Vue 3 组件包 `@puzzle-fuzzy/ui`。
2. 组件、类型、样式、主题、文档和测试遵循同一模板。
3. 根命令能够验证源码质量、构建产物和真实消费方式。
4. 文档开发体验支持源码 HMR，生产构建必须验证真实包导出。
5. 后续新增组件可以复制目录模板，而不重新发明架构。

### 非目标

- 不支持 React、Web Components 或无框架消费。
- 不输出 CommonJS、UMD、IIFE 或全局 CDN 包。
- 不拆分 tokens、themes、composables、icons 等独立 npm 包。
- 不建立自研构建系统、运行时 CSS-in-JS 或复杂配置 Provider。
- 不提供旧 `@components/ui` 的兼容入口。
- 不在本次任务中实际发布 npm 包。
- 单人、单发布包阶段不引入 Changesets、commitlint、nightly 或 PR 预览包。

## 4. 工程决策

| 领域       | 决策                                               |
| ---------- | -------------------------------------------------- |
| 开发运行时 | Node.js 24 LTS                                     |
| 包管理     | `pnpm@11.11.0`，根目录单锁文件                     |
| workspace  | `apps/docs` + `packages/ui`                        |
| 框架       | Vue `^3.5.0`，必需 peer dependency                 |
| 语言       | TypeScript strict                                  |
| 构建       | Vite 8 library mode，多入口、ESM-only              |
| 声明       | `vue-tsc` 生成并检查声明                           |
| 样式       | Less 编译期复用 + `--omg-*` CSS Variables          |
| 测试       | Vitest 4 + Vue Test Utils + jsdom                  |
| 浏览器     | Playwright 验证构建后的文档                        |
| 文档       | 稳定版 VitePress                                   |
| 发布检查   | `pnpm pack` + `publint` + ATTW + 临时 Vue consumer |
| 许可证     | `UNLICENSED`                                       |

Node 与 pnpm 只约束仓库开发环境，不会被打进浏览器组件包。发布包不声明 Node runtime dependency。

## 5. 目标结构

```text
components/
├─ apps/
│  └─ docs/
│     ├─ docs/
│     │  └─ .vitepress/
│     ├─ examples/
│     │  ├─ avatar/
│     │  ├─ avatar-flow/
│     │  └─ button/
│     ├─ tests/e2e/
│     ├─ package.json
│     └─ tsconfig.json
├─ packages/
│  └─ ui/
│     ├─ src/
│     │  ├─ components/
│     │  │  ├─ avatar/
│     │  │  │  ├─ __tests__/
│     │  │  │  ├─ src/
│     │  │  │  ├─ style/
│     │  │  │  └─ index.ts
│     │  │  ├─ avatar-flow/
│     │  │  └─ button/
│     │  ├─ shared/
│     │  ├─ styles/
│     │  │  ├─ tokens/
│     │  │  ├─ themes/
│     │  │  ├─ mixins.less
│     │  │  └─ index.less
│     │  └─ index.ts
│     ├─ tests/
│     │  ├─ package/
│     │  └─ ssr/
│     ├─ package.json
│     ├─ tsconfig.json
│     ├─ tsconfig.build.json
│     └─ vite.config.ts
├─ scripts/
│  ├─ check-naming.mjs
│  └─ test-package.mjs
├─ .github/workflows/ci.yml
├─ .node-version
├─ eslint.config.mjs
├─ package.json
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ prettier.config.mjs
├─ stylelint.config.mjs
└─ tsconfig.base.json
```

`apps/docs` 是不发布的真实消费应用。`packages/ui` 是唯一发布边界；演示、缓存、测试报告和仓库脚本不得进入 tarball。

## 6. 包合同

### 元数据

- `name`：`@puzzle-fuzzy/ui`
- `version`：`0.1.0`
- `private`：`false`
- `type`：`module`
- `files`：只包含 `dist` 和必要说明文件
- `publishConfig.access`：`public`
- `license`：`UNLICENSED`
- `peerDependencies.vue`：`^3.5.0`，不可选
- 初始版本不依赖 `@vueuse/core`；出现两个以上真实复用场景时再加入
- `sideEffects` 只保留构建后的 CSS

“仅 Vue 项目使用”通过必需 Vue peer、纯 Vue SFC API 和不提供框架中立入口落实。npm 无法判断宿主项目框架，因此不做伪运行时检查。

### 公共入口

```text
@puzzle-fuzzy/ui
@puzzle-fuzzy/ui/button
@puzzle-fuzzy/ui/avatar
@puzzle-fuzzy/ui/avatar-flow
@puzzle-fuzzy/ui/styles.css
```

所有入口只提供命名导出，不提供默认导出、`require` 或 wildcard export。`exports` 同时声明 `types` 与 `import`，未公开的内部路径由 package exports 封闭。

目标产物：

```text
dist/
├─ index.js
├─ index.d.ts
├─ styles.css
├─ components/
│  ├─ avatar/index.js
│  ├─ avatar/index.d.ts
│  ├─ avatar-flow/index.js
│  ├─ avatar-flow/index.d.ts
│  └─ button/index.{js,d.ts}
└─ shared declaration files required by public entries
```

Vite 显式设置 `formats: ['es']` 并 externalize `vue`。发布构建不输出 source map，避免
`UNLICENSED` 包通过 `sourcesContent` 泄露源码；同时不输出 CJS、UMD 或完整 CDN bundle。

## 7. 组件目录和命名

每个组件采用同一模板：

```text
components/button/
├─ __tests__/
│  └─ button.test.ts
├─ src/
│  ├─ OButton.vue
│  └─ button.ts
├─ style/
│  └─ index.less
└─ index.ts
```

规则：

- 目录和普通文件使用 kebab-case。
- Vue SFC 使用 PascalCase，并带公开前缀 `O`。
- 组件类使用 BEM：`.o-button`、`.o-button__icon`、`.o-button--solid`。
- 公共 CSS 变量统一使用 `--omg-*`，不再使用 `--o-*`。
- 公共组件：`OButton`、`OAvatar`、`OAvatarFlow`。
- 公共类型带完整组件前缀：`OButtonProps`、`OButtonVariant`、`OAvatarSize`、`OAvatarFlowPhase`。
- 布尔变量以 `is/has/can/should` 开头；数量以 `Count` 结尾；事件处理函数以 `handle` 开头。
- 枚举词汇使用 `as const` 常量，类型从常量派生；开发态 runtime validator 复用同一常量。
- `index.ts` 只做显式公共导出。组件间只能通过目标组件的 `index.ts` 引用。
- 只有出现真实复杂度时才拆 `constants`、`composables` 或 `instance` 文件。

`scripts/check-naming.mjs` 负责可机械验证的目录、SFC、测试和样式文件规则；ESLint 负责变量与导入边界。

## 8. 组件 API

### OButton

- Props：`variant`、`size`、`tone`、`type`、`loading`、`disabled`。
- Slots：`default`、`icon`。
- Emits：类型化 `click`。
- `type` 默认 `button`。
- loading 同时设置 native disabled 与 `aria-busy`，且不发业务 click。
- attrs、class 和 style 正确透传到原生 button。
- 不使用 `min-width: max-content`，允许长文本、窄容器和国际化。

### OAvatar

- Props：`src`、`alt`、`name`、`initials`、`size`、`shape`、`status`、`statusLabel`。
- Emits：`load`、`error`。
- Slot：类型化 `fallback`。
- 只依赖真实 `img` 的 load/error，不额外预加载。
- `src` 改变时重置错误状态，失败后确定性回退。
- initials 作为纯函数测试，最多三个 grapheme。
- 可访问名称优先级为显式 `alt`、`name`、`initials`；空 `alt` 表示装饰图片。
- 状态不能只靠颜色表达；有业务含义时通过 `statusLabel` 提供本地化文本。

### OAvatarFlow

- Props：`sender`、readonly `receivers`、`phase`、`accessibleLabel`、`maxVisibleReceivers`、`size`、`shape`。
- 五个 phase 均有不同语义：
  - `idle`：静态中性连接。
  - `requesting`：等待标记。
  - `transferring`：方向性流动。
  - `complete`：成功线与非颜色成功图形。
  - `error`：错误线与非颜色错误图形。
- `maxVisibleReceivers` 标准化为至少 1 的整数。
- 空 receivers 时只渲染 sender。
- overflow 头像跟随 size 与 shape。
- 用容器查询适应窄容器，不依赖 viewport media query。
- `accessibleLabel` 作为真实视觉隐藏文本置于 `role="status"`，不只使用 `aria-label`。
- reduced-motion 下所有循环动画退化为静态状态。

组件不再接收 `theme` prop。主题由祖先容器继承，避免每个组件复制主题 API。

## 9. 样式和主题

样式采用三层 token：

```text
primitive Less token
  → semantic CSS variable
    → component CSS variable
```

- Less 变量和 mixin 只服务库内部生成。
- 对消费者公开的主题合同全部是 `--omg-*` CSS Variables。
- 组件样式不得直接写品牌色、状态色、圆角、阴影或动效时长字面量。
- 默认浅色主题由 `:root` 提供。
- 显式主题使用 `[data-omg-theme='light']` 与 `[data-omg-theme='dark']`，支持局部嵌套。
- 没有显式主题时，根节点根据 `prefers-color-scheme` 选择系统主题。
- 不识别 VitePress 的 `.dark` 或通用 `[data-theme]`；文档应用负责把自身状态映射为 `data-omg-theme`。
- 非必要动画支持 `prefers-reduced-motion: reduce`。
- 当前只有三个组件，只发布一份 `styles.css`。CSS 体积或组件数量显著增长后再加入按组件样式入口。

主题继承完全由 CSS 完成，首版不增加 `OConfigProvider`。将来只有在 locale、全局 size、z-index 或命名空间等配置形成真实需求后再引入 Provider。

## 10. 测试设计

### 单元和组件测试

使用 Vitest、`@vitejs/plugin-vue`、Vue Test Utils 与 jsdom。测试复用 Vite 官方 Vue SFC 转换，不维护自定义 loader。

每个组件至少覆盖：

- 默认渲染和原生语义。
- props、slots、emits 与 attrs 透传。
- disabled/loading/error/empty/overflow 等状态。
- 键盘、焦点和可访问属性。
- 响应式 prop 更新。
- 公开类型和枚举边界。

测试行为和公共合同，避免大面积 snapshot。覆盖率目标为 lines/functions/statements 90%、branches 85%，覆盖率不是替代断言质量的指标。

### SSR

用 `@vue/server-renderer` 验证：

- 包入口在无 DOM 环境可导入。
- 三个组件可以 `renderToString`。
- 模块顶层不访问 `window`、`document` 或 `Image`。

### 成品包

`test:package` 必须：

1. 构建 UI 包。
2. 运行 `pnpm pack` 得到 tarball。
3. 运行 `publint` 和 ATTW。
4. 在系统临时目录创建最小 Vue/Vite consumer。
5. 安装 tarball，导入根入口、三个子入口和 `styles.css`。
6. 执行 `vue-tsc --noEmit` 与生产构建。
7. 检查 tarball 不包含源码、文档、缓存和测试。

成品测试禁止直接引用 `packages/ui/src`。

类型消费范围明确为 TypeScript `moduleResolution: "Bundler"`。ATTW 只检查四个 JavaScript
公共入口，并忽略 Node16 无法建模 Vue `.vue.d.ts` 内部引用产生的
`internal-resolution-error`；独立 Vue/Vite consumer 的严格类型检查仍是必须通过的最终合同。

### 浏览器

Playwright 针对构建后的 VitePress 站点验证关键路径：

- 明暗主题和系统 fallback。
- 键盘与 focus-visible。
- reduced-motion。
- 长文本、窄容器和 overflow。
- axe 可访问性规则。

PR 只跑 Chromium。整页视觉截图不作为核心门禁。

## 11. 文档

- 文档是 private workspace，目录为 `apps/docs`。
- 示例是 `apps/docs/examples/<component>/*.vue` 中的真实 SFC，不把大量示例代码复制进 Markdown。
- 每个页面包含安装、基础、状态、尺寸、API、events、slots、CSS Variables、可访问性与边界案例。
- `docs:dev` 可精确 alias 包入口到源码以获得 HMR。
- `docs:build` 必须先构建 UI，并解析真实 `@puzzle-fuzzy/ui` exports。
- 文档主题负责同步 `data-omg-theme`，组件库本身不依赖 VitePress。
- 删除模板页面、模板仓库链接、缓存和重复 preview 样式。

## 12. 标准化与质量门禁

工具：

- ESLint flat config：Vue、TypeScript、导入边界、未使用代码和命名。
- Stylelint：Vue/Less、BEM、重复声明和非法颜色字面量。
- Prettier：TS、Vue、Less、JSON、YAML 与 Markdown。
- TypeScript：`strict`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`、`noUnusedLocals`、`noUnusedParameters`、`verbatimModuleSyntax`。
- `check:naming`：组件目录合同。

根命令：

```text
pnpm check
  format:check
  lint
  lint:styles
  check:naming
  typecheck
  test:coverage

pnpm verify
  check
  build
  test:ssr
  test:package
  docs:build
  test:e2e
```

CI 使用 `pnpm install --frozen-lockfile` 并执行 `pnpm verify`。失败项必须非零退出，不使用忽略错误的脚本。

## 13. 发布

- `prepack` 只负责保证 UI dist 为最新。
- 实际发布前必须完成 `verify`。
- 只发布 `packages/ui` 的成品合同，不发布 workspace 根目录。
- 单包阶段使用手工 SemVer、CHANGELOG 和 tag；不引入 Changesets。
- 将来自动发布时使用 npm Trusted Publishing/OIDC，不保存长期 npm token。
- 本次只让包达到可发布状态，不执行 `npm publish`。

## 14. 清理范围

直接删除：

- 根与子目录的 Bun lockfile、Bun 专用配置和 Bun 强制说明。
- `introduction` 旧目录；内容迁移到 `apps/docs`。
- UI 应用脚手架、HelloWorld、favicon、starter assets 和损坏的 `style.css`。
- VitePress cache、模板 README 与失效链接。
- UMD/CJS 配置和旧 `@components/ui` exports。
- 仅被 `useImage` 使用的 `@vueuse/core`。
- 组件级 `theme` prop、`data-o-theme`、`--o-*` 和宿主 `.dark` 耦合。

## 15. 完成标准

1. 根目录只有 `pnpm-lock.yaml`，不存在 Bun lockfile。
2. `packages/ui` 不包含应用入口或脚手架素材。
3. 三个组件遵循统一目录和显式导出合同。
4. 公共命名统一为 `O*`、`.o-*`、`--omg-*`。
5. 主题只通过 CSS Variables 与 `data-omg-theme` 继承。
6. 五个 AvatarFlow phase 有可区分的视觉与无障碍状态。
7. 单测、SSR、类型、lint、样式和命名检查通过。
8. ESM 根入口、组件子入口、声明与 CSS 均通过 tarball consumer。
9. 构建后的 VitePress 通过关键 Playwright/axe 检查。
10. `pnpm verify` 在干净安装后完整通过。
11. 包为 `@puzzle-fuzzy/ui@0.1.0`、public、Vue 3.5+、ESM-only、`UNLICENSED`。
12. 没有旧包名、旧入口、源码消费捷径或兼容层。

## 16. 选型依据

- Element Plus 当前固定 pnpm workspace，并以 Vitest、Vue Test Utils、VitePress、组件自治目录和 CSS Variables 组织大型组件库。
- Naive UI 同样固定 pnpm 并使用 Vitest/Vue Test Utils，但其运行时 CSS-in-JS、ESM/CJS/UMD 和主题 Provider 是大型通用库成本。
- Vue 官方推荐 Vite 项目使用 Vitest，并使用 Vue Test Utils 做组件测试。
- Vite 官方 library mode 原生支持多入口和外部化依赖，足够覆盖本项目，无需私有构建框架。

参考：

- [Element Plus package.json](https://github.com/element-plus/element-plus/blob/dev/package.json)
- [Element Plus Button 目录](https://github.com/element-plus/element-plus/tree/dev/packages/components/button)
- [Element Plus 主题说明](https://element-plus.org/en-US/guide/theming)
- [Naive UI package.json](https://github.com/tusen-ai/naive-ui/blob/main/package.json)
- [Naive UI Button 目录](https://github.com/tusen-ai/naive-ui/tree/main/src/button)
- [Vue Testing Guide](https://vuejs.org/guide/scaling-up/testing.html)
- [Vite Library Mode](https://vite.dev/guide/build.html#library-mode)
- [pnpm Workspaces](https://pnpm.io/workspaces)
