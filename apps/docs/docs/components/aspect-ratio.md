<script setup>
import AspectRatioBasic from '../../examples/aspect-ratio/Basic.vue'
import AspectRatioResponsive from '../../examples/aspect-ratio/Responsive.vue'
</script>

# Aspect Ratio 宽高比

`OAspectRatio` 使用原生 CSS `aspect-ratio` 为媒体或自定义内容保留稳定比例。它只提供几何约束，不添加背景、圆角、裁切或媒体加载逻辑。

## 媒体容器

<DemoBlock label="Aspect Ratio media">
  <AspectRatioBasic />
</DemoBlock>

内容的视觉样式由使用方决定。若需要让图片或视频填满容器，应在内容上自行设置 `width`、`height` 与 `object-fit`。

## 响应式比例

<DemoBlock label="Aspect Ratio responsive shapes">
  <AspectRatioResponsive />
</DemoBlock>

组件始终跟随可用 inline size 计算 block size，因此可以直接放入响应式 Grid、Flex 或普通流式布局。

## 导入

根入口：

```ts
import { OAspectRatio, type OAspectRatioProps } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

独立子入口：

```ts
import {
  DEFAULT_O_ASPECT_RATIO,
  normalizeOAspectRatio,
  OAspectRatio,
} from '@puzzle-fuzzy/ui/aspect-ratio'
import '@puzzle-fuzzy/ui/styles.css'
```

## Props

| 名称  | 类型     | 默认值   | 说明                                               |
| ----- | -------- | -------- | -------------------------------------------------- |
| ratio | `number` | `16 / 9` | width / height；非正数或非有限值会回退到默认宽高比 |

## Slots

| 名称      | 说明                            |
| --------- | ------------------------------- |
| `default` | 需要被约束宽高比的任意 Vue 内容 |

`normalizeOAspectRatio()` 是公开纯函数。`0`、负数、`NaN` 与正负 `Infinity` 都归一为 `DEFAULT_O_ASPECT_RATIO`，避免产生无效 CSS。

## ARIA 与内容语义

Aspect Ratio 本身只是布局容器，不创建 role 或可访问名称。图片仍需准确的 `alt`，视频仍需字幕和原生控件；若容器本身需要语义，可以直接传入原生 `aria-*`、`role`、`id` 或 `data-*` 属性。

宽高比不会裁切溢出内容，也不会替内容管理焦点。不要把必要文字只放进视觉背景图中。

## 主题、RTL 与动效

- 组件没有自己的表面颜色，深色主题由 slot 内容继续消费 `--omg-*` tokens。
- 宽高比与书写方向无关，根节点使用逻辑 inline size，在 RTL 中保持相同几何行为。
- 组件没有动画；`prefers-reduced-motion` 不会改变比例或布局。

## SSR 与非目标

组件只同步计算一个 CSS 自定义属性，不读取 DOM、viewport 或浏览器 globals，可直接 SSR。服务端与客户端使用相同 `ratio` 时会输出一致几何结构。

`OAspectRatio` 不加载图片或视频、不读取媒体元数据、不提供懒加载、占位图、错误回退、预览层、轮播或业务操作。需要这些能力时由使用方组合 `OImage`、原生媒体元素或其他组件。
