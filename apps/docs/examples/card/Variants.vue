<script setup lang="ts">
import { OCard } from '@puzzle-fuzzy/ui'
</script>

<template>
  <div class="card-variants">
    <OCard title="Surface" description="默认表面依靠轻量阴影建立层级。"> 适合独立的信息块。 </OCard>
    <OCard variant="muted" size="sm" title="Muted" description="静音表面适合嵌套内容。">
      紧凑尺寸会同时收紧内部间距。
    </OCard>
    <OCard variant="ghost" title="Ghost" description="透明结构不创建额外容器感。">
      适合已经处在清晰表面中的内容。
    </OCard>
    <section class="card-variants-dark" data-omg-theme="dark" aria-label="Card dark theme">
      <OCard
        title="深色与长内容"
        description="很长的标题和说明会自然换行，不会把逻辑结束侧的操作或正文挤出容器。"
      >
        卡片继续使用 OMG UI 自己的主题变量，不覆盖 VitePress 的品牌变量。
      </OCard>
    </section>
  </div>
</template>

<style scoped lang="less">
.card-variants {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--omg-space-3);
}

.card-variants-dark {
  min-width: 0;
  grid-column: 1 / -1;
  padding: var(--omg-space-3);
  border-radius: var(--omg-radius-xl);
  background: var(--omg-color-surface-muted);
  color: var(--omg-color-text);
}

@media (width <= 720px) {
  .card-variants {
    grid-template-columns: minmax(0, 1fr);
  }

  .card-variants-dark {
    grid-column: auto;
  }
}
</style>
