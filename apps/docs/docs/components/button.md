<script setup>
import ButtonIconButtons from '../../examples/button/IconButtons.vue'
import ButtonStates from '../../examples/button/States.vue'
import ButtonThemes from '../../examples/button/Themes.vue'
import ButtonVariants from '../../examples/button/Variants.vue'
</script>

# Button 按钮

`OButton` 用于触发即时操作。默认原生类型是 `button`，loading 和 disabled 状态会阻止业务 click。

## 基础与外观

<DemoBlock label="Button variants">
  <ButtonVariants />
</DemoBlock>

## 尺寸与状态

<DemoBlock label="Button sizes and states">
  <ButtonStates />
</DemoBlock>

## 图标按钮

`icon-only` 复用普通按钮的尺寸、外观和状态。图标仍放在 `icon` slot；默认 slot 文本会在视觉上隐藏并作为可访问名称保留，也可以直接传入原生 `aria-label` 或 `aria-labelledby`。

<DemoBlock label="Icon-only buttons">
  <ButtonIconButtons />
</DemoBlock>

## 容器主题

组件不提供 `theme` prop。将 `data-omg-theme="light|dark"` 放在任意祖先容器即可局部切换主题。

<DemoBlock label="Button container themes">
  <ButtonThemes />
</DemoBlock>

## 使用

```vue
<script setup lang="ts">
import { OButton } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
</script>

<template>
  <OButton variant="soft" :loading="isSaving">保存</OButton>
</template>
```

## Props

| 名称     | 类型                                        | 默认值     | 说明                         |
| -------- | ------------------------------------------- | ---------- | ---------------------------- |
| variant  | `'solid' \| 'soft' \| 'outline' \| 'ghost'` | `'solid'`  | 视觉层级                     |
| size     | `'sm' \| 'md' \| 'lg'`                      | `'md'`     | 控件尺寸                     |
| tone     | `'brand' \| 'neutral' \| 'danger'`          | `'brand'`  | 语义色调                     |
| type     | `'button' \| 'submit' \| 'reset'`           | `'button'` | 原生按钮类型                 |
| loading  | `boolean`                                   | `false`    | 忙碌且不可点击               |
| iconOnly | `boolean`                                   | `false`    | 使用对应控件高度的正方形模式 |
| disabled | `boolean`                                   | `false`    | 禁用                         |

## Events 与 Slots

| 类型  | 名称      | 说明                              |
| ----- | --------- | --------------------------------- |
| Event | `click`   | 仅在可交互状态发出原生 MouseEvent |
| Slot  | `default` | 按钮内容；icon-only 时视觉隐藏    |
| Slot  | `icon`    | 图标内容                          |

## 可访问性

- loading 使用 `aria-busy` 并保留可访问名称。
- icon-only 必须通过默认 slot 文本、`aria-label` 或 `aria-labelledby` 提供可访问名称。
- focus-visible 有独立焦点环。
- 非必要动画在 reduced-motion 环境中关闭。
