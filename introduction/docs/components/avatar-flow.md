<script setup>
import { OAvatarFlow } from '@omg/ui'

const sender = { id: 'sender', name: 'Yxswy' }
const receivers = [
  { id: 'a', name: 'Omg UI' },
  { id: 'b', name: 'Vue Kit' },
  { id: 'c', name: 'Bun Lab' },
  { id: 'd', name: 'Design' },
]
</script>

# Avatar Flow

`OAvatarFlow` 是头像的组合强化组件，用来表达一个发送者到多个接收者的流转状态。它参考了你给的 `TransferPeerFlow` 结构：左侧 sender，中间连接线或动态点，右侧最多展示三个 receivers，剩余数量显示为 `+N`。

## Static

<div class="preview-row">
  <OAvatarFlow
    accessible-label="Yxswy is ready to send to receivers"
    :sender="sender"
    :receivers="receivers"
  />
</div>

## Transferring

<div class="preview-row">
  <OAvatarFlow
    accessible-label="Yxswy is transferring to receivers"
    phase="transferring"
    :sender="sender"
    :receivers="receivers"
  />
</div>

## Dark Instance

<div class="preview-row">
  <OAvatarFlow
    accessible-label="Dark avatar flow preview"
    phase="transferring"
    theme="dark"
    shape="rounded"
    :sender="{ id: 'sender-dark', name: 'Dark' }"
    :receivers="receivers"
  />
</div>

```vue
<script setup lang="ts">
import { OAvatarFlow } from '@omg/ui'
import '@omg/ui/style.css'

const sender = { id: 'sender', name: 'Yxswy' }
const receivers = [
  { id: 'a', name: 'Omg UI' },
  { id: 'b', name: 'Vue Kit' },
  { id: 'c', name: 'Bun Lab' },
  { id: 'd', name: 'Design' },
]
</script>

<template>
  <OAvatarFlow
    accessible-label="Yxswy is transferring to receivers"
    phase="transferring"
    :sender="sender"
    :receivers="receivers"
  />
</template>
```

<style>
.preview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  margin: 16px 0 28px;
}
</style>
