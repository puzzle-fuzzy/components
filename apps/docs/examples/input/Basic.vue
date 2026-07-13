<script setup lang="ts">
import { OInput } from '@puzzle-fuzzy/ui'
import { LuMail, LuSearch } from 'vue-icons-plus/lu'
import { ref } from 'vue'

const keyword = ref('')
const email = ref('designer@example.com')
const password = ref('correct-horse-battery-staple')
const invalidValue = ref('not-an-email')
const lightValue = ref('Light surface')
const darkValue = ref('Dark surface')
</script>

<template>
  <div class="omg-example-stack">
    <div class="input-example-grid">
      <div class="input-example-field">
        <label for="input-keyword">搜索组件 · 默认 soft</label>
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
      </div>

      <div class="input-example-field">
        <label for="input-email">Outline 邮箱</label>
        <OInput
          id="input-email"
          v-model="email"
          autocomplete="email"
          type="email"
          variant="outline"
        >
          <template #prefix>
            <LuMail aria-hidden="true" />
          </template>
        </OInput>
      </div>

      <div class="input-example-field">
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
    </div>

    <div class="input-example-grid">
      <div class="input-example-field">
        <label for="input-invalid">Invalid</label>
        <OInput id="input-invalid" v-model="invalidValue" invalid type="email" />
      </div>
      <div class="input-example-field">
        <label for="input-readonly">Readonly</label>
        <OInput id="input-readonly" model-value="只读内容" readonly />
      </div>
      <div class="input-example-field">
        <label for="input-disabled">Disabled</label>
        <OInput id="input-disabled" disabled model-value="不可编辑" />
      </div>
    </div>

    <div class="input-example-themes">
      <div class="omg-example-theme" data-omg-theme="light">
        <div class="input-example-field">
          <label for="input-light">Light</label>
          <OInput id="input-light" v-model="lightValue" />
        </div>
      </div>
      <div class="omg-example-theme" data-omg-theme="dark">
        <div class="input-example-field">
          <label for="input-dark">Dark soft</label>
          <OInput id="input-dark" v-model="darkValue" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.input-example-grid,
.input-example-themes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: var(--omg-space-4);
}

.input-example-field {
  display: grid;
  min-inline-size: 0;
  gap: var(--omg-space-1);
}

.omg-example-theme .input-example-field {
  inline-size: 100%;
}
</style>
