<script setup lang="ts">
import { ref } from 'vue'
import { OBadge, OButton } from '@puzzle-fuzzy/ui'

const showZero = ref(false)
const tones = ['neutral', 'brand', 'success', 'warning', 'danger'] as const
</script>

<template>
  <div class="badge-basic">
    <section class="badge-basic-group" aria-labelledby="badge-values-heading">
      <strong id="badge-values-heading">数值、文本与上限</strong>
      <div class="badge-basic-row">
        <OBadge :value="1" aria-label="1 条消息"><span class="badge-basic-anchor">1</span></OBadge>
        <OBadge :value="99" aria-label="99 条消息"
          ><span class="badge-basic-anchor">99</span></OBadge
        >
        <OBadge :value="120" aria-label="120 条消息">
          <span class="badge-basic-anchor">120 → 99+</span>
        </OBadge>
        <OBadge value="NEW"><span class="badge-basic-anchor">文本</span></OBadge>
        <OBadge :value="8" hidden><span class="badge-basic-anchor">hidden</span></OBadge>
      </div>
    </section>

    <section class="badge-basic-group" aria-labelledby="badge-zero-heading">
      <strong id="badge-zero-heading">零值与圆点</strong>
      <div class="badge-basic-row">
        <OBadge :value="0" :show-zero="showZero" tone="brand">
          <span class="badge-basic-anchor">零值</span>
        </OBadge>
        <OButton size="sm" tone="neutral" variant="soft" @click="showZero = !showZero">
          {{ showZero ? '隐藏零值' : '显示零值' }}
        </OButton>
        <OBadge dot tone="success" />
        <span class="badge-basic-hint">未命名圆点仅作装饰</span>
      </div>
    </section>

    <section class="badge-basic-group" aria-labelledby="badge-tones-heading">
      <strong id="badge-tones-heading">独立 Badge 与全部 tone</strong>
      <div class="badge-basic-row">
        <OBadge v-for="(tone, index) in tones" :key="tone" :tone="tone" :value="index + 1" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.badge-basic,
.badge-basic-group {
  display: grid;
  min-width: 0;
  gap: var(--omg-space-3);
}

.badge-basic {
  width: 100%;
}

.badge-basic-group > strong,
.badge-basic-hint {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.badge-basic-row {
  display: flex;
  min-height: 36px;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--omg-space-4);
}

.badge-basic-anchor {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  padding-inline: var(--omg-space-3);
  border-radius: var(--omg-radius-md);
  background: var(--omg-color-surface-muted);
  color: var(--omg-color-text);
  font-size: var(--omg-font-size-sm);
}
</style>
