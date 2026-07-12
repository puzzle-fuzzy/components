<script setup lang="ts">
import { computed } from 'vue'
import { OAvatar } from '../../avatar'
import { normalizeOAvatarGroupMax, oAvatarGroupProps } from './avatar-group'

defineOptions({ name: 'OAvatarGroup' })

const props = defineProps(oAvatarGroupProps)
const visibleItems = computed(() =>
  props.items.slice(0, normalizeOAvatarGroupMax(props.max, props.items.length)),
)
const overflowCount = computed(() => Math.max(0, props.items.length - visibleItems.value.length))
</script>

<template>
  <span
    class="o-avatar-group"
    :class="{ 'o-avatar-group--reverse': props.reverse }"
    role="group"
    :aria-label="props.ariaLabel"
  >
    <OAvatar
      v-for="(item, index) in visibleItems"
      :key="item.id"
      data-avatar-group-role="item"
      :src="item.src"
      :alt="item.name ?? ''"
      :name="item.name"
      :initials="item.initials"
      :background-color="item.backgroundColor"
      :text-color="item.textColor"
      :size="props.size"
      :shape="props.shape"
      :style="{ zIndex: index + 1 }"
      stacked
    />

    <OAvatar
      v-if="overflowCount > 0"
      data-avatar-group-role="overflow"
      alt=""
      :size="props.size"
      :shape="props.shape"
      :style="{ zIndex: visibleItems.length + 1 }"
      stacked
    >
      <template #fallback>+{{ overflowCount }}</template>
    </OAvatar>
  </span>
</template>
