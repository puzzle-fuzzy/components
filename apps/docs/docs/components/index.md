# 组件总览

OMG UI 当前提供 20 个组件族、21 个 Vue 组件。所有组件仅面向 Vue 3，支持根入口与独立子入口导入，并共享 `O*` 命名、`.o-*` 样式类和 `--omg-*` 主题变量。

## 基础与展示

- [Button 按钮](/components/button)：动作、语气、尺寸与加载状态。
- [Divider 分割线](/components/divider)：水平、垂直、实线、虚线与可选内容。
- [Image 图片](/components/image)：原生图片与基于 Dialog 的可访问预览。
- [Avatar 头像](/components/avatar)：图片、文字回退、颜色、状态与堆叠。
- [Avatar Group 头像组](/components/avatar-group)：受控重叠距离与超出数量。
- [Avatar Flow 头像流](/components/avatar-flow)：加载、已连接与传输中的连接状态。

## 数据输入

- [Input 单行输入](/components/input)：清除、密码可见性、前后缀与原生属性透传。
- [Textarea 多行输入](/components/textarea)：固定行高或按内容自动增长，不显示原生 resize 手柄。
- [Reference Textarea 引用输入](/components/reference-textarea)：通用受控引用项与多行输入组合。
- [Checkbox 复选框](/components/checkbox)：原生布尔值、mixed、只读与错误状态。
- [Radio 单选框](/components/radio)：独立 Radio 与共享 name、值和状态的 Radio Group。
- [Code Input 验证码输入](/components/code-input)：六位输入、粘贴与边框焦点反馈。
- [Select 选择器](/components/select)：单选、键盘导航、浮层定位与大型集合虚拟化。
- [Upload 文件选择](/components/upload)：点击或拖拽选择、受控列表与 UI 状态展示。

## 浮层、导航与流程

- [Dropdown 下拉菜单](/components/dropdown)：菜单按钮、操作项与焦点恢复。
- [Avatar Dropdown 头像下拉](/components/avatar-dropdown)：Avatar 与 Dropdown 的轻量组合。
- [Tabs 标签页](/components/tabs)：稳定值选择、roving focus 与可选 panel。
- [Dialog 对话框](/components/dialog)：原生 top layer、焦点约束与受控关闭。
- [Confirm Dialog 确认弹窗](/components/confirm-dialog)：UI-only 的普通或危险确认意图。
- [Form Dialog 表单弹窗](/components/form-dialog)：原生表单关联、约束校验与提交事件。

## 共同约定

- 内置和文档图标只从 `vue-icons-plus/lu` 导入。
- 只有 Select 的大型固定行选项集合使用 `vue-virtual-scroller`。Textarea、Upload、Dropdown、Tabs 与 Dialog 内容保持原生或完整 DOM。
- Upload 只选择文件并发出 `File[]`；Textarea 只编辑文本；Dialog 变体只发出操作意图。请求、持久化、验证和业务状态映射始终由使用方负责。
- 每个交互组件都以键盘、ARIA、SSR、受控值回退和 `prefers-reduced-motion` 为稳定合同。
