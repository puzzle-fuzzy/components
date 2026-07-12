# OMG UI Select、Dropdown、Avatar Dropdown 与图标规范设计

## 背景与目标

OMG UI 需要补齐单选下拉、点击菜单和头像菜单，并建立唯一图标来源。同时调整 `OAvatarFlow` 的 loading 圆点，使其只缩放而不产生上下位移。

目标：

1. 新增单选基础组件 `OSelect`。
2. 新增通用点击菜单 `ODropdown`。
3. 新增组合组件 `OAvatarDropdown`，不污染基础 `OAvatar` 的职责。
4. 所有库内图标统一使用 `vue-icons-plus/lu`。
5. 三个浮层组件复用同一套定位、受控开关和集合导航基础。
6. 补齐键盘、焦点、SSR、真实包消费、文档和浏览器可访问性验证。

## 方案选择

### 浮层架构

不为 Select、Dropdown 和 Avatar Dropdown 各自实现绝对定位，也不在本轮公开通用 Popover API。采用内部共享浮层基础：

- Vue `Teleport` 将面板挂到 `body`，避免祖先 `overflow` 裁剪。
- `@floating-ui/dom` 使用 `computePosition`、`autoUpdate`、`offset`、`flip`、`shift` 和 `size`。
- 浮层只在打开并挂载后启动 `autoUpdate`，关闭或卸载时立即清理。
- 共享受控/非受控 open 状态、点击外部关闭和集合索引工具。
- Select 和 Dropdown 自己负责各自的 ARIA 角色与键盘模式。

依赖版本：

```json
{
  "@floating-ui/dom": "^1.8.0",
  "vue-icons-plus": "^0.1.8"
}
```

两者作为 `@puzzle-fuzzy/ui` 的常规运行依赖。Vite 继续只 externalize Vue，组件实际使用的定位代码和图标可被按入口打包与 tree-shake。

### 图标规范

- 唯一图标来源为 `vue-icons-plus`。
- OMG UI 内部统一使用 Lucide 子包 `vue-icons-plus/lu`。
- Select 使用 `LuChevronDown`、`LuCheck`、`LuX`。
- Dropdown 使用 `LuChevronDown`，菜单项允许传入 Vue icon component。
- 文档中的菜单图标同样从 `vue-icons-plus/lu` 导入。
- 不复制 SVG，不引入第二个图标包，不创建只转发 props 的 `OIcon` 包装组件。
- 内置图标默认 `aria-hidden="true"`，尺寸和颜色继承组件 token。

## 内部共享基础

### useControllableOpen

位置：`packages/ui/src/composables/use-controllable-open.ts`

输入：

```ts
interface UseControllableOpenOptions {
  open: ComputedRef<boolean | undefined>
  emit: (event: 'update:open', value: boolean) => void
}
```

输出：

```ts
{
  isOpen: ComputedRef<boolean>
  setOpen(value: boolean): void
  toggle(): void
}
```

当 `open` 为 `undefined` 时使用内部状态；传入 `open` 时由消费者控制。每次请求变化都发出 `update:open`。

### useFloatingPanel

位置：`packages/ui/src/composables/use-floating-panel.ts`

输入：

- `isOpen`
- `placement: 'bottom-start' | 'bottom-end'`
- `matchReferenceWidth`
- `onDismiss`

输出：

- `referenceElement`
- `floatingElement`
- `floatingStyle`
- `resolvedPlacement`
- ref setters

行为：

- `strategy: 'fixed'`
- `offset(6)`
- `flip({ padding: 8 })`
- `shift({ padding: 8 })`
- `size({ padding: 8 })` 设置可用最大高度；Select 同时匹配 trigger 宽度。
- 打开时监听 scroll、resize、layout shift 与元素尺寸变化。
- document `pointerdown` 位于 trigger 和 panel 外时关闭。
- Escape 通过具体组件处理，避免内部基础层假定菜单语义。
- SSR setup 不访问 `window`、`document` 或 DOM 构造函数。

### 集合导航

位置：`packages/ui/src/utils/collection-navigation.ts`

纯函数：

