<script setup lang="ts">
import { OUpload, type OUploadFile } from '@puzzle-fuzzy/ui'

const createFile = (name: string, size: number, type = 'application/octet-stream'): File => {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', {
    configurable: true,
    value: size,
  })
  return file
}

const files: OUploadFile[] = [
  {
    id: 'brief',
    file: createFile('brand-brief.pdf', 1640 * 1024, 'application/pdf'),
    state: 'queued',
  },
  {
    id: 'footage',
    file: createFile('product-footage.mov', 12 * 1024 * 1024, 'video/quicktime'),
    progress: 0.58,
    state: 'uploading',
  },
  {
    id: 'archive',
    file: createFile('source-assets.zip', 5.2 * 1024 * 1024, 'application/zip'),
    progress: 1,
    state: 'success',
  },
  {
    id: 'poster',
    file: createFile('poster-final.png', 780 * 1024, 'image/png'),
    progress: 0.22,
    state: 'error',
  },
]
</script>

<template>
  <div class="omg-example-stack">
    <OUpload
      v-bind="{ files }"
      title="继续添加文件"
      description="列表状态可由业务上传任务驱动。"
      list-label="文件上传状态"
      aria-label="上传状态示例"
      clearable
    />
  </div>
</template>
