<script setup lang="ts">
import {
  OAccordion,
  OAccordionContent,
  OAccordionItem,
  OAccordionTrigger,
} from '@puzzle-fuzzy/ui/accordion'
import { OButton } from '@puzzle-fuzzy/ui/button'
</script>

<template>
  <OAccordion
    class="accordion-horizontal"
    type="single"
    default-value="first"
    orientation="horizontal"
    dir="rtl"
    collapsible
    aria-label="RTL 水平手风琴"
  >
    <OAccordionItem value="first">
      <OAccordionTrigger as-child>
        <OButton variant="soft" tone="neutral">第一项</OButton>
      </OAccordionTrigger>
      <OAccordionContent>水平模式会把宽度变化用于展开动效。</OAccordionContent>
    </OAccordionItem>

    <OAccordionItem value="second">
      <OAccordionTrigger as-child>
        <OButton variant="soft" tone="neutral">第二项</OButton>
      </OAccordionTrigger>
      <OAccordionContent>在 RTL 中，左右方向键会按照阅读方向移动焦点。</OAccordionContent>
    </OAccordionItem>
  </OAccordion>
</template>

<style scoped lang="less">
.accordion-horizontal {
  inline-size: min(100%, 720px);
  padding-block: var(--omg-space-2);
}
</style>
