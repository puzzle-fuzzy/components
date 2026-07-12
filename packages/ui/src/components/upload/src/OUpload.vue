<script setup lang="ts">
import { computed, ref, watch, type CSSProperties } from 'vue'
import { LuFile, LuUpload, LuX } from 'vue-icons-plus/lu'

import {
  formatOUploadFileSize,
  getOUploadStateLabel,
  normalizeOUploadMaxCount,
  oUploadProps,
  resolveOUploadLabels,
  resolveOUploadProgress,
  type OUploadEmits,
  type OUploadFile,
  type OUploadSlots,
} from './upload'

defineOptions({ name: 'OUpload' })

const props = defineProps(oUploadProps)
const emit = defineEmits<OUploadEmits>()

defineSlots<OUploadSlots>()

const inputElement = ref<HTMLInputElement>()
const isDragging = ref(false)

const labels = computed(() => resolveOUploadLabels(props.labels))
const visibleFiles = computed(() => props.files)
const hasFiles = computed(() => visibleFiles.value.length > 0)
const normalizedMaxCount = computed(() => normalizeOUploadMaxCount(props.maxCount))
const remainingCount = computed(() => {
  if (normalizedMaxCount.value === undefined) return Number.POSITIVE_INFINITY
  return Math.max(0, normalizedMaxCount.value - visibleFiles.value.length)
})
const canSelectMore = computed(() => !props.disabled && remainingCount.value > 0)
const currentTitle = computed(() =>
  isDragging.value ? labels.value.dragActive : labels.value.select,
)

const setDragging = (active: boolean): void => {
  if (active && !canSelectMore.value) return
  if (isDragging.value === active) return

  isDragging.value = active
  emit('dragChange', active)
}

watch(canSelectMore, (available) => {
  if (!available) setDragging(false)
})

const chooseFiles = (): void => {
  if (!canSelectMore.value) return
  inputElement.value?.click()
}

const handleDropzoneClick = (): void => {
  if (!hasFiles.value) chooseFiles()
}

const emitSelectedFiles = (files: FileList | readonly File[] | null): void => {
  if (!files || !canSelectMore.value) return

  const selectionLimit = props.multiple ? remainingCount.value : Math.min(1, remainingCount.value)
  const selectedFiles = Array.from(files).slice(0, selectionLimit)

  if (selectedFiles.length > 0) emit('select', selectedFiles)
}

const handleInputChange = (event: Event): void => {
  const input = event.target as HTMLInputElement
  emitSelectedFiles(input.files)
  input.value = ''
}

const handleDropzoneKeydown = (event: KeyboardEvent): void => {
  if (event.key !== 'Enter' && event.key !== ' ') return

  event.preventDefault()
  chooseFiles()
}

const handleDragEnter = (event: DragEvent): void => {
  event.preventDefault()
  setDragging(true)
}

const handleDragOver = (event: DragEvent): void => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = canSelectMore.value ? 'copy' : 'none'
  }
}

const handleDragLeave = (event: DragEvent): void => {
  const nextTarget = event.relatedTarget
  if (nextTarget instanceof Node && event.currentTarget instanceof Node) {
    if (event.currentTarget.contains(nextTarget)) return
  }

  setDragging(false)
}

const handleDrop = (event: DragEvent): void => {
  event.preventDefault()
  setDragging(false)
  emitSelectedFiles(event.dataTransfer?.files ?? null)
}

const removeFile = (file: OUploadFile): void => {
  if (props.disabled) return
  emit('remove', file)
}

const clearFiles = (): void => {
  if (props.disabled) return
  emit('clear')
}

const getProgressPercentage = (file: OUploadFile): number | undefined => {
  const progress = resolveOUploadProgress(file)
  return progress === undefined ? undefined : Math.round(progress * 100)
}

const getProgressStyle = (file: OUploadFile): CSSProperties => ({
  '--omg-upload-progress': resolveOUploadProgress(file) ?? 0,
})

const getStateLabel = (file: OUploadFile): string => getOUploadStateLabel(file, labels.value)
</script>

<template>
  <div
    class="o-upload"
    :class="{
      'is-dragging': isDragging,
      'is-disabled': props.disabled,
      'is-selection-disabled': !canSelectMore,
      'has-files': hasFiles,
    }"
  >
    <div
      class="o-upload__dropzone"
      :role="hasFiles ? undefined : 'button'"
      :tabindex="!hasFiles && canSelectMore ? 0 : -1"
      :aria-label="labels.select"
      :aria-disabled="!canSelectMore || undefined"
      @click="handleDropzoneClick"
      @keydown="handleDropzoneKeydown"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <input
        ref="inputElement"
        class="o-upload__input"
        type="file"
        :accept="props.accept"
        :multiple="props.multiple"
        :disabled="!canSelectMore"
        aria-hidden="true"
        tabindex="-1"
        @change="handleInputChange"
      />

      <div v-if="!hasFiles" class="o-upload__empty">
        <span class="o-upload__icon" aria-hidden="true">
          <slot name="icon">
            <LuUpload class="o-upload__icon-svg" aria-hidden="true" />
          </slot>
        </span>
        <span class="o-upload__title">{{ currentTitle }}</span>
        <span class="o-upload__description">
          <slot name="empty">{{ labels.description }}</slot>
        </span>
      </div>

      <div v-if="hasFiles" class="o-upload__selection" @click.stop>
        <ul class="o-upload__list" :aria-label="labels.list">
          <li
            v-for="file in visibleFiles"
            :key="file.id"
            class="o-upload__file"
            :class="`o-upload__file--${file.state ?? 'queued'}`"
            :data-upload-file-id="file.id"
          >
            <div
              class="o-upload__file-progress"
              :class="{ 'is-indeterminate': getProgressPercentage(file) === undefined }"
              role="progressbar"
              :aria-label="labels.progress(file.name)"
              :aria-valuemin="0"
              :aria-valuemax="100"
              :aria-valuenow="getProgressPercentage(file)"
              :aria-valuetext="getStateLabel(file)"
            >
              <span class="o-upload__file-progress-bar" :style="getProgressStyle(file)" />
            </div>

            <div class="o-upload__file-content">
              <slot name="file" :file="file">
                <span class="o-upload__file-icon" aria-hidden="true">
                  <LuFile class="o-upload__file-icon-svg" aria-hidden="true" />
                </span>
                <span class="o-upload__file-name" :title="file.name">{{ file.name }}</span>
                <span v-if="file.size !== undefined" class="o-upload__file-size">
                  {{ formatOUploadFileSize(file.size) }}
                </span>
                <span class="o-upload__file-state">{{ getStateLabel(file) }}</span>
              </slot>
              <button
                v-if="!props.disabled"
                class="o-upload__remove"
                type="button"
                :aria-label="labels.remove(file.name)"
                @click.stop="removeFile(file)"
              >
                <LuX class="o-upload__remove-icon" aria-hidden="true" />
              </button>
            </div>
          </li>
        </ul>

        <div v-if="!props.disabled" class="o-upload__actions">
          <button
            v-if="canSelectMore"
            class="o-upload__add"
            type="button"
            @click.stop="chooseFiles"
          >
            {{ labels.add }}
          </button>
          <button
            v-if="props.clearable"
            class="o-upload__clear"
            type="button"
            @click.stop="clearFiles"
          >
            {{ labels.clear }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
