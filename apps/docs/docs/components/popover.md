<script setup>
import PopoverBasic from '../../examples/popover/Basic.vue'
import PopoverControlled from '../../examples/popover/Controlled.vue'
import PopoverPlacement from '../../examples/popover/Placement.vue'
import PopoverForm from '../../examples/popover/Form.vue'
import PopoverModal from '../../examples/popover/Modal.vue'
</script>

# Popover 弹出层

Popover 是由点击触发、允许焦点进入的轻量交互浮层。它适合操作摘要、小型表单和补充控制，不承担菜单选择语义，也不替代需要明确流程的 Dialog。

## 基础组合

<DemoBlock label="Popover basic as-child composition">
  <PopoverBasic />
</DemoBlock>

`OPopoverTrigger` 使用 `as-child` 与 `OButton` 组合，最终只生成一个 button。Root 的 default slot 提供 `open` 和 `close`，调用方可以从浮层内主动请求关闭。

## 受控状态

<DemoBlock label="Popover controlled state">
  <PopoverControlled />
</DemoBlock>

省略 `open` 时，组件使用 `defaultOpen` 初始化内部状态。传入 `open` 后，trigger、Escape 和外部交互只发出 `update:open`；父组件没有回写时，浮层不会自行改变可见状态。

## 定位、锚点与挂载方式

<DemoBlock label="Popover sides alignments anchors and mount modes">
  <PopoverPlacement />
</DemoBlock>

四个 side 与三个 align 都是首选位置。默认会根据可用空间执行碰撞规避，因此最终的 `data-side` 与 `data-align` 可能不同。`OPopoverAnchor` 可以让浮层相对 trigger 之外的元素或虚拟 reference 定位。

## 小型表单

<DemoBlock label="Popover form content">
  <PopoverForm />
</DemoBlock>

Popover 只管理打开、关闭、定位和焦点，不读取或提交表单数据。校验、保存和关闭时机由使用方组合现有表单控件完成。

## Modal 与焦点

<DemoBlock label="Popover modal focus behavior">
  <PopoverModal />
</DemoBlock>

`modal` 会限制背景交互、隔离辅助技术可见内容，并把焦点保持在浮层中。关闭后默认把焦点还给 trigger。普通补充内容优先使用非 modal 模式。

## 导入

```ts
import {
  OPopover,
  OPopoverAnchor,
  OPopoverContent,
  OPopoverTrigger,
  type OPopoverSide,
} from '@puzzle-fuzzy/ui/popover'
import '@puzzle-fuzzy/ui/styles.css'
```

组件也会从根入口导出，但独立子入口更适合只消费 Popover 的项目。

## OPopover

### Props

| 名称        | 类型      | 默认值  | 说明                       |
| ----------- | --------- | ------- | -------------------------- |
| open        | `boolean` | —       | 传入后启用受控模式         |
| defaultOpen | `boolean` | `false` | 非受控模式的初始打开状态   |
| modal       | `boolean` | `false` | 是否隔离背景交互并限制焦点 |

### Events 与 Slots

| 类型  | 名称          | 参数                                   | 说明                        |
| ----- | ------------- | -------------------------------------- | --------------------------- |
| Event | `update:open` | `(open: boolean)`                      | 请求父组件接受新的打开状态  |
| Slot  | `default`     | `{ open: boolean, close: () => void }` | compound 组件与状态操作入口 |

## OPopoverTrigger

| 名称    | 类型                  | 默认值     | 说明                                  |
| ------- | --------------------- | ---------- | ------------------------------------- |
| as      | `string \| Component` | `'button'` | 修改底层渲染元素                      |
| asChild | `boolean`             | `false`    | 把行为与属性合并到唯一 default 子节点 |

Trigger 自动提供 button type、`aria-haspopup="dialog"`、`aria-expanded`、`aria-controls` 和 `data-state`。`asChild` 的子节点必须能接收 ref、事件与 ARIA attributes。

## OPopoverAnchor

| 名称      | 类型                                    | 默认值  | 说明                           |
| --------- | --------------------------------------- | ------- | ------------------------------ |
| as        | `string \| Component`                   | `'div'` | 修改锚点元素                   |
| asChild   | `boolean`                               | `false` | 复用唯一子节点                 |
| reference | `HTMLElement \| OPopoverVirtualElement` | —       | 使用真实元素或虚拟几何作为锚点 |

