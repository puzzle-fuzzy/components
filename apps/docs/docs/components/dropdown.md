<script setup>
import DropdownBasic from '../../examples/dropdown/Basic.vue'
</script>

# Dropdown 下拉菜单

`ODropdown` 在点击触发器后显示一组操作。它只负责菜单的视觉、定位与标准键盘交互，操作对应的业务含义由使用方处理。

## 基础用法

<DemoBlock label="Dropdown menu interactions">
  <DropdownBasic />
</DemoBlock>

菜单默认使用 Teleport 挂载到 `body`，并在可视区域内自动翻转和偏移，因此不会被普通 `overflow` 容器裁剪。组件会把 trigger 的 OMG tokens、排版、主题、语言和书写方向同步到浮层；原生 dialog 等 top-layer 场景再通过挂载 props 显式调整。

## 导入

从包根入口导入：

```ts
import { ODropdown, type ODropdownItem } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

也可以使用独立子入口：

```ts
import { ODropdown, type ODropdownItem } from '@puzzle-fuzzy/ui/dropdown'
import '@puzzle-fuzzy/ui/styles.css'
```

## Items

```ts
import type { Component } from 'vue'

type ODropdownValue = string | number
type ODropdownTone = 'default' | 'danger'

interface ODropdownItem {
  readonly value: ODropdownValue
  readonly label: string
  readonly icon?: Component
  readonly disabled?: boolean
  readonly tone?: ODropdownTone
  readonly dividerBefore?: boolean
}
```

`danger` 只改变视觉色调，不会替使用方确认或执行危险操作。`dividerBefore` 在当前项前增加结构分隔。

### 图标来源

所有内置和自定义菜单图标统一从 [`vue-icons-plus/lu`](https://github.com/vue-icons-plus/vue-icons-plus) 导入。图标组件通过 `item.icon` 传入，不复制 SVG，也不引入第二套图标库。

```ts
import { LuSettings, LuUser } from 'vue-icons-plus/lu'
import type { ODropdownItem } from '@puzzle-fuzzy/ui/dropdown'

const items: readonly ODropdownItem[] = [
  { value: 'profile', label: '个人资料', icon: LuUser },
  { value: 'settings', label: '设置', icon: LuSettings },
]
```

## Props

| 名称             | 类型                             | 默认值           | 说明                                  |
| ---------------- | -------------------------------- | ---------------- | ------------------------------------- |
| items            | `readonly ODropdownItem[]`       | 必填             | 菜单项                                |
| open             | `boolean`                        | `undefined`      | 传入后进入受控模式                    |
| disabled         | `boolean`                        | `false`          | 禁用触发器                            |
| placement        | `'bottom-start' \| 'bottom-end'` | `'bottom-start'` | 首选浮层位置，空间不足时会自动翻转    |
| triggerAriaLabel | `string`                         | —                | 触发器的可访问名称                    |
| showIndicator    | `boolean`                        | `true`           | 是否显示内置的下拉指示图标            |
| teleported       | `boolean`                        | `true`           | 是否把菜单 Teleport 到指定目标        |
| teleportTo       | `string \| HTMLElement`          | `'body'`         | Teleport 目标；仅在 teleported 时生效 |

## Events

| 名称          | 参数                                           | 说明                                     |
| ------------- | ---------------------------------------------- | ---------------------------------------- |
| `update:open` | `(value: boolean)`                             | 每次请求打开或关闭时发出                 |
| `select`      | `(value: ODropdownValue, item: ODropdownItem)` | 选择可用菜单项后发出，随后关闭并还原焦点 |

禁用项不会发出 `select`。`Tab`、点击外部和关闭操作只更新 open 状态，不会伪造选择事件。

## Slots

| 名称      | Slot props                | 说明                                   |
| --------- | ------------------------- | -------------------------------------- |
| `trigger` | `{ open: boolean }`       | 触发器内容，由组件内部原生 button 包裹 |
| `item`    | `{ item: ODropdownItem }` | 自定义菜单项文字区域                   |
| `empty`   | —                         | `items` 为空时的内容                   |

`trigger` slot 中只放文字、图标或其他非交互内容，不要放 button、链接或表单控件，避免嵌套交互元素。

## 受控与非受控 open

不传 `open` 时，组件自己维护开关状态：

```vue
<ODropdown :items="items">
  <template #trigger>操作</template>
