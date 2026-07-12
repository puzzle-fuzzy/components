# OMG UI Avatar、验证码与分割线扩展设计

## 背景与目标

OMG UI 需要补齐头像组合、轻量传输流、验证码输入和分割线这几类基础能力，同时保持 Vue 3-only、无运行时依赖、`O*` 组件命名、`.o-*` CSS 类名和 `--omg-*` 主题变量约束。

本次目标：

1. 让 `OAvatar` 可以直接参与堆叠，并提供头像回退文字的背景色和文字色覆盖。
2. 新增职责清晰的 `OAvatarGroup`，统一处理堆叠顺序、最大显示数和溢出头像。
3. 将 `OAvatarFlow` 中头像之间的连接视觉简化为短线或三个圆点，保留状态语义但移除复杂动画和图标。
4. 新增六位验证码输入组件 `OCodeInput`，支持键盘输入、退格、整段粘贴和完成事件。
5. 新增具备语义属性的 `ODivider`。
6. 删除 VitePress 主题中对 `--vp-c-brand-*` 的覆盖，确保文档站点与组件库主题变量解耦。

## 方案与取舍

考虑过三种头像堆叠方式：只在 `OAvatar` 上增加样式、通过 `OAvatarGroup` 统一管理、或运行时解析任意默认插槽的 VNode。采用第二种并保留第一种：`OAvatar` 负责单体能力，`OAvatarGroup` 负责数据化组合。这样避免 VNode 结构推断对 SSR、动态插槽和类型推导的影响，同时为后续成员列表保留稳定边界。

不引入第三方 OTP、表单或动画依赖。验证码的输入状态属于组件内部焦点管理，值本身由 `v-model` 控制；倒计时、请求、校验和重试属于业务层。Flow 只表达轻量视觉状态，不承担传输业务逻辑。

## 组件设计

### OAvatar

新增 props：

```ts
interface OAvatarProps {
  stacked?: boolean
  backgroundColor?: string
  textColor?: string
}
```

`stacked` 为根节点增加堆叠标记类，并在相邻 stacked 头像之间应用 `--omg-avatar-overlap` 负间距；普通单头像不会改变尺寸。`OAvatarGroup` 会为其渲染的头像统一打开该标记。颜色 props 通过根节点的 `--omg-avatar-background` 和 `--omg-avatar-color` 内联覆盖，仅影响当前头像，不写入全局主题。图片存在时颜色仍保留为图片加载失败和回退内容的基础样式。

现有 `src`、`alt`、`name`、`initials`、状态、fallback slot、`load`/`error` 事件和可访问性行为保持不变。

### OAvatarGroup

组件使用明确的数据模型，不解析任意默认插槽：

```ts
interface OAvatarGroupItem {
  readonly id: string | number
  readonly name?: string
  readonly src?: string
  readonly initials?: string
  readonly backgroundColor?: string
  readonly textColor?: string
}
```

Props：

- `items: readonly OAvatarGroupItem[]`，必填。
- `max?: number`，默认不裁剪；设置后只显示前 `max` 项并追加一个无障碍装饰性 `+N` 头像。
- `size?: OAvatarSize`、`shape?: OAvatarShape`，默认值与 `OAvatar` 一致。
- `reverse?: boolean`，控制视觉堆叠方向，不改变 `items` 顺序和读屏顺序。
- `ariaLabel?: string`，可选的组级说明；传入后设置在 group 容器上。

组容器使用 flex，头像之间通过一个可覆写的 `--omg-avatar-group-overlap` 变量实现负间距；每个头像有明确层级，后出现的头像位于上层。溢出头像使用 `alt=""`，同时由组容器提供完整的 `aria-label`。

### OAvatarFlow

保留 `phase`、`accessibleLabel`、发送者/接收者数据和最大接收者数量 API。模板只保留：发送者、一个连接器、接收者组。连接器在 `transferring` 时渲染三个简单圆点，其他阶段渲染一条静态短线。阶段通过 `data-phase` 和颜色变量表达，不再渲染方向箭头、状态徽标、粒子动画或复杂 keyframes。`role="status"` 和 live region 保持不变。

