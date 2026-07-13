<script setup lang="ts">
import { OCheckbox } from '@puzzle-fuzzy/ui/checkbox'
import {
  OField,
  OFieldContent,
  OFieldDescription,
  OFieldGroup,
  OFieldLabel,
  OFieldLegend,
  OFieldSet,
  OFieldTitle,
} from '@puzzle-fuzzy/ui/field'
import { OInput } from '@puzzle-fuzzy/ui/input'
import { ORadio, ORadioGroup, type ORadioValue } from '@puzzle-fuzzy/ui/radio'
import { OSwitch } from '@puzzle-fuzzy/ui/switch'
import { OTextarea } from '@puzzle-fuzzy/ui/textarea'
import { ref } from 'vue'

const name = ref('Puzzle Fuzzy')
const note = ref('保持组件只有 UI 能力。')
const includeTests = ref(true)
const channel = ref<ORadioValue>('stable')
const publishDocs = ref(true)
</script>

<template>
  <OFieldSet class="field-controls">
    <OFieldLegend>组件发布设置</OFieldLegend>
    <OFieldDescription id="field-controls-help">
      Field 只组织语义与布局，所有数据仍由使用方持有。
    </OFieldDescription>

    <OFieldGroup aria-describedby="field-controls-help">
      <OField required>
        <OFieldLabel for="field-package-name">显示名称</OFieldLabel>
        <OFieldContent>
          <OInput id="field-package-name" v-model="name" required />
          <OFieldDescription>用于文档标题，不改变包名。</OFieldDescription>
        </OFieldContent>
      </OField>

      <OField>
        <OFieldLabel for="field-release-note">发布说明</OFieldLabel>
        <OFieldContent>
          <OTextarea id="field-release-note" v-model="note" autosize :rows="2" />
        </OFieldContent>
      </OField>

      <OField orientation="horizontal">
        <OFieldTitle>测试</OFieldTitle>
        <OCheckbox v-model="includeTests" label="包含完整测试结果" />
      </OField>

      <OField orientation="horizontal">
        <OFieldTitle id="field-channel-title">通道</OFieldTitle>
        <ORadioGroup
          v-model="channel"
          aria-labelledby="field-channel-title"
          orientation="horizontal"
        >
          <ORadio label="稳定" value="stable" />
          <ORadio label="预览" value="preview" />
        </ORadioGroup>
      </OField>

      <OField orientation="horizontal">
        <OFieldTitle>文档</OFieldTitle>
        <OSwitch
          v-model="publishDocs"
          label="同步发布 VitePress 文档"
          description="关闭时只构建组件包"
        />
      </OField>
    </OFieldGroup>
  </OFieldSet>
</template>

<style scoped lang="less">
.field-controls {
  width: min(100%, 680px);
}
</style>
