<script setup lang="ts">
import { ref } from 'vue'
import { OUpload, type OUploadFile, type OUploadLabels } from '@puzzle-fuzzy/ui'

const files = ref<OUploadFile[]>([])

const addFiles = (nextFiles: File[]) => {
  const timestamp = Date.now()
  files.value = [
    ...files.value,
    ...nextFiles.map((file, index) => ({
      id: `${timestamp}-${index}-${file.name}`,
      name: file.name,
      size: file.size,
      progress: 0,
      state: 'queued' as const,
    })),
  ]
}

const removeFile = (target: OUploadFile) => {
  files.value = files.value.filter((file) => file.id !== target.id)
}

const labels = {
  select: '上传项目附件',
  description: '拖拽文件到这里，或点击选择；真实上传由业务层处理。',
  dragActive: '松开以选择文件',
  add: '添加更多文件',
  clear: '清空',
  list: '已选项目附件',
  queued: '等待上传',
  uploading: (percentage) => (percentage === undefined ? '上传中' : `${percentage}%`),
  success: '已完成',
  error: '上传失败',
  remove: (name) => `移除 ${name}`,
  progress: (name) => `${name} 上传进度`,
} satisfies OUploadLabels
</script>

<template>
  <div class="omg-example-stack">
    <OUpload
      v-bind="{ files }"
      :labels="labels"
      multiple
      clearable
      @select="addFiles"
      @remove="removeFile"
      @clear="files = []"
    />
  </div>
</template>