```ts
findFirstEnabledIndex(items)
findLastEnabledIndex(items)
findNextEnabledIndex(items, currentIndex, direction)
```

跳过 disabled 项并循环首尾。Select 和 Dropdown 共用，函数不依赖 DOM。

## ODropdown

### 数据模型

```ts
export type ODropdownValue = string | number
export type ODropdownTone = 'default' | 'danger'

export interface ODropdownItem {
  readonly value: ODropdownValue
  readonly label: string
  readonly icon?: Component
  readonly disabled?: boolean
  readonly tone?: ODropdownTone
  readonly dividerBefore?: boolean
}
```

### Props

```ts
interface ODropdownProps {
  items: readonly ODropdownItem[]
  open?: boolean
  disabled?: boolean
  placement?: 'bottom-start' | 'bottom-end'
  triggerAriaLabel?: string
  showIndicator?: boolean
}
```

默认 placement 为 `bottom-start`，`showIndicator` 为 true。

### Emits

```ts
interface ODropdownEmits {
  'update:open': [value: boolean]
  select: [value: ODropdownValue, item: ODropdownItem]
}
```

### Slots

- `trigger({ open })`
- `item({ item })`
- `empty`

触发 slot 由组件内部的原生 button 包裹，不能再传入交互式 button。文本、图标或 `OAvatar` 可作为非交互内容。

### 交互与 ARIA

- trigger：原生 button、`aria-haspopup="menu"`、`aria-expanded`、`aria-controls`。
- panel：`role="menu"`。
- item：原生 button + `role="menuitem"`。
- 点击 trigger 切换；点击外部关闭。
- ArrowDown/ArrowUp 打开并聚焦首个/最后一个可用项。
- 菜单内 ArrowDown/ArrowUp 循环跳过 disabled。
- Home/End 到首尾可用项。
- Enter/Space 选择，发出 `select`、关闭并把焦点还给 trigger。
- Escape 关闭并还原 trigger 焦点。
- Tab 不阻止默认行为，但关闭菜单。
- disabled item 不可聚焦、不可选择。
- danger 仅改变视觉，不改变事件类型。

## OSelect

### 数据模型

```ts
export type OSelectValue = string | number

export interface OSelectOption {
  readonly value: OSelectValue
  readonly label: string
  readonly disabled?: boolean
}
```

### Props

```ts
interface OSelectProps {
  modelValue?: OSelectValue
  options: readonly OSelectOption[]
  open?: boolean
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  clearable?: boolean
  clearAriaLabel?: string
  placement?: 'bottom-start' | 'bottom-end'
  ariaLabel?: string
}
```

默认 placeholder 为 `Select`、clearAriaLabel 为 `Clear selection`、size 为 `md`、placement 为 `bottom-start`。

### Emits

```ts
interface OSelectEmits {
  'update:modelValue': [value: OSelectValue | undefined]
  'update:open': [value: boolean]
  change: [value: OSelectValue, option: OSelectOption]
  clear: []
}
```

### Slots

- `option({ option, selected, active })`
- `empty`

### 交互与 ARIA

- 非可编辑 trigger 使用 button + `role="combobox"`。
- 设置 `aria-haspopup="listbox"`、`aria-expanded`、`aria-controls`、`aria-activedescendant`。
- panel 使用 `role="listbox"`，option 使用 `role="option"` 和 `aria-selected`。
- 焦点留在 combobox trigger，通过 active descendant 表达活动项。
- ArrowDown/ArrowUp 打开并移动 active option。
- Home/End 到首尾可用项。
- Enter/Space 选择 active option。
- Escape 关闭；Tab 关闭但保留默认导航。
- 点击 option 选择后关闭并把焦点保留在 trigger。
- control 内的 combobox trigger 与 clear button 是兄弟节点，禁止 button 嵌套；clear button 通过绝对定位进入同一视觉边框。
- clear 按钮仅在已选中、clearable 且非 disabled 时出现；使用 `clearAriaLabel`，清空为 `undefined` 并发出 `clear`，且不会切换面板。
- 空 options 可打开，使用 empty slot；没有 slot 时呈现无业务文案的空面板占位。
- 面板最小宽度匹配 trigger，最大高度由 Floating UI 可用空间决定。
- 首版不支持搜索、多选、分组、远程请求和业务校验。

