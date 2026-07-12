<script setup lang="ts">
import { OInput } from '@puzzle-fuzzy/ui'
import { LuMail, LuSearch } from 'vue-icons-plus/lu'
import { ref } from 'vue'

const keyword = ref('')
const email = ref('designer@example.com')
const password = ref('correct-horse-battery-staple')
</script>

<template>
  <div class="omg-example-stack">
    <label for="input-keyword">搜索组件</label>
    <OInput
      id="input-keyword"
      v-model="keyword"
      clearable
      clear-aria-label="清除搜索词"
      placeholder="输入组件名称…"
      type="search"
    >
      <template #prefix>
        <LuSearch aria-hidden="true" />
      </template>
    </OInput>

    <label for="input-email">邮箱</label>
    <OInput id="input-email" v-model="email" autocomplete="email" type="email">
      <template #prefix>
        <LuMail aria-hidden="true" />
      </template>
    </OInput>

    <label for="input-password">密码</label>
    <OInput
      id="input-password"
      v-model="password"
      autocomplete="current-password"
      hide-password-aria-label="隐藏密码"
      show-password
      show-password-aria-label="显示密码"
      type="password"
    />
  </div>
</template>
