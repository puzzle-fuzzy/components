<script setup>
import KbdBasic from '../../examples/kbd/Basic.vue'
import KbdTooltip from '../../examples/kbd/Tooltip.vue'
</script>

# Kbd 键盘按键

`OKbd` 用真实 `kbd` 元素展示单个键名，`OKbdGroup` 把多个按键与分隔文字组织成一条可命名的快捷键提示。它们只负责说明，不注册或监听快捷键。

## 按键与组合

<DemoBlock label="Kbd keys and groups">
  <KbdBasic />
</DemoBlock>

多个按键应保持清晰的可读顺序，并为组合提供当前语言下准确的 `ariaLabel`。

## Tooltip 组合

<DemoBlock label="Kbd Tooltip composition">
  <KbdTooltip />
</DemoBlock>

Kbd 可以放入 Tooltip、菜单项、按钮说明或普通正文；交互与浮层生命周期仍由外层组件负责。

## 导入

根入口：

```ts
import { OKbd, OKbdGroup, type OKbdSize } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

独立子入口：

```ts
import {
  OKbd,
  OKbdGroup,
  oKbdSizes,
  type OKbdGroupProps,
  type OKbdProps,
} from '@puzzle-fuzzy/ui/kbd'
import '@puzzle-fuzzy/ui/styles.css'
```

## OKbd Props

| 名称 | 类型           | 默认值 | 说明                   |
| ---- | -------------- | ------ | ---------------------- |
| size | `'sm' \| 'md'` | `'sm'` | 按键高度、内边距与字号 |

## OKbdGroup Props

| 名称      | 类型     | 默认值 | 说明                        |
| --------- | -------- | ------ | --------------------------- |
| ariaLabel | `string` | —      | `role="group"` 的可访问名称 |

## Slots

| 组件        | 名称      | 说明                              |
| ----------- | --------- | --------------------------------- |
| `OKbd`      | `default` | 单个键名，例如 `Esc`、`Ctrl`、`S` |
| `OKbdGroup` | `default` | 多个 OKbd 与可读或装饰性的连接符  |

## ARIA 与快捷键表达

- `OKbd` 使用原生 `kbd` 语义，但不会自动说明按键用途。
- `OKbdGroup` 固定使用 `role="group"`；复杂组合应提供 `ariaLabel`，例如“Control 加 S”。
- 如果视觉连接符已经被 group 的可访问名称完整表达，可以给连接符添加 `aria-hidden="true"`，避免重复朗读。
- 平台键名、修饰键顺序和本地化应由使用方决定。不要只依赖图标表达 Command、Control 或 Option。
- Kbd 不是交互控件，不进入 Tab 顺序，也不响应按下事件。

## 主题、RTL 与 reduced motion

按键使用无外边框的 neutral soft 表面和轻量 inset highlight，在深色主题中通过 `--omg-*` tokens 自动切换。RTL 页面会保留 DOM 中的按键顺序；若快捷键显示顺序需要特定方向，应在组合周围显式设置 `dir`。

Kbd 家族没有动画，`prefers-reduced-motion` 不改变其外观或布局。

## SSR 与 UI-only 边界

两个组件都只输出稳定原生元素，不读取 navigator、操作系统或键盘布局，可直接 SSR，并保留使用方传入的原生属性。

Kbd 不注册全局快捷键、不监听 keydown、不检测平台、不解析按键字符串、不处理冲突，也不执行命令。实际快捷键行为应由应用自己的输入层负责。
