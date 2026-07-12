<script setup>
import UploadBasic from '../../examples/upload/Basic.vue'
import UploadStates from '../../examples/upload/States.vue'
</script>

# Upload 文件上传

`OUpload` 提供文件选择、拖拽高亮和上传列表展示。组件只处理 UI 与选择事件，文件校验、真实上传、重试和持久化由业务层完成。受控列表只接收 SSR-safe 展示元数据，原生 `File[]` 仅由 `select` 事件交给业务层。

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
import { OUpload, type OUploadFile, type OUploadLabels } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'

const files = ref<OUploadFile[]>([])

const addFiles = (nextFiles: File[]) => {
  files.value = [
    ...files.value,
    ...nextFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      state: 'queued' as const,
    })),
  ]
}

const labels = {
  select: '选择文件',
  description: '拖拽文件到这里，或点击选择',
  dragActive: '松开以选择文件',
  add: '添加更多文件',
  clear: '清空',
  list: '已选文件',
  queued: '等待上传',
  uploading: (percentage) => (percentage === undefined ? '上传中' : `${percentage}%`),
  success: '已完成',
  error: '上传失败',
  remove: (name) => `移除 ${name}`,
  progress: (name) => `${name} 上传进度`,
} satisfies OUploadLabels
</script>

<template>
  <OUpload v-bind="{ files }" :labels="labels" multiple clearable @select="addFiles" />
</template>
```

## Props

| 名称          | 类型                     | 默认值  | 说明                                      |
| ------------- | ------------------------ | ------- | ----------------------------------------- |
| files         | `readonly OUploadFile[]` | `[]`    | 受控展示元数据列表，不包含原生 `File`     |
| labels        | `Partial<OUploadLabels>` | `{}`    | 覆盖可见文案、状态格式与可访问名称        |
| accept        | `string`                 | —       | 原生 file input accept，仅作为选择提示    |
| multiple      | `boolean`                | `false` | 每次选择或拖放是否允许多个文件            |
| disabled      | `boolean`                | `false` | 禁用选择、拖拽和列表操作                  |
| maxCount      | `number`                 | —       | 非负整数上限，小数向下取整，Infinity 不限 |
| listMaxHeight | `number \| string`       | `320`   | 文件列表最大高度，数字按像素处理          |
| clearable     | `boolean`                | `false` | 显示清空按钮                              |

## 类型

```ts
type OUploadFileState = 'queued' | 'uploading' | 'success' | 'error'

interface OUploadFile {
  readonly id: string
  readonly name: string
  readonly size?: number
  readonly state?: OUploadFileState
  readonly progress?: number
}
```

`progress` 使用 `0` 到 `1`。`success` 始终表现为 100%，`queued` 始终表现为 0%；`uploading` 或 `error` 未提供进度时使用不确定进度语义，不会错误宣读为 0%。

`OUploadLabels` 集中管理 `select`、`description`、`dragActive`、`add`、`clear`、`list`、四种状态文案，以及 `remove(name)`、`progress(name)`。可以只传需要覆盖的字段。

## Events 与 Slots

| 类型  | 名称          | 说明                                |
| ----- | ------------- | ----------------------------------- |
| Event | `select`      | 点击或拖拽选择文件，参数为 `File[]` |
| Event | `remove`      | 点击单行移除按钮，参数为当前文件项  |
| Event | `clear`       | 点击清空按钮                        |
| Event | `drag-change` | 拖拽激活状态变化，参数为 `boolean`  |
| Slot  | `icon`        | 自定义空状态图标                    |
| Slot  | `empty`       | 自定义空状态说明                    |
| Slot  | `file`        | 自定义文件行内容，参数 `{ file }`   |

## 可访问性

空状态选择区域使用与原生 file input 关联的 label，并支持 Enter 与 Space；input 位于点击区域之外，避免程序点击冒泡后递归打开选择器。出现文件后改由“添加更多文件”按钮继续选择。文件列表保留完整的原生 list/listitem 结构，并在超过 `listMaxHeight` 后使用统一的原生滚动条，因此所有移除按钮仍在键盘和读屏顺序中。文件进度使用 `progressbar` 语义，确定进度提供百分比，不确定进度省略 `aria-valuenow`。所有动画在 `prefers-reduced-motion` 下关闭，粗指针设备的列表操作按钮至少为 44px。
