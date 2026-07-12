<script setup lang="ts">
import { ref } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { OAvatar, OAvatarFlow, OButton } from './index'

const loading = ref(false)
const { start } = useTimeoutFn(
  () => {
    loading.value = false
  },
  1200,
  { immediate: false },
)

function previewLoading() {
  loading.value = true
  start()
}
</script>

<template>
  <main class="demo-shell">
    <section class="demo-panel">
      <p class="demo-kicker">OMG UI</p>
      <h1>Button</h1>
      <p class="demo-copy">
        A Vue button component with its own light and dark theme tokens.
      </p>

      <div class="demo-row">
        <OButton>Primary action</OButton>
        <OButton variant="soft">Soft action</OButton>
        <OButton variant="outline">Outline action</OButton>
        <OButton variant="ghost">Ghost action</OButton>
      </div>

      <div class="demo-row">
        <OButton size="sm" tone="neutral">Small</OButton>
        <OButton tone="neutral">Medium</OButton>
        <OButton size="lg" tone="neutral">Large</OButton>
      </div>

      <div class="demo-row">
        <OButton tone="danger">Delete</OButton>
        <OButton :loading="loading" @click="previewLoading">Loading</OButton>
        <OButton disabled>Disabled</OButton>
      </div>

      <div class="demo-row demo-row--split">
        <OButton theme="light" variant="soft">Forced light</OButton>
        <OButton theme="dark" variant="soft">Forced dark</OButton>
      </div>

      <div class="demo-row demo-row--split">
        <OAvatar name="Yxswy" status="online" />
        <OAvatar name="Components UI" size="lg" shape="rounded" status="away" />
        <OAvatar initials="UI" size="xl" theme="dark" status="busy" />
      </div>

      <div class="demo-row demo-row--split">
        <OAvatarFlow
          accessible-label="Yxswy is transferring files to three receivers"
          phase="transferring"
          :sender="{ id: 'sender', name: 'Yxswy' }"
          :receivers="[
            { id: 'a', name: 'Components UI' },
            { id: 'b', name: 'Vue Kit' },
            { id: 'c', name: 'Bun Lab' },
            { id: 'd', name: 'Design' },
          ]"
        />
      </div>
    </section>
  </main>
</template>
