<script setup>
import EmptyBasic from '../../examples/empty/Basic.vue'
import EmptyStates from '../../examples/empty/States.vue'
</script>

# Empty 空状态

`OEmpty` 为图标、标题、说明、补充内容与操作提供稳定排版。它只呈现使用方明确给出的内容，不猜测当前是无数据、无权限、请求失败还是首次使用。

## 媒体与操作

<DemoBlock label="Empty media and actions">
  <EmptyBasic />
</DemoBlock>

media 可以保持 plain，也可以用 soft 语义表面承载图标；actions 会在窄容器中保留完整可点击区域。

## UI-only 状态与深色主题

<DemoBlock label="Empty UI-only states and dark theme">
  <EmptyStates />
</DemoBlock>

空状态的含义、文案和恢复操作都由使用方决定，组件不会根据数据或异常自动切换内容。

## 导入

根入口：

```ts
import { OEmpty, type OEmptyProps, type OEmptySize } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

独立子入口：

```ts
import {
  OEmpty,
  oEmptyMediaVariants,
  oEmptySizes,
  oEmptyTitleLevels,
  type OEmptySlots,
} from '@puzzle-fuzzy/ui/empty'
import '@puzzle-fuzzy/ui/styles.css'
```

## Props

| 名称         | 类型                | 默认值    | 说明                                 |
| ------------ | ------------------- | --------- | ------------------------------------ |
| mediaVariant | `'plain' \| 'soft'` | `'plain'` | media slot 的视觉承载方式            |
| size         | `'sm' \| 'md'`      | `'md'`    | 整体间距与标题尺寸                   |
| title        | `string`            | —         | 默认标题；会被 title slot 替换       |
| description  | `string`            | —         | 默认说明；会被 description slot 替换 |
| titleLevel   | `2 \| 3 \| 4`       | `3`       | 标题实际使用的 `h2`、`h3` 或 `h4`    |

## Slots

| 名称          | 说明                                     |
| ------------- | ---------------------------------------- |
| `media`       | 装饰图标、插图或其他视觉内容             |
| `title`       | 标题内容，覆盖 `title` Prop              |
| `description` | 说明内容，覆盖 `description` Prop        |
| `default`     | 可选补充说明、链接或其他静态内容         |
| `actions`     | 恢复、创建、清除筛选等由使用方定义的操作 |

未提供内容的 media、header、content 与 actions 区域不会渲染空节点。

## ARIA 与动态状态

根节点是 `section`，默认不创建 `role` 或 `aria-live`，避免静态首屏空状态产生多余播报。若空状态在用户操作后动态替换结果区域，使用方可以按语义添加原生属性：

```vue
<OEmpty role="status" aria-live="polite" title="没有匹配结果" description="请修改搜索条件。" />
```

titleLevel 应与页面标题结构一致。media 若仅用于装饰，应在图标上设置 `aria-hidden="true"`；必要信息必须同时出现在可读标题或说明中。actions 中应使用真实按钮或链接。

## 响应式、主题、RTL 与动效

- Empty 使用容器查询适配窄区域，actions 在紧凑容器中扩展到可用 inline size。
- 长标题、说明与补充内容支持安全换行；默认无 outer border 或阴影。
- 深色主题继续消费 `--omg-*` tokens；RTL 下居中排版与逻辑尺寸保持一致。
- 组件没有加载、入场或自动切换动画，reduced-motion 不改变结构。

## SSR 与 UI-only 边界

所有可选区域都只由同步 Props 与 Slots 决定，不读取浏览器 globals，可直接 SSR。服务端与客户端使用相同状态时不会产生额外占位节点。

`OEmpty` 不读取列表长度、不区分权限或错误、不重试请求、不追踪首次使用、不导航，也不自动执行 actions。业务判断、状态切换与文案本地化由使用方负责。
