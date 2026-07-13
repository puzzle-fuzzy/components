<script setup>
import AccordionHorizontalRtl from '../../examples/accordion/HorizontalRtl.vue'
import AccordionMultiple from '../../examples/accordion/Multiple.vue'
import AccordionSingle from '../../examples/accordion/Single.vue'
</script>

# Accordion 手风琴

Accordion 用于在一组相关标题之间展开内容。它提供 single、multiple、受控与非受控状态，并处理焦点移动、ARIA 关联、方向和展开动效，不包含数据加载或业务判断。

## 单项与可收起

<DemoBlock label="Accordion single and collapsible">
  <AccordionSingle />
</DemoBlock>

single 模式默认始终保留一项展开。添加 `collapsible` 后，可以再次点击当前 Trigger 将它收起。

## 多项、禁用与自定义图标

<DemoBlock label="Accordion multiple disabled and custom icon">
  <AccordionMultiple />
</DemoBlock>

multiple 模式的值固定为 `string[]`。Item 的 `disabled` 只阻止该项目，Root 的 `disabled` 会阻止整个手风琴。

## 水平 RTL 与 Trigger 组合

<DemoBlock label="Accordion horizontal RTL and asChild">
  <AccordionHorizontalRtl />
</DemoBlock>

`asChild` 会把 Trigger 的交互属性合并到唯一的 slot 根节点，因此与 `OButton` 组合时不会生成嵌套 button。使用 `asChild` 时，触发器根节点和图标由调用方完整控制。

## 导入

```ts
import {
  OAccordion,
  OAccordionContent,
  OAccordionItem,
  OAccordionTrigger,
  type OAccordionValue,
} from '@puzzle-fuzzy/ui/accordion'
import '@puzzle-fuzzy/ui/styles.css'
```

## 状态规则

- 未传 `modelValue` 时，组件使用 `defaultValue` 作为非受控初始值，并在内部保存后续状态。
- 传入 `modelValue` 后进入受控模式。交互只发出 `update:modelValue`；父级不回写时，界面不会伪造新状态。
- `type="single"` 使用 `string | undefined`，`type="multiple"` 使用 `string[]`。开发环境会提示不匹配的值形状。
- 每个 `OAccordionItem` 都必须提供非空且在当前 Root 中唯一的 `value`。

## OAccordion Props

| 名称          | 类型                              | 默认值       | 说明                               |
| ------------- | --------------------------------- | ------------ | ---------------------------------- |
| type          | `'single' \| 'multiple'`          | `'single'`   | 单项或多项展开模式                 |
| modelValue    | `string \| string[] \| undefined` | —            | 受控值                             |
| defaultValue  | `string \| string[] \| undefined` | —            | 非受控初始值                       |
| collapsible   | `boolean`                         | `false`      | single 模式是否允许全部收起        |
| disabled      | `boolean`                         | `false`      | 禁用整个 Root                      |
| orientation   | `'vertical' \| 'horizontal'`      | `'vertical'` | 布局与方向键方向                   |
| dir           | `'ltr' \| 'rtl'`                  | 继承上下文   | 阅读方向                           |
| unmountOnHide | `boolean`                         | `true`       | 收起完成后是否卸载内容             |
| as            | `string \| Component`             | `'div'`      | 根元素或组件                       |
| asChild       | `boolean`                         | `false`      | 将 Root 属性合并到唯一 slot 根节点 |

## 子组件 Props

| 组件                | Props                  | 默认值              | 说明                               |
| ------------------- | ---------------------- | ------------------- | ---------------------------------- |
| `OAccordionItem`    | `value: string`        | 必填                | 当前项目的唯一状态值               |
| `OAccordionItem`    | `disabled?: boolean`   | `false`             | 禁用当前项目                       |
| `OAccordionItem`    | `as`, `asChild`        | `'div'`, `false`    | 替换项目根节点                     |
| `OAccordionTrigger` | `as`, `asChild`        | `'button'`, `false` | 替换触发器或组合现有控件           |
| `OAccordionContent` | `forceMount?: boolean` | `false`             | 强制保留内容节点，便于外部控制动画 |
| `OAccordionContent` | `as`, `asChild`        | `'div'`, `false`    | 替换内容根节点                     |

## Emits 与 Slots

| 组件                | 名称                | 参数                              | 说明                     |
| ------------------- | ------------------- | --------------------------------- | ------------------------ |
| `OAccordion`        | `update:modelValue` | `string \| string[] \| undefined` | 请求更新展开值           |
| `OAccordion`        | `default`           | `{ modelValue }`                  | 当前解析后的展开值       |
| `OAccordionItem`    | `default`           | `{ open: boolean }`               | 当前项目是否展开         |
| `OAccordionTrigger` | `default`           | —                                 | 触发器内容               |
| `OAccordionTrigger` | `icon`              | —                                 | 替换默认 `LuChevronDown` |
| `OAccordionContent` | `default`           | —                                 | 展开的内容               |

## 键盘交互

| 按键                  | 行为                                      |
| --------------------- | ----------------------------------------- |
| Enter、Space          | 切换当前项目                              |
| ArrowDown、ArrowUp    | vertical 模式移动到下一个或上一个 Trigger |
| ArrowRight、ArrowLeft | horizontal 模式按 LTR 或 RTL 方向移动     |
| Home                  | 聚焦第一个可用 Trigger                    |
| End                   | 聚焦最后一个可用 Trigger                  |

禁用项目不会成为可交互目标。Trigger 与 Content 保留 `aria-expanded`、`aria-controls`、`role="region"`、`data-state` 和方向状态，默认图标只随展开状态旋转。

## SSR、主题与动效

组件不直接读取 `window` 或 `document`，可以在 SSR 中渲染 closed、open 与 `forceMount` 状态。样式使用 OMG UI tokens，浅色、深色和 RTL 都不需要额外皮肤。

Content 使用 Reka 提供的测量尺寸变量完成高度或宽度展开，Trigger 只做背景反馈，Item 默认没有分割线。`prefers-reduced-motion: reduce` 下会关闭内容和图标动画。

## UI-only 边界

Accordion 不请求内容、不缓存面板、不决定权限，也不根据数据状态自动展开项目。异步加载、路由同步、表单保存与值持久化全部由使用方管理。