虚拟 reference 至少实现 `getBoundingClientRect()`；可选 `contextElement` 用于同步局部主题、方向与语言。

## OPopoverContent

### Props

| 名称             | 类型                                              | 默认值       | 说明                       |
| ---------------- | ------------------------------------------------- | ------------ | -------------------------- |
| as               | `string \| Component`                             | `'div'`      | 修改表面元素               |
| asChild          | `boolean`                                         | `false`      | 复用唯一子节点             |
| side             | `'top' \| 'right' \| 'bottom' \| 'left'`          | `'bottom'`   | 首选方向                   |
| align            | `'start' \| 'center' \| 'end'`                    | `'center'`   | 相对锚点的首选对齐         |
| sideOffset       | `number`                                          | `8`          | 与锚点的主轴距离           |
| alignOffset      | `number`                                          | `0`          | 对齐轴偏移                 |
| avoidCollisions  | `boolean`                                         | `true`       | 是否在空间不足时翻转或位移 |
| collisionPadding | `number \| Partial<Record<OPopoverSide, number>>` | `8`          | 与碰撞边界保留的空间       |
| sticky           | `'partial' \| 'always'`                           | `'partial'`  | 对齐轴上的粘附策略         |
| hideWhenDetached | `boolean`                                         | `false`      | 锚点完全不可见时是否隐藏   |
| positionStrategy | `'absolute' \| 'fixed'`                           | `'absolute'` | 定位策略                   |
| teleported       | `boolean`                                         | `true`       | 是否 Teleport              |
| teleportTo       | `string \| HTMLElement`                           | `'body'`     | Teleport 目标              |
| forceMount       | `boolean`                                         | `false`      | 关闭时是否仍保留 DOM       |

组件不会设置固定宽度。使用方应在内容根节点上按需要定义 inline size，并保留窄视口最大宽度。

### Events

| 名称                 | 参数                                       | 说明                                     |
| -------------------- | ------------------------------------------ | ---------------------------------------- |
| `escapeKeyDown`      | `(event: KeyboardEvent)`                   | Escape 按下时触发，可 `preventDefault()` |
| `pointerDownOutside` | `(event: OPopoverPointerDownOutsideEvent)` | 指针在外部按下时触发，可阻止关闭         |
| `focusOutside`       | `(event: OPopoverFocusOutsideEvent)`       | 焦点移到外部时触发，可阻止关闭           |
| `interactOutside`    | `(event: OPopoverInteractOutsideEvent)`    | 任一外部交互时触发，可阻止关闭           |
| `openAutoFocus`      | `(event: Event)`                           | 打开时自动聚焦前触发，可覆盖默认行为     |
| `closeAutoFocus`     | `(event: Event)`                           | 关闭时归还焦点前触发，可覆盖默认行为     |

Vue 模板中的事件名称使用 kebab-case，例如 `@pointer-down-outside` 和 `@close-auto-focus`。所有可取消事件都应直接在同步监听器中调用 `preventDefault()`。

## Teleport、局部主题与原生 Dialog

默认内容挂到 `body`。组件会把 trigger 或 anchor 附近有差异的 `--omg-*`、排版、`data-omg-theme`、`lang` 与 `dir` 同步到 Teleport 包装层，局部深色主题和 RTL 不会丢失。同步会响应相关 attribute 变化，并在关闭或卸载时清理观察器。

原生 `<dialog>` 位于浏览器 top layer。Dialog 内的 Popover 应使用 `:teleported="false"`，或把 `teleportTo` 指向 Dialog 内已经挂载的节点，挂到普通 body 的内容无法越过 top layer。

SSR 默认只输出 compound 的非浮层部分。需要服务端渲染打开内容时，应使用 `defaultOpen` 和 `:teleported="false"`；浏览器元素形式的 `teleportTo` 应在客户端挂载后取得。

## 视觉与动效

Popover 使用不透明语义表面、圆角、单一阴影和零边框，不覆盖 VitePress 变量。打开和关闭只包含透明度、轻微缩放与 `3px` 方向位移；`prefers-reduced-motion: reduce` 下压缩为近乎即时的状态变化。

## 选择合适的浮层

- 简短非交互说明使用 Tooltip。
- 选项列表和命令使用 Dropdown 或 Select。
- 小型交互内容使用 Popover。
- 需要明确标题、遮罩和完整任务流程时使用 Dialog。
