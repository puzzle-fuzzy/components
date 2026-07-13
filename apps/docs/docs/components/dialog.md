<script setup>
import DialogBasic from '../../examples/dialog/Basic.vue'
import DialogSizes from '../../examples/dialog/Sizes.vue'
import DialogCustom from '../../examples/dialog/Custom.vue'
import DialogContent from '../../examples/dialog/Content.vue'
import DialogBehavior from '../../examples/dialog/Behavior.vue'
</script>

# Dialog 对话框

`ODialog` 是基于原生 `<dialog>` 的受控模态表面。浏览器负责 top layer、背景隔离、焦点约束与触发器焦点恢复；组件补充明确的关闭原因、进入/离开阶段、内容挂载策略和一致的无边框视觉。它只管理 UI 状态，不提交表单、不确认操作，也不绑定任何业务流程。

## 基础受控状态与生命周期

<DemoBlock label="Dialog controlled lifecycle">
  <DialogBasic />
</DemoBlock>

使用 `v-model:open` 接受组件发出的关闭意图。关闭按钮、完整的遮罩手势、Esc 和 slot `close()` 都会先发出 `request-close` 与 `update:open(false)`；只有使用方真的把 `open` 更新为 `false`，Dialog 才进入离场阶段。

## 宽度与全屏

<DemoBlock label="Dialog widths and fullscreen surfaces">
  <DialogSizes />
</DemoBlock>

数字宽度会向下取整并转换为像素；非空字符串可直接使用 CSS 长度或函数表达式。Dialog 始终保留窄视口安全留白，`fullscreen` 则具有更高优先级，会忽略 `width` 并占满动态视口。

## 自定义结构与初始焦点

<DemoBlock label="Dialog custom slots and initial focus">
  <DialogCustom />
</DemoBlock>

`title` 与 `description` slot 自动获得组件生成的语义容器。完整替换 `header` 时，需要把 slot 提供的 `titleId` 赋给自己的可见标题；没有可见标题时，必须提供 `ariaLabel`。

## 长内容与挂载策略

<DemoBlock label="Dialog scrolling and content mounting">
  <DialogContent />
</DemoBlock>

Header 和 footer 固定在 Dialog 表面内，只有 body 独立滚动。内容首次打开时才挂载；默认关闭后保留内部 UI 状态，`destroyOnClose` 会等离场完成后再卸载内容。

## 关闭策略、暗色与 RTL

<DemoBlock label="Dialog close policies, dark theme, and RTL">
  <DialogBehavior />
</DemoBlock>

遮罩、Esc 与默认关闭按钮可以独立关闭。若三条路径都停用，内容中必须保留一个可键盘操作的显式关闭入口。受控状态也可以拒绝关闭：收到 `update:open(false)` 后继续保持 `open=true` 即可。

## 导入

根入口：

```ts
import {
  ODialog,
  type ODialogCloseReason,
  type ODialogCloseRequest,
  type ODialogSlotProps,
} from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

独立子入口：

```ts
import {
  ODialog,
  type ODialogCloseReason,
  type ODialogCloseRequest,
  type ODialogSlotProps,
} from '@puzzle-fuzzy/ui/dialog'
import '@puzzle-fuzzy/ui/styles.css'
```

## 通用 Props

Dialog、ConfirmDialog、FormDialog 和 Drawer 共享以下模态属性：

| 名称           | 类型      | 默认值           | 说明                                |
| -------------- | --------- | ---------------- | ----------------------------------- |
| open           | `boolean` | `false`          | 受控打开状态                        |
| title          | `string`  | —                | 默认可见标题和 accessible name 来源 |
| description    | `string`  | —                | 默认描述文本                        |
| closeOnMask    | `boolean` | `true`           | 完整遮罩点击手势是否请求关闭        |
| closeOnEsc     | `boolean` | `true`           | Esc 是否请求关闭                    |
| showClose      | `boolean` | `true`           | 是否显示默认关闭按钮                |
| closeAriaLabel | `string`  | `'Close dialog'` | 默认关闭按钮的可访问名称            |
| ariaLabel      | `string`  | —                | 直接设置 Dialog 的 accessible name  |

## Dialog Props

| 名称           | 类型               | 默认值  | 说明                                       |
| -------------- | ------------------ | ------- | ------------------------------------------ |
| width          | `string \| number` | `520`   | 表面宽度；正数转为整数像素，字符串原样使用 |
| fullscreen     | `boolean`          | `false` | 占满动态视口，并覆盖 `width`               |
| destroyOnClose | `boolean`          | `false` | 离场完成后是否卸载内部内容                 |
| initialFocus   | `string`           | —       | 打开后在 Dialog 内查询的 CSS selector      |

### width 规范化

```ts
normalizeODialogWidth(420.9) // '420px'
normalizeODialogWidth('min(92vw, 44rem)') // 'min(92vw, 44rem)'
normalizeODialogWidth(0) // '520px'
normalizeODialogWidth(Number.NaN) // '520px'
normalizeODialogWidth('   ') // '520px'
```

数字只接受正有限值；非法数字和空白字符串回退到 `520px`。字符串应当是有效的 CSS 长度或长度表达式。无论传入什么宽度，普通 Dialog 都不会突破视口留白；`fullscreen` 会直接使用 `100vw × 100dvh`。

## Events

| 名称            | 参数                             | 说明                                       |
| --------------- | -------------------------------- | ------------------------------------------ |
| `update:open`   | `(open: boolean)`                | 请求使用方更新受控状态                     |
| `request-close` | `(request: ODialogCloseRequest)` | 用户或原生关闭意图；可通过保持 open 来拒绝 |
| `open`          | —                                | 原生 `showModal()` 后、入场开始时发出      |
| `opened`        | —                                | 入场动效完成时发出                         |
| `close`         | `(reason: ODialogCloseReason)`   | 使用方接受关闭、离场开始时发出             |
| `closed`        | `(reason: ODialogCloseReason)`   | 原生 Dialog 关闭且离场清理完成时发出       |

关闭原因：

```ts
type ODialogCloseReason = 'close-button' | 'mask' | 'escape' | 'slot' | 'native' | 'programmatic'

