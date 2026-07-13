<script setup>
import TooltipBasic from '../../examples/tooltip/Basic.vue'
import TooltipBehavior from '../../examples/tooltip/Behavior.vue'
</script>

# Tooltip 文字提示

`OTooltip` 为一个现有控件补充简短、非交互的说明。它克隆 default slot 的单一 trigger，不增加布局 wrapper，也不会移动焦点或在提示层中承载按钮、链接、输入框与菜单。

## 方向与图标按钮说明

<DemoBlock label="Tooltip placements and icon-button help">
  <TooltipBasic />
</DemoBlock>

十二种 placement 都是首选位置。Floating UI 会在视口空间不足时 flip / shift，因此最终位置可能变化。提示表面最多 `240px`，长文字会自然换行。

## 受控状态、延时与局部主题

<DemoBlock label="Tooltip controlled timing dark and compact behavior">
  <TooltipBehavior />
</DemoBlock>

省略 `open` 时组件内部维护可见状态；传入 `open` 后，所有悬停、焦点、离开和 Escape 只通过 `update:open` 请求使用方更新。受控使用方可以接受或拒绝请求，不会出现第二份公开状态。

## 导入

根入口：

```ts
import { OTooltip, type OTooltipPlacement } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

独立子入口：

```ts
import { OTooltip, oTooltipPlacements, type OTooltipProps } from '@puzzle-fuzzy/ui/tooltip'
import '@puzzle-fuzzy/ui/styles.css'
```

## Props

| 名称       | 类型                                                                                                                                                                 | 默认值   | 说明                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------- |
| content    | `string`                                                                                                                                                             | —        | 默认提示文字；会被 content slot 替换  |
| open       | `boolean`                                                                                                                                                            | —        | 传入后启用受控开关模式                |
| disabled   | `boolean`                                                                                                                                                            | `false`  | 清理计时器并请求关闭提示              |
| placement  | `'top' \| 'top-start' \| 'top-end' \| 'right' \| 'right-start' \| 'right-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end' \| 'left' \| 'left-start' \| 'left-end'` | `'top'`  | 首选位置，可自动 flip / shift         |
| showDelay  | `number`                                                                                                                                                             | `400`    | 指针进入后显示的毫秒数                |
| hideDelay  | `number`                                                                                                                                                             | `100`    | 指针离开或失焦后隐藏的毫秒数          |
| offset     | `number`                                                                                                                                                             | `8`      | trigger 与提示表面的像素间距          |
| teleported | `boolean`                                                                                                                                                            | `true`   | 是否 Teleport 到指定目标              |
| teleportTo | `string \| HTMLElement`                                                                                                                                              | `'body'` | Teleport 目标；仅在 teleported 时生效 |

`showDelay`、`hideDelay` 和 `offset` 会归一为非负整数。非有限延时回退到对应默认值，非有限 offset 回退到 `8`。

## Events 与 Slots

| 类型  | 名称          | 参数              | 说明                                         |
| ----- | ------------- | ----------------- | -------------------------------------------- |
| Event | `update:open` | `(open: boolean)` | 请求显示或隐藏；受控模式由使用方决定是否接受 |
| Slot  | `default`     | —                 | 必填的单一 trigger 根节点                    |
| Slot  | `content`     | —                 | 替换 `content` 的非交互说明                  |

default slot 应提供一个可接收 ref 与事件的单一 meaningful root，例如 `OButton`、原生 button 或 span。开发环境遇到空 slot、纯文本或多个根节点时会警告，并只使用第一个可用根节点。

## 指针与键盘行为

| 输入          | 行为                                                 |
| ------------- | ---------------------------------------------------- |
| Pointer enter | 等待 `showDelay` 后请求打开                          |
| Pointer leave | trigger 未保持焦点时，等待 `hideDelay` 后请求关闭    |
| Focus in      | 立即请求打开，不等待悬停延时                         |
| Focus out     | 指针也不在 trigger 上时，等待 `hideDelay` 后请求关闭 |
| Escape        | 立即请求关闭，并阻止该次 Escape 继续触发提示层行为   |
| Click         | 不单独切换 Tooltip；trigger 保留自己的原生点击语义   |

延时回调使用 generation guard。新的进入、离开、disabled 或卸载会使旧计时器失效，不会发生过期计时器重新打开提示。

## ARIA、内容边界与 Popover

- 可见提示使用 `role="tooltip"` 和稳定 ID；只有实际可见时，trigger 才合并对应 `aria-describedby`。
- Tooltip 不移动焦点，表面使用 `pointer-events: none`，content 不得包含可交互控件。
- 图标按钮仍需要自身的 `aria-label`；Tooltip 是补充说明，不是按钮可访问名称的唯一来源。
- 需要点击打开、焦点进入浮层、操作按钮、表单或菜单时，应使用 Dropdown、Dialog，或等待独立的 Popover，而不是把 Tooltip 变成交互容器。

## Teleport、主题与 Dialog

默认 Teleport 会镜像 trigger 附近的 `--omg-*` 覆盖、继承排版、`data-omg-theme`、`lang` 与 `dir`，并使用固定定位保持在视口内。普通裁剪容器通常无需关闭 Teleport。

原生 `<dialog>` 位于 top layer。Dialog 内的 Tooltip 应使用 `:teleported="false"`，或把 `teleportTo` 指向 Dialog 内的已挂载元素；body 上的浮层无法越过原生 top layer。

## 视觉、SSR 与非目标

提示使用不透明反色表面、一层小阴影和零外边框。入场只淡入并沿当前 placement 平移 `2px`，不缩放；`prefers-reduced-motion: reduce` 下移除过渡与位移。

默认未受控 Tooltip 在 SSR 时只渲染 trigger。组件 setup 不读取 DOM globals；HTMLElement 类型的 `teleportTo` 应在客户端挂载后取得，服务端优先传 selector 或关闭 Teleport。

`OTooltip` 不提供全局 Provider、富交互内容、点击开关、导览系统或业务帮助内容加载。
