<script setup>
import AvatarFlowPhases from '../../examples/avatar-flow/Phases.vue'
</script>

# Avatar Flow 头像流

`OAvatarFlow` 表达一个发送者到多个接收者的状态变化，适合传输、邀请、授权等轻量流程。

## 简化状态

只有 `transferring` 使用三个圆点表示活跃传输，其他阶段统一使用静态短线。
视觉保持简单，完整状态始终由 `accessibleLabel` 提供。

<DemoBlock label="Avatar Flow phases">
  <AvatarFlowPhases />
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
    accessible-label="正在向两个接收端传输"
    phase="transferring"
    :receivers="receivers"
    :sender="sender"
  />
</template>
```

## Props

| 名称                | 类型                                                                | 默认值     | 说明                         |
| ------------------- | ------------------------------------------------------------------- | ---------- | ---------------------------- |
| sender              | `OAvatarFlowPeer`                                                   | 必填       | 发送者                       |
| receivers           | `readonly OAvatarFlowPeer[]`                                        | 必填       | 接收者                       |
| phase               | `'idle' \| 'requesting' \| 'transferring' \| 'complete' \| 'error'` | `'idle'`   | 当前阶段                     |
| accessibleLabel     | `string`                                                            | 必填       | live region 的完整本地化状态 |
| maxVisibleReceivers | `number`                                                            | `3`        | 至少为 1 的整数              |
| size                | `OAvatarSize`                                                       | `'md'`     | 所有头像尺寸                 |
| shape               | `OAvatarShape`                                                      | `'circle'` | 所有头像形状                 |

## 可访问性与布局

- 状态文本位于 `role="status"` 内并使用 `aria-live="polite"`。
- 视觉连接器位于 `aria-hidden` 区域，不替代完整状态文本。
- 组件不使用循环动画。
- 窄容器通过容器查询收紧连接间距。
