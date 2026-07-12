<script setup>
import UploadBasic from '../../examples/upload/Basic.vue'
import UploadStates from '../../examples/upload/States.vue'
</script>

# Upload 文件上传

`OUpload` 提供文件选择、拖拽高亮和上传列表展示。组件只处理 UI 与选择事件，文件校验、真实上传、重试和持久化由业务层完成。

## 基础用法

<DemoBlock label="Upload click and drag selection">
  <UploadBasic />
</DemoBlock>

## 列表状态

<DemoBlock label="Upload file list states">
  <UploadStates />
</DemoBlock>

## 使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { OUpload, type OUploadFile } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'

const files = ref<OUploadFile[]>([])

const addFiles = (nextFiles: File[]) => {
  files.value = [
    ...files.value,
    ...nextFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      state: 'queued' as const,
    })),
  ]
}
</script>

<template>
  <OUpload v-bind="{ files }" multiple clearable @select="addFiles" />
</template>
```

## Props

| 名称        | 类型            | 默认值                | 说明                        |
| ----------- | --------------- | --------------------- | --------------------------- |
| files       | `OUploadFile[]` | `[]`                  | 受控文件列表                |
| title       | `string`        | `'点击选择文件'`      | 默认标题                    |
| description | `string`        | `'拖拽文件到这里...'` | 默认说明                    |
| dragTitle   | `string`        | `'松开以上传'`        | 拖拽激活时标题              |
| actionText  | `string`        | `'添加更多文件'`      | 列表下方追加按钮文案        |
| accept      | `string`        | —                     | 原生 file input accept      |
| multiple    | `boolean`       | `false`               | 允许多选                    |
| disabled    | `boolean`       | `false`               | 禁用选择、拖拽和列表操作    |
| maxCount    | `number`        | —                     | 基于当前 files 限制新增数量 |
| empty       | `boolean`       | `false`               | 有文件时仍展示空状态区域    |
| clearable   | `boolean`       | `false`               | 显示清空按钮                |
| ariaLabel   | `string`        | `'Select files'`      | 选择区域的可访问名称        |
| listLabel   | `string`        | `'Selected files'`    | 文件列表的可访问名称        |

## 类型

```ts
type OUploadFileState = 'queued' | 'uploading' | 'success' | 'error'

interface OUploadFile {
  id: string
  file: File
  state?: OUploadFileState
  progress?: number
}
```

## Events 与 Slots

| 类型  | 名称         | 说明                                |
| ----- | ------------ | ----------------------------------- |
| Event | `select`     | 点击或拖拽选择文件，参数为 `File[]` |
| Event | `remove`     | 点击单行移除按钮，参数为当前文件项  |
| Event | `clear`      | 点击清空按钮                        |
| Event | `dragChange` | 拖拽激活状态变化，参数为 `boolean`  |
| Slot  | `icon`       | 自定义空状态图标                    |
| Slot  | `empty`      | 自定义空状态说明                    |
| Slot  | `file`       | 自定义文件行内容，参数 `{ file }`   |

## 可访问性

选择区域使用 `role="button"`，支持 Enter 与 Space 触发文件选择。文件进度使用 `progressbar` 语义，并提供百分比与状态文本。
