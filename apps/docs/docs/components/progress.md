<script setup>
import ProgressBasic from '../../examples/progress/Basic.vue'
import ProgressStates from '../../examples/progress/States.vue'
</script>

# Progress 进度条

`OProgress` 显示使用方提供的确定或不确定进度。它是 UI 原语，不启动上传、请求或后台任务，也不会根据完成度自动推断业务状态。

## 数值、尺寸与标签

<DemoBlock label="Progress values clamping sizes and labels">
  <ProgressBasic />
</DemoBlock>

有限数值会钳制到 `0..100`，保留小数用于填充比例，默认可见文字使用四舍五入后的百分比。`undefined`、`NaN` 和正负无穷都进入 indeterminate 模式。

## 状态、不确定进度与方向

<DemoBlock label="Progress states indeterminate dark and RTL">
  <ProgressStates />
</DemoBlock>

即使 value 为 `100`，默认 status 仍是 `normal`；成功、警告和错误必须由使用方显式传入。主题由祖先 `data-omg-theme` 提供，方向由 `dir` 继承。

## 导入

根入口：

```ts
import { OProgress, type OProgressProps } from '@puzzle-fuzzy/ui'
import '@puzzle-fuzzy/ui/styles.css'
```

独立子入口：

```ts
import { normalizeOProgressValue, OProgress } from '@puzzle-fuzzy/ui/progress'
import '@puzzle-fuzzy/ui/styles.css'
```

## Props

| 名称      | 类型                                            | 默认值     | 说明                              |
| --------- | ----------------------------------------------- | ---------- | --------------------------------- |
| value     | `number`                                        | —          | 有限数为确定进度，其他值为不确定  |
| status    | `'normal' \| 'success' \| 'warning' \| 'error'` | `'normal'` | 显式视觉状态                      |
| size      | `'sm' \| 'md'`                                  | `'md'`     | 轨道和标签尺寸                    |
| showLabel | `boolean`                                       | `false`    | 显示默认、label 或 slot 标签      |
| label     | `string`                                        | —          | 可见标签与可访问名称              |
| ariaLabel | `string`                                        | —          | 显式覆盖 progressbar 的可访问名称 |

## Slots

| 名称    | Slot props                         | 说明                                 |
| ------- | ---------------------------------- | ------------------------------------ |
| `label` | `{ value, indeterminate, status }` | 自定义可见标签；必须同时传 ariaLabel |

`value` 是归一化后的 `number | undefined`；`indeterminate` 表示是否缺少有限进度；`status` 是显式状态，不会由 value 改写。

## ARIA 与命名规则

根节点始终使用 `role="progressbar"`、`aria-valuemin="0"` 和 `aria-valuemax="100"`。确定进度提供归一化后的 `aria-valuenow`；不确定进度省略它。

可访问名称按以下顺序解析：

1. `ariaLabel`；
2. 字符串 `label`，同时也可作为可见标签；
3. `showLabel` 下的默认百分比，通过 `aria-labelledby` 指向同一个可见元素；
4. 没有可见标签或显式名称时回退到 `Progress`。

组件无法可靠地把任意 VNode slot 转成可访问名称，因此使用 `label` slot 时必须传入 `ariaLabel`；开发环境缺失时会给出简短警告并保留 `Progress` 回退名称。

## 动效、RTL 与 reduced motion

- 确定进度通过 `scaleX()` 更新填充，不使用 width 动画；transform origin 跟随逻辑 inline-start。
- RTL 下填充原点切换到右侧；不确定动画方向反转，保持从逻辑起点向终点移动。
- `prefers-reduced-motion: reduce` 下移除 transition 与循环动画，不确定进度保留静态局部填充。
- 轨道使用柔和语义表面，状态填充不添加装饰性 border。

## SSR 与非目标

`OProgress` 不读取 DOM globals，可直接服务端渲染。它不拥有上传队列、请求生命周期、任务轮询、取消行为或成功判断；使用方只需把当前 UI 值和显式 status 传入。
