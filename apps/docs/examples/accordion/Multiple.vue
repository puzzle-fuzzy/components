<script setup lang="ts">
import {
  OAccordion,
  OAccordionContent,
  OAccordionItem,
  OAccordionTrigger,
} from '@puzzle-fuzzy/ui/accordion'
import { ref } from 'vue'
import { LuHelpCircle } from 'vue-icons-plus/lu'

const activeItems = ref<string[]>(['keyboard'])
</script>

<template>
  <OAccordion v-model="activeItems" class="accordion-demo" type="multiple">
    <OAccordionItem value="keyboard">
      <OAccordionTrigger>
        键盘导航
        <template #icon><LuHelpCircle /></template>
      </OAccordionTrigger>
      <OAccordionContent>
        垂直模式使用上下方向键，Home 和 End 可以直接移动到首尾触发器。
      </OAccordionContent>
    </OAccordionItem>

    <OAccordionItem value="motion">
      <OAccordionTrigger>展开动效</OAccordionTrigger>
      <OAccordionContent>
        内容使用实际测量尺寸展开，并在 reduced motion 环境中关闭动画。
      </OAccordionContent>
    </OAccordionItem>

    <OAccordionItem value="locked" disabled>
      <OAccordionTrigger>暂不可用的项目</OAccordionTrigger>
      <OAccordionContent>禁用项目不会响应指针或键盘展开操作。</OAccordionContent>
    </OAccordionItem>
  </OAccordion>
</template>

<style scoped lang="less">
.accordion-demo {
  inline-size: min(100%, 640px);
}
</style>