interface ODialogCloseRequest {
  readonly reason: Exclude<ODialogCloseReason, 'programmatic'>
  readonly originalEvent?: Event
}
```

用户关闭的完整顺序是 `request-close` → `update:open(false)` → `close(reason)` → `closed(reason)`。前两个事件表达意图；后两个只在使用方接受关闭后发生。使用方直接把 `open` 改成 `false` 时，不产生请求事件，离场原因是 `programmatic`。打开顺序是 `open` → `opened`。

## Slots

| 名称          | Slot props         | 说明                                      |
| ------------- | ------------------ | ----------------------------------------- |
| `header`      | `ODialogSlotProps` | 完整替换默认头部                          |
| `title`       | `ODialogSlotProps` | 替换标题内容，保留组件生成的标题容器与 ID |
| `description` | `ODialogSlotProps` | 替换描述内容，保留组件生成的描述容器与 ID |
| `default`     | `ODialogSlotProps` | Dialog 主体                               |
| `footer`      | `ODialogSlotProps` | 固定在底部的操作区                        |
| `closeIcon`   | —                  | 替换默认 `vue-icons-plus` 关闭图标        |

```ts
interface ODialogSlotProps {
  readonly close: () => void
  readonly titleId: string
  readonly descriptionId: string
}
```

`close()` 只发出关闭意图，原因是 `slot`，不会绕过受控状态。完整 `header` slot 不会自动创建标题节点；应把 `titleId` 应用到可见标题。开发环境会对缺少 accessible name 的 Dialog 给出警告。

## 焦点与原生 top layer

- 打开时先使用 `showModal()` 进入浏览器 top layer，再处理初始焦点。
- `initialFocus` 只在当前 Dialog 内查询；无效 selector、未匹配或匹配到外部节点都会回退。
- 没有有效 `initialFocus` 时优先聚焦 `[autofocus]`，否则沿用原生 Dialog 的聚焦规则。
- Tab 与 Shift+Tab 由浏览器约束在模态层内，关闭后焦点由浏览器返回原触发器。
- 组件不复制手写 focus trap，也不把普通 fixed 元素伪装成模态层。

## 关闭请求与遮罩手势

遮罩关闭要求 pointerdown 和 pointerup 都发生在表面外部；从内容区按下再拖到遮罩，或从遮罩按下再拖到内容区，都不会误触关闭。Esc 会拦截原生 `cancel`，并根据 `closeOnEsc` 决定是否请求关闭。

如需拒绝请求，不要在 `request-close` 中重新打开 Dialog，只需控制 `update:open`：

```vue
<ODialog
  :open="open"
  @update:open="
    (nextOpen) => {
      if (nextOpen || canClose) open = nextOpen
    }
  "
/>
```

如果请求被拒绝，Dialog 保持打开，不触发 `close` 或 `closed`。之后的关闭操作仍可再次发出请求。

## 内容挂载与 SSR

- 关闭状态下首次渲染只输出 `<dialog>` 外壳，内部内容在第一次打开时懒挂载。
- 默认关闭后保留内部组件实例和 UI 状态，再次打开不会重新创建。
- `destroyOnClose` 在离场和 `closed` 清理阶段完成后卸载内容，避免截断离场画面。
- 包导入与服务端渲染不要求 DOM globals。SSR 时若 `open=false`，输出稳定的关闭外壳；若 `open=true`，输出内容并在客户端挂载后进入原生模态状态。

## Select、Dropdown 与 top layer

普通 Teleport 到 `body` 的菜单无法越过已打开的原生 Dialog top layer。在 Dialog 内使用 Select 或 Dropdown 时，优先保留内联渲染：

```vue
<ODialog v-model:open="open" title="显示设置">
  <OSelect
    v-model="value"
    aria-label="显示密度"
    :options="options"
    :teleported="false"
  />
</ODialog>
```

必须 Teleport 时，目标应是 Dialog 内已经挂载的稳定节点，不要把菜单挂到普通 body 容器。

## 几何与动效

- 表面没有装饰性边框；背景、圆角和语义阴影建立层级。
- body 是唯一滚动区，header 与 footer 保持可见；窄视口 footer 会换行并扩大操作按钮。
- 入场使用轻微上移和缩放复位，离场更快；backdrop 独立淡入淡出。
- 离场期间原生 `<dialog>` 保持打开，动画完成后才调用 `close()`，避免 top layer 提前消失。
- `prefers-reduced-motion: reduce` 下移除表面、backdrop 和关闭按钮过渡，不改变事件、焦点与卸载时序。

## 如何选择

- `ODialog`：阅读内容、自定义短流程、需要完全掌控 header/body/footer 的通用模态层。
- `OConfirmDialog`：明确的取消/确认二选一，支持普通或危险确认语气。
- `OFormDialog`：原生 form 语义、校验和 submit 意图。
- `ODrawer`：从逻辑起始侧或结束侧进入的长面板。
- `OImage`：继续使用独立的 Teleport 预览层，不依赖 Dialog。

## 非目标

- 不内置保存、删除、提交、请求、路由拦截或脏数据判断。
- 不提供 Promise 式确认服务，也不替使用方接受关闭。
- 不提供嵌套 Dialog 调度；同时打开多个模态层时，层级与流程由使用方组织。
- 不把 Image 预览、Select 菜单或 Dropdown 菜单聚合进 Dialog 实现。
