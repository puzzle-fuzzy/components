<script setup>
import AvatarDropdownBasic from '../../examples/avatar-dropdown/Basic.vue'
</script>

# Avatar Dropdown 头像下拉

`OAvatarDropdown` 将纯展示的 `OAvatar` 与标准 `ODropdown` 组合为头像触发菜单。它保留头像的尺寸、状态、回退和颜色能力，但不会把点击逻辑塞进基础 Avatar。

## 基础用法

<DemoBlock label="Avatar dropdown interactions and themes">
  <AvatarDropdownBasic />
</DemoBlock>

## 导入

从包根入口导入：

```ts
import { OAvatarDropdown, type ODropdownItem } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

也可以使用独立子入口，并从 Dropdown 子入口复用菜单模型：

```ts
import { OAvatarDropdown } from '@puzzle-fuzzy/ui/avatar-dropdown'
import type { ODropdownItem } from '@puzzle-fuzzy/ui/dropdown'
import '@puzzle-fuzzy/ui/styles.css'
```

## 使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { OAvatarDropdown } from '@puzzle-fuzzy/ui/avatar-dropdown'
import type { ODropdownItem } from '@puzzle-fuzzy/ui/dropdown'
import { LuSettings, LuUser } from 'vue-icons-plus/lu'

const open = ref(false)
const items: readonly ODropdownItem[] = [
  { value: 'profile', label: '个人资料', icon: LuUser },
  { value: 'settings', label: '设置', icon: LuSettings },
]
</script>

<template>
  <OAvatarDropdown
    v-model:open="open"
    v-bind="{ ariaLabel: '打开头像菜单' }"
    :items="items"
    name="Yxswy"
    status="online"
    @select="handleSelect"
  />
</template>
```