</ODropdown>
```

需要由页面协调状态时，使用 `v-model:open`：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <ODropdown v-model:open="open" :items="items">
    <template #trigger>操作</template>
  </ODropdown>
</template>
```

受控模式下，组件只通过 `update:open` 请求变化；使用方必须更新绑定值，面板才会真正改变。

## 浮层挂载、dialog 与局部上下文

默认 `teleported=true`、`teleportTo='body'`，适合需要越过普通布局裁剪的页面。以下场景应主动选择挂载位置：

- 原生 `<dialog>` 打开后属于浏览器 top layer。挂到 `body` 的菜单不在该 top layer 内，可能被遮挡或无法交互；在 dialog 内使用 `:teleported="false"`，或把 `teleportTo` 指向 dialog 内的稳定元素。
- 默认 Teleport 会主动镜像 trigger 的 `--omg-*` tokens、继承排版、最近的 `data-omg-theme`、`lang` 和计算后的 `dir`。局部深色、语言或 RTL 容器无需为了这些基础上下文关闭 Teleport。
- `bottom-start` / `bottom-end` 会依据同步后的书写方向解释 start/end。若还依赖非 `--omg-*` 自定义变量、祖先选择器或其他未镜像的局部样式，再把目标放进对应作用域或改用内联。

```vue
<dialog open>
  <ODropdown :items="items" :teleported="false">
    <template #trigger>Dialog actions</template>
  </ODropdown>
</dialog>
```

需要保留 Teleport 时，可以传入 selector 或已挂载的 HTMLElement：

```vue
<ODropdown :items="items" teleport-to="#dialog-menu-layer">
  <template #trigger>Dialog actions</template>
</ODropdown>
```

SSR 下默认字符串目标是安全的，组件 setup 不要求访问 `document`。若传入 HTMLElement，请在客户端挂载后取得元素；不要在服务端 setup 顶层调用 `document.querySelector`。`teleported=false` 同样支持 SSR，服务端输出保持内联。

## 键盘行为

| 焦点位置 | 按键                    | 行为                                   |
| -------- | ----------------------- | -------------------------------------- |
| 触发器   | `Enter` / `Space`       | 切换菜单                               |
| 触发器   | `ArrowDown`             | 打开并聚焦第一个可用项                 |
| 触发器   | `ArrowUp`               | 打开并聚焦最后一个可用项               |
| 触发器   | `Escape`                | 菜单打开时关闭并保留触发器焦点         |
| 菜单     | `ArrowDown` / `ArrowUp` | 在可用项之间循环，跳过 disabled 项     |
| 菜单     | `Home` / `End`          | 聚焦第一个或最后一个可用项             |
| 菜单项   | `Enter` / `Space`       | 选择当前项、关闭菜单并把焦点还给触发器 |
| 菜单     | `Escape`                | 关闭菜单并把焦点还给触发器             |
| 任意位置 | `Tab`                   | 不阻止浏览器默认导航，同时关闭菜单     |

## ARIA 与焦点

- 触发器是原生 button，并提供 `aria-haspopup="menu"`、`aria-expanded` 和打开时的 `aria-controls`。
- 浮层使用 `role="menu"`，每个操作使用原生 button 与 `role="menuitem"`。
- disabled 项既不可聚焦也不可选择；菜单导航会自动跳过它们。
- 选择和 `Escape` 会把焦点还给触发器；点击外部和 `Tab` 关闭时不抢夺焦点。
- `prefers-reduced-motion: reduce` 下关闭面板和指示图标的过渡。

## 非目标

- 不处理请求、路由、权限、确认弹窗或业务状态映射。
- 不提供 hover menu、context menu、多级子菜单或菜单内表单。
- 不允许一个菜单项承载多个嵌套操作；复杂内容应组合更合适的独立组件。
