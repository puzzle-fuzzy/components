<script setup lang="ts">
import { OInput } from '@puzzle-fuzzy/ui/input'
import { OLabel } from '@puzzle-fuzzy/ui/label'
import { ref } from 'vue'

const name = ref('OMG UI')
</script>

<template>
  <div class="label-example">
    <OLabel for="label-name">组件库名称</OLabel>
    <OInput id="label-name" v-model="name" autocomplete="organization" />
    <span class="label-example-value" aria-live="polite">当前名称：{{ name }}</span>
  </div>
</template>

<style scoped lang="less">
.label-example {
  display: grid;
  width: min(100%, 420px);
  gap: var(--omg-space-2);
}

.label-example-value {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}
</style>
