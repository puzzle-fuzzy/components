<script setup>
import DrawerBasic from '../../examples/drawer/Basic.vue'
import DrawerPlacement from '../../examples/drawer/Placement.vue'
import DrawerScrollable from '../../examples/drawer/Scrollable.vue'
import DrawerBehavior from '../../examples/drawer/Behavior.vue'
</script>

# Drawer 侧边面板

`ODrawer` 是基于 `ODialog` 的模态侧边面板。它复用原生 `<dialog>` 的 top layer、背景隔离、焦点循环、Esc、遮罩和页面滚动锁定，只新增逻辑方向、宽度规范化和侧边动效。

## 基础受控面板

<DemoBlock label="Drawer basic controlled panel">
  <DrawerBasic />
</DemoBlock>

Drawer 不会在内部直接改变使用方的 `open`。关闭按钮、遮罩和 Esc 都通过 `update:open` 请求变化；使用方更新 `v-model:open` 后，原生 Dialog 才真正关闭。

## 逻辑位置、尺寸与 RTL

<DemoBlock label="Drawer logical placements and sizes">
  <DrawerPlacement />
</DemoBlock>

`start` 和 `end` 是逻辑方向：在 LTR 中分别对应左、右，在 RTL 中会自动交换。数字尺寸会变成像素，非空字符串作为 CSS 长度表达式使用。窄视口中，最终宽度不会超过 `100vw`。

## 自定义区域与独立滚动

<DemoBlock label="Drawer custom slots and scrollable content">
  <DrawerScrollable />
</DemoBlock>

头部和底部保持在表面内，中间 body 是唯一滚动区。示例同时展示自定义 header/footer、长内容、Input，以及保留在 Dialog top layer 内的内联 Select。

## 关闭策略

<DemoBlock label="Drawer dismissal controls">
  <DrawerBehavior />
</DemoBlock>

`closeOnMask`、`closeOnEsc` 和 `showClose` 可以独立调整。当三者都不提供关闭路径时，必须在面板内保留一个可键盘操作的显式关闭按钮，避免将用户困在模态层中。

## 导入

根入口：

```ts
import { ODrawer } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

独立子入口：

```ts
import { ODrawer } from '@puzzle-fuzzy/ui/drawer'
import '@puzzle-fuzzy/ui/styles.css'
```

## Props

| 名称           | 类型               | 默认值           | 说明                     |
| -------------- | ------------------ | ---------------- | ------------------------ |
| open           | `boolean`          | `false`          | 受控打开状态             |
| placement      | `'start' \| 'end'` | `'end'`          | 逻辑停靠方向             |
| size           | `string \| number` | `400`            | 内联宽度；数字视为像素   |
| title          | `string`           | —                | 默认头部标题             |
| description    | `string`           | —                | 默认头部描述             |
| closeOnMask    | `boolean`          | `true`           | 点击遮罩时是否请求关闭   |
| closeOnEsc     | `boolean`          | `true`           | 按下 Esc 时是否请求关闭  |
| showClose      | `boolean`          | `true`           | 是否显示默认关闭按钮     |
| closeAriaLabel | `string`           | `'Close drawer'` | 关闭按钮的可访问名称     |
| ariaLabel      | `string`           | —                | 覆盖标题生成的可访问名称 |

### size 规范化

```ts
normalizeODrawerSize(480) // '480px'
normalizeODrawerSize(480.9) // '480px'
normalizeODrawerSize('min(90vw, 36rem)') // 'min(90vw, 36rem)'
normalizeODrawerSize(0) // '400px'
normalizeODrawerSize('   ') // '400px'
```

数字只接受正有限值。非法数字、空字符串和纯空白字符串都回退到 `400px`。字符串应当是带单位的有效 CSS 长度或长度表达式。

## Events

| 名称          | 参数              | 说明                                               |
| ------------- | ----------------- | -------------------------------------------------- |
| `update:open` | `(open: boolean)` | 遮罩、Esc、默认关闭按钮或原生 close 请求更新时发出 |
| `close`       | —                 | 请求关闭时发出；不代表使用方已接受                 |

## Slots

| 名称      | 说明                     |
| --------- | ------------------------ |
| `header`  | 替换默认标题和描述区     |
| `default` | 面板主体，是唯一可滚动区 |
| `footer`  | 固定在表面底部的操作区   |

传入的 `class`、`style`、`data-*` 和其他非 prop attributes 会合并到底层原生 `<dialog>`。使用自定义 header 但没有可见标题时，应通过 `ariaLabel` 补充明确名称。

## 原生模态与焦点

- Drawer 使用 `showModal()` 进入浏览器 top layer，不通过普通 fixed div 模拟模态层。
- 打开后背景内容不可交互，Tab 和 Shift+Tab 保持在面板内。
- 关闭后由浏览器把焦点还给原来的触发器。
- 任意 Drawer 打开时，页面根滚动被锁定；Drawer body 使用独立滚动和 overscroll containment。

## Select、Dropdown 与 top layer

挂到 `body` 的普通浮层无法显示在原生 Dialog top layer 之上。在 Drawer 中使用 Select 或 Dropdown 时，可以保留内联渲染：

```vue
<ODrawer v-model:open="open" title="设置">
  <OSelect
    v-model="selected"
    aria-label="抽屉内选择器"
    :options="options"
    :teleported="false"
  />
</ODrawer>
```

如果必须使用 Teleport，`teleportTo` 应指向 Drawer 内已挂载的稳定节点。不要把 Drawer 内的菜单挂到普通 body 节点。

## 几何、表面与动效

- Drawer 占满动态视口高度，只保留靠内侧的两个圆角；贴近视口边缘的两个角保持齐平。
- 表面完全无边框，使用实心语义表面、原生 backdrop 和指向内侧的阴影表达层级。
- 打开约 `260ms`，从当前逻辑边缘平移进入；关闭更快，并反向回到同一边缘。
- 动效只修改 transform 和 opacity。宽度、高度、inset、margin 和阴影不参与动画。
- `prefers-reduced-motion: reduce` 下移除 Drawer 和 backdrop 过渡，但不改变打开、关闭和焦点行为。

## 非目标

- 不支持 top 或 bottom placement。
- 不内置表单提交、确认、脏数据拦截、路由或请求逻辑。
- 不复制 Dialog 的焦点捕获、Esc、遮罩或滚动锁定实现。
