<script setup lang="ts">
import { ref } from 'vue'
import { ODropdown, type ODropdownItem, type ODropdownValue } from '@puzzle-fuzzy/ui'
import { LuLogOut, LuSettings, LuUser } from 'vue-icons-plus/lu'

const selectedLabel = ref('尚未选择')

const items: readonly ODropdownItem[] = [
  { value: 'profile', label: '个人资料', icon: LuUser },
  { value: 'settings', label: '偏好设置（已停用）', icon: LuSettings, disabled: true },
  {
    value: 'sign-out',
    label: '退出示例',
    icon: LuLogOut,
    tone: 'danger',
    dividerBefore: true,
  },
]

const emptyItems: readonly ODropdownItem[] = []

const handleSelect = (_value: ODropdownValue, item: ODropdownItem): void => {
  selectedLabel.value = item.label
}
</script>

<template>
  <div class="omg-example-stack">
    <ODropdown :items="items" trigger-aria-label="打开操作菜单" @select="handleSelect">
      <template #trigger>操作菜单</template>
    </ODropdown>

    <span aria-live="polite">最近选择：{{ selectedLabel }}</span>

    <ODropdown :items="emptyItems" trigger-aria-label="打开空菜单">
      <template #trigger>空菜单</template>
      <template #empty>暂无可用操作</template>
    </ODropdown>
  </div>
</template>
