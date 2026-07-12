<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'

import { oDialogProps, type ODialogEmits } from './dialog'

defineOptions({ name: 'ODialog' })

const props = defineProps(oDialogProps)
const emit = defineEmits<ODialogEmits>()

const titleId = `o-dialog-title-${Math.random().toString(36).slice(2)}`
const descriptionId = `o-dialog-description-${Math.random().toString(36).slice(2)}`
const labelledBy = computed(() => (props.title ? titleId : undefined))
const describedBy = computed(() => (props.description ? descriptionId : undefined))

const close = (): void => {
  emit('update:open', false)
  emit('close')
}

const closeFromMask = (): void => {
  if (props.closeOnMask) close()
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && props.closeOnEsc) close()
}

watch(
  () => props.open,
  (open) => {
    if (typeof window === 'undefined') return

    if (open) {
      window.addEventListener('keydown', handleKeydown)
    } else {
      window.removeEventListener('keydown', handleKeydown)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="props.open" class="o-dialog__mask" @click="closeFromMask">
      <section
        class="o-dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="props.ariaLabel"
        :aria-labelledby="labelledBy"
        :aria-describedby="describedBy"
        @click.stop
      >
        <header v-if="props.title || $slots.header || props.description" class="o-dialog__header">
          <slot name="header">
            <h2 v-if="props.title" :id="titleId" class="o-dialog__title">{{ props.title }}</h2>
            <p v-if="props.description" :id="descriptionId" class="o-dialog__description">
              {{ props.description }}
            </p>
          </slot>
        </header>

        <div class="o-dialog__body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="o-dialog__footer">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>
