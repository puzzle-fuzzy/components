# OMG UI

OMG UI 是一个仅面向 Vue 3 的个人组件库，发布包为 `@puzzle-fuzzy/ui`。

## 开发

```bash
corepack pnpm install
pnpm docs:dev
```

## 验证

```bash
pnpm verify
```

## 工作区

- `packages/ui`：唯一发布的组件包。
- `apps/docs`：VitePress 文档与真实消费示例。

项目当前为首次发布前重构阶段，不提供旧包名、CommonJS 或 UMD 兼容入口。
