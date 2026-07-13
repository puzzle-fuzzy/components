<script setup>
import AlertBasic from '../../examples/alert/Basic.vue'
import AlertClosable from '../../examples/alert/Closable.vue'
</script>

# Alert 提示

`OAlert` 用于需要持续留在布局中的内联反馈，补充会自动离场的 Message。它只呈现使用方明确给出的状态和内容，不翻译异常、不重试操作、不设置计时器，也不会自动删除自己。

## 状态、内容与操作

<DemoBlock label="Alert statuses content and actions">
  <AlertBasic />
</DemoBlock>

四种 status 都使用柔和语义表面与明确图标。标题、正文、操作区可以独立出现；状态不能只靠颜色表达，使用方仍需提供可读文字。

## 受控关闭、长内容与深色主题

<DemoBlock label="Alert controlled close long content and dark theme">
  <AlertClosable />
</DemoBlock>

close 按钮只发出原生 `MouseEvent`。示例中的隐藏与恢复由使用方状态完成，Alert 本身始终保持静态、无队列、无自动离场。

## 导入

根入口：

```ts
import { OAlert, type OAlertStatus } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

独立子入口：

```ts
import { OAlert, oAlertStatuses, type OAlertProps } from '@puzzle-fuzzy/ui/alert'
import '@puzzle-fuzzy/ui/styles.css'
```

## Props

| 名称           | 类型                                          | 默认值          | 说明                             |
| -------------- | --------------------------------------------- | --------------- | -------------------------------- |
| status         | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'`        | 语义表面与默认状态图标           |
| title          | `string`                                      | —               | 默认标题；会被 title slot 替换   |
| description    | `string`                                      | —               | 默认正文；会被 default slot 替换 |
| closable       | `boolean`                                     | `false`         | 是否显示关闭按钮                 |
| showIcon       | `boolean`                                     | `true`          | 是否显示默认或自定义状态图标     |
| closeAriaLabel | `string`                                      | `'Close alert'` | 关闭按钮的可访问名称             |

## Events 与 Slots

| 类型  | 名称        | 参数         | 说明                                   |
| ----- | ----------- | ------------ | -------------------------------------- |
| Event | `close`     | `MouseEvent` | 激活关闭按钮时发出意图，不卸载组件     |
| Slot  | `icon`      | —            | 替换默认状态图标，仍作为装饰内容       |
| Slot  | `title`     | —            | 替换 `title`                           |
| Slot  | `default`   | —            | 替换 `description` 的正文              |
| Slot  | `action`    | —            | 可选操作区，紧凑宽度下移动到文字下方   |
| Slot  | `closeIcon` | —            | 替换默认关闭图标，不改变按钮可访问名称 |

默认状态图标与关闭图标均来自 `vue-icons-plus/lu`。icon 和 closeIcon 的容器带有 `aria-hidden="true"`，不要把必要状态文字只放在图标中。

## ARIA 与动态反馈

Alert 默认不创建 `role="status"`、`role="alert"` 或 `aria-live`，避免页面初次渲染时产生未经请求的播报。只有使用方知道内容何时动态出现以及紧急程度，因此可以通过原生属性显式添加：

```vue
<OAlert
  role="alert"
  aria-live="assertive"
  status="error"
  title="无法保存"
  description="请检查连接后重试。"
/>
```

- 紧急且需要立即打断播报的错误才使用 `role="alert"`。
- 普通动态完成反馈优先使用 `role="status"` 或 `aria-live="polite"`。
- 静态说明通常不需要 live region。
- closable Alert 必须传入当前语言下明确的 `closeAriaLabel`；关闭按钮支持 Tab、Enter、Space 与 `focus-visible`。

## 布局、主题与动效

- Alert 支持仅标题、仅正文、标题加正文、长文本、action 和 close 同时存在。
- 容器变窄时 action 自动移到文字下方，图标和关闭按钮不会覆盖正文。
- 整个表面无 outer border；柔和背景、圆角和间距已经表达边界。
- 深色主题继续使用对应的语义 soft tokens，不使用透明磨砂或额外阴影。
- Alert 默认静态，不引入未经请求的入场、离场或自动关闭动效。

## SSR 与非目标

`OAlert` 只进行同步 Vue 渲染，不读取浏览器 globals，可直接 SSR。原生 `role`、`aria-live`、`data-*` 和其他未声明属性会保留在根 article。

组件不映射异常类型、不根据正文猜测 status、不提供重试逻辑、Promise helper、计时器、队列或自动移除。需要短暂右上角反馈时使用 Message；需要业务恢复流程时由使用方组合 action 与自己的状态。
