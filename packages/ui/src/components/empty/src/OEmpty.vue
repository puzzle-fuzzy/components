<script setup lang="ts">
import { computed } from 'vue'

import { oEmptyProps, type OEmptySlots } from './empty'

defineOptions({ name: 'OEmpty' })

const props = defineProps(oEmptyProps)
const slots = defineSlots<OEmptySlots>()

const headingTag = computed(() => `h${props.titleLevel}`)
const hasHeader = computed(
  () =>
    Boolean(props.title) ||
    Boolean(props.description) ||
    Boolean(slots.title) ||
    Boolean(slots.description),
)
</script>

<template>
  <section
    class="o-empty"
    :class="[`o-empty--${props.size}`, `o-empty--media-${props.mediaVariant}`]"
    data-slot="empty"
    :data-size="props.size"
    :data-media-variant="props.mediaVariant"
  >
    <div v-if="slots.media" class="o-empty__media" data-slot="empty-media">
      <slot name="media" />
    </div>

    <header v-if="hasHeader" class="o-empty__header" data-slot="empty-header">
      <component
        :is="headingTag"
        v-if="props.title || slots.title"
        class="o-empty__title"
        data-slot="empty-title"
      >
        <slot name="title">{{ props.title }}</slot>
      </component>

      <div
        v-if="props.description || slots.description"
        class="o-empty__description"
        data-slot="empty-description"
      >
        <slot name="description">{{ props.description }}</slot>
      </div>
    </header>

    <div v-if="slots.default" class="o-empty__content" data-slot="empty-content">
      <slot />
    </div>

    <div v-if="slots.actions" class="o-empty__actions" data-slot="empty-actions">
      <slot name="actions" />
    </div>
  </section>
</template>
