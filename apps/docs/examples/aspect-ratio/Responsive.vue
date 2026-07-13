<script setup lang="ts">
import { OAspectRatio } from '@puzzle-fuzzy/ui'
</script>

<template>
  <div class="aspect-ratio-responsive">
    <OAspectRatio :ratio="1">
      <div class="aspect-ratio-responsive-square">1 : 1</div>
    </OAspectRatio>
    <OAspectRatio :ratio="4 / 3">
      <div class="aspect-ratio-responsive-landscape">4 : 3</div>
    </OAspectRatio>
  </div>
</template>

<style scoped lang="less">
.aspect-ratio-responsive {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(120px, 1fr) minmax(180px, 1.5fr);
  align-items: start;
  gap: var(--omg-space-4);
}

.aspect-ratio-responsive-square,
.aspect-ratio-responsive-landscape {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
  color: var(--omg-color-text-muted);
  font-weight: var(--omg-font-weight-semibold);
}

@media (width <= 480px) {
  .aspect-ratio-responsive {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
