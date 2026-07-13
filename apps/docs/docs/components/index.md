# 组件总览

OMG UI 当前提供 42 个组件族、67 个公开 Vue 组件。所有组件仅面向 Vue 3，支持根入口与独立子入口导入，并共享 `O*` 命名、`.o-*` 样式类和 `--omg-*` 主题变量。

## 基础

- [Button 按钮](/components/button)：动作、语气、尺寸与加载状态。
- [Button Group 按钮组](/components/button-group)：横向或纵向组合按钮、输入和菜单触发器。
- [Card 卡片](/components/card)：标题、描述、操作、内容和页脚的紧凑表面组合。
- [Tag 标签](/components/tag)：语义色、软色/实色、图标与受控关闭意图。
- [Badge 徽标](/components/badge)：计数、文本、圆点与逻辑方位组合。
- [Kbd 键盘按键](/components/kbd)：单键、组合键和快捷键语义展示。
- [Divider 分割线](/components/divider)：水平、垂直、实线、虚线与可选内容。
- [Aspect Ratio 宽高比](/components/aspect-ratio)：用原生 CSS 保持媒体或自定义内容比例。
- [Image 图片](/components/image)：原生图片与组件自持的 Teleport 全屏预览层。
- [Avatar 头像](/components/avatar)：图片、文字回退、颜色、状态与堆叠。
- [Avatar Group 头像组](/components/avatar-group)：受控重叠距离与超出数量。

## 表单

- [Label 标签](/components/label)：原生标签、必填提示与禁用状态。
- [Field 表单字段](/components/field)：标签、说明、错误和控件的语义组合。
- [Input Group 输入组合](/components/input-group)：单边界输入、前后附加内容与操作按钮。
- [Input 单行输入](/components/input)：清除、密码可见性、前后缀与原生属性透传。
- [Textarea 多行输入](/components/textarea)：固定行高或按内容自动增长，不显示原生 resize 手柄。
- [Checkbox 复选框](/components/checkbox)：原生布尔值、mixed、只读与错误状态。
- [Radio 单选框](/components/radio)：独立 Radio 与共享 name、值和状态的 Radio Group。
- [Switch 开关](/components/switch)：真实 checkbox、受控布尔值、只读、加载与逻辑方向滑块。
- [Code Input 验证码输入](/components/code-input)：六位输入、粘贴与边框焦点反馈。
- [Select 选择器](/components/select)：单选、键盘导航、浮层定位与大型集合虚拟化。
- [Upload 文件选择](/components/upload)：点击或拖拽选择、受控列表与 UI 状态展示。

## 导航

- [Tabs 标签页](/components/tabs)：稳定值选择、roving focus 与可选 panel。
- [Accordion 手风琴](/components/accordion)：单项或多项展开、方向键导航与 RTL。
- [Collapsible 折叠区域](/components/collapsible)：轻量的受控或非受控内容展开。

## 反馈

- [Alert 提示](/components/alert)：持久内联反馈、语义图标、动作插槽与受控关闭意图。
- [Empty 空状态](/components/empty)：无默认播报的媒体、说明、内容和操作组合。
- [Message 消息](/components/message)：右上角实体消息、状态图标、自动关闭与堆叠动效。
- [Progress 进度](/components/progress)：确定/不确定进度、显式状态与可访问标签。
- [Skeleton 骨架屏](/components/skeleton)：原子占位形状、受控内容切换与静态 reduced-motion 路径。
- [Spinner 加载指示](/components/spinner)：可访问状态或装饰性旋转图标。

## 浮层

- [Tooltip 文字提示](/components/tooltip)：焦点或悬停触发的非交互描述层与十二方向定位。
- [Dropdown 下拉菜单](/components/dropdown)：菜单按钮、操作项与焦点恢复。
- [Popover 弹出层](/components/popover)：可交互浮层、碰撞定位、焦点管理与 Teleport。
- [Avatar Dropdown 头像下拉](/components/avatar-dropdown)：Avatar 与 Dropdown 的轻量组合。
- [Drawer 侧边面板](/components/drawer)：逻辑方向、原生模态焦点与独立滚动内容。
- [Dialog 对话框](/components/dialog)：原生 top layer、焦点约束与受控关闭。
- [Confirm Dialog 确认弹窗](/components/confirm-dialog)：UI-only 的普通或危险确认意图。
- [Form Dialog 表单弹窗](/components/form-dialog)：原生表单关联、约束校验与提交事件。

## 个人组件

- [Avatar Flow 头像流](/components/avatar-flow)：加载、已连接与传输中的连接状态。
- [Reference Textarea 引用输入](/components/reference-textarea)：通用受控引用项与多行输入组合。
- [Widget 小组件](/components/widget)：个人高频数据卡片、迷你趋势与活动状态展示。

## 共同约定

- 内置和文档图标只从 `vue-icons-plus/lu` 导入。
- Tooltip 只承载不可交互的辅助描述；按钮、链接和表单内容使用 Popover，菜单操作使用 Dropdown。
- 只有 Select 的大型固定行选项集合使用 `vue-virtual-scroller`。Textarea、Upload、Dropdown、Tabs 与 Dialog 内容保持原生或完整 DOM。
- Switch 不持久化设置，Alert 不映射异常，Skeleton 不判断数据是否就绪；Upload、Textarea 与 Dialog 变体同样只表达 UI 状态或操作意图。
- 每个交互组件都以键盘、ARIA、SSR、受控值回退和 `prefers-reduced-motion` 为稳定合同。
