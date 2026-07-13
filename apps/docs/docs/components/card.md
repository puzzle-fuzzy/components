<script setup>
import CardBasic from '../../examples/card/Basic.vue'
import CardVariants from '../../examples/card/Variants.vue'
</script>

# Card 卡片

`OCard` 是一个边界轻量的内容组合容器，用稳定的 header、action、content 与 footer 区域组织信息。它不会替使用方加载数据、处理点击或推断卡片类型。

## 内容组合与操作

<DemoBlock label="Card composition and actions">
  <CardBasic />
</DemoBlock>

只有实际传入内容的区域才会渲染；title 与 description slot 会覆盖同名 Prop，适合在保持结构的同时插入更丰富的 Vue 内容。

## 变体、深色主题与紧凑尺寸

<DemoBlock label="Card variants dark and compact">
  <CardVariants />
</DemoBlock>

surface 用轻量阴影建立层级，muted 使用静音表面，ghost 只保留布局。三个变体都不添加外边框。

## 导入

根入口：

```ts
import { OCard, type OCardProps, type OCardVariant } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

独立子入口：

```ts
import {
  OCard,
  oCardSizes,
  oCardTitleLevels,
  oCardVariants,
  type OCardSlots,
} from '@puzzle-fuzzy/ui/card'
import '@puzzle-fuzzy/ui/styles.css'
```

## Props

| 名称        | 类型                              | 默认值      | 说明                                 |
| ----------- | --------------------------------- | ----------- | ------------------------------------ |
| variant     | `'surface' \| 'muted' \| 'ghost'` | `'surface'` | 表面层级                             |
| size        | `'sm' \| 'md'`                    | `'md'`      | 内部间距与标题尺寸                   |
| title       | `string`                          | —           | 默认标题；会被 title slot 替换       |
| description | `string`                          | —           | 默认说明；会被 description slot 替换 |
| titleLevel  | `2 \| 3 \| 4`                     | `3`         | 标题实际使用的 `h2`、`h3` 或 `h4`    |

## Slots

| 名称          | 说明                                                |
| ------------- | --------------------------------------------------- |
| `title`       | 标题内容，覆盖 `title` Prop                         |
| `description` | 说明内容，覆盖 `description` Prop                   |
| `action`      | header 逻辑结束侧的操作区；窄容器中会移动到标题下方 |
| `default`     | 正文内容                                            |
| `footer`      | 页脚内容                                            |

## 语义与 ARIA

根节点是 `article`，适合可以独立理解的内容块。`titleLevel` 应根据页面现有标题层级选择，不要为了视觉大小跳过 heading 层级；视觉尺寸由组件 size 决定。

Card 默认不创建可访问名称、landmark 或点击行为。若整张卡片需要描述，可以传入原生 `aria-label` 或 `aria-labelledby`；若需要操作，应在 action、正文或 footer 中放置真实链接或按钮，不要仅给 article 添加 click。

## 响应式、主题、RTL 与动效

- header 使用容器查询；窄卡片会把 action 移到标题下方，而不是依赖 viewport 宽度。
- 长标题、说明和正文支持任意位置换行，避免把操作区挤出容器。
- 深色主题通过 `data-omg-theme="dark"` 与 `--omg-*` tokens 工作，不影响 VitePress 变量。
- 间距与对齐使用逻辑方向，RTL 中 action 位于逻辑结束侧并在窄容器中回流。
- Card 没有入场、悬停或布局动画，reduced-motion 下无需额外切换。

## SSR 与非目标

组件只根据 Props 与 Slots 同步决定可选区域，不读取 DOM 或浏览器 globals，可直接 SSR。为避免 hydration 差异，服务端与客户端应提供相同标题和 slot 结构。

`OCard` 不请求数据、不导航、不创建选择状态、不把整卡变成按钮，也不提供商品、用户、统计等业务模板。可交互行为和具体领域内容由使用方组合。
