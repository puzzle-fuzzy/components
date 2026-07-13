<script setup>
import FieldControls from '../../examples/field/Controls.vue'
import FieldErrors from '../../examples/field/Errors.vue'
import FieldLayout from '../../examples/field/Layout.vue'
</script>

# Field 表单字段

Field 家族用九个小组件明确组织标签、控件、说明、错误和字段集合。它保留原生 HTML 语义，但不加入校验器、提交器或业务规则。

## 完整控件组合

<DemoBlock label="Field controls and native semantics">
  <FieldControls />
</DemoBlock>

`OFieldLabel` 适合能通过 `for` 关联的单个控件；Checkbox、RadioGroup、Switch 等复合控件可使用 `OFieldTitle` 配合 `aria-labelledby`。

## 三种布局方向

<DemoBlock label="Field vertical horizontal responsive layouts">
  <FieldLayout />
</DemoBlock>

responsive 依据最近 `OFieldGroup` 的容器宽度切换布局，不依赖 viewport，因此放在 Dialog、Drawer 或窄 Card 中也能正确响应。

## 错误、去重与 slot

<DemoBlock label="Field errors deduplication and custom slot">
  <FieldErrors />
</DemoBlock>

`OFieldError` 会过滤空消息并按最终文本去重。单条错误直接输出文本，多条错误输出列表；default slot 存在时完全覆盖 `errors`。

## 导入

```ts
import {
  OField,
  OFieldContent,
  OFieldDescription,
  OFieldError,
  OFieldGroup,
  OFieldLabel,
  OFieldLegend,
  OFieldSet,
  OFieldTitle,
  type OFieldOrientation,
  type OFieldProps,
} from '@puzzle-fuzzy/ui/field'
import '@puzzle-fuzzy/ui/styles.css'
```

## 组件结构

| 组件                | 原生元素   | 职责                                  |
| ------------------- | ---------- | ------------------------------------- |
| `OField`            | `div`      | 单个字段的状态、方向和 context        |
| `OFieldLabel`       | `label`    | 复用 OLabel 并通过 `for` 关联单个控件 |
| `OFieldContent`     | `div`      | 聚合控件、说明与错误，不添加视觉表面  |
| `OFieldTitle`       | `div`      | 不使用 `for` 的复合控件标题           |
| `OFieldDescription` | `p`        | 帮助文字                              |
| `OFieldError`       | `div`      | 非空时输出 `role="alert"` 的错误内容  |
| `OFieldGroup`       | `div`      | 字段间距与 responsive container query |
| `OFieldSet`         | `fieldset` | 一组相关字段的原生语义与整体禁用能力  |
| `OFieldLegend`      | `legend`   | FieldSet 的原生标题                   |

## OField Props

| 名称        | 类型                                         | 默认值       | 说明                         |
| ----------- | -------------------------------------------- | ------------ | ---------------------------- |
| orientation | `'vertical' \| 'horizontal' \| 'responsive'` | `'vertical'` | 字段排列方向                 |
| disabled    | `boolean`                                    | `false`      | 向 compound 传递禁用视觉状态 |
| invalid     | `boolean`                                    | `false`      | 向 compound 传递错误视觉状态 |
| required    | `boolean`                                    | `false`      | 向 OFieldLabel 传递必填标记  |

三个布尔状态分别映射为 `data-disabled`、`data-invalid` 与 `data-required`。它们不会自动修改任意未知 control；真实控件仍需传入 `disabled`、`invalid`、`required` 或 `aria-invalid`。

## 其他 Props

### OFieldLabel

与 `OLabel` 相同：`for?: string`、`disabled?: boolean`、`required?: boolean`。自身状态与最近 OField context 使用逻辑 OR 合并。

### OFieldError

| 名称   | 类型                                                               | 默认值 | 说明                          |
| ------ | ------------------------------------------------------------------ | ------ | ----------------------------- |
| errors | `readonly (string \| { message?: string } \| null \| undefined)[]` | `[]`   | 过滤、trim 并按文本去重的消息 |

### OFieldSet

| 名称     | 类型      | 默认值  | 说明                                       |
| -------- | --------- | ------- | ------------------------------------------ |
| disabled | `boolean` | `false` | 输出原生 fieldset `disabled`，禁用后代控件 |

### OFieldLegend

| 名称    | 类型                  | 默认值     | 说明                               |
| ------- | --------------------- | ---------- | ---------------------------------- |
| variant | `'legend' \| 'label'` | `'legend'` | 只调整视觉层级，不改变 legend 语义 |

`OFieldContent`、`OFieldTitle`、`OFieldDescription` 与 `OFieldGroup` 没有组件专属 Props；原生 attrs 全部透传。

## Slots 与 Events

九个组件都提供 `default` slot。Field 家族不发出 Events；control 的 `update:modelValue`、focus、blur 与 change 保持由 control 自身负责。

## ARIA 与验证责任

- 调用方显式维护 control `id` 与 OFieldLabel `for`。
- Description 与 Error 的 `id` 应由 control 的 `aria-describedby` 引用。
- 非空 Error 固定使用 `role="alert"`；没有 slot 或有效 errors 时不渲染节点。
- Field 不自动注册 ID，以保证 SSR 结构稳定并避免改变现有 control 合同。
- `invalid` 只表达状态，不执行验证，也不会自动生成消息。
- 多个 Checkbox、Radio 或 Switch 应放入 OFieldSet，并使用 OFieldLegend 描述整组。

## 主题、RTL、窄容器与 SSR

所有表面都透明且无边框。布局使用逻辑方向，RTL 自动镜像。长 label、description 和 error 支持任意位置换行。responsive 使用 container query；不支持 container query 的环境保持安全的 vertical 布局。

组件只使用同步 Props、Slots 与 Vue provide/inject，不访问浏览器 globals，可以直接 SSR。不要在客户端首次渲染前改变字段结构、ID 或错误数组，以避免 hydration 差异。

## UI-only 边界

Field 不保存值、不校验、不格式化、不提交表单、不调用接口，也不决定错误何时出现。业务状态与规则完全由使用方持有。
