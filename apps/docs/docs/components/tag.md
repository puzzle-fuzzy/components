<script setup>
import TagBasic from '../../examples/tag/Basic.vue'
import TagClosable from '../../examples/tag/Closable.vue'
</script>

# Tag 标签

`OTag` 用于显示短小的分类、状态或筛选条件。它只负责视觉与关闭意图，不会自己删除标签，也不会把业务状态映射为颜色。

## 色调、变体与尺寸

五种 tone 都提供 `soft` 和 `solid` 表面。语义颜色必须配合可读文字，不能只靠颜色传达状态。

<DemoBlock label="Tag tones variants and sizes">
  <TagBasic />
</DemoBlock>

标签允许收缩，过长内容会在可用宽度内显示省略号；组件不会擅自改写或截短原始 slot 内容。图标使用 `icon` slot，并作为装饰内容隐藏于辅助技术。

## 可关闭标签

<DemoBlock label="Closable tags">
  <TagClosable />
</DemoBlock>

`close` 只携带原生 `MouseEvent`。是否从数组移除、恢复或保留标签，完全由使用方在 `@close` 中决定。

## 导入

根入口：

```ts
import { OTag, type OTagProps } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

独立子入口：

```ts
import { OTag, oTagSizes, oTagTones, oTagVariants } from '@puzzle-fuzzy/ui/tag'
import '@puzzle-fuzzy/ui/styles.css'
```

## Props

| 名称           | 类型                                                         | 默认值        | 说明                 |
| -------------- | ------------------------------------------------------------ | ------------- | -------------------- |
| tone           | `'neutral' \| 'brand' \| 'success' \| 'warning' \| 'danger'` | `'neutral'`   | 语义色调             |
| variant        | `'soft' \| 'solid'`                                          | `'soft'`      | 表面层级             |
| size           | `'sm' \| 'md'`                                               | `'md'`        | 标签高度             |
| closable       | `boolean`                                                    | `false`       | 显示关闭按钮         |
| closeAriaLabel | `string`                                                     | `'Close tag'` | 关闭按钮的可访问名称 |

## Events 与 Slots

| 类型  | 名称        | 参数         | 说明                       |
| ----- | ----------- | ------------ | -------------------------- |
| Event | `close`     | `MouseEvent` | 激活关闭按钮时发出关闭意图 |
| Slot  | `default`   | —            | 标签文字或其他短内容       |
| Slot  | `icon`      | —            | 前置装饰图标               |
| Slot  | `closeIcon` | —            | 替换默认 `LuX` 装饰图标    |

## 可访问性与视觉约束

- 可关闭标签应按当前语言传入明确的 `closeAriaLabel`；关闭按钮支持键盘和 `focus-visible`。
- tone 不是状态名称的替代品，例如成功状态仍应显示“成功”等可读文字。
- `icon` 与 `closeIcon` 都是装饰内容，不应重复标签或按钮的可访问名称。
- Tag 使用实心或柔和语义表面表达边界，不添加装饰性 border。
- 粗指针设备会扩大关闭按钮命中区，但不会改变标签的可见高度。

## SSR 与非目标

`OTag` 不读取 DOM globals，可直接服务端渲染。它不管理筛选条件、路由参数、删除确认或标签数组，也不会根据传入文字推断 tone；这些都属于使用方状态。
