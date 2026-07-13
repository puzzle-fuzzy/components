<script setup lang="ts">
import { ref } from 'vue'
import { OButton, OTag } from '@puzzle-fuzzy/ui'

const initialTags = [
  { id: 'vue', label: 'Vue', tone: 'success' },
  { id: 'typescript', label: 'TypeScript', tone: 'brand' },
  { id: 'tests', label: '待补测试', tone: 'warning' },
  { id: 'legacy', label: '待移除', tone: 'danger' },
] as const

const tags = ref([...initialTags])

const removeTag = (id: string): void => {
  tags.value = tags.value.filter((tag) => tag.id !== id)
}

const restoreTags = (): void => {
  tags.value = [...initialTags]
}
</script>

<template>
  <div class="tag-closable">
    <div class="tag-closable-list" aria-label="可移除标签">
      <OTag
        v-for="tag in tags"
        :key="tag.id"
        :tone="tag.tone"
        closable
        :close-aria-label="`移除${tag.label}标签`"
        @close="removeTag(tag.id)"
      >
        {{ tag.label }}
      </OTag>
      <span v-if="tags.length === 0" class="tag-closable-empty">标签已全部移除</span>
    </div>
    <OButton size="sm" tone="neutral" variant="soft" @click="restoreTags">恢复标签</OButton>
  </div>
</template>

<style scoped lang="less">
.tag-closable {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--omg-space-3);
}

.tag-closable-list {
  display: flex;
  min-width: min(100%, 260px);
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--omg-space-2);
}

.tag-closable-empty {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}
</style>
