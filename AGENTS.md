# OMG UI project instructions

- 使用 Python 编写临时检查或迁移脚本，避免 PowerShell 编码问题。
- 使用 Node.js 24 LTS 与 pnpm；不要添加 Bun 专用脚本、配置或锁文件。
- 使用 `pnpm <script>`、`pnpm --filter <package> <script>` 和 `pnpm exec <command>`。
- Vue SFC 的构建与测试统一使用 Vite、`@vitejs/plugin-vue` 和 Vitest。
- `packages/ui` 是唯一发布包；`apps/docs` 是私有 VitePress 消费应用。
- 公共命名使用 `O*` 组件、`.o-*` CSS 类和 `--omg-*` CSS Variables。
- 新增组件时复制现有组件目录合同，并同时补齐类型、样式、测试和文档。
- 提交前运行 `pnpm verify`。
