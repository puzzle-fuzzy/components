<script setup>
import InputGroupBlock from '../../examples/input-group/Block.vue'
import InputGroupInline from '../../examples/input-group/Inline.vue'
import InputGroupTextarea from '../../examples/input-group/Textarea.vue'
</script>

# Input Group 输入组合

Input Group 家族把文字、图标、按钮与现有输入控件组合成一个连续表面。Root 是唯一边界拥有者，内部 OInput、OTextarea 与 OButton 继续保留原来的受控值、IME、autosize 和点击合同。默认 soft 子控件让 Root 使用浅色表面和透明预留边界；任一输入子控件使用 `variant="outline"` 时，Root 统一切换为常显边界，不会在内部产生重复线条。

## Inline 附加内容

<DemoBlock label="Input Group inline addons">
  <InputGroupInline />
</DemoBlock>

点击 Addon 的非交互空白会聚焦组内第一个可用 input 或 textarea；点击其中的按钮、链接或其他交互节点不会被抢焦点。

## Block 附加内容与按钮

<DemoBlock label="Input Group block addons and button">
  <InputGroupBlock />
</DemoBlock>

block addon 占据整行，但不增加分隔线。DOM 顺序决定视觉顺序与键盘顺序，组件不会用 CSS 把内容重新排序。

## Textarea、autosize 与字符计数

<DemoBlock label="Input Group textarea autosize and count">
  <InputGroupTextarea />
</DemoBlock>

OInputGroupTextarea 直接复用 OTextarea，因此固定高度、按内容高度、上限滚动、IME 与字符计数行为保持一致。

## 导入

```ts
import {
  OInputGroup,
  OInputGroupAddon,
  OInputGroupButton,
  OInputGroupInput,
  OInputGroupText,
  OInputGroupTextarea,
  type OInputGroupAddonAlign,
} from '@puzzle-fuzzy/ui/input-group'
import '@puzzle-fuzzy/ui/styles.css'
```

## 组件结构

| 组件                  | 职责                                             |
| --------------------- | ------------------------------------------------ |
| `OInputGroup`         | 单一 border、focus-within、invalid 与 group 语义 |
| `OInputGroupAddon`    | 四个逻辑位置和空白点击聚焦                       |
| `OInputGroupInput`    | 直接代理 OInput                                  |
| `OInputGroupTextarea` | 直接代理 OTextarea                               |
| `OInputGroupButton`   | 直接代理 OButton，默认使用紧凑 sm 尺寸           |
| `OInputGroupText`     | 单位、协议、快捷键或简短辅助文字                 |

## OInputGroup Props

| 名称      | 类型      | 默认值  | 说明                                  |
| --------- | --------- | ------- | ------------------------------------- |
| invalid   | `boolean` | `false` | 强制 Root 使用 danger border          |
| disabled  | `boolean` | `false` | Root 的禁用视觉状态，不自动禁用子控件 |
| ariaLabel | `string`  | —       | Root `role="group"` 的可访问名称      |

Root 也会通过 `:has([aria-invalid='true'])` 读取真实 control 错误状态。聚焦时由 Root 统一显示品牌边界和 `0 0 0 2px` brand-soft 焦点层；内部控件不会再绘制第二圈边界。

## OInputGroupAddon Props

| 名称  | 类型                                                             | 默认值           | 说明         |
| ----- | ---------------------------------------------------------------- | ---------------- | ------------ |
| align | `'inline-start' \| 'inline-end' \| 'block-start' \| 'block-end'` | `'inline-start'` | 逻辑布局位置 |

align 不改变 DOM 顺序。block-start 应写在 control 前，block-end 应写在 control 后。

## Control 与辅助组件 Props

- `OInputGroupInput` 完整使用 OInput Props，包含 modelValue、type、size、variant、clearable、showPassword、disabled、readonly、invalid 与可访问名称。
- `OInputGroupTextarea` 完整使用 OTextarea Props，包含 modelValue、variant、rows、autosize、maxlength、showCount、disabled、readonly 与 invalid。
- `OInputGroupButton` 使用 OButton Props，并与 OButton 一样默认使用紧凑 `sm`。可显式覆盖 variant、size、tone、type、loading、iconOnly 与 disabled。
- `OInputGroupText` 提供 `tag: 'span' | 'div'`，默认 `span`。

原生 attrs 和监听器会继续到真实 input、textarea 或 button。不要把未知业务属性放在 Root 后期再猜测分发目标，应直接传给对应 compound。

## Events

| 组件                  | Events                                             |
| --------------------- | -------------------------------------------------- |
| `OInputGroupInput`    | `update:modelValue`、`focus`、`blur`、`clear`      |
| `OInputGroupTextarea` | `update:modelValue`、`focus`、`blur`               |
| `OInputGroupButton`   | `click`                                            |
| Root、Addon、Text     | 无组件自定义 Events；原生 attrs/listeners 正常透传 |

这些事件只是原组件事件的代理，不改变参数、时序或受控回写规则。

## Slots

| 组件                  | Slots              |
| --------------------- | ------------------ |
| `OInputGroup`         | `default`          |
| `OInputGroupAddon`    | `default`          |
| `OInputGroupInput`    | `prefix`、`suffix` |
| `OInputGroupTextarea` | 无                 |
| `OInputGroupButton`   | `default`、`icon`  |
| `OInputGroupText`     | `default`          |

图标统一从 `vue-icons-plus/lu` 导入，并对装饰图标设置 `aria-hidden="true"`。

## 键盘、焦点与可访问性

- Root 使用 `role="group"`。页面上有多个相似 Input Group 时应提供 `ariaLabel`。
- Addon 不创建 Tab 停靠点；其内部 button、a、input、textarea、select 和 `[role='button']` 保留自己的交互。
- 空白聚焦会跳过 disabled input/textarea，但 readonly control 仍可获得焦点。
- Root 的 `disabled` 只影响整体视觉。每个不可用子控件仍需显式传 `disabled`。
- DOM 顺序就是 Tab 顺序；不要只依赖 align 命名表达阅读顺序。

## 主题、RTL、窄容器与 SSR

组件使用 OMG UI tokens，不读取 VitePress 变量。inline-start/end 使用逻辑方向，RTL 会自然镜像；block addon 在窄容器中保持完整换行。长文本支持换行，输入区域允许收缩。

Root、control wrappers、Text 与 Button 可直接 SSR。Addon 只在用户点击后查询最近 Root，不会在模块加载或服务端渲染时读取 document。

## UI-only 边界

Input Group 不执行搜索、不清空值、不切换密码、不提交内容，也不决定 Button 点击后的业务。需要的动作由调用方组合 OInput、OTextarea 与 OButton 已有能力。
