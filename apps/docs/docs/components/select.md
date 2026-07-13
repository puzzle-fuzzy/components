<script setup>
import SelectBasic from '../../examples/select/Basic.vue'
</script>

# Select 选择器

`OSelect` 是一个非可编辑的单选控件，提供清晰的选中状态、可选清除、浮层定位和完整键盘导航。大型选项集合会按阈值使用 `vue-virtual-scroller`，小型集合仍保留直接渲染路径。

默认 `soft` 外观采用浅色表面和透明的 1px 预留边界，focus / 打开时才显示品牌边界与 brand-soft 焦点层；`outline` 适合需要常显边界的场景。触发器右侧始终只保留一个 32px 尾部轨道：有已选值时，桌面端 hover / focus 会用 24px 清除动作替换箭头而不移动文字，粗指针环境则提供真实 44px 命中区域。

## 基础用法

<DemoBlock label="Select single choice interactions">
  <SelectBasic />
</DemoBlock>

## 导入

从包根入口导入：

```ts
import { OSelect, type OSelectOption, type OSelectValue } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

也可以使用独立子入口：

```ts
import { OSelect, type OSelectOption, type OSelectValue } from '@puzzle-fuzzy/ui/select'
import '@puzzle-fuzzy/ui/styles.css'
```

## Options

```ts
type OSelectValue = string | number

interface OSelectOption {
  readonly value: OSelectValue
  readonly label: string
  readonly disabled?: boolean
}
```

值使用稳定的 `string | number`，组件不会把 label 反向解析成值，也不会修改 options。

## Props

| 名称              | 类型                             | 默认值              | 说明                                  |
| ----------------- | -------------------------------- | ------------------- | ------------------------------------- |
| modelValue        | `string \| number \| undefined`  | `undefined`         | 当前单选值                            |
| options           | `readonly OSelectOption[]`       | 必填                | 可选项                                |
| open              | `boolean`                        | `undefined`         | 传入后进入受控开关模式                |
| placeholder       | `string`                         | `'Select'`          | 未选择时显示的文字                    |
| size              | `'sm' \| 'md' \| 'lg'`           | `'md'`              | 控件尺寸                              |
| variant           | `'soft' \| 'outline'`            | `'soft'`            | 浅色无边框默认态或常显边界            |
| disabled          | `boolean`                        | `false`             | 禁用整个控件                          |
| clearable         | `boolean`                        | `false`             | 有选中值时显示独立清除按钮            |
| clearAriaLabel    | `string`                         | `'Clear selection'` | 清除按钮的可访问名称                  |
| placement         | `'bottom-start' \| 'bottom-end'` | `'bottom-start'`    | 首选浮层位置，空间不足时会自动翻转    |
| ariaLabel         | `string`                         | —                   | combobox trigger 的可访问名称         |
| teleported        | `boolean`                        | `true`              | 是否把 listbox Teleport 到指定目标    |
| teleportTo        | `string \| HTMLElement`          | `'body'`            | Teleport 目标；仅在 teleported 时生效 |
| virtual           | `boolean`                        | `true`              | 大型集合达到阈值后启用虚拟滚动        |
| virtualThreshold  | `number`                         | `100`               | 启用虚拟滚动的最小选项数量            |
| virtualListHeight | `number`                         | `288`               | 虚拟列表视口高度，单位为像素          |

为没有可见 label 的 Select 提供本地化 `ariaLabel`。清除按钮是 trigger 的相邻按钮，不会产生嵌套 button。Select 没有 `readonly` 或 `invalid` 业务状态；不可交互使用 `disabled`，校验消息与错误呈现由表单组合层负责。

## Events

| 名称                | 参数                                           | 说明                   |
| ------------------- | ---------------------------------------------- | ---------------------- |
| `update:modelValue` | `(value: OSelectValue \| undefined)`           | 选择或清除时请求更新值 |
| `update:open`       | `(value: boolean)`                             | 请求打开或关闭浮层     |
| `change`            | `(value: OSelectValue, option: OSelectOption)` | 选择可用 option 后发出 |
| `clear`             | —                                              | 点击清除按钮后发出     |

清除会发出 `update:modelValue(undefined)` 和 `clear`，不会同时发出伪造的 `change`。

## Slots

| 名称     | Slot props                                                      | 说明                     |
| -------- | --------------------------------------------------------------- | ------------------------ |
| `option` | `{ option: OSelectOption, selected: boolean, active: boolean }` | 自定义 option 的文字区域 |
| `empty`  | —                                                               | options 为空时的内容     |

`empty` 未提供时显示 `No options`。选中勾选、下拉指示和清除图标均来自 `vue-icons-plus/lu`，无需在 slot 中复制 SVG。

## 受控值与 open

`modelValue` 始终由 `v-model` 控制。省略 `open` 时，浮层开关状态由组件内部维护：

```vue
<OSelect v-model="selected" aria-label="选择选项" :options="options" />
```

需要协调多个浮层时，再使用受控 `v-model:open`：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { OSelectValue } from '@puzzle-fuzzy/ui/select'

const selected = ref<OSelectValue>()
const open = ref(false)
</script>

<template>
  <OSelect v-model="selected" v-model:open="open" aria-label="选择选项" :options="options" />
</template>
```

