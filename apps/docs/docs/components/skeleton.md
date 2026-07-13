<script setup>
import SkeletonBasic from '../../examples/skeleton/Basic.vue'
import SkeletonContent from '../../examples/skeleton/Content.vue'
</script>

# Skeleton 骨架屏

`OSkeleton` 是原子加载占位符，提供文字、矩形和圆形三种形状，也可以在 `loading=false` 时显示 default slot。它不发起请求、不测量真实内容、不决定数据何时就绪，也不强制某种卡片模板。

## 形状、尺寸与组合

<DemoBlock label="Skeleton variants dimensions and composition">
  <SkeletonBasic />
</DemoBlock>

Skeleton 可以组合成使用方需要的布局，但每个实例仍只负责自己的占位形状。显式宽高作用于整个 Skeleton，文本多行时最后一行自动缩短到逻辑宽度的 `72%`。

## 内容切换与 reduced motion

<DemoBlock label="Skeleton loading-to-content and reduced motion">
  <SkeletonContent />
</DemoBlock>

默认 slot 只在 `loading=false` 时渲染。`animated=false` 会使用静态表面；系统启用 `prefers-reduced-motion: reduce` 时，animated Skeleton 也会停止扫光并保留相同几何尺寸。

## 导入

根入口：

```ts
import { OSkeleton, type OSkeletonVariant } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

独立子入口：

```ts
import {
  OSkeleton,
  normalizeOSkeletonDimension,
  normalizeOSkeletonLines,
  oSkeletonVariants,
} from '@puzzle-fuzzy/ui/skeleton'
import '@puzzle-fuzzy/ui/styles.css'
```

## Props

| 名称     | 类型                           | 默认值   | 说明                                      |
| -------- | ------------------------------ | -------- | ----------------------------------------- |
| loading  | `boolean`                      | `true`   | true 显示占位；false 显示 default slot    |
| animated | `boolean`                      | `true`   | 是否启用低对比度扫光                      |
| variant  | `'text' \| 'rect' \| 'circle'` | `'text'` | 占位形状                                  |
| width    | `string \| number`             | —        | 整体 inline size；正数按像素处理          |
| height   | `string \| number`             | —        | 每个 shape 的 block size；正数按像素处理  |
| lines    | `number`                       | `1`      | text 行数，归一到 1–12；其他 variant 忽略 |

## Slots

| 名称      | 说明                                             |
| --------- | ------------------------------------------------ |
| `default` | `loading=false` 时渲染的真实内容；加载时不会挂载 |

## 尺寸归一与默认几何

- 正的有限 number 会向下取整并转换为像素，例如 `40.8` 变为 `40px`。
- 非空 string 会去掉首尾空白并原样作为 CSS 尺寸，支持 `%`、`rem`、`min()` 等表达式。
- `0`、负数、非有限 number 与空字符串回退到 variant 默认值。
- `text` 默认为 `100% × 1em`；`rect` 默认为 `100% × 120px`；`circle` 默认为 `40px × 40px`。
- circle 始终为 50% 圆角；text 使用紧凑 pill；rect 使用共享 medium radius。

```ts
normalizeOSkeletonDimension(48.9) // '48px'
normalizeOSkeletonDimension(' min(100%, 32rem) ') // 'min(100%, 32rem)'
normalizeOSkeletonLines(99) // 12
```

## ARIA 与加载区域

Skeleton shape 使用 `aria-hidden="true"`，不会自己播报“加载中”。只有使用方知道哪个内容区域被替换，因此应在周围稳定容器上管理 `aria-busy` 和必要的可访问名称：

```vue
<section :aria-busy="loading" aria-label="个人资料">
  <OSkeleton :loading="loading" :lines="3">
    <ProfileSummary />
  </OSkeleton>
</section>
```

不要让每个原子 shape 分别创建 live region。若加载状态需要文字说明，在区域附近提供一条可读状态即可。

## 视觉、SSR 与非目标

占位使用不透明 muted surface，没有卡片外框、装饰阴影或图标。扫光只改变背景位置，不触发布局尺寸动画；reduced motion 下背景位置固定。

组件不读取 DOM globals，尺寸归一 helper 是纯函数，可直接 SSR。`loading=true` 服务端输出稳定占位；`loading=false` 服务端直接输出 slot 内容。

`OSkeleton` 不请求数据、不创建全局 loading 状态、不测量内容、不推断 loading，也不提供固定文章、列表或卡片模板。布局组合与 `aria-busy` 的生命周期都属于使用方。
