<script setup lang="ts">
import {
  OInputGroup,
  OInputGroupAddon,
  OInputGroupButton,
  OInputGroupInput,
  OInputGroupText,
} from '@puzzle-fuzzy/ui/input-group'
import { LuLink, LuSearch } from 'vue-icons-plus/lu'
import { ref } from 'vue'

const path = ref('components/field')
const feedback = ref('尚未打开')
</script>

<template>
  <div class="input-group-block">
    <OInputGroup aria-label="文档路径">
      <OInputGroupAddon align="block-start">
        <LuLink aria-hidden="true" />
        <OInputGroupText>https://omg-ui.dev/</OInputGroupText>
      </OInputGroupAddon>
      <OInputGroupInput v-model="path" aria-label="相对文档路径" />
      <OInputGroupAddon align="block-end">
        <OInputGroupText>输入相对路径后直接打开预览。</OInputGroupText>
        <OInputGroupButton variant="solid" @click="feedback = `已打开 ${path}`">
          <template #icon><LuSearch aria-hidden="true" /></template>
          打开
        </OInputGroupButton>
      </OInputGroupAddon>
    </OInputGroup>
    <span class="input-group-block-feedback" aria-live="polite">{{ feedback }}</span>
  </div>
</template>

<style scoped lang="less">
.input-group-block {
  display: grid;
  width: min(100%, 620px);
  gap: var(--omg-space-2);
}

.input-group-block-feedback {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}
</style>
