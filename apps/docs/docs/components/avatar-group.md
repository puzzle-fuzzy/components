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
  <OAvatarGroup aria-label="三位成员" :items="members" :max="2" />
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
| ariaLabel | `string`                      | —          | 头像组及溢出数量的完整说明 |

## Item

每项必须包含稳定的 `id`，并可传入 `name`、`src`、`initials`、`backgroundColor` 和
`textColor`。头像组不会解析任意 VNode，因此动态数据、SSR 与类型推导保持一致。

## CSS 变量

通过 `--omg-avatar-overlap` 调整重叠距离；默认使用 `--omg-space-2`。
