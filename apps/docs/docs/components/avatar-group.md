<script setup>
import AvatarStacking from '../../examples/avatar/Stacking.vue'
</script>

# Avatar Group 头像组

`OAvatarGroup` 用明确的数据模型渲染一组头像，统一处理尺寸、形状、堆叠方向和 `+N` 溢出。

## 基础用法

<DemoBlock label="Avatar group stacking and overflow">
  <AvatarStacking />
</DemoBlock>

## 使用

```vue
<script setup lang="ts">
import { OAvatarGroup, type OAvatarGroupItem } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'

const members: readonly OAvatarGroupItem[] = [
  { id: 'one', name: 'One', backgroundColor: '#1d4ed8', textColor: '#ffffff' },
  { id: 'two', name: 'Two' },
  { id: 'three', name: 'Three' },
]
</script>

<template>
  <OAvatarGroup aria-label="三位成员" :items="members" :max="2" :overlap="12" />
</template>
```

## Props

| 名称      | 类型                          | 默认值     | 说明                       |
| --------- | ----------------------------- | ---------- | -------------------------- |
| items     | `readonly OAvatarGroupItem[]` | 必填       | 头像数据                   |
| max       | `number`                      | —          | 最大真实头像显示数         |
| size      | `OAvatarSize`                 | `'md'`     | 所有头像尺寸               |
| shape     | `OAvatarShape`                | `'circle'` | 所有头像形状               |
| reverse   | `boolean`                     | `false`    | 反转视觉堆叠方向           |
| overlap   | `number \| string`            | —          | 相邻头像的重叠距离         |
| ariaLabel | `string`                      | —          | 头像组及溢出数量的完整说明 |

有限数字按像素处理并收敛为非负值，例如 `12` 生成 `12px`，负数生成 `0px`。
字符串会去除首尾空白后直接作为 CSS 长度使用，例如 `overlap="0.5rem"`。空字符串和
`NaN`、`Infinity` 不生成局部覆盖，继续使用默认值。

## Item

每项必须包含稳定的 `id`，并可传入 `name`、`src`、`initials`、`backgroundColor` 和
`textColor`。头像组不会解析任意 VNode，因此动态数据、SSR 与类型推导保持一致。

## CSS 变量

通过 `--omg-avatar-group-overlap` 调整头像组的重叠距离；默认使用
`--omg-space-2`。`overlap` prop 会在当前头像组根节点设置这个变量，正向和反向堆叠共用
同一个距离。
