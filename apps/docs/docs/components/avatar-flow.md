<script setup>
import AvatarFlowStates from '../../examples/avatar-flow/States.vue'
</script>

# Avatar Flow 头像流

`OAvatarFlow` 呈现单个头像与头像组之间的视觉关系。组件只提供视觉状态，状态与业务含义的映射由使用方决定。

## 视觉状态

| 状态           | 表现               |
| -------------- | ------------------ |
| `loading`      | 依次浮动的三个圆点 |
| `connected`    | 静态实线           |
| `transferring` | 持续向右移动的虚线 |

<DemoBlock label="Avatar Flow states">
  <AvatarFlowStates />
</DemoBlock>

## 使用

```vue
<script setup lang="ts">
import { OAvatarFlow, type OAvatarFlowPeer } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'

const sender: OAvatarFlowPeer = { id: 'me', name: 'Yxswy' }
const receivers: readonly OAvatarFlowPeer[] = [
  { id: 'a', name: 'Vue' },
  { id: 'b', name: 'Docs' },
]
</script>

<template>
  <OAvatarFlow
    ariaLabel="流动视觉状态的头像连接"
    :receivers="receivers"
    :sender="sender"
    state="transferring"
  />
</template>
```

## Props

| 名称                | 类型                                         | 默认值        | 说明                     |
| ------------------- | -------------------------------------------- | ------------- | ------------------------ |
| sender              | `OAvatarFlowPeer`                            | 必填          | 起始头像                 |
| receivers           | `readonly OAvatarFlowPeer[]`                 | 必填          | 末端头像                 |
| state               | `'loading' \| 'connected' \| 'transferring'` | `'connected'` | 纯视觉状态               |
| ariaLabel           | `string`                                     | 必填          | 整组头像关系的无障碍名称 |
| maxVisibleReceivers | `number`                                     | `3`           | 至少为 1 的整数          |
| size                | `OAvatarSize`                                | `'md'`        | 所有头像尺寸             |
| shape               | `OAvatarShape`                               | `'circle'`    | 所有头像形状             |

## 可访问性与布局

- 根节点使用 `role="img"` 和必填的 `ariaLabel` 描述整个视觉组合。
- 内部头像与连接器对辅助技术隐藏，避免重复朗读。
- `prefers-reduced-motion: reduce` 下动画停止，但圆点、实线和虚线三种形态保持可辨识。
- 窄容器通过容器查询收紧连接间距。
