<script setup lang="ts">
import {
  computed,
  mergeProps,
  nextTick,
  onMounted,
  ref,
  shallowRef,
  useAttrs,
  useId,
  watch,
  type ComponentPublicInstance,
} from 'vue'
import { LuImagePlus, LuPlus, LuX } from 'vue-icons-plus/lu'

import {
  useFileSelection,
  normalizeFileSelectionMaxCount,
} from '../../../composables/use-file-selection'
import { useFloatingPanel } from '../../../composables/use-floating-panel'
import { findFirstEnabledIndex, findNextEnabledIndex } from '../../../utils/collection-navigation'
import { OImage } from '../../image'
import { OTextarea } from '../../textarea'
import {
  oReferenceTextareaProps,
  resolveOReferenceTextareaLabels,
  type OReferenceTextareaEmits,
  type OReferenceTextareaMedia,
  type OReferenceTextareaSlots,
} from './reference-textarea'
import {
  findOReferenceTextareaMention,
  formatOReferenceTextareaToken,
  insertOReferenceTextareaToken,
  type OReferenceTextareaMention,
} from './reference-token'

defineOptions({
  name: 'OReferenceTextarea',
  inheritAttrs: false,
})

interface OReferenceTextareaCandidate {
  readonly media: OReferenceTextareaMedia
  readonly index: number
  readonly token: string
  readonly disabled: false
}

const props = defineProps(oReferenceTextareaProps)
const emit = defineEmits<OReferenceTextareaEmits>()
const attrs = useAttrs()

defineSlots<OReferenceTextareaSlots>()

const instanceId = useId()
const inputId = `o-reference-textarea-${instanceId}-input`
const listboxId = `o-reference-textarea-${instanceId}-listbox`
const textareaElement = shallowRef<HTMLTextAreaElement | null>(null)
const isTextareaFocused = ref(false)
const isComposing = ref(false)
const isDragging = ref(false)
const isMounted = ref(false)
const mention = shallowRef<OReferenceTextareaMention>()
const activeIndex = ref(-1)

onMounted(() => {
  isMounted.value = true
})

const labels = computed(() => resolveOReferenceTextareaLabels(props.labels))
const normalizedMaxCount = computed(() => normalizeFileSelectionMaxCount(props.maxCount))
const remainingCount = computed(() => {
  if (normalizedMaxCount.value === undefined) return Number.POSITIVE_INFINITY
  return Math.max(0, normalizedMaxCount.value - props.media.length)
})
const canSelectMore = computed(
  () => props.uploadable && !props.disabled && !props.readonly && remainingCount.value > 0,
)
const canRemove = computed(() => props.removable && !props.disabled && !props.readonly)

const candidates = computed<readonly OReferenceTextareaCandidate[]>(() => {
  const query = mention.value?.query.toLocaleLowerCase() ?? ''

  return props.media
    .map((item, index) => ({
      media: item,
      index,
      token: formatOReferenceTextareaToken(index),
      disabled: false as const,
    }))
    .filter(({ media: item, token }) =>
      `${token} ${item.label}`.toLocaleLowerCase().includes(query),
    )
})
const isMentionOpen = computed(
  () =>
    mention.value !== undefined &&
    candidates.value.length > 0 &&
    isTextareaFocused.value &&
    !props.disabled &&
    !props.readonly,
)

const closeMention = (): void => {
  mention.value = undefined
  activeIndex.value = -1
}

const floating = useFloatingPanel({
  isOpen: isMentionOpen,
  placement: computed(() => 'bottom-start'),
  matchReferenceWidth: true,
  onDismiss: closeMention,
})

const activeCandidate = computed(() => candidates.value[activeIndex.value])
const activeOptionId = computed(() =>
  isMentionOpen.value && activeCandidate.value
    ? `${listboxId}-option-${String(activeCandidate.value.index)}`
    : undefined,
)

watch(
  [isMentionOpen, candidates],
  ([open, nextCandidates]) => {
    if (!open) {
      activeIndex.value = -1
      return
    }

    if (activeIndex.value < 0 || activeIndex.value >= nextCandidates.length) {
      activeIndex.value = findFirstEnabledIndex(nextCandidates)
    }
  },
  { flush: 'sync' },
)

watch(canSelectMore, (available) => {
  if (!available) isDragging.value = false
})

watch(
  () => [props.disabled, props.readonly] as const,
  ([disabled, readonly]) => {
    if (disabled || readonly) closeMention()
  },
)

const { inputElement, chooseFiles, selectFiles, handleInputChange } = useFileSelection({
  canSelect: canSelectMore,
  multiple: computed(() => props.multiple),
  remainingCount,
  onSelect: (files) => emit('select', files),
})

const setInputElement = (element: Element | ComponentPublicInstance | null): void => {
  inputElement.value = element instanceof HTMLInputElement ? element : undefined
}

