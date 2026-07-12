<script setup lang="ts">
import { ODivider } from '@puzzle-fuzzy/ui'
</script>

<template>
  <div class="omg-example-stack">
    <div>
      <span>上方内容</span>
      <ODivider />
      <span>下方内容</span>
    </div>

    <ODivider content-position="left">左侧标题</ODivider>
    <ODivider dashed>居中虚线</ODivider>
    <ODivider content-position="right">右侧标题</ODivider>

    <div class="divider-inline">
      <span>基础信息</span>
      <ODivider direction="vertical" />
      <span>安全设置</span>
      <ODivider direction="vertical" dashed />
      <span>通知</span>
    </div>
  </div>
</template>

<style scoped lang="less">
.divider-inline {
  display: flex;
  align-items: center;
  color: var(--omg-color-text);
}
</style>
