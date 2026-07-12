<script setup lang="ts">
import { OButton } from '@puzzle-fuzzy/ui'
</script>

<template>
  <OButton size="sm" tone="neutral">Small</OButton>
  <OButton tone="neutral">Medium</OButton>
  <OButton size="lg" tone="neutral">Large</OButton>
  <OButton loading>Saving</OButton>
  <OButton disabled>Unavailable</OButton>
  <OButton tone="danger">Delete</OButton>
  <OButton variant="outline">一段允许在窄容器中换行的较长按钮文案</OButton>
</template>
