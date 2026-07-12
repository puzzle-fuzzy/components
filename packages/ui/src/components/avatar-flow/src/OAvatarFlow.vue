<script setup lang="ts">
import { computed } from 'vue'
import { OAvatar } from '../../avatar/index'
import { normalizeOAvatarFlowMaxVisibleReceivers, oAvatarFlowProps } from './avatar-flow'

defineOptions({
  name: 'OAvatarFlow',
})

const props = defineProps(oAvatarFlowProps)

const maxVisibleReceivers = computed(() =>
  normalizeOAvatarFlowMaxVisibleReceivers(props.maxVisibleReceivers),
)
const visibleReceivers = computed(() => props.receivers.slice(0, maxVisibleReceivers.value))
const overflowCount = computed(() =>
  Math.max(0, props.receivers.length - visibleReceivers.value.length),
)
const hasReceivers = computed(() => props.receivers.length > 0)
</script>

<template>
  <div
    class="o-avatar-flow"
    :data-phase="props.phase"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <span class="o-avatar-flow__live-status">{{ props.accessibleLabel }}</span>

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
        <span class="o-avatar-flow__connector" :data-phase="props.phase">
          <span class="o-avatar-flow__line" />

          <span
            v-if="props.phase === 'idle'"
            class="o-avatar-flow__phase-marker o-avatar-flow__phase-marker--idle"
            data-marker="idle"
          >
            —
          </span>

          <span
            v-else-if="props.phase === 'requesting'"
            class="o-avatar-flow__phase-marker o-avatar-flow__phase-marker--requesting"
            data-marker="requesting"
          >
            …
          </span>

          <span
            v-else-if="props.phase === 'transferring'"
            class="o-avatar-flow__phase-marker o-avatar-flow__phase-marker--transferring"
            data-marker="transferring"
          >
            <span class="o-avatar-flow__direction">→</span>
            <span class="o-avatar-flow__particles">
              <span class="o-avatar-flow__particle" />
              <span class="o-avatar-flow__particle" />
              <span class="o-avatar-flow__particle" />
            </span>
          </span>

          <span
            v-else-if="props.phase === 'complete'"
            class="o-avatar-flow__phase-marker o-avatar-flow__phase-marker--complete"
            data-marker="complete"
          >
            ✓
          </span>

          <span
            v-else
            class="o-avatar-flow__phase-marker o-avatar-flow__phase-marker--error"
            data-marker="error"
          >
            !
          </span>
        </span>

        <span class="o-avatar-flow__receivers">
          <OAvatar
            v-for="receiver in visibleReceivers"
            :key="receiver.id"
            class="o-avatar-flow__avatar o-avatar-flow__avatar--receiver"
            data-avatar-flow-role="receiver"
            :src="receiver.src"
            :alt="receiver.name"
            :name="receiver.name"
            :initials="receiver.initials"
            :size="props.size"
            :shape="props.shape"
          />

          <OAvatar
            v-if="overflowCount > 0"
            class="o-avatar-flow__avatar o-avatar-flow__avatar--overflow"
            data-avatar-flow-role="overflow"
            alt=""
            :size="props.size"
            :shape="props.shape"
          >
            <template #fallback>+{{ overflowCount }}</template>
          </OAvatar>
        </span>
      </template>
    </div>
  </div>
</template>
