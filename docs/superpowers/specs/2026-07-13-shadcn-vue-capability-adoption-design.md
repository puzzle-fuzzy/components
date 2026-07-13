# shadcn-vue 能力吸收设计

## 背景

OMG UI 是一个只面向 Vue 3 的个人组件发布包。它使用 `O*` 公共组件名、`.o-*` CSS 类、`--omg-*` CSS Variables、Less 样式和 `vue-icons-plus/lu` 图标，并通过根入口、组件子入口、类型声明、SSR、真实 tarball 消费和 VitePress 文档建立发布合同。

本轮参考对象是 `unovue/shadcn-vue` 的 `dev` 分支提交 `fd513ebaabf5d6493717bc8e3c6bf249cd026567`。该项目采用 registry 源码分发：组件源码复制进消费应用，由消费应用的 Tailwind 和 Reka UI 基础设施编译。OMG UI 则发布预编译 ESM 和单一 CSS，因此不能直接照搬它的依赖与目录结构。

## 目标

- 尽可能覆盖 shadcn-vue 中对个人项目有长期价值的 UI 能力。
- 摘取 compound composition、`data-state` / `data-slot`、无障碍交互、语义布局和文档示例等优点。
- 保留 OMG UI 已有组件的视觉效果和个人组件，不为了上游同名而重写。
- 新组件只表达 UI 状态和交互意图，不加入请求、验证策略、持久化或领域业务。
- 每个新增组件都拥有类型、样式、单元测试、SSR、发布子入口和 VitePress 完整展示。

## 不做的事情

- 不在发布包中引入 Tailwind、CVA、clsx 或 tailwind-merge。
- 不复制 shadcn-vue 的 Tailwind 视觉皮肤，不引入其通用 reset、`.dark` 或无前缀变量。
- 不公开 Reka UI 的 Props 类型，也不从 OMG UI 重新导出 Reka UI。
- 不用同义组件替换现有能力：Separator、Sheet、AlertDialog、InputOTP、Sonner 等继续分别由 ODivider、ODrawer、OConfirmDialog、OCodeInput、OMessage 承担。
- 不把已有 ODialog、OSelect、OTooltip、ODropdown、OTabs 等强行迁移到 Reka UI；只有在公共契约不变且回归测试充分时才考虑内部重构。

## 方案选择

### 方案 A：原样移植

复制上游微型组件、Tailwind class 和 Reka Props。实现快，但会让发布包公共 API、依赖和 CSS 急剧膨胀，并污染 VitePress。拒绝。

### 方案 B：OMG 选择性转译（采用）

保留上游的组合思想、键盘合同和布局能力，将无行为包装层压缩成明确 Props 与 named slots；复杂交互才由 Reka UI 承担。样式继续使用 Less 和 OMG tokens，默认减少边框。该方案最符合个人发布包的长期维护方式。

### 方案 C：全部原生实现

依赖最少，但 Accordion、Popover、Combobox、Menu、Calendar 等复杂组件会重复实现大量焦点、方向、键盘和读屏合同，维护成本和错误风险过高。拒绝。

## 依赖边界

### Tailwind

Tailwind 不进入 `packages/ui` 的 dependencies、peerDependencies 或 devDependencies。shadcn-vue 的 utility class 被转译为 `.o-*` Less 和 `--omg-*` 语义 token。文档也不使用 `--vp-*` 覆盖 VitePress 品牌变量。

### Reka UI

第一阶段无需 Reka UI。自第二阶段的 OAccordion、OCollapsible、OPopover 起，按需把 `reka-ui` 放入 `packages/ui.dependencies`，由消费者自动安装；Vue 继续是 peer dependency。

构建必须把 `reka-ui` 和 `reka-ui/*` external，避免在多个入口重复打包。公共 O* Props 只映射本库稳定合同。每个 Reka 组件都要验证 closed/open SSR、初始打开 hydration、Portal/Teleport 单实例、稳定 ID、Escape、外部指针、方向键、Home/End 和 RTL。

### 许可证

本项目自行实现结构与视觉，不复制上游源码。若后续确实复制了实质源码或样式片段，必须在发布 tarball 中包含对应 MIT copyright 和 permission notice；不能依赖仓库外部文件自动满足许可。

## 能力盘点

上游 registry 当前有 65 个组件族。OMG UI 已直接或等价覆盖 Alert、Avatar、Badge、Button、Checkbox、Dialog、Drawer/Sheet、DropdownMenu、Input、InputOTP/PinInput、Progress、RadioGroup、Select、Separator、Skeleton、Sonner、Switch、Tabs、Textarea、Tooltip 等约 24 个能力族。

OMG UI 的 AvatarDropdown、AvatarFlow、AvatarGroup、FormDialog、Image、ReferenceTextarea、Tag、Upload、Widget 是个人组件或独立能力，继续保留，不为上游清单让路。

剩余能力按以下路线吸收：

