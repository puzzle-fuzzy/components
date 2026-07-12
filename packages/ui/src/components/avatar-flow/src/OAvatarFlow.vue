<script setup lang="ts">
import { computed } from 'vue'
import { OAvatar } from '../../avatar/index'
import { OAvatarGroup } from '../../avatar-group/index'
import { normalizeOAvatarFlowMaxVisibleReceivers, oAvatarFlowProps } from './avatar-flow'

defineOptions({
  name: 'OAvatarFlow',
})

const props = defineProps(oAvatarFlowProps)

const maxVisibleReceivers = computed(() =>
  normalizeOAvatarFlowMaxVisibleReceivers(props.maxVisibleReceivers),
)
const hasReceivers = computed(() => props.receivers.length > 0)
</script>

<template>
  <div class="o-avatar-flow" :data-state="props.state" role="img" :aria-label="props.ariaLabel">
    <div class="o-avatar-flow__inner" aria-hidden="true">
      <OAvatar
        class="o-avatar-flow__avatar o-avatar-flow__avatar--sender"
        data-avatar-flow-role="sender"
        :src="props.sender.src"
        :alt="props.sender.name"
        :name="props.sender.name"
        :initials="props.sender.initials"
        :size="props.size"
        :shape="props.shape"
      />

      <template v-if="hasReceivers">
        <span class="o-avatar-flow__connector" :data-state="props.state">
          <span v-if="props.state === 'loading'" class="o-avatar-flow__dots">
            <span class="o-avatar-flow__dot" />
            <span class="o-avatar-flow__dot" />
            <span class="o-avatar-flow__dot" />
          </span>
          <span v-else-if="props.state === 'connected'" class="o-avatar-flow__line" />
          <span v-else class="o-avatar-flow__dash-line" />
        </span>

        <OAvatarGroup
          class="o-avatar-flow__receivers"
          :items="props.receivers"
          :max="maxVisibleReceivers"
          :size="props.size"
          :shape="props.shape"
        />
      </template>
    </div>
  </div>
</template>
