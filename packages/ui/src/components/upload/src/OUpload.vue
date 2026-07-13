<script setup lang="ts">
import {
  computed,
  ref,
  useId,
  watch,
  type Component,
  type ComponentPublicInstance,
  type CSSProperties,
} from 'vue'
import {
  LuAlertCircle,
  LuCheckCircle2,
  LuClock3,
  LuFile,
  LuLoader2,
  LuPlus,
  LuTrash2,
  LuUpload,
  LuX,
} from 'vue-icons-plus/lu'

import {
  formatOUploadFileSize,
  getOUploadStateLabel,
  normalizeOUploadListMaxHeight,
  normalizeOUploadMaxCount,
  oUploadProps,
  resolveOUploadLabels,
  resolveOUploadProgress,
  type OUploadEmits,
  type OUploadFile,
  type OUploadSlots,
} from './upload'

import { useFileSelection } from '../../../composables/use-file-selection'

defineOptions({ name: 'OUpload' })

const props = defineProps(oUploadProps)
const emit = defineEmits<OUploadEmits>()

defineSlots<OUploadSlots>()

const isDragging = ref(false)
const inputId = `o-upload-${useId()}-input`

const stateIcons: Readonly<Record<NonNullable<OUploadFile['state']>, Component>> = {
  queued: LuClock3,
  uploading: LuLoader2,
  success: LuCheckCircle2,
  error: LuAlertCircle,
}

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
const selectionStyle = computed<CSSProperties>(() => ({
  '--omg-upload-list-max-height': normalizeOUploadListMaxHeight(props.listMaxHeight) ?? 'none',
}))

const { inputElement, chooseFiles, selectFiles, handleInputChange } = useFileSelection({
  canSelect: canSelectMore,
  multiple: computed(() => props.multiple),
  remainingCount,
  onSelect: (files) => emit('select', files),
})

const setInputElement = (element: Element | ComponentPublicInstance | null): void => {
  inputElement.value = element instanceof HTMLInputElement ? element : undefined
}

const setDragging = (active: boolean): void => {
  if (active && !canSelectMore.value) return
  if (isDragging.value === active) return

  isDragging.value = active
  emit('dragChange', active)
}

watch(canSelectMore, (available) => {
  if (!available) setDragging(false)
})

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
  selectFiles(event.dataTransfer?.files ?? null)
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
const getStateIcon = (file: OUploadFile): Component => stateIcons[file.state ?? 'queued']
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
    <input
      :id="inputId"
      :ref="setInputElement"
      class="o-upload__input"
      type="file"
      :accept="props.accept"
      :multiple="props.multiple"
      :disabled="!canSelectMore"
      aria-hidden="true"
      tabindex="-1"
      @click.stop
      @change="handleInputChange"
    />

    <label
      v-if="!hasFiles"
      class="o-upload__dropzone"
      :for="inputId"
      role="button"
      :tabindex="canSelectMore ? 0 : -1"
      :aria-label="labels.select"
      :aria-disabled="!canSelectMore || undefined"
      @keydown="handleDropzoneKeydown"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="o-upload__empty">
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
    </label>

    <div
      v-else
      class="o-upload__dropzone"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="o-upload__selection" :style="selectionStyle">
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
                <span class="o-upload__file-state">
                  <component
                    :is="getStateIcon(file)"
                    class="o-upload__state-icon"
                    :class="{ 'is-spinning': file.state === 'uploading' }"
                    aria-hidden="true"
                  />
                  {{ getStateLabel(file) }}
                </span>
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
            <LuPlus aria-hidden="true" />
            {{ labels.add }}
          </button>
          <button
            v-if="props.clearable"
            class="o-upload__clear"
            type="button"
            @click.stop="clearFiles"
          >
            <LuTrash2 aria-hidden="true" />
            {{ labels.clear }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
