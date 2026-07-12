# OMG UI 视觉状态与间距精修设计

## 背景与目标

本次调整聚焦纯 UI 表达，不在组件中引入传输成功、失败、请求或其他业务流程逻辑。

目标：

1. 将 `OCodeInput` 从正方形改为轻微纵向矩形，并使用边框变化表达焦点。
2. 将 `OAvatarFlow` 从五个业务阶段重置为三个纯视觉状态。
3. 为 `OAvatarGroup` 增加可直接配置的头像重叠距离。
4. 同步更新类型导出、测试、文档、SSR 与真实包消费验证。

不保留旧 `OAvatarFlow` 状态或属性兼容层。项目尚未发布，本次直接收紧公开 API。

## 方案选择

### Avatar Flow

不再把旧的五个 `phase` 映射到三种视觉，也不开放任意连接器 slot。采用三个明确的 UI 状态，既删除业务词汇，也避免消费者重复实现动画。

### Avatar Group

采用 `overlap` prop，并保留 CSS 变量作为默认值与主题入口。相比固定预设，数字和 CSS 长度字符串能覆盖个人项目中的常见头像尺寸。

### Code Input

尺寸使用宽、高两个独立变量。焦点只改变边框，不使用 outline、box-shadow 或额外光晕。

## OAvatarFlow

### 公开 API

删除：

```ts
type OAvatarFlowPhase = 'idle' | 'requesting' | 'transferring' | 'complete' | 'error'

phase: OAvatarFlowPhase
accessibleLabel: string
```

新增：

```ts
export const oAvatarFlowStates = ['loading', 'connected', 'transferring'] as const

export type OAvatarFlowState = (typeof oAvatarFlowStates)[number]

interface OAvatarFlowProps {
  state?: OAvatarFlowState // 默认 connected
  ariaLabel: string
}
```

根节点从 `data-phase` 改为 `data-state`。删除 `oAvatarFlowPhases`、`OAvatarFlowPhase`、live status DOM、`role="status"`、`aria-live` 与 `aria-atomic`。根节点使用 `role="img"` 和必填的 `aria-label`，内部头像与连接器仍为装饰性组合，避免读屏重复输出。

### 三种视觉状态

`loading`：

- 渲染三个实心圆点。
- 三个圆点共享一个 keyframe，通过负延迟或递增延迟形成连续节奏。
- 动画同时轻微上移与改变透明度，不改变布局尺寸。

`connected`：

- 渲染一条静态实线。
- 不使用动画。

`transferring`：

- 使用 `repeating-linear-gradient(to right, ...)` 生成虚线。
- 通过正向变化 `background-position-x` 让图案持续从左向右移动。
- 使用线性、无限循环动画，不改变元素几何尺寸。

组件只负责视觉状态。状态如何映射到网络、文件、邀请或其他业务，由消费者决定。

### 动效可访问性

在 `prefers-reduced-motion: reduce` 下：

- 圆点和虚线动画停止。
- `loading` 仍显示三个圆点。
- `connected` 仍显示实线。
- `transferring` 仍显示虚线。

三种状态不依赖动画才能被区分。

## OCodeInput

### 尺寸

| size | 宽度 | 高度 |
| ---- | ---- | ---- |
| sm   | 32px | 40px |
| md   | 40px | 48px |
| lg   | 48px | 56px |

CSS 使用：

```css
--omg-code-input-width
--omg-code-input-height
```

字段继续使用 `border-box`、可收缩 flex basis 与 `min-inline-size: 0`，保证六个输入框在窄容器中可以收缩。

### 焦点与错误状态

- 默认使用 1px `--omg-color-border` 边框。
- 聚焦时使用 2px `--omg-color-brand` 边框。
- 显式设置 `outline: none`，不生成 outline 或 box-shadow。
- `invalid` 使用 `--omg-color-danger`；invalid + focus 仍保持危险色。
- 边框变化发生在固定外部尺寸内，不改变相邻输入框布局。

输入、粘贴、退格、方向键、`complete` 和 `focus(index?)` 行为保持不变。

## OAvatarGroup

### 公开 API

新增：

```ts
interface OAvatarGroupProps {
  overlap?: number | string
}
```

规则：

- 未传时不生成内联覆盖，继续使用 `--omg-avatar-group-overlap`，最终回退到 `--omg-space-2`。
- 有限数字转换为非负 px；例如 `12` 变为 `12px`。
- 负数收敛为 `0px`。
- 非有限数字不生成内联覆盖。
- 去除首尾空白后的非空字符串作为 CSS 长度使用；空字符串不生成覆盖。
- `0` 或 `'0'` 表示头像相接但不重叠。

组件通过根节点的 `--omg-avatar-group-overlap` 内联变量应用值。正向使用负 `margin-inline-start`，反向使用负 `margin-inline-end`。`OAvatarFlow` 不复制重叠计算，继续复用 `OAvatarGroup`。

## 类型、文档与包合同

- 根入口与 `@puzzle-fuzzy/ui/avatar-flow` 导出 `oAvatarFlowStates`、`OAvatarFlowState`，删除旧 phase 导出。
- `OAvatarGroupProps` 和文档增加 `overlap`。
- Flow 文档与示例改用 `state`、`aria-label` 和三个视觉状态。
- Code Input 文档明确尺寸与边框焦点行为。
- 临时 Vue/Vite 消费项目使用新 API，确保 tarball 类型声明与 ESM 子路径可用。

## 测试

### 单元测试

- Flow 只接受三个 state，默认 `connected`。
- `loading` 恰好三个圆点并具有错开的动画。
- `connected` 只渲染实线。
- `transferring` 只渲染移动虚线。
- Flow 不再包含 live region 或旧 phase 导出。
- Code Input 三个尺寸拥有独立宽高变量，焦点样式不存在非 `none` 的 outline 或 box-shadow。
- Code Input focus、invalid、invalid + focus 的边框颜色优先级正确。
- Avatar Group 对数字、负数、非有限值、字符串、空字符串的 overlap 归一化正确。
- 正向与反向头像组使用相同 overlap 值。

### 浏览器与质量门禁

- Playwright 验证 loading 圆点与 transferring 虚线的动画名称不为 `none`。
- reduced-motion 环境下两种动画名称为 `none`。
- connected 连接器保持静态实线。
- 继续运行 `pnpm verify`，覆盖格式、lint、类型、覆盖率、SSR、构建、publint、ATTW、真实消费者、VitePress 和 axe。

## 非目标

- 不判断网络、传输、请求、完成或失败。
- 不添加 Flow 事件、计时器、自动状态切换或业务文案。
- 不为 Avatar Group 添加预设间距枚举。
- 不改变 Code Input 的数据模型与键盘交互。
