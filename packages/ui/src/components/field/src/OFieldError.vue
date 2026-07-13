<script setup lang="ts">
import { computed } from 'vue'

import { oFieldErrorProps, type OFieldErrorSlots } from './field'

defineOptions({
  name: 'OFieldError',
  inheritAttrs: false,
})

const props = defineProps(oFieldErrorProps)
const slots = defineSlots<OFieldErrorSlots>()

const messages = computed(() => {
  const uniqueMessages = new Set<string>()

  for (const error of props.errors) {
    const message = (typeof error === 'string' ? error : error?.message)?.trim()
    if (message) uniqueMessages.add(message)
  }

  return [...uniqueMessages]
})

const hasContent = computed(() => Boolean(slots.default) || messages.value.length > 0)
</script>

<template>
  <div
    v-if="hasContent"
    v-bind="$attrs"
    class="o-field__error"
    data-slot="field-error"
    role="alert"
  >
    <slot v-if="$slots.default" />
    <template v-else-if="messages.length === 1">{{ messages[0] }}</template>
    <ul v-else class="o-field__error-list">
      <li v-for="message in messages" :key="message">{{ message }}</li>
    </ul>
  </div>
</template>
