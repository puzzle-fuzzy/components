<script setup lang="ts">
import { OAvatarFlow, type OAvatarFlowPeer, type OAvatarFlowPhase } from '@puzzle-fuzzy/ui'

const sender: OAvatarFlowPeer = { id: 'sender', name: 'OMG UI' }
const receivers: readonly OAvatarFlowPeer[] = [
  { id: 'vue', name: 'Vue' },
  { id: 'docs', name: 'Docs' },
  { id: 'tests', name: 'Tests' },
  { id: 'build', name: 'Build' },
]

const phases: readonly { phase: OAvatarFlowPhase; label: string }[] = [
  { phase: 'idle', label: '等待发送' },
  { phase: 'requesting', label: '正在请求接收端' },
  { phase: 'transferring', label: '正在传输' },
  { phase: 'complete', label: '传输完成' },
  { phase: 'error', label: '传输失败' },
]
</script>

<template>
  <div class="omg-example-stack">
    <OAvatarFlow
      v-for="item in phases"
      :key="item.phase"
      :accessible-label="item.label"
      :phase="item.phase"
      :receivers="receivers"
      :sender="sender"
    />
  </div>
</template>
