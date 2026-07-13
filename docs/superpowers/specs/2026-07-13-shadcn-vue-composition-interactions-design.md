# shadcn-vue 组合表单与展开交互设计

## 背景

OMG UI 是仅面向 Vue 3 的个人组件发布包。上一阶段已经完成 Card、Empty、AspectRatio、Kbd、Spinner 和 ButtonGroup，并确认继续吸收 `unovue/shadcn-vue` 中适合长期复用的能力。本阶段处理 Label、Field、InputGroup、Accordion、Collapsible 和 Popover 六个组件族。

本阶段不复制 shadcn-vue 的 Tailwind 皮肤，也不把 Reka UI 变成 OMG UI 的公共合同。表单语义由原生 HTML 与现有 OMG 控件完成；复杂展开、焦点、键盘和浮层定位由 Reka UI 作为私有运行内核完成。

## 目标

- 新增 6 个组件族、27 个公开 Vue 组件。
- 建立可组合的字段、标签和输入组布局，不加入验证、提交或领域业务。
- 提供符合 WAI-ARIA 键盘和焦点预期的 Accordion、Collapsible 和 Popover。
- 保持 `.o-*`、`--omg-*`、Less 和 `vue-icons-plus/lu` 的现有设计语言。
- 默认减少不必要边框；真实输入边界只保留一圈，浮层依靠表面色和阴影建立层级。
- 通过一个组件 manifest 降低发布入口、文档、测试路由等清单漂移风险。
- 完成单元、SSR、包消费、VitePress、Playwright、无障碍与完整 `pnpm verify` 验收。

## 不做的事情

- 不引入 Tailwind、CVA、clsx 或 tailwind-merge。
- 不重写现有 OInput、OTextarea、OButton 的受控值、IME、autosize 或交互行为。
- 不给 Field 加入校验规则、表单提交、数据请求或错误生成策略。
- 不给 InputGroup 加入搜索、清空、密码显示等业务动作；调用方组合已有组件。
- 不从 OMG UI 导出 Reka UI 类型，也不在公开 Props 中直接继承 Reka Props。
- 不在本阶段增加 PopoverClose、PopoverArrow、AccordionHeader 等非确认组件。
- 不修改 Image 的独立 Teleport 预览、Tabs 滑块或其他已确认视觉效果。

## 方案选择

### 方案 A：完全原生实现

表单侧简单，但 Accordion 的 roving focus、横向 RTL，以及 Popover 的碰撞、焦点陷阱、外部交互和焦点归还需要长期自行维护。拒绝。

### 方案 B：混合内核（采用）

Label、Field 和 InputGroup 使用原生语义与 OMG 现有组件；Accordion、Collapsible 和 Popover 使用 Reka UI 私有运行内核。所有公开 Props、Emits、Slots、class、token 和文档都由 OMG UI 定义。该方案兼顾可访问性、依赖边界和个人视觉一致性。

### 方案 C：直接公开 Reka 包装

实现最薄，但 `.d.ts` 会被上游类型和版本影响，消费方会被迫理解 Reka 细节，也不利于日后更换内核。拒绝。

## 依赖与构建边界

- workspace catalog 固定 `reka-ui: ^2.10.1`，`packages/ui` 以普通 dependency 使用 `catalog:`。
- Vue 保持 peer dependency。
- Vite external 同时匹配 `vue`、`reka-ui` 和 `reka-ui/*`，避免把 Reka 实现重复嵌入每个组件入口。
- Tailwind 不进入任何 dependency 或配置。
- 公共 `.d.ts` 递归检查不得出现 `reka-ui`。
- 打包后的交互组件允许保留 bare `reka-ui` ESM import，由正常 dependency 安装和消费端 tree-shaking 处理。
- 根入口仅消费原生组件时不得把 Reka 运行代码内联进产物。

## 公共渲染合同

交互组件使用 OMG 自有类型：

```ts
export type ORenderAs = string | Component

export interface ORenderProps {
  as?: ORenderAs
  asChild?: boolean
}
```

`asChild` 用于让 Trigger 与 OButton 等现有交互组件组合，避免嵌套 button。该类型只依赖 Vue，不暴露 Reka 类型。

## Label 组件族

### OLabel

- Props：`for?: string`、`disabled?: boolean`、`required?: boolean`。
- Slots：`default`。
- 输出真实 `<label>`，attrs 和事件透传到 label。
- `required` 只显示装饰性必填标记；组件不猜测验证规则。
- disabled 使用 muted 文本和禁用光标，不阻止浏览器原生 label 行为。

## Field 组件族

公开 9 个组件：

- `OField`
- `OFieldLabel`
- `OFieldContent`
- `OFieldTitle`
- `OFieldDescription`
- `OFieldError`
- `OFieldGroup`
- `OFieldSet`
- `OFieldLegend`

不增加 `OFieldSeparator`；已有 `ODivider` 覆盖该能力。

### OField

```ts
export type OFieldOrientation = 'vertical' | 'horizontal' | 'responsive'

export interface OFieldProps {
  orientation?: OFieldOrientation
  disabled?: boolean
  invalid?: boolean
  required?: boolean
}
```

