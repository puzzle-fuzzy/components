<script setup lang="ts">
import { OButton, OEmpty } from '@puzzle-fuzzy/ui'
import { LuSearchX, LuSparkles } from 'vue-icons-plus/lu'
</script>

<template>
  <div class="empty-states">
    <OEmpty size="sm" title="没有匹配结果" description="换一个更短的关键词，或清除当前筛选。">
      <template #media><LuSearchX aria-hidden="true" /></template>
      <template #actions><OButton size="sm" variant="soft">清除筛选</OButton></template>
    </OEmpty>

    <section class="empty-states-dark" data-omg-theme="dark" aria-label="Empty dark theme">
      <OEmpty
        title="这是一个由使用方定义的深色空状态"
        description="即使说明文字很长，它也只负责排版和可访问内容，不会猜测这是无数据、无权限、错误还是首次使用。"
        media-variant="soft"
      >
        <template #media><LuSparkles aria-hidden="true" /></template>
        <p>这里可以继续放置自定义说明、链接或其他静态内容。</p>
        <template #actions><OButton size="sm">创建第一项</OButton></template>
      </OEmpty>
    </section>
  </div>
</template>

<style scoped lang="less">
.empty-states {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--omg-space-3);
}

.empty-states-dark {
  min-width: 0;
  border-radius: var(--omg-radius-xl);
  background: var(--omg-color-surface);
  color: var(--omg-color-text);
}

.empty-states p {
  margin: 0;
}

@media (width <= 640px) {
  .empty-states {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
