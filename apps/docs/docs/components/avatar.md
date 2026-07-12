<script setup>
import AvatarBasics from '../../examples/avatar/Basics.vue'
import AvatarStacking from '../../examples/avatar/Stacking.vue'
import AvatarStatuses from '../../examples/avatar/Statuses.vue'
</script>

# Avatar 头像

`OAvatar` 展示用户、团队或其他实体。图片失败时会回退到显式 initials 或根据 name 计算的缩写。

## 尺寸与形状

<DemoBlock label="Avatar sizes and shapes">
  <AvatarBasics />
</DemoBlock>

## 状态

状态同时使用颜色与图形区分。状态具有业务意义时应传入本地化 `statusLabel`。

<DemoBlock label="Avatar statuses">
  <AvatarStatuses />
</DemoBlock>

## 自定义颜色与堆叠

`backgroundColor` 与 `textColor` 只覆盖当前头像。少量头像可以直接使用 `stacked`，
数据列表则使用 `OAvatarGroup` 统一处理重叠与溢出。

<DemoBlock label="Avatar colors and stacking">
  <AvatarStacking />
</DemoBlock>

## 使用

```vue
<script setup lang="ts">
import { OAvatar } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
</script>

<template>
  <OAvatar name="Yxswy" status="online" status-label="在线" />
  <OAvatar src="/avatar.png" alt="Yxswy" />
</template>
```

## Props

| 名称            | 类型                                        | 默认值     | 说明                               |
| --------------- | ------------------------------------------- | ---------- | ---------------------------------- |
| src             | `string`                                    | —          | 图片地址                           |
| alt             | `string`                                    | —          | 图片替代文字；空字符串表示装饰图片 |
| name            | `string`                                    | —          | 名称与 initials 来源               |
| initials        | `string`                                    | —          | 显式回退文字                       |
| size            | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`      | `'md'`     | 尺寸                               |
| shape           | `'circle' \| 'rounded' \| 'square'`         | `'circle'` | 形状                               |
| status          | `'online' \| 'away' \| 'busy' \| 'offline'` | —          | 状态                               |
| statusLabel     | `string`                                    | —          | 本地化状态描述                     |
| stacked         | `boolean`                                   | `false`    | 与相邻 stacked 头像重叠            |
| backgroundColor | `string`                                    | —          | 当前头像的回退背景色               |
| textColor       | `string`                                    | —          | 当前头像的回退文字色               |

## Events 与 Slots

| 类型  | 名称       | 说明              |
| ----- | ---------- | ----------------- |
| Event | `load`     | 真实 img 加载成功 |
| Event | `error`    | 真实 img 加载失败 |
| Slot  | `fallback` | 自定义回退内容    |

## 可访问性

优先使用显式 alt，其次是 name 和 initials。不要为装饰性头像添加无意义的“Avatar”标签。