## OAvatarDropdown

`OAvatarDropdown` 组合 `OAvatar` 与 `ODropdown`。基础头像不新增菜单 props 或点击逻辑。

Props：

- 复用全部 `oAvatarProps`。
- 新增 `items`、`open`、`disabled`、`placement`、`ariaLabel`、`showIndicator`。
- `ariaLabel` 必填，用作菜单 trigger 的可访问名称。

Emits：

- `update:open`
- `select`
- 转发 Avatar `load`
- 转发 Avatar `error`

渲染：

- `ODropdown` 内部 trigger button 包裹 `OAvatar`。
- 默认显示 `LuChevronDown`，打开时旋转 180°。
- trigger hover/focus 只作用于按钮外壳，不改变 Avatar 图片或 fallback 逻辑。
- status、颜色、stacked、shape、size 等头像 props 原样转发。

## 样式与动效

- 浮层使用 OMG surface、border、shadow、radius、spacing、text 和 focus tokens。
- panel 淡入并轻微 `scale(0.98 → 1)`，时长不超过 160ms。
- chevron 旋转不超过 160ms。
- `prefers-reduced-motion: reduce` 下取消 panel 和 chevron 动画。
- Select、Dropdown、Avatar Dropdown 支持浅色与深色 OMG 主题。
- menu item 与 select option 的最小点击高度为 36px。
- 所有图标继承 currentColor。

### Avatar Flow 调整

loading 圆点从 `translateY + opacity` 改为 `scale + opacity`：

```css
0%,
60%,
100% {
  opacity: 0.35;
  transform: scale(0.7);
}

30% {
  opacity: 1;
  transform: scale(1);
}
```

删除 `--omg-avatar-flow-dot-lift`。延迟、持续时间和 reduced-motion 保持。

## 发布与文档

新增子路径：

- `@puzzle-fuzzy/ui/select`
- `@puzzle-fuzzy/ui/dropdown`
- `@puzzle-fuzzy/ui/avatar-dropdown`

更新：

- 根显式导出。
- Vite multi-entry。
- `styles.css` 汇总。
- naming contract 从 6 个组件扩展到 9 个。
- package contract、publint、ATTW 与临时 Vue/Vite consumer。
- VitePress sidebar、三个组件页面、图标规范说明和交互示例。

## 测试

### 单元测试

- 集合导航跳过 disabled、循环首尾、空集合返回 -1。
- controllable open 的受控/非受控路径。
- floating composable 只在打开时启动/清理 autoUpdate，并应用 placement、flip、shift、size。
- Dropdown 的 trigger、菜单角色、键盘、disabled、danger、divider、outside click、focus return 与 emits。
- Select 的 v-model、clear、keyboard、active descendant、selected/disabled、空 options 与 open 控制。
- Avatar Dropdown 的头像 props、菜单选择、open、load/error 与 indicator。
- 内置 icon import 只来自 `vue-icons-plus/lu`。
- Flow loading CSS 不再包含 translateY 或 dot-lift。

### SSR、包与浏览器

- 四个调整/新增组件 SSR 不访问 DOM globals。
- tarball 包含三个新 JS/type 子路径，不包含源码与 map。
- 临时消费者从根入口和三个子路径导入。
- Playwright 验证 trigger 点击、外部关闭、Escape、键盘选择、Select 清空、Avatar 菜单、flip/shift 后 panel 可见、浅深主题和 axe。
- reduced-motion 下 panel 与 chevron 无动画。
- 最终执行 `pnpm verify`。

## 非目标

- 不实现 Select 搜索、多选、tag、分组、远程加载或虚拟列表。
- 不实现 Dropdown 嵌套子菜单、右键菜单或 hover 触发。
- 不在基础 OAvatar 中增加菜单数据。
- 不公开通用 Popover/Floating primitive。
- 不创建第二套 icon 组件或 SVG 资产目录。
