<script setup lang="ts">
import {
  OField,
  OFieldContent,
  OFieldDescription,
  OFieldGroup,
  OFieldLabel,
} from '@puzzle-fuzzy/ui/field'
import { OInput } from '@puzzle-fuzzy/ui/input'
import { ref } from 'vue'

const vertical = ref('vertical')
const horizontal = ref('horizontal')
const responsive = ref('resize the demo')
</script>

<template>
  <OFieldGroup class="field-layout">
    <OField orientation="vertical">
      <OFieldLabel for="field-vertical">Vertical</OFieldLabel>
      <OFieldContent>
        <OInput id="field-vertical" v-model="vertical" />
      </OFieldContent>
    </OField>

    <OField orientation="horizontal">
      <OFieldLabel for="field-horizontal">Horizontal</OFieldLabel>
      <OFieldContent>
        <OInput id="field-horizontal" v-model="horizontal" />
        <OFieldDescription>Label 与 control 使用逻辑方向列布局。</OFieldDescription>
      </OFieldContent>
    </OField>

    <OField orientation="responsive">
      <OFieldLabel for="field-responsive">Responsive</OFieldLabel>
      <OFieldContent>
        <OInput id="field-responsive" v-model="responsive" />
        <OFieldDescription>根据 FieldGroup 宽度切换，不依赖 viewport。</OFieldDescription>
      </OFieldContent>
    </OField>
  </OFieldGroup>
</template>

<style scoped lang="less">
.field-layout {
  width: 100%;
}
</style>
