<script setup>
import FormDialogBasic from '../../examples/form-dialog/Basic.vue'
</script>

# FormDialog 表单弹窗

`OFormDialog` 在 `ODialog` 中保留真正的 `<form>`，并通过原生 `form` 属性把底部提交按钮与表单关联。浏览器先执行约束校验，校验通过后组件阻止页面跳转并发出原始 `SubmitEvent`；数据、验证规则和保存行为始终由使用方管理。

## 基础用法

<DemoBlock label="Native form dialog">
  <FormDialogBasic />
</DemoBlock>

## Props

| 名称           | 类型      | 默认值           | 说明                       |
| -------------- | --------- | ---------------- | -------------------------- |
| open           | `boolean` | `false`          | 受控打开状态               |
| title          | `string`  | —                | 标题                       |
| description    | `string`  | —                | 标题下方的补充说明         |
| submitLabel    | `string`  | `'Submit'`       | 提交按钮文本               |
| cancelLabel    | `string`  | `'Cancel'`       | 取消按钮文本               |
| loading        | `boolean` | `false`          | 提交按钮加载状态           |
| submitDisabled | `boolean` | `false`          | 是否禁用提交按钮           |
| closeOnMask    | `boolean` | `true`           | 点击遮罩是否请求关闭       |
| closeOnEsc     | `boolean` | `true`           | 按 Esc 是否请求关闭        |
| showClose      | `boolean` | `true`           | 是否显示右上角关闭按钮     |
| closeAriaLabel | `string`  | `'Close dialog'` | 关闭按钮的可访问名称       |
| ariaLabel      | `string`  | —                | 没有可见标题时的可访问名称 |

## Events 与 Slots

| 类型  | 名称          | 说明                                           |
| ----- | ------------- | ---------------------------------------------- |
| Event | `update:open` | 请求改变打开状态                               |
| Event | `submit`      | 原生校验通过后的 `SubmitEvent`，默认跳转已阻止 |
| Event | `cancel`      | 点击取消按钮时的原始 `MouseEvent`              |
| Slot  | `default`     | 使用方拥有的表单控件                           |

`OFormDialog` 不会序列化字段、不保存数据，也不会把服务器错误映射为表单状态。可直接在默认插槽中组合 `OInput`、`OCheckbox`、`ORadioGroup`、`ORadio` 或原生表单元素。
