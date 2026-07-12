<script setup>
import ConfirmDialogBasic from '../../examples/confirm-dialog/Basic.vue'
</script>

# ConfirmDialog 确认弹窗

`OConfirmDialog` 组合 `ODialog` 与 `OButton`，用于表达一个需要使用方确认的 UI 意图。点击确认只发出 `confirm`，不会自动关闭、请求接口或执行任何业务操作；是否关闭由使用方控制。

## 基础与危险确认

<DemoBlock label="Confirm dialog variants">
  <ConfirmDialogBasic />
</DemoBlock>

危险确认会使用 `vue-icons-plus/lu` 的 Lucide 警告图标加强辨识。取消按钮默认获得安全初始焦点，危险操作不会被默认聚焦。

## Props

| 名称           | 类型                    | 默认值           | 说明                       |
| -------------- | ----------------------- | ---------------- | -------------------------- |
| open           | `boolean`               | `false`          | 受控打开状态               |
| title          | `string`                | —                | 标题                       |
| description    | `string`                | —                | 标题下方的补充说明         |
| tone           | `'neutral' \| 'danger'` | `'neutral'`      | 确认动作语气               |
| confirmLabel   | `string`                | `'Confirm'`      | 确认按钮文本               |
| cancelLabel    | `string`                | `'Cancel'`       | 取消按钮文本               |
| loading        | `boolean`               | `false`          | 确认按钮加载状态           |
| disabled       | `boolean`               | `false`          | 是否禁用确认按钮           |
| closeOnMask    | `boolean`               | `true`           | 点击遮罩是否请求关闭       |
| closeOnEsc     | `boolean`               | `true`           | 按 Esc 是否请求关闭        |
| showClose      | `boolean`               | `true`           | 是否显示右上角关闭按钮     |
| closeAriaLabel | `string`                | `'Close dialog'` | 关闭按钮的可访问名称       |
| ariaLabel      | `string`                | —                | 没有可见标题时的可访问名称 |

## Events 与 Slots

| 类型  | 名称          | 说明                                          |
| ----- | ------------- | --------------------------------------------- |
| Event | `update:open` | 遮罩、Esc、关闭按钮或取消按钮请求改变打开状态 |
| Event | `confirm`     | 点击确认按钮，参数为原始 `MouseEvent`         |
| Event | `cancel`      | 点击取消按钮，参数为原始 `MouseEvent`         |
| Slot  | `default`     | 确认内容                                      |
| Slot  | `details`     | 次级详情区域                                  |

遮罩、Esc 和右上角关闭按钮只属于关闭请求，不会伪造 `cancel` 鼠标事件。加载和禁用状态仅影响确认按钮，不会隐式修改关闭规则。
