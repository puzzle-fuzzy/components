<script setup>
import ButtonGroupActions from '../../examples/button-group/Actions.vue'
import ButtonGroupControls from '../../examples/button-group/Controls.vue'
</script>

# Button Group 按钮组

Button Group 家族用于把相关操作或控件组织成一个可识别的视觉组。`OButtonGroup` 负责方向与相邻几何，`OButtonGroupSeparator` 提供装饰分隔，`OButtonGroupText` 提供静态附加文字；子控件继续保有自己的状态和事件。

## 操作与方向

<DemoBlock label="Button Group actions and orientation">
  <ButtonGroupActions />
</DemoBlock>

水平与垂直方向共用同一套组件。separator 会读取最近 Button Group 的方向并自动切换几何。

## 组合控件与 RTL

<DemoBlock label="Button Group controls and RTL">
  <ButtonGroupControls />
</DemoBlock>

attached 样式只作用于直接子级中的 `OButton`、`OInput`、`OSelect`、`ODropdown` 与 `OButtonGroupText`，不会修改未知组件的内部结构。

## 导入

根入口：

```ts
import {
  OButtonGroup,
  OButtonGroupSeparator,
  OButtonGroupText,
  type OButtonGroupOrientation,
} from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

独立子入口：

```ts
import {
  OButtonGroup,
  OButtonGroupSeparator,
  OButtonGroupText,
  oButtonGroupOrientations,
  type OButtonGroupProps,
  type OButtonGroupTextProps,
} from '@puzzle-fuzzy/ui/button-group'
import '@puzzle-fuzzy/ui/styles.css'
```

## OButtonGroup Props

| 名称        | 类型                         | 默认值         | 说明                               |
| ----------- | ---------------------------- | -------------- | ---------------------------------- |
| orientation | `'horizontal' \| 'vertical'` | `'horizontal'` | 布局方向，同时提供给内部 separator |
| attached    | `boolean`                    | `true`         | 是否合并已知直接子控件的相邻圆角   |
| ariaLabel   | `string`                     | —              | 根 `role="group"` 的可访问名称     |

## OButtonGroupText Props

| 名称 | 类型              | 默认值   | 说明                       |
| ---- | ----------------- | -------- | -------------------------- |
| tag  | `'span' \| 'div'` | `'span'` | 静态附加文字使用的原生元素 |

`OButtonGroupSeparator` 没有 Props。它在组内继承方向；单独使用时回退为 horizontal，但通常应作为 `OButtonGroup` 的直接子级。

## Slots

| 组件                    | 名称      | 说明                                     |
| ----------------------- | --------- | ---------------------------------------- |
| `OButtonGroup`          | `default` | 相关按钮、输入、选择、下拉或静态文字     |
| `OButtonGroupText`      | `default` | 不可交互的前缀、后缀、计数或当前模式文字 |
| `OButtonGroupSeparator` | —         | 无 slot                                  |

## ARIA 与键盘交互

- 根节点固定使用 `role="group"`。多个同类操作相邻时应传入当前语言下清楚的 `ariaLabel`。
- separator 固定 `aria-hidden="true"`，不创建额外的 separator role 或 Tab 停靠点。
- Button Group 不实现 roving tabindex、方向键切换或选择状态；Tab、Enter、Space 与菜单键盘行为继续由每个子控件负责。
- `OButtonGroupText` 是静态内容，不应代替按钮。需要可点击操作时使用 `OButton`。
- attached 模式保留 `focus-visible` 与浮层空间，不裁切焦点环或下拉菜单。

## 主题、RTL 与 reduced motion

组件使用 OMG UI tokens，在 `data-omg-theme="dark"` 祖先中自动适配深色主题。水平 attached 圆角使用逻辑 start/end 方向，因此 RTL 会自然镜像；内容顺序仍由 DOM 与 `dir` 决定。

Button Group 不增加动画，系统 reduced-motion 设置不会改变布局或子控件行为。子控件自己的动画策略继续由对应组件负责。

## SSR 与 UI-only 边界

方向通过 Vue provide/inject 同步传递，不读取浏览器 globals，可直接 SSR。根节点和两个辅助组件都会保留使用方传入的原生属性。

这个组件家族不管理选中项、不提交表单、不打开菜单、不保存筛选、不执行批量操作，也不判断按钮是否可以合并。业务状态、事件处理与数据流全部由使用方持有。
