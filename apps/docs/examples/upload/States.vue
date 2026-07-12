<script setup lang="ts">
import { OUpload, type OUploadFile, type OUploadLabels } from '@puzzle-fuzzy/ui'

const files: OUploadFile[] = [
  {
    id: 'brief',
    name: 'brand-brief.pdf',
    size: 1640 * 1024,
    state: 'queued',
  },
  {
    id: 'footage',
    name: 'product-footage.mov',
    size: 12 * 1024 * 1024,
    progress: 0.58,
    state: 'uploading',
  },
  {
    id: 'archive',
    name: 'source-assets.zip',
    size: 5.2 * 1024 * 1024,
    progress: 1,
    state: 'success',
  },
  {
    id: 'poster',
    name: 'poster-final.png',
    size: 780 * 1024,
    progress: 0.22,
    state: 'error',
  },
]

const labels = {
  select: '继续添加文件',
  description: '列表状态由外部上传任务驱动。',
  dragActive: '松开以选择文件',
  add: '添加更多文件',
  clear: '清空',
  list: '文件上传状态',
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
    <OUpload v-bind="{ files }" :labels="labels" clearable />
  </div>
</template>
