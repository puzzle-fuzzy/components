<script setup>
import BadgeBasic from '../../examples/badge/Basic.vue'
import BadgeComposition from '../../examples/badge/Composition.vue'
</script>

# Badge 徽标

`OBadge` 在内容的逻辑顶端显示圆点、计数或短文本，也可以单独作为行内标记。它只呈现使用方提供的值，不保存通知数量或在线状态。

## 数值、零值与 tone

<DemoBlock label="Badge values tones and zero visibility">
  <BadgeBasic />
</DemoBlock>

正数 `max` 会向下取整；缺失、非有限或小于等于零时回退到 `99`。数值超过上限时显示 `<max>+`，例如 `120` 默认显示 `99+`。数值 `0` 默认隐藏，通过 `showZero` 显示；字符串 `'0'` 仍是普通文本。

## 内容组合、圆点与 RTL

<DemoBlock label="Badge composition and logical positioning">
  <BadgeComposition />
</DemoBlock>

存在 default slot 时，marker 定位到逻辑 `block-start / inline-end`，因此 LTR 与 RTL 会自然镜像；没有 slot 时，marker 保持普通行内布局。

## 导入

根入口：

```ts
import { OBadge, type OBadgeProps } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

独立子入口：

```ts
import { formatOBadgeValue, normalizeOBadgeMax, OBadge } from '@puzzle-fuzzy/ui/badge'
import '@puzzle-fuzzy/ui/styles.css'
```

## Props

| 名称      | 类型                                                         | 默认值     | 说明                    |
| --------- | ------------------------------------------------------------ | ---------- | ----------------------- |
| value     | `string \| number`                                           | —          | 计数或短文本            |
| max       | `number`                                                     | `99`       | 数字显示上限            |
| dot       | `boolean`                                                    | `false`    | 忽略 value，只显示圆点  |
| hidden    | `boolean`                                                    | `false`    | 强制隐藏 marker         |
| showZero  | `boolean`                                                    | `false`    | 显示数字零              |
| tone      | `'neutral' \| 'brand' \| 'success' \| 'warning' \| 'danger'` | `'danger'` | marker 语义色调         |
| ariaLabel | `string`                                                     | —          | marker 的显式可访问名称 |

## Slots 与辅助函数

| 类型   | 名称                   | 说明                                          |
| ------ | ---------------------- | --------------------------------------------- |
| Slot   | `default`              | 被 marker 标记的内容；可省略                  |
| Helper | `normalizeOBadgeMax()` | 归一化 max，非法值回退到 99                   |
| Helper | `formatOBadgeValue()`  | 内部再次归一化 max，并生成普通文本或 `<max>+` |

## 可访问性

- 未命名 dot 使用 `aria-hidden="true"`，适合纯装饰提示。
- dot 具有业务意义时传入本地化 `ariaLabel`；marker 会使用 `role="img"` 和该名称。
- 带 `ariaLabel` 的计数或文本同样使用命名图像语义，适合提供“120 条未读消息”这类未截断信息。
- 未传 `ariaLabel` 的普通计数和文本保持可读 DOM 文本，不创建 `status`、`alert` 或 `aria-live`。值变化是否需要播报应由使用方在合适的业务区域处理。
- marker 使用实心语义表面和轻量结构阴影，不添加装饰性 border。

## SSR 与非目标

`OBadge` 不读取 DOM globals，可直接服务端渲染。它不轮询消息、计算在线状态、管理通知清零或推断 tone，也不会因为 value 变化自动创建 live region。
