<script setup>
import SwitchBasic from '../../examples/switch/Basic.vue'
import SwitchStates from '../../examples/switch/States.vue'
</script>

# Switch 开关

`OSwitch` 是用于即时布尔选择的受控控件，内部保留真实的 `<input type="checkbox" role="switch">`。它负责呈现开关、原生交互与变更意图，但不会保存设置、发起请求或决定某项能力是否可用。

## 尺寸、标签与原生行为

<DemoBlock label="Switch sizes labels and native behavior">
  <SwitchBasic />
</DemoBlock>

`sm` 与 `md` 只改变可见轨道尺寸。标签、说明和 44px 粗指针命中区不会因为轨道紧凑而牺牲可读性或可操作性。真实 input 保留 `name`、`value`、`required`、自动填充和原生表单提交行为。

## 状态、受控拒绝与主题

<DemoBlock label="Switch readonly loading invalid dark and RTL">
  <SwitchStates />
</DemoBlock>

`readonly` 和 `loading` 会阻止值变化并恢复原生 checked 状态；`disabled` 使用原生 disabled。`loading` 只是视觉交互状态，不代表组件正在执行请求。若使用方拒绝 `update:modelValue`，组件会在事件周期结束后把 DOM 恢复到传入的 `modelValue`。

## 导入

根入口：

```ts
import { OSwitch, type OSwitchProps } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

独立子入口：

```ts
import { OSwitch, oSwitchSizes, type OSwitchSize } from '@puzzle-fuzzy/ui/switch'
import '@puzzle-fuzzy/ui/styles.css'
```

## Props

| 名称        | 类型           | 默认值  | 说明                                       |
| ----------- | -------------- | ------- | ------------------------------------------ |
| modelValue  | `boolean`      | `false` | 当前受控值                                 |
| size        | `'sm' \| 'md'` | `'md'`  | 可见轨道尺寸                               |
| label       | `string`       | —       | 默认可见标签；会被 default slot 替换       |
| description | `string`       | —       | 支持文字；会被 description slot 替换       |
| disabled    | `boolean`      | `false` | 使用原生 disabled，移出交互与表单操作      |
| readonly    | `boolean`      | `false` | 保持可读但拒绝指针与键盘修改               |
| loading     | `boolean`      | `false` | 显示标准加载图标并拒绝修改，不接管请求     |
| invalid     | `boolean`      | `false` | 使用危险色轨道并设置 `aria-invalid="true"` |

## Events 与 Slots

| 类型  | 名称                | 参数                             | 说明                          |
| ----- | ------------------- | -------------------------------- | ----------------------------- |
| Event | `update:modelValue` | `(value: boolean)`               | 请求更新受控值                |
| Event | `change`            | `(value: boolean, event: Event)` | 值变更时携带原生 change event |
| Slot  | `default`           | —                                | 替换 `label` 的可见标签       |
| Slot  | `description`       | —                                | 替换 `description` 的支持文字 |

## 原生属性与受控值

未声明的属性和监听器会转发到真实 input，而不是外层布局节点：

```vue
<OSwitch
  :model-value="enabled"
  id="weekly-digest"
  name="digest"
  value="weekly"
  required
  label="接收每周摘要"
  @update:model-value="enabled = $event"
/>
```

组件不会维持第二份公开值。若父级保持原值，原生 input 会恢复；若父级接受更新，新的 `modelValue` 会成为唯一状态来源。

## 键盘与 ARIA

- 可用状态下，Tab 聚焦真实 input，Space 使用原生 checkbox 行为切换。
- 点击 label、default slot 或 description 所在标签区域都会激活对应 input。
- input 使用 `role="switch"` 和与 `modelValue` 一致的 `aria-checked`。
- description 自动生成 SSR-safe ID 并合并进 `aria-describedby`；使用方已有的描述 ID 不会被覆盖。
- `readonly` 使用 `aria-readonly="true"`；`loading` 使用 `aria-disabled="true"`；disabled 仍使用原生属性。
- invalid 不能只靠红色表达，页面应在 label 或 description 中提供可读原因。

## 视觉、RTL 与动效

- 正常轨道无 border；选中、无效与悬停通过轨道填充表达，焦点只使用必要的 focus ring。
- 滑块沿逻辑 inline 轴移动，`dir="rtl"` 下自动反向，无需另一套 API。
- 内置加载图标来自 `vue-icons-plus/lu`，组件没有手写 SVG。
- `prefers-reduced-motion: reduce` 下移除滑块过渡并停止加载图标旋转，状态语义保持不变。

## SSR 与非目标

组件使用 Vue `useId()` 建立稳定的 input、label 和 description 关联，不会在 setup 中读取 DOM globals，可直接服务端渲染与 hydration。

`OSwitch` 不保存偏好、不执行权限检查、不发起乐观请求，也不在切换前弹出确认框。需要这些策略时，由使用方响应更新意图并组合 Dialog、Message 或其他业务流程。
