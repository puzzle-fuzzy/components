<script setup>
import ReferenceTextareaBasic from '../../examples/reference-textarea/Basic.vue'
import ReferenceTextareaReindex from '../../examples/reference-textarea/Reindex.vue'
import ReferenceTextareaStates from '../../examples/reference-textarea/States.vue'
</script>

# Reference Textarea 参考图提示词

`OReferenceTextarea` 是专门用于图片参考 Prompt 的组合组件。参考图位于输入框上方；在真实 textarea 中输入 `@` 选择图片后，组件会在当前光标处写入百炼可直接识别的 `[Image n]` 文本。

数组顺序是唯一映射来源：

```text
media[0] <-> [Image 1]
media[1] <-> [Image 2]
media[n] <-> [Image n + 1]
```

## 完整流程

<DemoBlock label="Reference image prompt workflow">
  <ReferenceTextareaBasic />
</DemoBlock>

上面的示例覆盖本地文件选择、受控图片列表、`@` 引用、图片预览和移除。组件只发出 `File[]` 与移除意图；示例代码负责对象 URL 和媒体数组。

## 删除与编号重排

<DemoBlock label="Controlled removal and token reindexing">
  <ReferenceTextareaReindex />
</DemoBlock>

删除中间图片后，位置更高的 token 必须同步减一。组件不会擅自修改 Prompt，可以在接受 `remove` 意图时调用公开纯函数：

```ts
import { reindexOReferenceTextareaTokens } from '@puzzle-fuzzy/ui'

prompt.value = reindexOReferenceTextareaTokens(prompt.value, removedIndex)
media.value = media.value.filter((_item, index) => index !== removedIndex)
```

该函数只处理精确的 `[Image N]`；格式错误、大小写不同和普通文本保持原样。

## 状态与主题

<DemoBlock label="Readonly disabled max-count and dark theme">
  <ReferenceTextareaStates />
</DemoBlock>

- `readonly` 保留图片预览，隐藏上传和移除入口。
- `disabled` 同时禁用编辑、上传、移除和预览。
- 达到 `maxCount` 后隐藏继续添加入口，但已有图片仍可通过 `@` 引用。

## 使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  OReferenceTextarea,
  reindexOReferenceTextareaTokens,
  type OReferenceTextareaMedia,
} from '@puzzle-fuzzy/ui'

const prompt = ref('[Image 1]中身着红色旗袍的女性')
const media = ref<OReferenceTextareaMedia[]>([
  {
    id: 'woman',
    src: '/reference/woman.webp',
    label: '红色旗袍人物',
    alt: '庭院中身着红色旗袍的女性参考图',
  },
])

const addFiles = (files: File[]) => {
  // 由使用方上传文件或创建本地预览，然后把结果追加到 media。
}

const removeMedia = (_item: OReferenceTextareaMedia, index: number) => {
  prompt.value = reindexOReferenceTextareaTokens(prompt.value, index)
  media.value = media.value.filter((_item, mediaIndex) => mediaIndex !== index)
}
</script>

<template>
  <OReferenceTextarea
    v-model="prompt"
    :media="media"
    aria-label="参考图提示词"
    @select="addFiles"
    @remove="removeMedia"
  />