const setTextareaElement = (event: Event): HTMLTextAreaElement | null => {
  const element = event.currentTarget
  if (!(element instanceof HTMLTextAreaElement)) return null

  textareaElement.value = element
  floating.setReferenceElement(element)
  return element
}

const refreshMention = (element: HTMLTextAreaElement): void => {
  if (isComposing.value || props.disabled || props.readonly) {
    closeMention()
    return
  }

  mention.value = findOReferenceTextareaMention(
    element.value,
    element.selectionStart,
    element.selectionEnd,
  )
}

const handleNativeInput = (event: Event): void => {
  const element = setTextareaElement(event)
  if (element) refreshMention(element)
}

const handleNativeCaretChange = (event: Event): void => {
  const element = setTextareaElement(event)
  if (element) refreshMention(element)
}

const handleNativeCompositionStart = (event: CompositionEvent): void => {
  setTextareaElement(event)
  isComposing.value = true
  closeMention()
}

const handleNativeCompositionEnd = (event: CompositionEvent): void => {
  const element = setTextareaElement(event)
  void nextTick(() => {
    isComposing.value = false
    if (element) refreshMention(element)
  })
}

const selectCandidate = async (candidate: OReferenceTextareaCandidate): Promise<void> => {
  const element = textareaElement.value
  const currentMention = mention.value
  if (!element || !currentMention || props.disabled || props.readonly) return

  const insertion = insertOReferenceTextareaToken(element.value, currentMention, candidate.index)
  if (props.maxlength !== undefined && insertion.value.length > props.maxlength) return

  emit('update:modelValue', insertion.value)
  closeMention()
  await nextTick()

  if (props.modelValue !== insertion.value || element.value !== insertion.value) return
  element.focus({ preventScroll: true })
  element.setSelectionRange(insertion.caret, insertion.caret)
}

const handleNativeKeydown = (event: KeyboardEvent): void => {
  const element = setTextareaElement(event)
  if (!element || isComposing.value || !isMentionOpen.value) return

  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowUp': {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      activeIndex.value = findNextEnabledIndex(candidates.value, activeIndex.value, direction)
      break
    }
    case 'Enter':
    case 'Tab': {
      const candidate = activeCandidate.value
      if (!candidate) return
      event.preventDefault()
      void selectCandidate(candidate)
      break
    }
    case 'Escape':
      event.preventDefault()
      closeMention()
      break
  }
}

const handleFocus = (event: FocusEvent): void => {
  const element = setTextareaElement(event)
  isTextareaFocused.value = true
  if (element) refreshMention(element)
  emit('focus', event)
}

const handleBlur = (event: FocusEvent): void => {
  isTextareaFocused.value = false
  closeMention()
  emit('blur', event)
}

