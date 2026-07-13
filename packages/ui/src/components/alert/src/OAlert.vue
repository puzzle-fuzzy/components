<script setup lang="ts">
import {
  LuAlertTriangle as LuTriangleAlert,
  LuCheckCircle2 as LuCircleCheck,
  LuInfo,
  LuX,
  LuXCircle as LuCircleX,
} from 'vue-icons-plus/lu'
import { computed, type Component } from 'vue'

import { oAlertProps, type OAlertEmits, type OAlertSlots, type OAlertStatus } from './alert'

defineOptions({ name: 'OAlert' })

const props = defineProps(oAlertProps)
const emit = defineEmits<OAlertEmits>()

defineSlots<OAlertSlots>()

const statusIcons = {
  info: LuInfo,
  success: LuCircleCheck,
  warning: LuTriangleAlert,
  error: LuCircleX,
} satisfies Record<OAlertStatus, Component>

const statusIcon = computed(() => statusIcons[props.status])
</script>

<template>
  <article class="o-alert" :class="`o-alert--${props.status}`">
    <span v-if="props.showIcon" class="o-alert__icon" aria-hidden="true">
      <slot name="icon">
        <component :is="statusIcon" aria-hidden="true" />
      </slot>
    </span>

    <div class="o-alert__main">
      <div class="o-alert__copy">
        <div v-if="props.title || $slots.title" class="o-alert__title">
          <slot name="title">{{ props.title }}</slot>
        </div>
        <div v-if="props.description || $slots.default" class="o-alert__body">
          <slot>{{ props.description }}</slot>
        </div>
      </div>

      <div v-if="$slots.action" class="o-alert__action">
        <slot name="action" />
      </div>
    </div>

    <button
      v-if="props.closable"
      class="o-alert__close"
      type="button"
      :aria-label="props.closeAriaLabel"
      @click="emit('close', $event)"
    >
      <span class="o-alert__close-icon" aria-hidden="true">
        <slot name="closeIcon"><LuX /></slot>
      </span>
    </button>
  </article>
</template>
