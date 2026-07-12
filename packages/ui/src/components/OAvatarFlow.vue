<script setup lang="ts">
import { computed } from 'vue'
import OAvatar from './OAvatar.vue'
import type { OAvatarFlowProps } from './avatar-flow'

const props = withDefaults(defineProps<OAvatarFlowProps>(), {
  phase: 'idle',
  maxVisibleReceivers: 3,
  size: 'md',
  shape: 'circle',
})

const visibleReceivers = computed(() => props.receivers.slice(0, props.maxVisibleReceivers))
const overflow = computed(() => Math.max(0, props.receivers.length - visibleReceivers.value.length))
const active = computed(() => props.phase === 'transferring')
const hasReceivers = computed(() => visibleReceivers.value.length > 0)
</script>

<template>
  <div
    class="o-avatar-flow"
    :data-active="active ? 'true' : 'false'"
    :data-phase="props.phase"
    :data-o-theme="props.theme"
    role="status"
    :aria-label="props.accessibleLabel"
    aria-live="polite"
    aria-atomic="true"
  >
    <div class="o-avatar-flow__inner" aria-hidden="true">
      <OAvatar
        class="o-avatar-flow__avatar"
        :src="props.sender.src"
        :name="props.sender.name"
        :initials="props.sender.initials"
        :size="props.size"
        :shape="props.shape"
        :theme="props.theme"
      />

      <template v-if="hasReceivers">
        <span class="o-avatar-flow__connector" aria-hidden="true">
          <span v-if="active" class="o-avatar-flow__dots">
            <span class="o-avatar-flow__dot" />
            <span class="o-avatar-flow__dot" />
            <span class="o-avatar-flow__dot" />
          </span>
          <span v-else class="o-avatar-flow__line" />
        </span>

        <span class="o-avatar-flow__receivers">
          <OAvatar
            v-for="(receiver, index) in visibleReceivers"
            :key="receiver.id"
            class="o-avatar-flow__avatar o-avatar-flow__receiver"
            :class="{ 'is-stacked': index > 0 }"
            :src="receiver.src"
            :name="receiver.name"
            :initials="receiver.initials"
            :size="props.size"
            :shape="props.shape"
            :theme="props.theme"
          />

          <span v-if="overflow > 0" class="o-avatar-flow__overflow">+{{ overflow }}</span>
        </span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.o-avatar-flow {
  --o-avatar-flow-fg: #273040;
  --o-avatar-flow-muted: rgba(39, 48, 64, 0.24);
  --o-avatar-flow-accent: #2f6fed;
  --o-avatar-flow-overflow-bg: #eef2f7;
  --o-avatar-flow-overflow-border: #ffffff;

  display: inline-flex;
  min-width: 0;
  align-items: center;
  color: var(--o-avatar-flow-fg);
}

.o-avatar-flow__inner {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.o-avatar-flow__avatar {
  flex: 0 0 auto;
}

.o-avatar-flow__connector {
  display: inline-flex;
  width: 32px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
}

.o-avatar-flow__line {
  width: 100%;
  height: 1px;
  background: var(--o-avatar-flow-muted);
}

.o-avatar-flow__dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.o-avatar-flow__dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: var(--o-avatar-flow-accent);
  animation: o-avatar-flow-pulse 920ms ease-in-out infinite;
}

.o-avatar-flow__dot:nth-child(2) {
  animation-delay: 120ms;
}

.o-avatar-flow__dot:nth-child(3) {
  animation-delay: 240ms;
}

.o-avatar-flow__receivers {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  padding-left: 2px;
}

.o-avatar-flow__receiver.is-stacked,
.o-avatar-flow__overflow {
  margin-left: -8px;
}

.o-avatar-flow__overflow {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--o-avatar-flow-overflow-border);
  border-radius: 999px;
  background: var(--o-avatar-flow-overflow-bg);
  color: var(--o-avatar-flow-fg);
  box-sizing: border-box;
  font-size: 12px;
  font-weight: 750;
  line-height: 1;
  tab-size: 4;
}

.o-avatar-flow[data-phase='complete'] {
  --o-avatar-flow-accent: #17b26a;
}

.o-avatar-flow[data-phase='error'] {
  --o-avatar-flow-accent: #f04438;
}

:global(.dark) .o-avatar-flow,
:global([data-theme='dark']) .o-avatar-flow,
.o-avatar-flow[data-o-theme='dark'] {
  --o-avatar-flow-fg: #f4f6fb;
  --o-avatar-flow-muted: rgba(244, 246, 251, 0.24);
  --o-avatar-flow-accent: #7da2ff;
  --o-avatar-flow-overflow-bg: #242936;
  --o-avatar-flow-overflow-border: #141821;
}

@media (prefers-color-scheme: dark) {
  .o-avatar-flow {
    --o-avatar-flow-fg: #f4f6fb;
    --o-avatar-flow-muted: rgba(244, 246, 251, 0.24);
    --o-avatar-flow-accent: #7da2ff;
    --o-avatar-flow-overflow-bg: #242936;
    --o-avatar-flow-overflow-border: #141821;
  }
}

.o-avatar-flow[data-o-theme='light'] {
  --o-avatar-flow-fg: #273040;
  --o-avatar-flow-muted: rgba(39, 48, 64, 0.24);
  --o-avatar-flow-accent: #2f6fed;
  --o-avatar-flow-overflow-bg: #eef2f7;
  --o-avatar-flow-overflow-border: #ffffff;
}

@media (max-width: 640px) {
  .o-avatar-flow__inner {
    gap: 4px;
  }

  .o-avatar-flow__connector {
    width: 20px;
  }
}

@keyframes o-avatar-flow-pulse {
  0%,
  100% {
    opacity: 0.36;
    transform: translateY(0);
  }

  50% {
    opacity: 1;
    transform: translateY(-1px);
  }
}
</style>
