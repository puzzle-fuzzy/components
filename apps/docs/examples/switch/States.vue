<script setup lang="ts">
import { ref } from 'vue'
import { OSwitch } from '@puzzle-fuzzy/ui'

const readonlyEnabled = ref(true)
const rtlEnabled = ref(true)
</script>

<template>
  <div class="switch-states">
    <section class="switch-states-panel" aria-label="Switch guarded visual states">
      <strong>不可交互与校验状态</strong>
      <OSwitch
        :model-value="false"
        label="受控拒绝更新"
        description="使用方保持 false 后，原生状态会恢复"
      />
      <OSwitch
        v-model="readonlyEnabled"
        readonly
        label="只读状态"
        description="可聚焦和读取，但不会修改值"
      />
      <OSwitch disabled label="禁用状态" />
      <OSwitch loading label="加载状态" description="loading 只是一种视觉交互状态" />
      <OSwitch invalid label="需要检查" description="invalid 会提供 aria-invalid" />
    </section>

    <section
      class="switch-states-panel switch-states-panel-dark"
      data-omg-theme="dark"
      dir="rtl"
      lang="zh-CN"
      aria-label="Switch dark RTL state"
    >
      <strong>深色 · RTL</strong>
      <OSwitch
        v-model="rtlEnabled"
        label="从逻辑起点滑动"
        description="滑块方向跟随书写方向，不复制左右两套 API"
      />
      <OSwitch size="sm" label="紧凑 RTL 开关" />
    </section>
  </div>
</template>

<style scoped lang="less">
.switch-states {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--omg-space-3);
}

.switch-states-panel {
  display: grid;
  min-width: 0;
  align-content: start;
  justify-items: start;
  gap: var(--omg-space-3);
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
  color: var(--omg-color-text);
}

.switch-states-panel > strong {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.switch-states-panel-dark {
  background: var(--omg-color-surface);
}

@media (width <= 640px) {
  .switch-states {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
