<script setup lang="ts">
import { OAvatar, OBadge, OButton } from '@puzzle-fuzzy/ui'
import { LuBell } from 'vue-icons-plus/lu'
</script>

<template>
  <div class="badge-composition">
    <section class="badge-composition-group" aria-label="Badge 组合示例">
      <OBadge :value="8" aria-label="8 条未读通知">
        <OButton icon-only tone="neutral" variant="soft" aria-label="通知">
          <template #icon><LuBell /></template>
        </OButton>
      </OBadge>

      <OBadge dot tone="success" aria-label="Yxswy 在线">
        <OAvatar name="Yxswy" background-color="#1d4ed8" text-color="#ffffff" />
      </OBadge>

      <OBadge value="NEW" tone="brand">
        <span class="badge-composition-text">组件文档</span>
      </OBadge>
    </section>

    <section class="badge-composition-rtl" dir="rtl" aria-label="从右到左 Badge 组合">
      <span>RTL 逻辑顶端</span>
      <div class="badge-composition-group">
        <OBadge :value="12" aria-label="12 条未读消息">
          <OAvatar name="RTL" />
        </OBadge>
        <OBadge dot tone="success">
          <OAvatar name="装饰圆点" />
        </OBadge>
        <OBadge dot tone="warning" aria-label="等待处理">
          <OAvatar name="命名圆点" />
        </OBadge>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.badge-composition {
  display: grid;
  width: 100%;
  gap: var(--omg-space-5);
}

.badge-composition-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--omg-space-5);
}

.badge-composition-text {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  padding-inline: var(--omg-space-3);
  border-radius: var(--omg-radius-md);
  background: var(--omg-color-surface-muted);
  color: var(--omg-color-text);
}

.badge-composition-rtl {
  display: grid;
  gap: var(--omg-space-3);
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
  color: var(--omg-color-text);
}

.badge-composition-rtl > span {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}
</style>