- 默认 `vertical`。
- 输出语义布局容器，通过 `data-orientation`、`data-disabled`、`data-invalid`、`data-required` 暴露状态。
- 提供共享 Field context；不自动执行验证。
- Field context 使用一个共享模块定义 InjectionKey，避免独立子路径构建产生不同 key。

### OFieldLabel、OFieldTitle、OFieldDescription、OFieldError

- `OFieldLabel` 复用 OLabel 的语义与视觉，可显式传 `for`。
- `OFieldTitle` 是不与 control 建立 `for` 关联的简短标题，默认输出 `<div>`。
- `OFieldDescription` 输出 `<p>`，用于帮助文本。
- `OFieldError` 支持 default slot 和 `errors?: readonly (string | { message?: string } | null | undefined)[]`。
- errors 过滤空消息并按文本去重；单条直接输出，多条输出列表；slot 优先。
- 非空错误使用 `role="alert"`，但不负责产生错误内容。

### OFieldContent、OFieldGroup、OFieldSet、OFieldLegend

- `OFieldContent` 聚合标题、说明和控制区域，不增加视觉表面或边框。
- `OFieldGroup` 负责字段间距并建立 container query 容器。
- `OFieldSet` 输出真实 `<fieldset>`，默认 `border: 0`，可通过原生 disabled 语义禁用内部表单控件。
- `OFieldLegend` 输出真实 `<legend>`；`variant='label'` 时只调整视觉层级，不改变语义元素。

Field compound 允许调用方显式组织复杂结构。ID 与 `aria-describedby` 由调用方或现有 control attrs 明确传入；本阶段不通过挂载期自动注册改变 SSR 结构。

## InputGroup 组件族

公开 6 个组件：

- `OInputGroup`
- `OInputGroupAddon`
- `OInputGroupInput`
- `OInputGroupTextarea`
- `OInputGroupButton`
- `OInputGroupText`

### Root 与布局

```ts
export type OInputGroupAddonAlign = 'inline-start' | 'inline-end' | 'block-start' | 'block-end'
```

- Root 是唯一边框拥有者；内部 input、textarea 和 button 不再各画一圈边框。
- `:focus-within` 只改变 root 的 border color，不使用 outline 或额外 glow。
- invalid 由真实 control 的 `aria-invalid` 或 modifier 映射到 danger border。
- block addon 使用布局、间距和顺序区分，不增加上下分隔线。
- DOM 顺序决定键盘顺序，CSS 不制造与 DOM 相反的可访问顺序。

### Addon、Text 与控件包装

- Addon 支持四个 align 值。点击非交互空白区域时聚焦组内第一个可用 input/textarea。
- 点击 button、a、input、textarea、select 或 `[role='button']` 时不抢焦点。
- Text 输出 `span` 或 `div`，用于单位、前缀和提示。
- InputGroupInput 与 InputGroupTextarea 复用 OInput/OTextarea 的 Props、Emits 和 Slots，并只在 group 内中和自身表面、border 和 radius。
- InputGroupButton 复用 OButton 行为，提供适合组内的紧凑尺寸，不复制点击逻辑。

## Accordion 组件族

公开 `OAccordion`、`OAccordionItem`、`OAccordionTrigger`、`OAccordionContent`。

### Root

```ts
export type OAccordionType = 'single' | 'multiple'
export type OAccordionOrientation = 'vertical' | 'horizontal'
export type OAccordionValue = string | string[] | undefined
```

- Props：`type='single'`、`modelValue?`、`defaultValue?`、`collapsible=false`、`disabled=false`、`orientation='vertical'`、`dir?`、`unmountOnHide=true`、`as?`、`asChild?`。
- Emit：`update:modelValue`。
- single 使用 string，multiple 使用 string[]；开发环境对形状不匹配给出 warning。
- 保留 Reka 提供的 `data-state`、`data-disabled`、`data-orientation`、aria-expanded、controls 和 region 关联。

### Item、Trigger、Content

- Item 要求唯一 `value: string`，支持 disabled 和渲染替换。
- Trigger 默认 button，支持 asChild；默认使用 `LuChevronDown`，icon slot 可替换。
- Chevron 只随 open 状态旋转，不增加额外状态动画。
- Content 使用测量变量完成高度或宽度加 opacity 展开，内部 wrapper 只负责 padding。
- Item 默认不画分割边框，依靠间距和表面层级组织。
- 支持 vertical/horizontal、LTR/RTL、Arrow、Home、End、Enter 和 Space。

## Collapsible 组件族

公开 `OCollapsible`、`OCollapsibleTrigger`、`OCollapsibleContent`。

- Root Props：`open?`、`defaultOpen=false`、`disabled=false`、`unmountOnHide=true`、`as?`、`asChild?`。
- Emit：`update:open`。
- 受控模式只 emit；父组件不回写时不伪改 UI。
- Trigger 默认无皮肤 button，允许通过 asChild 组合 OButton；裸用时仍有 focus-visible。
- Content 支持 `forceMount`，保留 aria-controls、aria-expanded、稳定 ID 和 data-state。
- 展开动画与 Accordion 使用同一 motion token，但两个公共组件族互不依赖。

