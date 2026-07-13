<script setup lang="ts">
import { OButton } from '@puzzle-fuzzy/ui/button'
import {
  OCollapsible,
  OCollapsibleContent,
  OCollapsibleTrigger,
} from '@puzzle-fuzzy/ui/collapsible'
</script>

<template>
  <div class="collapsible-list">
    <OCollapsible class="collapsible-example" default-open>
      <OCollapsibleTrigger class="collapsible-heading">查看基础配置</OCollapsibleTrigger>
      <OCollapsibleContent>
        <div class="collapsible-copy">主题：跟随系统<br />语言：简体中文</div>
      </OCollapsibleContent>
    </OCollapsible>

    <OCollapsible class="collapsible-example">
      <OCollapsibleTrigger as-child>
        <OButton variant="soft" tone="neutral">查看构建信息</OButton>
      </OCollapsibleTrigger>
      <OCollapsibleContent>
        <div class="collapsible-copy">Vue 3.5<br />Vite 8<br />TypeScript 6</div>
      </OCollapsibleContent>
    </OCollapsible>
  </div>
</template>

<style scoped lang="less">
.collapsible-list {
  display: grid;
  inline-size: min(100%, 560px);
  gap: var(--omg-space-5);
}

.collapsible-example {
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
}

.collapsible-heading {
  font-weight: var(--omg-font-weight-semibold);
}

.collapsible-copy {
  color: var(--omg-color-text);
  line-height: 1.7;
}
</style>
