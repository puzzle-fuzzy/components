# @puzzle-fuzzy/ui

OMG UI 是一个仅面向 Vue 3 的个人组件库。

## 安装

```bash
pnpm add @puzzle-fuzzy/ui
```

## 使用

```vue
<script setup lang="ts">
import { OButton } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
</script>

<template>
  <OButton variant="soft">保存</OButton>
</template>
```

也可以使用显式组件子入口：

- `@puzzle-fuzzy/ui/button`
- `@puzzle-fuzzy/ui/avatar`
- `@puzzle-fuzzy/ui/avatar-group`
- `@puzzle-fuzzy/ui/avatar-flow`
- `@puzzle-fuzzy/ui/code-input`
- `@puzzle-fuzzy/ui/divider`

## 主题

默认跟随系统主题。需要显式或局部主题时，在祖先容器设置：

```html
<section data-omg-theme="dark">
  <!-- OMG UI components -->
</section>
```

公开样式变量统一使用 `--omg-*` 前缀。

## 范围

- Vue `^3.5.0` 是必需 peer dependency。
- TypeScript 消费项目使用 `moduleResolution: "Bundler"`。
- 只发布 ESM，不提供 CommonJS、UMD 或框架中立入口。
- 本包使用 `UNLICENSED`，公开可安装不代表授予复制、修改或再发布权利。
