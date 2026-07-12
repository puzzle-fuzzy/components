<script setup>
import ReferenceTextareaBasic from '../../examples/reference-textarea/Basic.vue'
</script>

# Reference Textarea 引用输入

`OReferenceTextarea` 在 `OTextarea` 下方展示一组受控引用。它不解析输入文本，也不认识成员、文件或任何业务协议；引用的来源、状态和业务含义由使用方管理。

默认渲染器支持简洁的文本引用与可选图片缩略图；没有缩略图时使用 `vue-icons-plus/lu` 的文件或图片图标。需要其他表现时，使用 `reference` slot 完整控制单项内容。

## 基础用法

<DemoBlock label="Reference textarea">
  <ReferenceTextareaBasic />
</DemoBlock>

## Reference 类型

```ts
interface OReferenceTextareaReference {
  readonly id: string
  readonly label: string
  readonly kind?: 'text' | 'image'
  readonly thumbnailSrc?: string
}
```

`id` 应尽量保持稳定且唯一；组件也能安全渲染重复 ID，不会产生重复 Vue key。

## Props

| 名称        | 类型                                                | 默认值  | 说明                                       |
| ----------- | --------------------------------------------------- | ------- | ------------------------------------------ |
| modelValue  | `string`                                            | `''`    | 当前文本                                   |
| references  | `readonly OReferenceTextareaReference[]`            | `[]`    | 由使用方控制的通用引用列表                 |
| placeholder | `string`                                            | —       | 占位文本                                   |
| rows        | `number`                                            | `4`     | 固定模式的行数，也是自动模式的默认最小行数 |
| autosize    | `boolean \| { minRows?: number; maxRows?: number }` | `false` | 是否随内容增长，可选最小与最大行数         |
| maxlength   | `number`                                            | —       | 最大长度                                   |
| showCount   | `boolean`                                           | `false` | 显示字数统计                               |
| disabled    | `boolean`                                           | `false` | 禁用                                       |
| readonly    | `boolean`                                           | `false` | 只读                                       |
| invalid     | `boolean`                                           | `false` | 错误状态                                   |
| ariaLabel   | `string`                                            | —       | 可访问名称                                 |

## Events

| 名称                | 说明     |
| ------------------- | -------- |
| `update:modelValue` | 值变化   |
| `focus`             | 获得焦点 |
| `blur`              | 失去焦点 |

## Slots

| 名称        | 参数                   | 说明              |
| ----------- | ---------------------- | ----------------- |
| `reference` | `{ reference, index }` | 自定义单项引用 UI |

```vue
<OReferenceTextarea v-model="message" :references="references">
  <template #reference="{ reference, index }">
    <span>{{ index + 1 }}. {{ reference.label }}</span>
  </template>
</OReferenceTextarea>
```

## 原生 textarea 契约

未声明的原生属性和监听器会继续传递到内部真实 `<textarea>`。固定高度、自动增长、统一滚动条和隐藏原生拖拽手柄的行为均由 `OTextarea` 提供；计数器使用 SSR-safe ID 与输入框关联，受控值、IME composition、焦点和失焦行为也与 `OTextarea` 保持一致。
