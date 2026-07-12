<script setup lang="ts">
import { ref } from 'vue'
import { OAvatarDropdown, type ODropdownItem, type ODropdownValue } from '@puzzle-fuzzy/ui'
import { LuLogOut, LuSettings, LuUser } from 'vue-icons-plus/lu'

const open = ref(false)
const darkOpen = ref(false)
const selectedLabel = ref('尚未选择')

const items: readonly ODropdownItem[] = [
  { value: 'profile', label: '个人资料', icon: LuUser },
  { value: 'settings', label: '界面设置', icon: LuSettings },
  {
    value: 'sign-out',
    label: '退出示例',
    icon: LuLogOut,
    tone: 'danger',
    dividerBefore: true,
  },
]

const handleSelect = (_value: ODropdownValue, item: ODropdownItem): void => {
  selectedLabel.value = item.label
}
</script>

<template>
  <div class="omg-example-stack">
    <div class="omg-example-theme" data-omg-theme="light">
      <OAvatarDropdown
        v-model:open="open"
        v-bind="{ ariaLabel: '打开头像菜单' }"
        background-color="#1d4ed8"
        text-color="#ffffff"
        :items="items"
        name="Yxswy"
        status="online"
        status-label="在线"
        @select="handleSelect"
      />
    </div>

    <div class="omg-example-theme" data-omg-theme="dark">
      <OAvatarDropdown
        v-model:open="darkOpen"
        v-bind="{ ariaLabel: '打开深色头像菜单' }"
        background-color="#7da2ff"
        text-color="#141821"
        :items="items"
        name="OMG UI"
        placement="bottom-end"
        :teleported="false"
        @select="handleSelect"
      />
    </div>

    <span aria-live="polite">最近选择：{{ selectedLabel }}</span>
  </div>
</template>
