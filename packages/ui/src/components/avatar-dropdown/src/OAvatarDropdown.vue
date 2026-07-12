<script setup lang="ts">
import { OAvatar } from '../../avatar'
import { ODropdown, type ODropdownItem, type ODropdownValue } from '../../dropdown'
import {
  oAvatarDropdownProps,
  type OAvatarDropdownEmits,
  type OAvatarDropdownSlots,
} from './avatar-dropdown'

defineOptions({ name: 'OAvatarDropdown' })

const props = defineProps(oAvatarDropdownProps)
const emit = defineEmits<OAvatarDropdownEmits>()

defineSlots<OAvatarDropdownSlots>()

const handleOpenUpdate = (value: boolean): void => {
  emit('update:open', value)
}

const handleSelect = (value: ODropdownValue, item: ODropdownItem): void => {
  emit('select', value, item)
}

const handleLoad = (event: Event): void => {
  emit('load', event)
}

const handleError = (event: Event): void => {
  emit('error', event)
}
</script>

<template>
  <ODropdown
    class="o-avatar-dropdown"
    :class="`o-avatar-dropdown--${props.shape}`"
    :items="props.items"
    :open="props.open"
    :disabled="props.disabled"
    :teleported="props.teleported"
    :teleport-to="props.teleportTo"
    :placement="props.placement"
    :trigger-aria-label="props.ariaLabel"
    :show-indicator="props.showIndicator"
    @update:open="handleOpenUpdate"
    @select="handleSelect"
  >
    <template #trigger>
      <OAvatar
        :src="props.src"
        :alt="props.alt"
        :name="props.name"
        :initials="props.initials"
        :size="props.size"
        :shape="props.shape"
        :status="props.status"
        :status-label="props.statusLabel"
        :stacked="props.stacked"
        :background-color="props.backgroundColor"
        :text-color="props.textColor"
        @load="handleLoad"
        @error="handleError"
      >
        <template v-if="$slots.fallback" #fallback="fallbackProps">
          <slot name="fallback" v-bind="fallbackProps" />
        </template>
      </OAvatar>
    </template>

    <template v-if="$slots.item" #item="itemProps">
      <slot name="item" v-bind="itemProps" />
    </template>

    <template v-if="$slots.empty" #empty>
      <slot name="empty" />
    </template>
  </ODropdown>
</template>