接收者部分复用 `OAvatar` 的堆叠规则；溢出仍显示 `+N`，但不再单独维护一套重叠 CSS。

### OCodeInput

Props：

```ts
interface OCodeInputProps {
  modelValue?: string
  length?: number // 默认 6
  size?: 'sm' | 'md' | 'lg' // 默认 md
  disabled?: boolean
  readonly?: boolean
  autofocus?: boolean
  invalid?: boolean
  ariaLabel?: string
}
```

值会按数字字符过滤，并截断到 `length`。每格是独立原生输入框，使用 `maxlength=1`、`inputmode="numeric"` 和 `autocomplete="one-time-code"`。输入一个字符后前进；空格退格时回退；整段粘贴按顺序填充剩余格子。`autofocus` 默认关闭，避免组件挂载时抢夺页面焦点。

Emits：

- `update:modelValue(value: string)`
- `complete(value: string)`，仅在值达到 `length` 时触发
- `focus(event: FocusEvent)`
- `blur(event: FocusEvent)`

通过 `defineExpose` 暴露 `focus(index?: number)`。组件不执行远程校验，不维护倒计时。

### ODivider

Props：

- `direction?: 'horizontal' | 'vertical'`，默认 `horizontal`。
- `dashed?: boolean`，默认实线。
- `contentPosition?: 'left' | 'center' | 'right'`，默认 `center`。

默认 slot 有内容时渲染文字和两侧线段，无内容时只渲染一条线。根节点使用 `role="separator"`，并根据方向设置 `aria-orientation`。所有颜色、间距和边框变量来自 `--omg-*`。

## 主题与 VitePress 边界

删除 `apps/docs/docs/.vitepress/theme/custom.less` 中的 `:root { --vp-c-brand-* }` 覆盖。文档站点继续使用 VitePress 自带的品牌变量；组件示例只通过导入 `@puzzle-fuzzy/ui/styles.css` 获得 `--omg-*`。组件源码、文档自定义样式和测试中不得新增 `--vp-c-brand-*`。

## 可访问性与边界

- 图片头像遵循现有 `alt` 优先、`name`/`initials` 回退规则。
- 颜色 props 不改变语义标签；装饰性溢出头像使用空 alt，并由组级 label 说明总数。
- 验证码输入框分别拥有可读的序号 label，支持键盘导航，禁用和只读状态符合原生语义。
- 分割线使用原生 separator 语义；垂直模式不生成额外视觉文字。
- `prefers-reduced-motion` 下不启用任何新增动画；Flow 本次默认不再使用动画。
- 文本、边框、焦点环和自定义头像颜色继续通过对比度测试验证。

## 测试与交付

- 单元测试：头像颜色与 stacked 标记、`OAvatarGroup` 裁剪/溢出/顺序、Flow 短线/圆点、验证码输入/退格/粘贴/完成事件/暴露 focus、Divider 方向/slot/语义属性。
- 样式测试：命名检查、`--omg-*` 变量边界、Flow 不再包含旧粒子/phase-marker 结构。
- 文档与 E2E：新增三个组件页面和示例；验证主题切换、焦点可见性、验证码完整输入和文档路由。
- 契约检查：根入口、五个组件子路径（avatar、avatar-group、avatar-flow、code-input、divider）类型声明、`publint`、ATTW、临时 Vue/Vite 消费者和 tarball 内容。
- 交付前执行现有 `pnpm verify`、覆盖率、SSR、VitePress 构建、Playwright 和包契约脚本。

## 非目标

- 不新增 `OConfigProvider`、全局语言包、验证码请求/倒计时、头像上传、拖拽排序或复杂 Flow 动画。
- 不修改 VitePress 全局品牌颜色来匹配 OMG UI。
