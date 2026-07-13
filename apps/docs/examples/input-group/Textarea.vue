<script setup lang="ts">
import {
  OInputGroup,
  OInputGroupAddon,
  OInputGroupButton,
  OInputGroupText,
  OInputGroupTextarea,
} from '@puzzle-fuzzy/ui/input-group'
import { LuFileText, LuSend } from 'vue-icons-plus/lu'
import { ref } from 'vue'

const note = ref('复用 OTextarea 的 autosize、字符计数和受控输入行为。')
const submitted = ref(false)
</script>

<template>
  <div class="input-group-textarea">
    <OInputGroup aria-label="发布说明">
      <OInputGroupAddon align="block-start">
        <LuFileText aria-hidden="true" />
        <OInputGroupText>CHANGELOG 摘要</OInputGroupText>
      </OInputGroupAddon>
      <OInputGroupTextarea
        v-model="note"
        aria-label="摘要内容"
        :autosize="{ minRows: 3, maxRows: 7 }"
        :maxlength="180"
        show-count
      />
      <OInputGroupAddon align="block-end">
        <OInputGroupText>支持 180 个字符</OInputGroupText>
        <OInputGroupButton variant="soft" @click="submitted = true">
          <template #icon><LuSend aria-hidden="true" /></template>
          使用摘要
        </OInputGroupButton>
      </OInputGroupAddon>
    </OInputGroup>
    <span class="input-group-textarea__feedback" aria-live="polite">
      {{ submitted ? '已使用当前摘要' : '等待确认' }}
    </span>
  </div>
</template>

<style scoped lang="less">
.input-group-textarea {
  display: grid;
  width: min(100%, 620px);
  gap: var(--omg-space-2);
}

.input-group-textarea__feedback {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}
</style>