受控 open 模式下，使用方必须响应 `update:open`；组件不会绕过绑定值维护第二份公开状态。

## 浮层挂载、dialog 与局部上下文

Select 默认把 listbox Teleport 到 `body`，以避免普通容器裁剪。原生 dialog 是浏览器 top layer；其内部 Select 应使用内联浮层，或把目标放在 dialog 内：

```vue
<dialog open>
  <OSelect
    v-model="selected"
    aria-label="Dialog option"
    :options="options"
    :teleported="false"
  />
</dialog>
```

默认 Teleport 会把 trigger 的 `--omg-*` tokens、继承排版、最近的 `data-omg-theme`、`lang` 与计算后的 `dir` 同步到 listbox。因此局部深色和 RTL 场景通常不需要修改挂载方式，`bottom-start` / `bottom-end` 会按同步后的方向解释。

`teleported=false` 时 listbox 保留在组件 DOM 位置。若页面依赖非 `--omg-*` 自定义变量、祖先选择器或其他未镜像的局部样式，也可以关闭 Teleport，或把 `teleportTo` 指向对应作用域内的 selector / HTMLElement。注意内联模式可能重新受到特殊 containing block 或裁剪上下文影响。

```vue
<section class="product-field-scope" data-omg-theme="dark" dir="rtl">
  <OSelect
    v-model="selected"
    aria-label="选择选项"
    :options="options"
    :teleported="false"
  />
</section>
```

SSR setup 不需要 `window`、`document` 或 HTMLElement 构造函数。默认 `'body'` 和 selector 字符串可直接用于 SSR；HTMLElement 目标应在客户端挂载后取得，不能在服务端模块或 setup 顶层查询 DOM。

## 键盘行为

| 按键                    | 行为                                                 |
| ----------------------- | ---------------------------------------------------- |
| `ArrowDown` / `ArrowUp` | 打开浮层并移动 active option，循环且跳过 disabled 项 |
| `Home` / `End`          | 打开时移动到第一个或最后一个可用 option              |
| `Enter` / `Space`       | 关闭时打开；打开时选择 active option                 |
| `Escape`                | 关闭浮层并保持 trigger 焦点                          |
| `Tab`                   | 不阻止默认导航，同时关闭浮层                         |

指针悬停只更新 active option；点击可用项后选择、关闭，并把焦点留在 combobox trigger。

## ARIA 与焦点

- trigger 是原生 button，并使用 `role="combobox"`、`aria-haspopup="listbox"`、`aria-expanded` 和打开时的 `aria-controls`。
- 浮层使用 `role="listbox"`，每项使用 `role="option"`、`aria-selected`，禁用项还提供 `aria-disabled`。
- 虚拟列表只挂载可见窗口；每个已渲染 option 通过 `aria-setsize` 与 `aria-posinset` 描述完整集合。
- DOM 焦点始终留在 combobox trigger；`aria-activedescendant` 指向当前 active option。
- Select 浮层匹配 trigger 宽度，并通过 flip、shift 和可用高度限制保持在视口内。
- `prefers-reduced-motion: reduce` 下移除浮层和指示图标过渡。

## 图标规则

组件内置的 `LuChevronDown`、`LuCheck` 和 `LuX` 均来自 [`vue-icons-plus/lu`](https://github.com/vue-icons-plus/vue-icons-plus)。Select v1 不接收 option 图标；需要更丰富的内容时使用 `option` slot，但仍应只从同一入口导入图标。

## 非目标

- v1 不提供可编辑输入、搜索过滤、多选或分组。
- 不加载远程 options，不处理分页、缓存、校验或表单提交。
- 不根据业务状态重写 option；禁用与可见性由使用方在传入前决定。
