<script setup lang="ts">
import {
  OAccordion,
  OAccordionContent,
  OAccordionItem,
  OAccordionTrigger,
} from '@puzzle-fuzzy/ui/accordion'
import { ref } from 'vue'

const activeItem = ref<string | undefined>('structure')
</script>

<template>
  <OAccordion v-model="activeItem" class="accordion-demo" collapsible>
    <OAccordionItem value="structure">
      <OAccordionTrigger>组件由哪些部分组成？</OAccordionTrigger>
      <OAccordionContent>
        Root 管理展开状态，Item 提供唯一值，Trigger 与 Content 建立完整的 ARIA 关联。
      </OAccordionContent>
    </OAccordionItem>

    <OAccordionItem value="control">
      <OAccordionTrigger>可以完全受控吗？</OAccordionTrigger>
      <OAccordionContent>
        可以。传入 modelValue 后，组件只发出 update:modelValue，实际状态由使用方回写。
      </OAccordionContent>
    </OAccordionItem>

    <OAccordionItem value="scope">
      <OAccordionTrigger>组件会处理业务数据吗？</OAccordionTrigger>
      <OAccordionContent>
        不会。Accordion 只管理展开交互、键盘导航、语义和视觉状态。
      </OAccordionContent>
    </OAccordionItem>
  </OAccordion>
</template>

<style scoped lang="less">
.accordion-demo {
  inline-size: min(100%, 640px);
}
</style>