const textareaBindings = computed(() => ({
  modelValue: props.modelValue,
  variant: props.variant,
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
  mergeProps(attrs, textareaBindings.value, {
    class: 'o-reference-textarea__field',
    onInput: handleNativeInput,
    onClick: handleNativeCaretChange,
    onSelect: handleNativeCaretChange,
    onKeydown: handleNativeKeydown,
    onCompositionstart: handleNativeCompositionStart,
    onCompositionend: handleNativeCompositionEnd,
    'aria-autocomplete': isMentionOpen.value ? 'list' : undefined,
    'aria-haspopup': props.media.length > 0 ? 'listbox' : undefined,
    'aria-expanded': isMentionOpen.value ? 'true' : undefined,
    'aria-controls': isMentionOpen.value ? listboxId : undefined,
    'aria-activedescendant': activeOptionId.value,
  })

const handlePickerKeydown = (event: KeyboardEvent): void => {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  chooseFiles()
}

const handleDragEnter = (event: DragEvent): void => {
  event.preventDefault()
  if (canSelectMore.value) isDragging.value = true
}

const handleDragOver = (event: DragEvent): void => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = canSelectMore.value ? 'copy' : 'none'
  }
}

const handleDragLeave = (event: DragEvent): void => {
  const nextTarget = event.relatedTarget
  if (
    nextTarget instanceof Node &&
    event.currentTarget instanceof Node &&
    event.currentTarget.contains(nextTarget)
  ) {
    return
  }
  isDragging.value = false
}

const handleDrop = (event: DragEvent): void => {
  event.preventDefault()
  isDragging.value = false
  selectFiles(event.dataTransfer?.files ?? null)
}

const removeMedia = (item: OReferenceTextareaMedia, index: number): void => {
  if (!canRemove.value) return
  emit('remove', item, index)
}

const getMediaKey = (item: OReferenceTextareaMedia, index: number): string =>
  JSON.stringify([item.id, index])
const getOptionId = (candidate: OReferenceTextareaCandidate): string =>
  `${listboxId}-option-${String(candidate.index)}`
</script>

<template>
  <div
    class="o-reference-textarea"
    :class="{
      'is-disabled': props.disabled,
      'is-readonly': props.readonly,
      'is-invalid': props.invalid,
      'is-dragging': isDragging,
      'has-media': props.media.length > 0,
    }"
  >
    <section
      class="o-reference-textarea__media"
      :aria-label="labels.mediaList"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <input
        v-if="canSelectMore"
        :id="inputId"
        :ref="setInputElement"
        class="o-reference-textarea__input"
        type="file"
        :accept="props.accept"
        :multiple="props.multiple"
        aria-hidden="true"
        tabindex="-1"
        @click.stop
        @change="handleInputChange"
      />

      <ul v-if="props.media.length > 0" class="o-reference-textarea__media-list">
        <li
          v-for="(item, index) in props.media"
          :key="getMediaKey(item, index)"
          class="o-reference-textarea__media-item"
        >
          <slot
            name="media"
            :media="item"
            :index="index"
            :token="formatOReferenceTextareaToken(index)"
          >
            <div class="o-reference-textarea__preview">
              <OImage
                :src="item.src"
                :preview-src="item.previewSrc"
                :alt="item.alt ?? item.label"
                :preview-aria-label="
                  labels.mentionOption(item, index, formatOReferenceTextareaToken(index))
                "
                :disabled="props.disabled"
                fit="cover"
                loading="lazy"
              />
            </div>
            <span class="o-reference-textarea__media-copy">
              <span class="o-reference-textarea__media-token">
                {{ formatOReferenceTextareaToken(index) }}
              </span>
              <span class="o-reference-textarea__media-label" :title="item.label">
                {{ item.label }}
              </span>
            </span>
          </slot>

          <button
            v-if="canRemove"
            class="o-reference-textarea__remove"
            type="button"
            :aria-label="labels.remove(item, index)"
            @click="removeMedia(item, index)"
          >
            <LuX aria-hidden="true" />
          </button>
        </li>

        <li v-if="canSelectMore" class="o-reference-textarea__add-item">
          <label
            class="o-reference-textarea__picker o-reference-textarea__picker--compact"
            :for="inputId"
            role="button"
            tabindex="0"
            :aria-label="labels.add"
            @keydown="handlePickerKeydown"
          >
            <slot name="upload">
              <LuPlus class="o-reference-textarea__picker-icon" aria-hidden="true" />
              <span>{{ labels.add }}</span>
            </slot>
          </label>
        </li>
      </ul>

      <label
        v-else-if="canSelectMore"
        class="o-reference-textarea__picker o-reference-textarea__picker--empty"
        :for="inputId"
        role="button"
        tabindex="0"
        :aria-label="labels.upload"
        @keydown="handlePickerKeydown"
      >
        <slot name="upload">
          <span class="o-reference-textarea__picker-visual" aria-hidden="true">
            <LuImagePlus class="o-reference-textarea__picker-icon" aria-hidden="true" />
          </span>
          <span class="o-reference-textarea__picker-title">{{ labels.upload }}</span>
        </slot>
      </label>
    </section>

    <div class="o-reference-textarea__prompt">
      <OTextarea
        v-bind="getTextareaBindings()"
        @update:model-value="emit('update:modelValue', $event)"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>

    <Teleport :to="props.teleportTo" :disabled="!isMounted || !props.teleported">
      <Transition name="o-reference-textarea-mention">
        <div
          v-if="isMentionOpen"
          :id="listboxId"
          :ref="floating.setFloatingElement"
          class="o-reference-textarea__mention-list"
          :style="floating.floatingStyle.value"
          :data-placement="floating.resolvedPlacement.value"
          role="listbox"
          :aria-label="labels.mentionList"
        >
          <div
            v-for="(candidate, candidateIndex) in candidates"
            :id="getOptionId(candidate)"
            :key="getMediaKey(candidate.media, candidate.index)"
            class="o-reference-textarea__mention-option"
            :class="{ 'is-active': activeIndex === candidateIndex }"
            role="option"
            :aria-label="labels.mentionOption(candidate.media, candidate.index, candidate.token)"
            :aria-selected="activeIndex === candidateIndex"
            @pointerdown.prevent
            @pointerenter="activeIndex = candidateIndex"
            @click="selectCandidate(candidate)"
          >
            <slot
              name="mentionOption"
              :media="candidate.media"
              :index="candidate.index"
              :token="candidate.token"
              :active="activeIndex === candidateIndex"
            >
              <img
                class="o-reference-textarea__mention-image"
                :src="candidate.media.src"
                alt=""
                loading="lazy"
                decoding="async"
              />
              <span class="o-reference-textarea__mention-copy">
                <span class="o-reference-textarea__mention-token">{{ candidate.token }}</span>
                <span class="o-reference-textarea__mention-label">{{ candidate.media.label }}</span>
              </span>
            </slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
