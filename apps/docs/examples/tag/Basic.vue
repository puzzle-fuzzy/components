<script setup lang="ts">
import { OTag } from '@puzzle-fuzzy/ui'
import { LuSparkles } from 'vue-icons-plus/lu'

const tones = [
  { value: 'neutral', label: '中性' },
  { value: 'brand', label: '品牌' },
  { value: 'success', label: '成功' },
  { value: 'warning', label: '警告' },
  { value: 'danger', label: '危险' },
] as const
</script>

<template>
  <div class="tag-basic">
    <section class="tag-basic-group" aria-labelledby="tag-soft-heading">
      <strong id="tag-soft-heading">Soft</strong>
      <div class="tag-basic-row">
        <OTag v-for="tone in tones" :key="tone.value" :tone="tone.value">
          {{ tone.label }}
        </OTag>
      </div>
    </section>

    <section class="tag-basic-group" aria-labelledby="tag-solid-heading">
      <strong id="tag-solid-heading">Solid</strong>
      <div class="tag-basic-row">
        <OTag v-for="tone in tones" :key="tone.value" :tone="tone.value" variant="solid">
          {{ tone.label }}
        </OTag>
      </div>
    </section>

    <section class="tag-basic-group" aria-labelledby="tag-detail-heading">
      <strong id="tag-detail-heading">尺寸、图标与长文本</strong>
      <div class="tag-basic-row">
        <OTag size="sm" tone="brand">Small</OTag>
        <OTag size="md" tone="brand">Medium</OTag>
        <OTag tone="warning">
          <template #icon><LuSparkles /></template>
          推荐
        </OTag>
        <OTag class="tag-basic-long" tone="neutral">
          这是一段会在受限空间内安全截断的很长标签文字
        </OTag>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.tag-basic {
  display: grid;
  width: 100%;
  gap: var(--omg-space-4);
}

.tag-basic-group {
  display: grid;
  min-width: 0;
  gap: var(--omg-space-2);
}

.tag-basic-group > strong {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.tag-basic-row {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--omg-space-2);
}

.tag-basic-long {
  inline-size: min(100%, 220px);
}
</style>
