# @puzzle-fuzzy/ui

OMG UI 是一个仅面向 Vue 3 的个人组件库。

## 安装

```bash
pnpm add @puzzle-fuzzy/ui
```

## 使用

```vue
<script setup lang="ts">
import { OButton, OSelect, type OSelectOption } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'

const options: readonly OSelectOption[] = [
  { value: 'compact', label: '紧凑' },
  { value: 'comfortable', label: '舒适' },
]
</script>

<template>
  <OButton variant="soft">保存</OButton>
  <OSelect aria-label="选择密度" :options="options" />
</template>
```

也可以只从显式组件子入口导入：

```ts
import { ODropdown, type ODropdownItem } from '@puzzle-fuzzy/ui/dropdown'
import { OAvatarDropdown } from '@puzzle-fuzzy/ui/avatar-dropdown'

const items: readonly ODropdownItem[] = [{ value: 'profile', label: '个人资料' }]
```

当前公开组件与子入口：

- `@puzzle-fuzzy/ui/avatar`
- `@puzzle-fuzzy/ui/avatar-dropdown`
- `@puzzle-fuzzy/ui/avatar-flow`
- `@puzzle-fuzzy/ui/avatar-group`
- `@puzzle-fuzzy/ui/button`
- `@puzzle-fuzzy/ui/checkbox`
- `@puzzle-fuzzy/ui/code-input`
- `@puzzle-fuzzy/ui/confirm-dialog`
- `@puzzle-fuzzy/ui/dialog`
- `@puzzle-fuzzy/ui/divider`
- `@puzzle-fuzzy/ui/dropdown`
- `@puzzle-fuzzy/ui/form-dialog`
- `@puzzle-fuzzy/ui/image`
- `@puzzle-fuzzy/ui/input`
- `@puzzle-fuzzy/ui/radio`
- `@puzzle-fuzzy/ui/reference-textarea`
- `@puzzle-fuzzy/ui/select`
- `@puzzle-fuzzy/ui/tabs`
- `@puzzle-fuzzy/ui/textarea`
- `@puzzle-fuzzy/ui/upload`

## 图标

内置图标与文档示例统一使用 `vue-icons-plus/lu`。为 Dropdown 菜单项传入自定义图标时，也只从这个入口导入；不复制 SVG，不混用第二套图标库，不增加仅转发属性的图标包装层。

```ts
import { LuSettings } from 'vue-icons-plus/lu'
import type { ODropdownItem } from '@puzzle-fuzzy/ui/dropdown'

const items: readonly ODropdownItem[] = [{ value: 'settings', label: '设置', icon: LuSettings }]
```

状态点、分割线、Tabs 指示器和 Avatar Flow 连接线属于 CSS 状态几何，不作为图标替换。组件源码与文档示例不写内联 SVG，也不混用第二套图标库。

## 表单与受控状态

- `OInput` 保留真实单行 input，并提供清除、密码可见性和前后缀能力。
- `OCheckbox`、`ORadio` 与 `ORadioGroup` 保留原生表单提交、键盘和辅助技术语义。
- `OTextarea` 支持固定 `rows`、`autosize=true` 和 `{ minRows, maxRows }` 三种高度策略，始终关闭浏览器右下角尺寸拖拽手柄。
- `OConfirmDialog` 只发出确认或取消意图；`OFormDialog` 只在原生校验通过后发出 `SubmitEvent`。两者都不会执行操作、序列化表单或自动保存。

输入组件采用受控值合同。父级拒绝或规范化更新时，真实表单控件会恢复到最新 prop，不维护第二份公开业务状态。

## 滚动与大型集合

组件库采用语义优先的混合策略：

- `OSelect` 默认在选项数达到 `virtualThreshold` 后使用 `vue-virtual-scroller`，并通过 `virtual` 与 `virtualListHeight` 控制虚拟列表。
- `OTextarea` 始终保留真实 textarea 的原生编辑滚动，避免破坏选择、输入法、剪贴板和移动端键盘。
- `OUpload` 使用受 `listMaxHeight` 约束的原生列表，使每个移除按钮都保留在键盘和读屏顺序中。
- Dropdown、Tabs、引用项和任意 Dialog slot 内容保持完整 DOM，不进行无意义的虚拟化。

滚动容器共享细滚动条视觉，但不会改变各组件的原生语义。

## 浮层挂载

`ODropdown`、`OSelect` 与 `OAvatarDropdown` 默认使用 `teleported=true` 和 `teleportTo='body'`，避免菜单被普通 overflow 容器裁剪。两项 API 保持一致：

- `teleported?: boolean`，默认 `true`；设为 `false` 时浮层保留在组件 DOM 位置。
- `teleportTo?: string | HTMLElement`，默认 `'body'`；仅在启用 Teleport 时作为挂载目标。

原生 `<dialog>` 属于浏览器 top layer。dialog 内应使用 `:teleported="false"`，或把 `teleportTo` 指向 dialog 内的目标元素，避免浮层落到 top layer 之外。

默认 Teleport 会把 trigger 的 `--omg-*` tokens、继承排版、最近的 `data-omg-theme`、`lang` 与计算后的 `dir` 同步到面板，局部主题和 RTL 无需额外配置。依赖其他自定义变量或祖先选择器时，可选择对应作用域内的目标或关闭 Teleport。SSR 下不要在 setup 顶层查询 DOM；默认字符串目标和内联模式均可安全渲染，HTMLElement 目标应在客户端挂载后取得。

## 主题

默认跟随系统主题。需要显式或局部主题时，在祖先容器设置：

```html
<section data-omg-theme="dark">
  <!-- OMG UI components -->
</section>
```

公开样式变量统一使用 `--omg-*` 前缀。
Teleported 浮层会同步 trigger 的 OMG tokens 与主题属性，具体规则见上一节。

## 组件边界

- `ODialog` 使用浏览器原生 top layer、无边框 surface 与模态焦点模型，不包含确认、请求或路由逻辑。
- `OConfirmDialog` 确认时保持受控打开状态，由使用方决定操作结果与关闭时机。
- `OFormDialog` 保留原生 form association 和约束校验，只发出原始提交事件。
- `OImage` 只负责图片展示和预览交互，预览复用 `ODialog`。
- `OReferenceTextarea` 只渲染使用方传入的通用引用项，不解析成员、图片或私有文本协议。
- `OUpload` 使用独立原生 file input 修复递归点击，并在每次选择后重置 input，使同一文件可再次选择；上传请求、校验、重试和持久化全部由使用方实现。

## 范围

- Vue `^3.5.0` 是必需 peer dependency。
- TypeScript 消费项目使用 `moduleResolution: "Bundler"`。
- 只发布 ESM，不提供 CommonJS、UMD 或框架中立入口。
- 本包使用 `UNLICENSED`，公开可安装不代表授予复制、修改或再发布权利。
