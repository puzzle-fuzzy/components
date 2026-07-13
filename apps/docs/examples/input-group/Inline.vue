<script setup lang="ts">
import {
  OInputGroup,
  OInputGroupAddon,
  OInputGroupInput,
  OInputGroupText,
} from '@puzzle-fuzzy/ui/input-group'
import { LuAtSign, LuSearch } from 'vue-icons-plus/lu'
import { ref } from 'vue'

const query = ref('')
const handle = ref('puzzle-fuzzy')
</script>

<template>
  <div class="input-group-inline">
    <OInputGroup aria-label="搜索组件">
      <OInputGroupAddon align="inline-start">
        <LuSearch aria-hidden="true" />
      </OInputGroupAddon>
      <OInputGroupInput v-model="query" aria-label="组件名称" placeholder="搜索组件" />
      <OInputGroupAddon align="inline-end">
        <OInputGroupText>⌘ K</OInputGroupText>
      </OInputGroupAddon>
    </OInputGroup>

    <OInputGroup aria-label="用户标识">
      <OInputGroupAddon align="inline-start">
        <LuAtSign aria-hidden="true" />
      </OInputGroupAddon>
      <OInputGroupInput v-model="handle" aria-label="用户名" />
      <OInputGroupAddon align="inline-end">
        <OInputGroupText>.vue</OInputGroupText>
      </OInputGroupAddon>
    </OInputGroup>
  </div>
</template>

<style scoped lang="less">
.input-group-inline {
  display: grid;
  width: min(100%, 560px);
  gap: var(--omg-space-4);
}
</style>
