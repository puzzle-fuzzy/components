<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <section class="omg-docs-demo" :aria-label="label">
    <div class="omg-docs-demo__content">
      <slot />
    </div>
  </section>
</template>
