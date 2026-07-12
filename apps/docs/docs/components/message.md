<script setup>
import MessageBasic from '../../examples/message/Basic.vue'
import MessageDeclarative from '../../examples/message/Declarative.vue'
import MessageThemes from '../../examples/message/Themes.vue'
</script>

# Message 消息

Message 用于在不打断当前任务的情况下呈现一条简短反馈。`OMessage` 是可放在普通布局中的声明式表面；`oMessage()` 则负责右上角堆叠、展示计时和离场清理。两者都只表达 UI 状态，不会把请求结果、重试或业务状态自动映射为消息。

## Service 与展示周期

<DemoBlock label="Message service and lifecycle">
  <MessageBasic />
</DemoBlock>

这组示例包含普通调用、四种状态 helper、自动关闭、持久消息、返回的 handle、`closeAll()`、长文本和堆叠重排。鼠标停留在消息上，或键盘焦点位于其中时，自动计时会暂停；离开后从剩余时间继续，不会重新开始完整时长。

## 声明式表面

<DemoBlock label="Message declarative surfaces">
  <MessageDeclarative />
</DemoBlock>

`OMessage` 本身没有计时器和全局状态。它适合长期保留在布局中，或由使用方放进自己的列表。`close` 只发出关闭意图，是否移除组件由使用方控制。

## 实心主题表面

<DemoBlock label="Message solid theme surfaces">
  <MessageThemes />
</DemoBlock>

Message 是当前组件库的特殊表面：浅色主题始终使用完全不透明的 `#fff`，深色主题始终使用 `#2d2d2d`。它不使用磨砂或透明背景，也不叠加外边框；层级只由实心表面和专用阴影表达。状态色只出现在图标上。

## 导入

根入口：

```ts
import { OMessage, oMessage, type OMessageHandle, type OMessageOptions } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

独立子入口：

```ts
import {
  OMessage,
  oMessage,
  type OMessageHandle,
  type OMessageOptions,
} from '@puzzle-fuzzy/ui/message'
import '@puzzle-fuzzy/ui/styles.css'
```

## OMessage Props

| 名称           | 类型                                          | 默认值            | 说明                             |
| -------------- | --------------------------------------------- | ----------------- | -------------------------------- |
| message        | `string`                                      | —                 | 默认正文；会被 default slot 替换 |
| status         | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'`          | 状态与内置图标                   |
| closable       | `boolean`                                     | `false`           | 是否显示关闭按钮                 |
| closeAriaLabel | `string`                                      | `'Close message'` | 关闭按钮的可访问名称             |

## OMessage Events 与 Slots

| 类型  | 名称      | 说明                             |
| ----- | --------- | -------------------------------- |
| Event | `close`   | 每次激活关闭按钮时发出一次       |
| Slot  | `default` | 替换 `message` prop 的正文       |
| Slot  | `icon`    | 替换内置状态图标；仍视为装饰内容 |

## oMessage Service

直接传入字符串会使用默认 info 状态：

```ts
oMessage('设置已更新')
```

也可以使用状态 helper：

```ts
oMessage.success('内容已保存')
oMessage.warning({ message: '请检查当前输入', closable: true })
oMessage.error({ message: '暂时无法完成', duration: 0 })
```

Service 签名：

```ts
interface OMessageOptions {
  readonly message: string
  readonly status?: 'info' | 'success' | 'warning' | 'error'
  readonly duration?: number
  readonly closable?: boolean
  readonly closeAriaLabel?: string
  readonly pauseOnHover?: boolean
  readonly appendTo?: string | HTMLElement
  readonly onClose?: () => void
}

interface OMessageHandle {
  close: () => void
}
```

| 选项           | 默认值            | 说明                             |
| -------------- | ----------------- | -------------------------------- |
| message        | 必填              | 消息正文；空字符串也会原样保留   |
| status         | `'info'`          | 使用状态 helper 时由 helper 覆盖 |
| duration       | `3000`            | 展示毫秒数；`0` 表示持久展示     |
| closable       | `false`           | 是否显示关闭按钮                 |
| closeAriaLabel | `'Close message'` | 关闭按钮的可访问名称             |
| pauseOnHover   | `true`            | 鼠标停留时是否暂停计时           |
| appendTo       | `document.body`   | 已连接的 HTMLElement 或 selector |
| onClose        | —                 | 离场完成后调用一次               |

`duration` 未传或为非有限数值时回退到 `3000`；小于等于零时归一为 `0`；正数会向下取整。

### Handle 与 closeAll

```ts
const handle: OMessageHandle = oMessage.info({
  message: '需要手动关闭',
  duration: 0,
})

handle.close()
handle.close() // 可重复调用，只会进入一次离场

oMessage.closeAll()
```

关闭按钮、计时器、handle 和 `closeAll()` 都只请求一次离场。`onClose` 在动画完成且内部记录清理时触发，不是“开始关闭”的回调。

## 位置、堆叠与动效

- Host 固定在视口的物理右上角，顶部和右侧各留 `16px`；它不会随 RTL 切换到左侧。
- 消息宽度不超过 `360px`，在窄视口中保留两侧 `16px`。长文本可换行，图标和关闭按钮不缩小。
- 入场约 `260ms`，从右侧滑入并淡入。
- 离场约 `180ms`，以右上角为原点缩小到约 `0.9` 并淡出，不再向右滑走。
- 其他消息的重排只使用 transform move transition。
- `prefers-reduced-motion: reduce` 下移除入场、离场和重排动效，不延迟节点清理。

## appendTo、局部主题与 Dialog

每个有效目标最多只会创建一个 Host。传入已断开的 HTMLElement，或 selector 没有匹配元素时，会回退到 `document.body`。Host 在最后一条消息离场后自动卸载。

把 Host 挂到带有 `data-omg-theme` 的已连接容器，它会自然继承该容器的 OMG tokens。原生 `<dialog>` 打开后位于 top layer；需要让 Message 显示在 Dialog 之上时，`appendTo` 必须指向 Dialog 内的已挂载元素，普通 body Host 无法越过原生 top layer。

## ARIA 与 SSR

- error 状态使用 `role="alert"`；info、success 和 warning 使用 `role="status"`，所有状态都使用 `aria-atomic="true"`。
- 内置图标和 `icon` slot 属于装饰内容。消息文字和 live-region 语义保留状态信息，Host 本身不再重复声明 live region。
- closable Message 应为当前语言提供明确的 `closeAriaLabel`。键盘焦点位于关闭按钮时，自动计时同样暂停。
- 自动关闭只适合简短、可从页面其他位置再次获取的冗余反馈；重要内容或需要充分阅读时间的内容应使用 `duration: 0`，并提供可键盘操作的关闭路径。
- 导入包和声明式渲染都不要求 DOM globals。服务端调用 `oMessage()` 是无副作用的 no-op，但依然返回可重复关闭的 handle。

## 非目标

- 不提供通知标题、操作按钮、进度条、分组、去重或业务重试。
- 不将 Promise、请求或上传结果自动转换为状态消息。
- 不要求 Provider、`app.use()` 或全局 Vue 应用注册。
