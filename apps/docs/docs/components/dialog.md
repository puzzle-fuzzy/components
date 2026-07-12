<script setup>
import DialogBasic from '../../examples/dialog/Basic.vue'
</script>

# Dialog 对话框

`ODialog` 基于原生 `<dialog>`，由浏览器提供 top layer、背景隔离与焦点约束，适合阅读和自定义短流程。表面不使用边框，通过遮罩、圆角和语义阴影建立层级。点击遮罩、默认关闭按钮或按 Esc 会请求关闭；`open` 仍由使用方通过 `v-model:open` 控制。标准确认与表单场景可分别使用 `OConfirmDialog` 和 `OFormDialog`。

## 基础用法

<DemoBlock label="Dialog overlay">
  <DialogBasic />
</DemoBlock>

## Props

| 名称           | 类型      | 默认值           | 说明                     |
| -------------- | --------- | ---------------- | ------------------------ |
| open           | `boolean` | `false`          | 是否打开                 |
| title          | `string`  | —                | 标题                     |
| description    | `string`  | —                | 描述文本                 |
| closeOnMask    | `boolean` | `true`           | 点击遮罩关闭             |
| closeOnEsc     | `boolean` | `true`           | 按 Esc 关闭              |
| showClose      | `boolean` | `true`           | 是否显示默认关闭按钮     |
| closeAriaLabel | `string`  | `'Close dialog'` | 默认关闭按钮的可访问名称 |
| ariaLabel      | `string`  | —                | 覆盖标题生成的可访问名称 |

## Events 与 Slots

| 类型  | 名称          | 说明         |
| ----- | ------------- | ------------ |
| Event | `update:open` | 打开状态变化 |
| Event | `close`       | 请求关闭     |
| Slot  | `header`      | 自定义头部   |
| Slot  | `default`     | 内容         |
| Slot  | `footer`      | 底部操作区   |

自定义头部没有可见标题时，请通过 `ariaLabel` 提供明确的对话框名称。传入组件的 `class`、`style` 和 `data-*` 会合并到原生 `<dialog>` surface。
