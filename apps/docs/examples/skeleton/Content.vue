<script setup lang="ts">
import { ref } from 'vue'
import { OButton, OSkeleton } from '@puzzle-fuzzy/ui'

const loading = ref(true)
</script>

<template>
  <div class="skeleton-content">
    <section class="skeleton-content-panel" :aria-busy="loading">
      <div class="skeleton-content-heading">
        <strong>占位与真实内容切换</strong>
        <OButton size="sm" @click="loading = !loading">
          {{ loading ? '显示内容' : '重新载入' }}
        </OButton>
      </div>

      <OSkeleton :loading="loading" :lines="3">
        <article class="skeleton-content-resolved">
          <strong>内容已经准备好</strong>
          <p>default slot 只会在 loading=false 时渲染；请求与就绪判断始终属于使用方。</p>
        </article>
      </OSkeleton>
    </section>

    <section class="skeleton-content-panel" aria-busy="true">
      <div class="skeleton-content-heading">
        <strong>静态与 reduced motion</strong>
        <span>animated=false</span>
      </div>
      <OSkeleton :animated="false" :lines="3" />
      <p>
        系统启用 <code>prefers-reduced-motion: reduce</code> 时，animated 模式也会自动停用扫光。
      </p>
    </section>
  </div>
</template>

<style scoped lang="less">
.skeleton-content {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--omg-space-3);
}

.skeleton-content-panel {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: var(--omg-space-4);
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
  color: var(--omg-color-text);
}

.skeleton-content-heading {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--omg-space-2);
}

.skeleton-content-heading > span,
.skeleton-content-panel > p,
.skeleton-content-resolved p {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.skeleton-content-panel p {
  margin: 0;
}

.skeleton-content-resolved {
  display: grid;
  gap: var(--omg-space-2);
}

@media (width <= 640px) {
  .skeleton-content {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