1. **组合基础**：Card、Empty、AspectRatio、Kbd、Spinner、ButtonGroup。
2. **展开与导航**：Accordion、Collapsible、Breadcrumb、Pagination、Stepper、Table、Toggle、ToggleGroup。
3. **表单体系**：Field、Label、InputGroup、NativeSelect、NumberField、Slider、TagsInput、Combobox。
4. **交互浮层**：Popover、HoverCard、Command、ContextMenu、Menubar、NavigationMenu。
5. **集合与布局**：Calendar、RangeCalendar、Carousel、Resizable、ScrollArea、Sidebar、Item。
6. **个人高阶组件**：Attachment、Bubble、MessageScroller、Marker、Chart；逐项评估专用依赖和真实复用价值。

AutoForm 不纳入公共路线，因为它容易把校验和提交政策变成组件职责。已有等价能力不创建第二个同义名称。

## 第一阶段公共合同

第一阶段新增 6 个组件族、9 个公开 Vue 组件；完成后总计 36 个组件族、40 个公开 Vue 组件。

### OCard

一个组件收敛上游 CardHeader、CardTitle、CardDescription、CardAction、CardContent 和 CardFooter 包装层。

- Props：`variant: 'surface' | 'muted' | 'ghost'`、`size: 'sm' | 'md'`、`title?: string`、`description?: string`、`titleLevel: 2 | 3 | 4`。
- Slots：`title`、`description`、`action`、`default`、`footer`。
- 默认 `surface` 不使用描边，以表面色和轻量结构阴影建立层级；`muted` 使用静音表面；`ghost` 透明。
- 只有存在标题、描述或 action 时才渲染 header，长文本允许断行。

### OEmpty

一个可直接使用的空状态，收敛上游 EmptyHeader、EmptyMedia、EmptyTitle、EmptyDescription 和 EmptyContent。

- Props：`mediaVariant: 'plain' | 'soft'`、`size: 'sm' | 'md'`、`title?: string`、`description?: string`、`titleLevel: 2 | 3 | 4`。
- Slots：`media`、`title`、`description`、`default`、`actions`。
- 默认无外框、无 live region，不判断无数据、无权限或加载失败；调用方可透传 role/aria-live。

### OAspectRatio

使用原生 CSS `aspect-ratio`，不引入 Reka。

- Props：`ratio?: number`，默认 `16 / 9`。
- Export：`normalizeOAspectRatio`。
- 非正数、NaN 和 Infinity 回退默认值。
- 只有 default slot，不添加圆角、背景、overflow 或 border。

### OKbd 与 OKbdGroup

- OKbd Props：`size: 'sm' | 'md'`；渲染真实 `<kbd>`。
- OKbdGroup Props：`ariaLabel?: string`；渲染 `<span role="group">`。
- 两者只提供 default slot。组合符号由调用方显式写出，组件不猜测平台键位。

### OSpinner

- Props：`size: 'sm' | 'md' | 'lg'`、`label: string`、`decorative: boolean`。
- 使用 `vue-icons-plus/lu` 的 `LuLoader2`，颜色继承 `currentColor`。
- 普通模式使用 `role="status"` 和可访问名称；装饰模式使用 `aria-hidden="true"`。
- `prefers-reduced-motion` 下停止旋转但保留视觉和语义。

### OButtonGroup、OButtonGroupText、OButtonGroupSeparator

- Group Props：`orientation: 'horizontal' | 'vertical'`、`attached: boolean`、`ariaLabel?: string`。
- Text Props：`tag: 'span' | 'div'`。
- Group 只负责布局，不管理选择值、roving focus 或业务动作。
- `attached` 合并相邻圆角；Separator 从 provide/inject context 读取方向并对辅助技术隐藏；Text 使用 muted surface。
- 现有 Button、Input、Select、Dropdown 保留自己的键盘和焦点合同。

## 样式原则

- 默认无不必要边框。边框只用于真实输入边界、连接控制或必须区分的状态。
- 使用逻辑属性支持 RTL，使用容器查询或现有断点处理紧凑布局。
- 粗指针环境中的交互目标保持至少 44px 可点击区域。
- 动画必须有 `prefers-reduced-motion` 静态路径。
- 状态优先通过显式 modifier 或 `data-state` / `data-slot` 表达，不依赖脆弱 DOM 顺序。

## 发布与标准化

第一阶段仍按现有目录合同创建 `src/*.ts`、`O*.vue`、`style/index.less`、`__tests__/*.test.ts`、`index.ts`。同步维护：

- `packages/ui/src/index.ts`
- `packages/ui/src/styles/index.less`
- `packages/ui/vite.config.ts`
- `packages/ui/package.json` exports
- SSR suite、package contract、tarball consumer、ATTW/publint 入口断言
- VitePress alias、sidebar、总览、独立文档与 Playwright 展示

在第二阶段引入 Reka 前，新增一个单一 component manifest 或一致性校验，以减少组件名单在多处手工重复造成的遗漏；同时加入“根入口只导入一个原生组件”和“子入口只导入一个 Reka 组件”的最小消费构建与体积护栏。

## 验收

- 第一阶段所有公共 Props、Emits、Slots 和 helper 有类型与单元测试。
- SSR 同时覆盖每个新组件的默认与关键变体。
- VitePress 每个家族至少两个展示，覆盖暗色、长文本、RTL、响应式和 reduced-motion 中适用项。
- Playwright 验证实际尺寸、键盘、焦点、可访问树和少边框视觉。
- `pnpm verify` 全部通过，工作区无生成物或 Bun 文件，并合并推送到 `main`。
