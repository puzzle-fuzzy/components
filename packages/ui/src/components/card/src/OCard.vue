<script setup lang="ts">
import { computed } from 'vue'

import { oCardProps, type OCardSlots } from './card'

defineOptions({ name: 'OCard' })

const props = defineProps(oCardProps)
const slots = defineSlots<OCardSlots>()

const headingTag = computed(() => `h${props.titleLevel}`)
const hasHeader = computed(
  () =>
    Boolean(props.title) ||
    Boolean(props.description) ||
    Boolean(slots.title) ||
    Boolean(slots.description) ||
    Boolean(slots.action),
)
</script>

<template>
  <article
    class="o-card"
    :class="[`o-card--${props.variant}`, `o-card--${props.size}`]"
    data-slot="card"
    :data-variant="props.variant"
    :data-size="props.size"
  >
    <header v-if="hasHeader" class="o-card__header" data-slot="card-header">
      <div class="o-card__copy">
        <component
          :is="headingTag"
          v-if="props.title || slots.title"
          class="o-card__title"
          data-slot="card-title"
        >
          <slot name="title">{{ props.title }}</slot>
        </component>

        <div
          v-if="props.description || slots.description"
          class="o-card__description"
          data-slot="card-description"
        >
          <slot name="description">{{ props.description }}</slot>
        </div>
      </div>

      <div v-if="slots.action" class="o-card__action" data-slot="card-action">
        <slot name="action" />
      </div>
    </header>

    <div v-if="slots.default" class="o-card__content" data-slot="card-content">
      <slot />
    </div>

    <footer v-if="slots.footer" class="o-card__footer" data-slot="card-footer">
      <slot name="footer" />
    </footer>
  </article>
</template>
