<script setup>
import InputBasic from '../../examples/input/Basic.vue'
</script>

# Input 单行输入

`OInput` 是受控的原生单行输入控件。它保留真实 `<input>` 的表单、自动填充与输入法语义，并提供统一尺寸、前后缀、清除按钮和密码可见性切换。

默认 `soft` 外观使用 Upload 同系的浅色表面，并始终预留透明的 1px 边界：静止时没有装饰性边框，hover 只改变背景，focus / invalid 才显示语义边界与克制的 brand-soft 焦点层。需要始终可见边界时使用 `variant="outline"`。两种外观都保留相同尺寸和原生行为。

## 基础用法

<DemoBlock label="Input native text controls">
  <InputBasic />
</DemoBlock>

## 导入

```ts
import { OInput } from '@puzzle-fuzzy/ui'
// 或 import { OInput } from '@puzzle-fuzzy/ui/input'
import '@puzzle-fuzzy/ui/styles.css'
```

## Props

| 名称                  | 类型                                                            | 默认值            | 说明                                   |
| --------------------- | --------------------------------------------------------------- | ----------------- | -------------------------------------- |
| modelValue            | `string`                                                        | `''`              | 当前受控值                             |
| type                  | `'text' \| 'password' \| 'email' \| 'search' \| 'tel' \| 'url'` | `'text'`          | 原生输入类型                           |
| size                  | `'sm' \| 'md' \| 'lg'`                                          | `'md'`            | 控件尺寸                               |
| variant               | `'soft' \| 'outline'`                                           | `'soft'`          | 浅色无边框默认态或常显边界             |
| placeholder           | `string`                                                        | —                 | 占位文本                               |
| clearable             | `boolean`                                                       | `false`           | 非空且可编辑时显示清除按钮             |
| showPassword          | `boolean`                                                       | `false`           | `type="password"` 时显示可见性切换按钮 |
| disabled              | `boolean`                                                       | `false`           | 禁用输入                               |
| readonly              | `boolean`                                                       | `false`           | 只读输入                               |
| invalid               | `boolean`                                                       | `false`           | 设置错误视觉状态与 `aria-invalid`      |
| ariaLabel             | `string`                                                        | —                 | 无可见 label 时的输入名称              |
| clearAriaLabel        | `string`                                                        | `'Clear input'`   | 清除按钮的可访问名称                   |
| showPasswordAriaLabel | `string`                                                        | `'Show password'` | 显示密码按钮的可访问名称               |
| hidePasswordAriaLabel | `string`                                                        | `'Hide password'` | 隐藏密码按钮的可访问名称               |

未声明的属性与监听器会绑定到真实 `<input>`，因此可以直接使用 `id`、`name`、`required`、`autocomplete`、`aria-describedby`、`@change` 等原生能力。

## Events

| 名称                | 参数                  | 说明                           |
| ------------------- | --------------------- | ------------------------------ |
| `update:modelValue` | `(value: string)`     | 输入法提交或普通输入后请求更新 |
| `focus`             | `(event: FocusEvent)` | 原生输入获得焦点               |
| `blur`              | `(event: FocusEvent)` | 原生输入失去焦点               |
| `clear`             | —                     | 点击清除按钮                   |

组件不解析数字、不格式化，也不防抖。父级拒绝或规范化一次更新后，原生输入值会回到最新的 `modelValue`。

## Slots

| 名称     | 说明                                          |
| -------- | --------------------------------------------- |
| `prefix` | 输入前缀；图标统一从 `vue-icons-plus/lu` 导入 |
| `suffix` | 输入后缀                                      |

前后缀不会替代 label。装饰图标应设置 `aria-hidden="true"`，无可见 label 时必须传入 `ariaLabel` 或原生 `aria-label`。

## 键盘与可访问性

- 清除后焦点回到输入框；密码切换按钮通过 `aria-pressed` 表达当前可见性。
- IME 组合期间不会发出中间拉丁字符，只在组合结束后提交一次完整值。
- 清除与密码图标来自 `vue-icons-plus/lu`，按钮保留独立可访问名称和粗指针 44px 目标。
- `disabled` 和 `readonly` 都不会修改值；密码可见性切换不改变 `modelValue`。
