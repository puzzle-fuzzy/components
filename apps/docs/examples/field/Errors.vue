<script setup lang="ts">
import {
  OField,
  OFieldContent,
  OFieldDescription,
  OFieldError,
  OFieldGroup,
  OFieldLabel,
} from '@puzzle-fuzzy/ui/field'
import { OInput } from '@puzzle-fuzzy/ui/input'
import { ref } from 'vue'

const username = ref('om')
const token = ref('expired-token')
const usernameErrors = [
  '至少输入 3 个字符',
  { message: '至少输入 3 个字符' },
  { message: '只能使用字母、数字和连字符' },
]
</script>

<template>
  <OFieldGroup class="field-errors">
    <OField invalid required>
      <OFieldLabel for="field-username">组件命名空间</OFieldLabel>
      <OFieldContent>
        <OInput
          id="field-username"
          v-model="username"
          aria-describedby="field-username-help field-username-error"
          invalid
          required
        />
        <OFieldDescription id="field-username-help">用于生成 CSS class 前缀。</OFieldDescription>
        <OFieldError id="field-username-error" :errors="usernameErrors" />
      </OFieldContent>
    </OField>

    <OField invalid>
      <OFieldLabel for="field-token">访问令牌</OFieldLabel>
      <OFieldContent>
        <OInput id="field-token" v-model="token" aria-describedby="field-token-error" invalid />
        <OFieldError id="field-token-error" :errors="['令牌无效']">
          <span>令牌已经过期，请生成新令牌。</span>
        </OFieldError>
      </OFieldContent>
    </OField>
  </OFieldGroup>
</template>

<style scoped lang="less">
.field-errors {
  width: min(100%, 560px);
}
</style>
