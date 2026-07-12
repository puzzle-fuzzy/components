<script setup lang="ts">
import { OAvatarFlow, type OAvatarFlowPeer, type OAvatarFlowState } from '@puzzle-fuzzy/ui'

const sender: OAvatarFlowPeer = { id: 'sender', name: 'OMG UI' }
const receivers: readonly OAvatarFlowPeer[] = [
  { id: 'vue', name: 'Vue' },
  { id: 'docs', name: 'Docs' },
  { id: 'tests', name: 'Tests' },
  { id: 'build', name: 'Build' },
]

const states: readonly { state: OAvatarFlowState; label: string }[] = [
  { state: 'loading', label: '加载视觉状态' },
  { state: 'connected', label: '连接视觉状态' },
  { state: 'transferring', label: '传输视觉状态' },
]
</script>

<template>
  <div class="omg-example-stack">
    <OAvatarFlow
      v-for="item in states"
      :key="item.state"
      v-bind="{ ariaLabel: item.label }"
      :receivers="receivers"
      :sender="sender"
      :state="item.state"
    />
  </div>
</template>
