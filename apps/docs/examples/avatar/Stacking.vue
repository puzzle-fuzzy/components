<script setup lang="ts">
import { OAvatar, OAvatarGroup, type OAvatarGroupItem } from '@puzzle-fuzzy/ui'

const members: readonly OAvatarGroupItem[] = [
  {
    id: 'yxswy',
    name: 'Yxswy',
    backgroundColor: '#1d4ed8',
    textColor: '#ffffff',
  },
  {
    id: 'vue',
    name: 'Vue',
    backgroundColor: '#047857',
    textColor: '#ffffff',
  },
  {
    id: 'docs',
    name: 'Docs',
    backgroundColor: '#7c3aed',
    textColor: '#ffffff',
  },
  { id: 'tests', name: 'Tests' },
  { id: 'build', name: 'Build' },
]
</script>

<template>
  <div class="omg-example-stack">
    <div class="avatar-stack" role="group" aria-label="直接堆叠的三个头像">
      <OAvatar name="Yxswy" background-color="#1d4ed8" text-color="#ffffff" stacked />
      <OAvatar name="Vue" background-color="#047857" text-color="#ffffff" stacked />
      <OAvatar name="Docs" background-color="#7c3aed" text-color="#ffffff" stacked />
    </div>

    <OAvatarGroup aria-label="五位项目成员，重叠十二像素" :items="members" :max="3" :overlap="12" />

    <OAvatarGroup
      aria-label="五位项目成员，反向重叠半个根字号"
      :items="members"
      :max="4"
      overlap="0.5rem"
      reverse
    />
  </div>
</template>

<style scoped lang="less">
.avatar-stack {
  --omg-avatar-overlap: var(--omg-space-3);

  display: flex;
  align-items: center;
  isolation: isolate;
}
</style>