## Popover 组件族

公开 `OPopover`、`OPopoverTrigger`、`OPopoverAnchor`、`OPopoverContent`。

### Root、Trigger、Anchor

- Root Props：`open?`、`defaultOpen=false`、`modal=false`。
- Root Emit：`update:open`；default slot 暴露 `{ open, close }`。
- Trigger 默认 button，支持 asChild，与 OButton 组合时不产生嵌套 button。
- Anchor 支持普通元素和本地声明的 virtual reference 合同，不公开 Floating/Reka 类型。

### Content

- 定位 Props：`side`、`align`、`sideOffset=8`、`alignOffset=0`、`avoidCollisions=true`、`collisionPadding=8`、`sticky='partial'`、`hideWhenDetached=false`、`positionStrategy='absolute'`。
- Portal Props：`teleported=true`、`teleportTo='body'`、`forceMount?`。
- 透传并公开本地 DOM 事件类型：Escape、pointer outside、focus outside、interact outside、open autofocus、close autofocus；调用方可以 preventDefault。
- 默认无 border，使用不透明 surface、单层 shadow、radius 和 padding；宽度由内容与调用方 CSS 控制，不复制固定 `w-72`。
- 使用 `--omg-z-index-dropdown`，不覆盖 VitePress `--vp-*`。
- Teleport 后同步触发器所在局部主题、方向、语言和有差异的 `--omg-*` 变量；与现有 floating context 能力复用同一内部工具。
- 支持 Escape、外部交互关闭、焦点进入和归还；modal 模式由 Reka 负责焦点陷阱和背景隔离。

## Motion 与视觉原则

- InputGroup 仅保留一圈真实输入边界。
- Field、FieldGroup、FieldSet、Accordion item、Collapsible 默认无外边框。
- Popover 使用表面色和阴影，不添加描边。
- Trigger 的键盘焦点必须清晰可见；不能为了少 border 去掉可访问焦点状态。
- 动画只服务状态理解：Accordion/Collapsible 展开，Popover 淡入加 2–4px 位移，Chevron 旋转。
- 所有 motion 在 `prefers-reduced-motion: reduce` 下关闭或近乎即时。

## 组件 Manifest 与标准化

新增 `packages/ui/component-manifest.json`，保存组件族 slug、文档 label 和 category。它是结构索引，不生成源代码，也不在 build 时写文件。

由 manifest 派生或核对：

- Vite library entries。
- VitePress source aliases 和 sidebar。
- Playwright 全组件路由 smoke。
- tarball ATTW entrypoints。
- package exports、根导出、总样式、目录、文档和总览必须与 manifest 精确一致，既拒绝缺失也拒绝多余。

现有 36 个组件族先完整录入 manifest，本阶段再增加 6 个，总数达到 42 个组件族、67 个公开 Vue 组件。

## 测试合同

### 单元与类型

- 所有 tuple、validator、default、Props、Emits、Slots 和 attrs forwarding。
- Label 的 for、required、disabled 与原生点击行为。
- Field 的语义元素、状态、error 去重、slot 优先、fieldset disabled 和所有排列。
- InputGroup 四种 addon、空白聚焦、交互子节点不抢焦点、OInput/OTextarea/OButton 行为回归。
- Accordion single/multiple、受控/非受控、disabled、collapsible、方向键、Home/End、RTL horizontal。
- Collapsible Enter/Space、受控/非受控、disabled、forceMount。
- Popover Escape、外部交互、事件取消、焦点归还、modal、body/custom target/inline 三种挂载。

### SSR 与发布

- 所有新组件不访问 window/document 即可 renderToString。
- Accordion/Collapsible 覆盖 closed、open 和 forceMount。
- Popover 覆盖 closed、`defaultOpen + teleported=false`，以及 teleported SSR context 不抛错。
- 根入口和六个子路径均通过类型检查、build、publint、ATTW 和真实 tarball Vue 消费。
- dist `.d.ts` 不含 `reka-ui`，交互 JS 不内联完整 Reka 源码。

### VitePress 与浏览器

- 每个组件族提供基础、状态、组合、键盘/无障碍示例。
- Field 展示 Input、Textarea、Checkbox、Radio、Switch。
- InputGroup 展示 icon、文字、按钮、block addon 和 Textarea。
- Accordion 展示 single、multiple、disabled、horizontal RTL。
- Collapsible 展示裸 Trigger 与 OButton composition。
- Popover 展示基础、受控、定位、modal、表单内容和自定义挂载。
- Playwright 验证交互、焦点、axe、暗色、窄容器、RTL 和 reduced motion。

## 验收与交付

- 六个组件族及 27 个公开组件完整发布。
- manifest 和一致性检查覆盖全部组件族。
- `pnpm verify` 全部通过。
- 工作区无 Bun 文件、临时脚本、构建输出或无关改动。
- 拉取远程并在 `main` 上安全同步，完成提交和推送。
