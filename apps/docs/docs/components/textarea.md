<script setup>
import TextareaBasic from '../../examples/textarea/Basic.vue'
</script>

# Textarea 多行输入

`OTextarea` 是基础多行文本输入，支持固定高度或按内容增长，也支持受控值、字数统计、禁用、只读和错误状态。组件会把未声明的原生 textarea 属性与监听器绑定到真实的 `<textarea>`，可以直接使用 `id`、`name`、`required`、`aria-describedby`、`@change` 等原生能力。

默认 `soft` 外观使用浅色表面和透明的 1px 预留边界，只在 focus / invalid 时呈现语义边界；`outline` 则始终显示边界。hover、focus、readonly、disabled 与 invalid 都由同一状态表驱动，不会改变高度模式或原生编辑行为。

组件始终关闭浏览器右下角的原生尺寸拖拽手柄。固定模式在内容超出时使用经过统一样式处理的原生滚动区域；自动高度模式仍保留真实的文本编辑元素，不使用列表虚拟化，因此不会破坏选择、输入法、剪贴板和移动端键盘行为。

## 基础用法

<DemoBlock label="Textarea basic">
  <TextareaBasic />
</DemoBlock>

## Props

| 名称        | 类型                                                | 默认值   | 说明                                         |
| ----------- | --------------------------------------------------- | -------- | -------------------------------------------- |
| modelValue  | `string`                                            | `''`     | 当前值                                       |
| placeholder | `string`                                            | —        | 占位文本                                     |
| variant     | `'soft' \| 'outline'`                               | `'soft'` | 浅色无边框默认态或常显边界                   |
| rows        | `number`                                            | `4`      | 固定模式的行数，也是自动模式的默认最小行数   |
| autosize    | `boolean \| { minRows?: number; maxRows?: number }` | `false`  | 是否按内容增长；对象形式可限定最小和最大行数 |
| maxlength   | `number`                                            | —        | 最大长度                                     |
| showCount   | `boolean`                                           | `false`  | 显示字数统计                                 |
| disabled    | `boolean`                                           | `false`  | 禁用                                         |
| readonly    | `boolean`                                           | `false`  | 只读                                         |
| invalid     | `boolean`                                           | `false`  | 错误状态                                     |
| ariaLabel   | `string`                                            | —        | 可访问名称                                   |

## 高度模式

- `autosize=false`：高度由 `rows` 决定，超出内容在 textarea 内滚动。
- `autosize=true`：从 `rows` 指定的行数开始随内容增长，不设置内部滚动上限。
- `autosize={ minRows, maxRows }`：在指定行数范围内增长，达到 `maxRows` 后恢复内部滚动。
- 非法、非有限或小于 1 的行数会回退到安全值；`maxRows` 小于 `minRows` 时会自动对齐到 `minRows`。

## Events

| 名称                | 说明     |
| ------------------- | -------- |
| `update:modelValue` | 值变化   |
| `focus`             | 获得焦点 |
| `blur`              | 失去焦点 |

## 可访问性

- 推荐使用原生 `<label for="...">` 与传入组件的 `id` 建立可访问名称。
- 开启 `showCount` 后，组件会使用 SSR-safe ID 自动把计数器合并到 textarea 的 `aria-describedby`，不会覆盖已有的帮助文本关联。
- `invalid` 会设置 `aria-invalid="true"`；具体错误文案应由表单层提供，并通过 `aria-describedby` 或 `aria-errormessage` 关联。
- `maxlength` 与计数器均遵循原生 textarea 的 UTF-16 code-unit 长度语义。