</template>
```

也可以从子路径导入：

```ts
import {
  OReferenceTextarea,
  reindexOReferenceTextareaTokens,
  type OReferenceTextareaMedia,
} from '@puzzle-fuzzy/ui/reference-textarea'
```

## Media 类型

```ts
interface OReferenceTextareaMedia {
  readonly id: string
  readonly src: string
  readonly previewSrc?: string
  readonly label: string
  readonly alt?: string
}
```

- `src` 用于缩略图，`previewSrc` 可提供更清晰的预览地址。
- `label` 用于媒体编号旁的文本、`@` 过滤和选项名称。
- `alt` 未提供时回退到 `label`。
- `id` 用于渲染稳定性，编号始终由数组位置决定。

## Props

| 名称        | 类型                                                | 默认值      | 说明                                      |
| ----------- | --------------------------------------------------- | ----------- | ----------------------------------------- |
| modelValue  | `string`                                            | `''`        | Prompt 纯文本                             |
| media       | `readonly OReferenceTextareaMedia[]`                | `[]`        | 受控参考图，顺序决定 `[Image n]`          |
| accept      | `string`                                            | `'image/*'` | 原生 file input 的选择提示                |
| multiple    | `boolean`                                           | `true`      | 每次是否可以选择多个文件                  |
| maxCount    | `number`                                            | —           | 参考图数量上限                            |
| uploadable  | `boolean`                                           | `true`      | 是否显示上传入口                          |
| removable   | `boolean`                                           | `true`      | 是否显示移除入口                          |
| labels      | `Partial<OReferenceTextareaLabels>`                 | `{}`        | 可见文案与可访问名称                      |
| teleported  | `boolean`                                           | `true`      | `@` 选项是否 Teleport                     |
| teleportTo  | `string \| HTMLElement`                             | `'body'`    | `@` 选项挂载目标                          |
| variant     | `'soft' \| 'outline'`                               | `'soft'`    | 输入框表面                                |
| placeholder | `string`                                            | —           | 输入框占位文本                            |
| rows        | `number`                                            | `4`         | 固定模式行数，也是自动模式默认最小行数    |
| autosize    | `boolean \| { minRows?: number; maxRows?: number }` | `false`     | 随内容增长，可限制最小和最大行数          |
| maxlength   | `number`                                            | —           | 原生最大长度；完整 token 放不下时拒绝插入 |
| showCount   | `boolean`                                           | `false`     | 显示字数统计                              |
| readonly    | `boolean`                                           | `false`     | Prompt 与媒体列表只读，仍允许预览         |
| disabled    | `boolean`                                           | `false`     | 禁用整个组合组件                          |
| invalid     | `boolean`                                           | `false`     | 输入错误状态                              |
| ariaLabel   | `string`                                            | —           | 输入框可访问名称                          |

未声明的 textarea 原生属性和大多数原生监听器继续传递到内部真实 `<textarea>`。`select` 名称已用于文件选择事件，因此原生文本选择监听应在使用方通过其他输入/光标事件处理。

## Events

| 名称                | 参数                                     | 说明                                   |
| ------------------- | ---------------------------------------- | -------------------------------------- |
| `update:modelValue` | `string`                                 | Prompt 更新请求                        |
| `select`            | `File[]`                                 | 点击或拖放选择图片，不代表文件已经上传 |
| `remove`            | `OReferenceTextareaMedia, index: number` | 移除意图，不修改 `media` 或 Prompt     |
| `focus`             | `FocusEvent`                             | textarea 获得焦点                      |
| `blur`              | `FocusEvent`                             | textarea 失去焦点                      |

## Slots

| 名称            | 参数                              | 说明                |
| --------------- | --------------------------------- | ------------------- |
| `media`         | `{ media, index, token }`         | 自定义上方媒体项    |
| `mentionOption` | `{ media, index, token, active }` | 自定义 `@` 选项内容 |
| `upload`        | —                                 | 自定义上传入口内容  |

token 格式不可配置；slot 收到的 `token` 始终与当前数组位置一致。

## `@` 键盘交互

| 操作                    | 结果                               |
| ----------------------- | ---------------------------------- |
| 输入 `@`                | 展示全部参考图                     |
| 输入 `@2` 或 `@花瓶`    | 按 `[Image n]` 和 `label` 过滤     |
| `ArrowDown` / `ArrowUp` | 移动当前选项                       |
| `Enter` / `Tab`         | 在当前 `@query` 位置插入完整 token |
| `Escape`                | 关闭选项，焦点仍留在 textarea      |

`@` 必须位于文本开头或紧跟空白字符。IME composition 期间不会打开选项或提交中间值。选项使用 `listbox/option`、`aria-controls` 与 `aria-activedescendant`，视觉面板不会接管 textarea 焦点。

## 图片预览与边界

每个缩略图直接组合 `OImage`，因此继续使用 Image 自己的 Teleport 预览层；Reference Textarea 不复制预览逻辑，也不依赖 Dialog。

组件不会：

- 上传或持久化文件；
- 创建、撤销对象 URL 或构造百炼 `media` 请求；
- 自动删除媒体或改写 Prompt；
- 拖拽重排图片；
- 使用 `contenteditable`、富文本、镜像文本或输入框下方的引用列表；
- 保留旧版通用引用列表的兼容接口。
