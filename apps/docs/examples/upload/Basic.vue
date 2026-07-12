<script setup lang="ts">
import { ref } from 'vue'
import { OUpload, type OUploadFile } from '@puzzle-fuzzy/ui'

const files = ref<OUploadFile[]>([])

const addFiles = (nextFiles: File[]) => {
  const timestamp = Date.now()
  files.value = [
    ...files.value,
    ...nextFiles.map((file, index) => ({
      id: `${timestamp}-${index}-${file.name}`,
      file,
      progress: 0,
      state: 'queued' as const,
    })),
  ]
}

const removeFile = (target: OUploadFile) => {
  files.value = files.value.filter((file) => file.id !== target.id)
}
</script>

<template>
  <div class="omg-example-stack">
    <OUpload
      v-bind="{ files }"
      multiple
      accept="image/*,.pdf,.zip"
      aria-label="上传项目附件"
      title="点击选择附件"
      description="拖拽文件到这里，或点击选择；真实上传由业务层处理。"
      clearable
      @select="addFiles"
      @remove="removeFile"
      @clear="files = []"
    />
  </div>
</template>
