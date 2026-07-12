<script setup>
import DialogBasic from '../../examples/dialog/Basic.vue'
</script>

# Dialog 对话框

`ODialog` 提供黑色遮罩和居中内容面板，适合确认、阅读和短流程操作。点击遮罩或按 Esc 会触发关闭。

## 基础用法

<DemoBlock label="Dialog overlay">
  <DialogBasic />
</DemoBlock>

## Props

| 名称        | 类型      | 默认值  | 说明                 |
| ----------- | --------- | ------- | -------------------- |
| open        | `boolean` | `false` | 是否打开             |
| title       | `string`  | —       | 标题                 |
| description | `string`  | —       | 描述文本             |
| closeOnMask | `boolean` | `true`  | 点击遮罩关闭         |
| closeOnEsc  | `boolean` | `true`  | 按 Esc 关闭          |
| ariaLabel   | `string`  | —       | 无标题时的可访问名称 |

## Events 与 Slots

| 类型  | 名称          | 说明         |
| ----- | ------------- | ------------ |
| Event | `update:open` | 打开状态变化 |
| Event | `close`       | 请求关闭     |
| Slot  | `header`      | 自定义头部   |
| Slot  | `default`     | 内容         |
| Slot  | `footer`      | 底部操作区   |
