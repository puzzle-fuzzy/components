# OMG UI

OMG UI 是一个仅面向 Vue 3 的个人组件库，发布包为 `@puzzle-fuzzy/ui`。

当前提供 30 个组件族、31 个 Vue 组件：

- 基础：Button、Tag、Badge、Divider、Image、Avatar、Avatar Group。
- 表单：Input、Textarea、Checkbox、Radio、Radio Group、Switch、Code Input、Select、Upload。
- 导航：Tabs。
- 反馈：Alert、Message、Progress、Skeleton。
- 浮层：Tooltip、Dropdown、Avatar Dropdown、Drawer、Dialog、Confirm Dialog、Form Dialog。
- 个人组件：Avatar Flow、Reference Textarea、Widget。

内置图标统一来自 `vue-icons-plus/lu`。Alert、Tooltip、Skeleton 和普通浮层使用语义表面、间距或必要阴影，不叠加装饰性边框。Tooltip 只承载非交互描述，交互浮层留给未来独立的 Popover。长列表只在 Select 达到阈值后使用 `vue-virtual-scroller`；Textarea 保留原生编辑滚动，Upload 保留完整可访问的原生文件列表。组件只负责 UI、交互与受控状态，不包含请求、上传传输、验证或其他业务逻辑。

## 开发

```bash
corepack pnpm install
pnpm docs:dev
```

开发环境使用 Node.js 24 LTS 与 pnpm；组件构建、类型检查和测试由 Vite、Vue TSC 与 Vitest 负责。

## 验证

```bash
pnpm verify
```

## 工作区

- `packages/ui`：唯一发布的组件包。
- `apps/docs`：VitePress 文档与真实消费示例。

项目当前为首次发布前重构阶段，不提供旧包名、CommonJS 或 UMD 兼容入口。
