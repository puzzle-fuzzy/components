<script setup>
import CollapsibleBasic from '../../examples/collapsible/Basic.vue'
import CollapsibleControlled from '../../examples/collapsible/Controlled.vue'
</script>

# Collapsible 折叠区域

Collapsible 用于切换一段独立内容。它由 Root、Trigger 和 Content 三部分组成，提供受控与非受控状态、原生按钮键盘语义、稳定 ARIA 关联和可关闭的展开动效。

## 基础与 OButton 组合

<DemoBlock label="Collapsible basic and button composition">
  <CollapsibleBasic />
</DemoBlock>

裸 Trigger 不附加按钮皮肤，但保留清晰的 `focus-visible`。`asChild` 可以把 Trigger 合并到 `OButton` 等单一交互根节点，避免嵌套 button。

## 受控与禁用

<DemoBlock label="Collapsible controlled and disabled">
  <CollapsibleControlled />
</DemoBlock>

传入 `open` 后，Root 只发出下一次状态请求。外部按钮和内部 Trigger 可以共享同一个 `ref`，disabled Root 不响应任何切换请求。

## 导入

```ts
import {
  OCollapsible,
  OCollapsibleContent,
  OCollapsibleTrigger,
} from '@puzzle-fuzzy/ui/collapsible'
import '@puzzle-fuzzy/ui/styles.css'
```

## OCollapsible Props

| 名称          | 类型                  | 默认值  | 说明                               |
| ------------- | --------------------- | ------- | ---------------------------------- |
| open          | `boolean`             | —       | 受控展开状态                       |
| defaultOpen   | `boolean`             | `false` | 非受控初始状态                     |
| disabled      | `boolean`             | `false` | 禁用整个折叠区域                   |
| unmountOnHide | `boolean`             | `true`  | 收起完成后是否卸载 slot 内容       |
| as            | `string \| Component` | `'div'` | 根元素或组件                       |
| asChild       | `boolean`             | `false` | 将 Root 属性合并到唯一 slot 根节点 |

## 子组件 Props

| 组件                  | Props                  | 默认值              | 说明                       |
| --------------------- | ---------------------- | ------------------- | -------------------------- |
| `OCollapsibleTrigger` | `as`, `asChild`        | `'button'`, `false` | 替换触发器或组合现有控件   |
| `OCollapsibleContent` | `forceMount?: boolean` | `false`             | 无论状态如何都保留内容节点 |
| `OCollapsibleContent` | `as`, `asChild`        | `'div'`, `false`    | 替换内容根节点             |

## Emits 与 Slots

| 组件                  | 名称          | 参数                | 说明             |
| --------------------- | ------------- | ------------------- | ---------------- |
| `OCollapsible`        | `update:open` | `boolean`           | 请求更新展开状态 |
| `OCollapsible`        | `default`     | `{ open: boolean }` | 当前展开状态     |
| `OCollapsibleTrigger` | `default`     | —                   | 触发器内容       |
| `OCollapsibleContent` | `default`     | —                   | 折叠内容         |

## 受控规则与 asChild

- 未传 `open` 时，Root 从 `defaultOpen` 初始化并自行保存状态。
- 传入 `open` 时，交互只发出 `update:open`。父级不回写时，界面保持传入状态。
- `asChild` slot 必须只有一个有意义的根节点。根节点需要能够接收 class、ARIA、disabled 和点击事件。
- `forceMount` 让节点持续存在，适合外部动画或需要保留 DOM 的组合；内容显示策略仍由 `data-state` 表达。

## 键盘与 ARIA

| 按键             | 行为                         |
| ---------------- | ---------------------------- |
| Tab、Shift + Tab | 按页面顺序进入或离开 Trigger |
| Enter、Space     | 使用原生 button 语义切换内容 |

Trigger 保留 `aria-expanded`、`aria-controls`、`disabled` 和 `data-state`。Content 使用稳定 ID 与 Trigger 关联。禁用状态不会创建额外 Tab 停靠点。

## SSR、主题与 reduced motion

组件使用 Vue `useId` 和 Reka 的服务端安全状态，不直接读取浏览器 globals。open、closed 和 `forceMount` 都可以在 SSR 中输出稳定结构。

Root 和 Content 默认无外边框。调用方可通过表面、间距或现有组件表达层级。展开只改变实际测量高度与 opacity；`prefers-reduced-motion: reduce` 下动画时长归零。

## UI-only 边界

Collapsible 不加载数据、不保存偏好、不判断权限，也不把展开状态同步到路由或存储。组件只管理可复用的显示状态、语义和交互意图。
