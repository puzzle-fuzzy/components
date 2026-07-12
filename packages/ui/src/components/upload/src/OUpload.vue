<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  formatOUploadFileSize,
  getOUploadStateLabel,
  normalizeOUploadProgress,
  oUploadProps,
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

const visibleFiles = computed(() => props.files)
const hasFiles = computed(() => visibleFiles.value.length > 0)
const currentTitle = computed(() => (isDragging.value ? props.dragTitle : props.title))
const canSelectMore = computed(() => {
  if (props.disabled) return false
  if (props.maxCount === undefined) return true
  return visibleFiles.value.length < Math.max(0, Math.floor(props.maxCount))
})

const setDragging = (active: boolean): void => {
  if (props.disabled || isDragging.value === active) return
  isDragging.value = active
  emit('dragChange', active)
}

const chooseFiles = (): void => {
  if (!canSelectMore.value) return
  inputElement.value?.click()
}

const emitSelectedFiles = (files: FileList | readonly File[] | null): void => {
  if (!files || props.disabled) return

  const nextFiles = Array.from(files)
  const remaining =
    props.maxCount === undefined ? nextFiles.length : props.maxCount - props.files.length
  const limited = nextFiles.slice(0, Math.max(0, remaining))

  if (limited.length > 0) {
    emit('select', limited)
  }
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
  if (canSelectMore.value) setDragging(true)
}

const handleDragOver = (event: DragEvent): void => {
  event.preventDefault()
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
</script>

<template>
  <div
    class="o-upload"
    :class="{
      'is-dragging': isDragging,
      'is-disabled': props.disabled,
      'has-files': hasFiles,
    }"
  >
    <div
      class="o-upload__dropzone"
      :role="hasFiles ? undefined : 'button'"
      :tabindex="!hasFiles && canSelectMore ? 0 : -1"
      :aria-label="props.ariaLabel"
      :aria-disabled="props.disabled || undefined"
      @click="chooseFiles"
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
        :disabled="props.disabled"
        :aria-label="`${props.ariaLabel} file input`"
        tabindex="-1"
        @change="handleInputChange"
      />

      <div v-if="!hasFiles || props.empty" class="o-upload__empty">
        <span class="o-upload__icon" aria-hidden="true">
          <slot name="icon">
            <svg viewBox="0 0 24 24" focusable="false">
              <path
                d="M12 3.75 17.25 9l-1.06 1.06-3.44-3.43v9.62h-1.5V6.63l-3.44 3.43L6.75 9 12 3.75Z"
              />
              <path d="M5.5 17.25h13v1.5h-13v-1.5Z" />
            </svg>
          </slot>
        </span>
        <span class="o-upload__title">{{ currentTitle }}</span>
        <span class="o-upload__description">
          <slot name="empty">{{ props.description }}</slot>
        </span>
      </div>

      <div v-if="hasFiles" class="o-upload__list" :aria-label="props.listLabel" @click.stop>
        <div
          v-for="file in visibleFiles"
          :key="file.id"
          class="o-upload__file"
          :class="`o-upload__file--${file.state ?? 'queued'}`"
          :data-upload-file-id="file.id"
        >
          <div
            class="o-upload__file-progress"
            role="progressbar"
            :aria-label="`${file.file.name} 上传进度`"
            :aria-valuemin="0"
            :aria-valuemax="100"
            :aria-valuenow="Math.round(normalizeOUploadProgress(file.progress) * 100)"
            :aria-valuetext="getOUploadStateLabel(file)"
          >
            <span
              class="o-upload__file-progress-bar"
              :style="{ width: `${Math.round(normalizeOUploadProgress(file.progress) * 100)}%` }"
            />
          </div>

          <div class="o-upload__file-content">
            <slot name="file" :file="file">
              <span class="o-upload__file-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path
                    d="M6.75 3.5h7.19l3.31 3.31V20.5H6.75v-17Zm1.5 1.5v14h7.5V7.43L13.32 5H8.25Z"
                  />
                  <path d="M13 4.25h1.5V8h3.75v1.5H13V4.25Z" />
                </svg>
              </span>
              <span class="o-upload__file-name" :title="file.file.name">{{ file.file.name }}</span>
              <span class="o-upload__file-size">{{ formatOUploadFileSize(file.file.size) }}</span>
              <span class="o-upload__file-state">{{ getOUploadStateLabel(file) }}</span>
            </slot>
            <button
              v-if="!props.disabled"
              class="o-upload__remove"
              type="button"
              :aria-label="`移除 ${file.file.name}`"
              @click.stop="removeFile(file)"
            >
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path
                  d="m7.76 6.7 4.24 4.24 4.24-4.24 1.06 1.06L13.06 12l4.24 4.24-1.06 1.06L12 13.06 7.76 17.3 6.7 16.24 10.94 12 6.7 7.76 7.76 6.7Z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="!props.disabled" class="o-upload__actions">
          <button
            v-if="canSelectMore"
            class="o-upload__add"
            type="button"
            @click.stop="chooseFiles"
          >
            {{ props.actionText }}
          </button>
          <button
            v-if="props.clearable"
            class="o-upload__clear"
            type="button"
            @click.stop="clearFiles"
          >
            清空
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
