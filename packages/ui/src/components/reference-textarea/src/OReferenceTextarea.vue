<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue'
import { LuFileText, LuImage } from 'vue-icons-plus/lu'

import { OTextarea } from '../../textarea'
import {
  oReferenceTextareaProps,
  type OReferenceTextareaEmits,
  type OReferenceTextareaReference,
  type OReferenceTextareaReferenceKind,
  type OReferenceTextareaSlots,
} from './reference-textarea'

defineOptions({
  name: 'OReferenceTextarea',
  inheritAttrs: false,
})

const props = defineProps(oReferenceTextareaProps)
const emit = defineEmits<OReferenceTextareaEmits>()
const attrs = useAttrs()

defineSlots<OReferenceTextareaSlots>()

const textareaBindings = computed(() => ({
  modelValue: props.modelValue,
  rows: props.rows,
  autosize: props.autosize,
  showCount: props.showCount,
  disabled: props.disabled,
  readonly: props.readonly,
  invalid: props.invalid,
  ...(props.placeholder === undefined ? {} : { placeholder: props.placeholder }),
  ...(props.maxlength === undefined ? {} : { maxlength: props.maxlength }),
  ...(props.ariaLabel === undefined ? {} : { ariaLabel: props.ariaLabel }),
}))

const getTextareaBindings = () =>
  mergeProps(attrs, textareaBindings.value, { class: 'o-reference-textarea__field' })

const normalizeReferenceKind = (
  reference: OReferenceTextareaReference,
): OReferenceTextareaReferenceKind => (reference.kind === 'image' ? 'image' : 'text')

const getReferenceKey = (reference: OReferenceTextareaReference, index: number): string =>
  JSON.stringify([reference.id, index])
</script>

<template>
  <div
    class="o-reference-textarea"
    :class="{
      'is-disabled': props.disabled,
      'is-readonly': props.readonly,
      'is-invalid': props.invalid,
      'is-referenced': props.references.length > 0,
    }"
  >
    <OTextarea
      v-bind="getTextareaBindings()"
      @update:model-value="emit('update:modelValue', $event)"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />

    <ul v-if="props.references.length > 0" class="o-reference-textarea__references">
      <li
        v-for="(reference, index) in props.references"
        :key="getReferenceKey(reference, index)"
        class="o-reference-textarea__reference"
        :class="`o-reference-textarea__reference--${normalizeReferenceKind(reference)}`"
      >
        <slot name="reference" :reference="reference" :index="index">
          <span class="o-reference-textarea__reference-content">
            <img
              v-if="normalizeReferenceKind(reference) === 'image' && reference.thumbnailSrc"
              class="o-reference-textarea__thumbnail"
              :src="reference.thumbnailSrc"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <LuImage
              v-else-if="normalizeReferenceKind(reference) === 'image'"
              class="o-reference-textarea__reference-icon"
              aria-hidden="true"
            />
            <LuFileText v-else class="o-reference-textarea__reference-icon" aria-hidden="true" />
            <span class="o-reference-textarea__reference-label">{{ reference.label }}</span>
          </span>
        </slot>
      </li>
    </ul>
  </div>
</template>
