<script setup lang="ts">
import { LuAlertTriangle, LuCheckCircle2, LuInfo, LuX, LuXCircle } from 'vue-icons-plus/lu'
import { computed, type Component } from 'vue'

import {
  oMessageProps,
  type OMessageEmits,
  type OMessageSlots,
  type OMessageStatus,
} from './message'

defineOptions({ name: 'OMessage' })

const props = defineProps(oMessageProps)
const emit = defineEmits<OMessageEmits>()

defineSlots<OMessageSlots>()

const statusIcons = {
  info: LuInfo,
  success: LuCheckCircle2,
  warning: LuAlertTriangle,
  error: LuXCircle,
} satisfies Record<OMessageStatus, Component>

const statusIcon = computed(() => statusIcons[props.status])
const liveRole = computed(() => (props.status === 'error' ? 'alert' : 'status'))
</script>

<template>
  <article
    class="o-message"
    :class="`o-message--${props.status}`"
    :role="liveRole"
    aria-atomic="true"
  >
    <span class="o-message__icon" aria-hidden="true">
      <slot name="icon">
        <component :is="statusIcon" aria-hidden="true" />
      </slot>
    </span>
    <div class="o-message__content">
      <slot>{{ props.message }}</slot>
    </div>
    <button
      v-if="props.closable"
      class="o-message__close"
      type="button"
      :aria-label="props.closeAriaLabel"
      @click="emit('close')"
    >
      <LuX aria-hidden="true" />
    </button>
  </article>
</template>
