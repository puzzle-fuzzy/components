<script setup>
import SpinnerBasic from '../../examples/spinner/Basic.vue'
import SpinnerContexts from '../../examples/spinner/Contexts.vue'
</script>

# Spinner 加载指示器

`OSpinner` 是轻量、不确定进度指示器，使用 `vue-icons-plus` 的 Lucide Loader 图标并继承当前文字颜色。它只表达“正在进行”，不持有 loading 状态，也不执行异步任务。

## 尺寸与状态

<DemoBlock label="Spinner sizes and status">
  <SpinnerBasic />
</DemoBlock>

独立 Spinner 默认是带可访问名称的 status。不同 size 只改变图标几何，不改变语义。

## 上下文、深色主题与动效

<DemoBlock label="Spinner contexts dark and motion">
  <SpinnerContexts />
</DemoBlock>

放在已经包含“正在保存”等可读文字的按钮中时，可以设置 decorative，避免辅助技术重复播报。

## 导入

根入口：

```ts
import { OSpinner, type OSpinnerProps, type OSpinnerSize } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

独立子入口：

```ts
import { OSpinner, oSpinnerSizes, type OSpinnerSlots } from '@puzzle-fuzzy/ui/spinner'
import '@puzzle-fuzzy/ui/styles.css'
```

## Props

| 名称       | 类型                   | 默认值      | 说明                                        |
| ---------- | ---------------------- | ----------- | ------------------------------------------- |
| size       | `'sm' \| 'md' \| 'lg'` | `'md'`      | 14px、18px 或 24px 的指示器尺寸             |
| label      | `string`               | `'Loading'` | 非 decorative 模式的 `aria-label`           |
| decorative | `boolean`              | `false`     | 移除 status 语义并设置 `aria-hidden="true"` |

## Slots

`OSpinner` 没有 Slots。标准图标由组件统一管理；如需完全不同的视觉形态，应创建独立的状态呈现，而不是把 Spinner 当作任意图标容器。

## ARIA

默认输出 `role="status"` 与 `aria-label`。请把 label 改为当前语言下具体的状态，例如“正在同步文件”；默认英文值只适合作为开发期回退。

设置 decorative 后，根节点使用 `aria-hidden="true"`，同时移除 role 与 label。只有附近已经有等价可读状态时才使用 decorative：

```vue
<OButton disabled>
  <template #icon><OSpinner decorative size="sm" /></template>
  正在保存
</OButton>
```

Spinner 表示不确定进度。若可以提供确定百分比，应使用 `OProgress` 并给出准确可访问值。

## 主题、RTL 与 reduced motion

Spinner 继承 `currentColor`，因此会跟随按钮、正文和 `data-omg-theme="dark"` 容器的颜色，不设置额外背景或边框。旋转不依赖方向，在 RTL 中保持相同语义。

系统启用 `prefers-reduced-motion: reduce` 时旋转动画会完全停止，指示器仍保留尺寸、颜色和 status 语义，不触发布局变化。

## SSR 与 UI-only 边界

组件不读取浏览器 globals，可直接 SSR。服务端会输出相同的状态容器与静态 SVG 结构，动画只由 CSS 在客户端决定。

`OSpinner` 不发起请求、不绑定 Promise、不切换 disabled、不计算进度、不设置超时，也不决定何时隐藏。loading 生命周期、错误处理与重试属于使用方。
