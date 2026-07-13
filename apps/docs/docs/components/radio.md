<script setup>
import RadioBasic from '../../examples/radio/Basic.vue'
</script>

# Radio 单选框

`ORadio` 保留真实原生 radio；`ORadioGroup` 通过 provide/inject 共享受控值、name、禁用和错误状态。组件不解析或验证业务选项。

## 基础用法

<DemoBlock label="Radio states and radio group">
  <RadioBasic />
</DemoBlock>

示例同时展示横向与纵向排列、禁用项、错误状态、长标签和深色主题。标签文本可以自然换行且不会挤压 20px 指示器；每项在桌面端至少为 32px 高，粗指针设备会扩展到至少 44px。

## 视觉状态

- 默认指示器使用 20px 圆环、2px 边界和 10px 选中圆点。
- Hover、按下和键盘焦点通过圆环周围的状态层反馈，不会把整项变成卡片。
- `invalid` 会让圆环、圆点和状态层统一使用错误色，避免同一选项混用品牌色与错误色。
- 高对比度模式使用系统颜色恢复圆环、选中圆点和焦点轮廓；减弱动效模式会移除圆点与状态层过渡。

## 导入

```ts
import { ORadio, ORadioGroup, type ORadioValue } from '@puzzle-fuzzy/ui'
// 或从 '@puzzle-fuzzy/ui/radio' 导入
import '@puzzle-fuzzy/ui/styles.css'
```

```ts
type ORadioValue = string | number
type ORadioGroupOrientation = 'horizontal' | 'vertical'
```

数值 value 始终以原始 number 发出，不会从原生 DOM 字符串反向解析。

## ORadio Props

| 名称       | 类型                       | 默认值      | 说明                        |
| ---------- | -------------------------- | ----------- | --------------------------- |
| modelValue | `ORadioValue \| undefined` | `undefined` | 独立使用时的当前受控值      |
| value      | `ORadioValue`              | 必填        | 此选项的稳定值              |
| label      | `string`                   | —           | 可见标签，也可使用默认 slot |
| name       | `string`                   | —           | 独立使用时的原生 name       |
| disabled   | `boolean`                  | `false`     | 禁用此项                    |
| invalid    | `boolean`                  | `false`     | 此项的错误状态              |

## ORadioGroup Props

| 名称        | 类型                         | 默认值       | 说明                      |
| ----------- | ---------------------------- | ------------ | ------------------------- |
| modelValue  | `ORadioValue \| undefined`   | `undefined`  | 当前受控值                |
| name        | `string`                     | 自动生成     | 所有子项共享的原生 name   |
| orientation | `'horizontal' \| 'vertical'` | `'vertical'` | 排列和 `aria-orientation` |
| disabled    | `boolean`                    | `false`      | 禁用全部子项              |
| invalid     | `boolean`                    | `false`      | 向全部子项提供错误状态    |
| ariaLabel   | `string`                     | —            | radiogroup 的可访问名称   |

Group 还会把未声明属性绑定到 `role="radiogroup"` 容器，可用 `aria-labelledby` 连接可见标题。显式 `name` 方便原生表单读取；省略时会生成可稳定水合的共享 name。

## Events

`ORadio` 和 `ORadioGroup` 都提供以下事件；Radio 位于 Group 内时只由 Group 发出更新：

| 名称                | 参数                                 | 说明               |
| ------------------- | ------------------------------------ | ------------------ |
| `update:modelValue` | `(value: ORadioValue)`               | 请求选择当前项     |
| `change`            | `(value: ORadioValue, event: Event)` | 原生 change 后发出 |

## Slots

- `ORadio default`：自定义可见标签。
- `ORadioGroup default`：放置 `ORadio`，可以通过普通模板结构组织选项。

## 键盘与可访问性

- 每个选项都是真实 `<input type="radio">`，保留 Tab、Space 和同 name radio 的原生方向键行为。
- Group 使用 `role="radiogroup"`；应通过 `ariaLabel` 或 `aria-labelledby` 提供名称。
- 可见圆点只是状态镜像，不使用图标替代 radio 的原生语义。
- 父级拒绝选择更新时，Group 会在下一次渲染后恢复整组原生 checked 状态，避免浏览器状态与 `modelValue` 分离。
