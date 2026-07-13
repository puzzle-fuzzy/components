<script setup lang="ts">
import { OAlert, OButton } from '@puzzle-fuzzy/ui'
import { LuSparkles } from 'vue-icons-plus/lu'
</script>

<template>
  <div class="alert-basic">
    <OAlert status="info" title="信息提示" description="适合需要持续留在当前布局中的说明。">
      <template #action>
        <OButton size="sm" variant="ghost">查看详情</OButton>
      </template>
    </OAlert>

    <OAlert status="success" title="设置已准备完成" />

    <OAlert status="warning"> 当前选择会影响后续新建项目，但组件不会替你保存这项设置。 </OAlert>

    <OAlert
      status="error"
      title="自定义图标"
      description="icon slot 只替换装饰图标，不改变反馈内容或状态语义。"
    >
      <template #icon><LuSparkles /></template>
      <template #action>
        <OButton size="sm" tone="danger">检查输入</OButton>
      </template>
    </OAlert>

    <OAlert :show-icon="false" description="也可以隐藏图标，但应保留清楚的可读文字。" />
  </div>
</template>

<style scoped lang="less">
.alert-basic {
  display: grid;
  width: 100%;
  gap: var(--omg-space-3);
}
</style>
