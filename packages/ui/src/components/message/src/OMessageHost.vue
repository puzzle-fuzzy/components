<script setup lang="ts">
import OMessage from './OMessage.vue'
import type { OMessageHostEmits, OMessageHostRecord } from './message-host'

defineOptions({ name: 'OMessageHost' })

defineProps<{ records: readonly OMessageHostRecord[] }>()
const emit = defineEmits<OMessageHostEmits>()

const handleAfterLeave = (element: Element): void => {
  const id = (element as HTMLElement).dataset.messageId
  if (id) emit('afterLeave', id)
}

const handleFocusOut = (event: FocusEvent, id: string): void => {
  const current = event.currentTarget as HTMLElement
  if (
    typeof Node !== 'undefined' &&
    event.relatedTarget instanceof Node &&
    current.contains(event.relatedTarget)
  ) {
    return
  }
  emit('resume', id, 'focus')
}
</script>

<template>
  <TransitionGroup
    class="o-message-host"
    name="o-message"
    tag="div"
    @after-leave="handleAfterLeave"
  >
    <div
      v-for="record in records"
      :key="record.id"
      class="o-message-host__item"
      :data-message-id="record.id"
      @mouseenter="emit('pause', record.id, 'hover')"
      @mouseleave="emit('resume', record.id, 'hover')"
      @focusin="emit('pause', record.id, 'focus')"
      @focusout="handleFocusOut($event, record.id)"
    >
      <OMessage
        :message="record.message"
        :status="record.status"
        :closable="record.closable"
        :close-aria-label="record.closeAriaLabel"
        @close="emit('requestClose', record.id)"
      />
    </div>
  </TransitionGroup>
</template>
