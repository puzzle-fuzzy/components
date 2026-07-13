<script setup lang="ts">
import { OKbd, OKbdGroup } from '@puzzle-fuzzy/ui'
</script>

<template>
  <div class="kbd-basic">
    <p>按 <OKbd>Esc</OKbd> 关闭当前浮层。</p>
    <p>
      保存更改：
      <OKbdGroup aria-label="Control 加 S">
        <OKbd size="md">Ctrl</OKbd>
        <span aria-hidden="true">+</span>
        <OKbd size="md">S</OKbd>
      </OKbdGroup>
    </p>
  </div>
</template>

<style scoped lang="less">
.kbd-basic {
  display: grid;
  gap: var(--omg-space-3);
}

.kbd-basic p {
  margin: 0;
  color: var(--omg-color-text-muted);
}
</style>