所有菜单图标统一从 [`vue-icons-plus/lu`](https://github.com/vue-icons-plus/vue-icons-plus) 导入。`OAvatarDropdown` 不提供第二套图标映射，也不接受复制的 SVG 字符串。

## Props

### 菜单与组合

| 名称          | 类型                             | 默认值           | 说明                                  |
| ------------- | -------------------------------- | ---------------- | ------------------------------------- |
| items         | `readonly ODropdownItem[]`       | 必填             | 与 ODropdown 共用的菜单项模型         |
| open          | `boolean`                        | `undefined`      | 传入后进入受控模式                    |
| disabled      | `boolean`                        | `false`          | 禁用头像触发器                        |
| placement     | `'bottom-start' \| 'bottom-end'` | `'bottom-start'` | 首选菜单位置                          |
| ariaLabel     | `string`                         | 必填             | 头像菜单触发器的可访问名称            |
| showIndicator | `boolean`                        | `true`           | 是否显示下拉指示图标                  |
| teleported    | `boolean`                        | `true`           | 是否把菜单 Teleport 到指定目标        |
| teleportTo    | `string \| HTMLElement`          | `'body'`         | Teleport 目标；仅在 teleported 时生效 |

### Avatar 外观

| 名称            | 类型                                        | 默认值     | 说明                               |
| --------------- | ------------------------------------------- | ---------- | ---------------------------------- |
| src             | `string`                                    | —          | 图片地址                           |
| alt             | `string`                                    | —          | 图片替代文字；空字符串表示装饰图片 |
| name            | `string`                                    | —          | 名称与 initials 来源               |
| initials        | `string`                                    | —          | 显式回退文字                       |
| size            | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`      | `'md'`     | 头像尺寸                           |
| shape           | `'circle' \| 'rounded' \| 'square'`         | `'circle'` | 头像和触发器轮廓                   |
| status          | `'online' \| 'away' \| 'busy' \| 'offline'` | —          | 头像视觉状态                       |
| statusLabel     | `string`                                    | —          | 本地化状态描述                     |
| stacked         | `boolean`                                   | `false`    | 使用 Avatar 的相邻重叠样式         |
| backgroundColor | `string`                                    | —          | 回退头像背景色                     |
| textColor       | `string`                                    | —          | 回退头像文字色                     |

## Events

| 名称          | 参数                                           | 说明                  |
| ------------- | ---------------------------------------------- | --------------------- |
| `update:open` | `(value: boolean)`                             | 请求打开或关闭菜单    |
| `select`      | `(value: ODropdownValue, item: ODropdownItem)` | 选择可用菜单项后发出  |
| `load`        | `(event: Event)`                               | 内部真实 img 加载成功 |
| `error`       | `(event: Event)`                               | 内部真实 img 加载失败 |

## Slots

| 名称       | Slot props                                | 说明                   |
| ---------- | ----------------------------------------- | ---------------------- |
| `fallback` | `{ initials: string, hasError: boolean }` | 自定义 Avatar 回退内容 |
| `item`     | `{ item: ODropdownItem }`                 | 自定义菜单项文字区域   |
| `empty`    | —                                         | items 为空时的菜单内容 |

组件没有 `trigger` slot：头像就是明确的触发内容。需要其他触发器时直接使用 `ODropdown`。

## 受控与非受控 open

省略 `open` 时，Avatar Dropdown 自己维护菜单开关：

```vue
<OAvatarDropdown v-bind="{ ariaLabel: '打开头像菜单' }" :items="items" name="Yxswy" />
```

需要从外部协调时使用 `v-model:open`：

```vue
<OAvatarDropdown
  v-model:open="open"
  v-bind="{ ariaLabel: '打开头像菜单' }"
  :items="items"
  name="Yxswy"
/>
```

受控模式沿用 ODropdown 语义：每次交互发出 `update:open`，绑定值由使用方更新。

## 浮层挂载、主题与方向

Avatar Dropdown 默认把菜单 Teleport 到 `body`，以越过普通容器裁剪。组件会主动把头像 trigger 的 `--omg-*` tokens、继承排版、最近的 `data-omg-theme`、`lang` 与计算后的 `dir` 同步到菜单，因此局部主题和 RTL 默认保持一致。

依赖非 `--omg-*` 自定义变量、祖先选择器或其他未镜像局部样式时，可以关闭 Teleport。下面的面板会保留在 `.product-field-scope` 内：

```vue
<section class="product-field-scope" data-omg-theme="dark" dir="rtl">
  <OAvatarDropdown
    v-bind="{ ariaLabel: '打开头像菜单' }"
    :items="items"
    name="Yxswy"
    :teleported="false"
  />
</section>
```

需要 Teleport 和更广泛的局部样式上下文同时存在时，把 `teleportTo` 指向该作用域内的 selector 或 HTMLElement。`bottom-start` / `bottom-end` 始终按从 trigger 同步后的方向解释。

原生 `<dialog>` 位于 top layer；默认挂到 `body` 的菜单可能落在 dialog 之外。请在 dialog 内使用 `:teleported="false"`，或把 `teleportTo` 指向 dialog 内部目标。

SSR 时默认 `'body'` 目标和内联模式都不要求 setup 访问 DOM。HTMLElement 目标只能在客户端挂载后取得，不要在服务端 setup 顶层执行 DOM 查询。

## 键盘行为

| 焦点位置   | 按键                    | 行为                                 |
| ---------- | ----------------------- | ------------------------------------ |
| 头像触发器 | `Enter` / `Space`       | 切换菜单                             |
| 头像触发器 | `ArrowDown` / `ArrowUp` | 打开并聚焦第一个或最后一个可用菜单项 |
| 菜单       | `ArrowDown` / `ArrowUp` | 循环移动焦点并跳过 disabled 项       |
| 菜单       | `Home` / `End`          | 聚焦第一个或最后一个可用菜单项       |
| 菜单项     | `Enter` / `Space`       | 选择、关闭并把焦点还给头像触发器     |
| 菜单       | `Escape`                | 关闭并把焦点还给头像触发器           |
| 任意位置   | `Tab`                   | 保留默认焦点导航，同时关闭菜单       |

## ARIA 与焦点

- 外层触发器是原生 button，`ariaLabel` 写入它，并提供 `aria-haspopup="menu"`、`aria-expanded` 与 `aria-controls`。
- Avatar 仍负责图片替代文字、回退 initials 与可选状态标签；触发器的 `ariaLabel` 描述点击后打开的菜单。
- 菜单使用 `role="menu"`，操作项使用 `role="menuitem"`；disabled 项不可聚焦或选择。
- 选择和 `Escape` 后焦点回到头像触发器，点击外部和 `Tab` 不抢夺焦点。
- reduced-motion 环境中菜单与指示图标立即切换，不播放过渡。

## 组合边界与非目标

- 组件只组合 Avatar 与 Dropdown，不修改 `OAvatar` 的公开职责或点击行为。
- 不执行账户请求、退出登录、路由跳转、权限判断或危险操作确认。
- 不支持任意 trigger 内容、多级菜单或菜单内表单；这些场景应直接组合其他基础组件。
