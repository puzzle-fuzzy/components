<script setup lang="ts">
import { OSkeleton } from '@puzzle-fuzzy/ui'
</script>

<template>
  <div class="skeleton-basic">
    <section class="skeleton-basic-group" aria-labelledby="skeleton-shapes-heading">
      <strong id="skeleton-shapes-heading">原子形状与尺寸</strong>
      <div class="skeleton-basic-shapes" role="region" aria-busy="true" aria-label="内容载入中">
        <OSkeleton variant="circle" :width="48" :height="48" />
        <OSkeleton :lines="3" />
        <OSkeleton variant="rect" width="min(100%, 280px)" :height="96" />
      </div>
    </section>

    <section class="skeleton-basic-group" aria-labelledby="skeleton-composition-heading">
      <strong id="skeleton-composition-heading">组合占位</strong>
      <div class="skeleton-basic-card" role="region" aria-busy="true" aria-label="个人资料载入中">
        <OSkeleton variant="circle" :width="44" :height="44" />
        <div class="skeleton-basic-copy">
          <OSkeleton width="42%" />
          <OSkeleton :lines="2" />
        </div>
        <OSkeleton class="skeleton-basic-media" variant="rect" :height="132" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.skeleton-basic,
.skeleton-basic-group {
  display: grid;
  width: 100%;
  min-width: 0;
  gap: var(--omg-space-3);
}

.skeleton-basic-group > strong {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.skeleton-basic-shapes {
  display: grid;
  min-width: 0;
  grid-template-columns: auto minmax(160px, 1fr) minmax(180px, 0.7fr);
  align-items: center;
  gap: var(--omg-space-4);
}

.skeleton-basic-card {
  display: grid;
  width: min(100%, 520px);
  min-width: 0;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--omg-space-3);
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
}

.skeleton-basic-copy {
  display: grid;
  min-width: 0;
  align-content: center;
  gap: var(--omg-space-2);
}

.skeleton-basic-media {
  grid-column: 1 / -1;
}

@media (width <= 640px) {
  .skeleton-basic-shapes {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .skeleton-basic-shapes > :last-child {
    grid-column: 1 / -1;
  }
}
</style>
