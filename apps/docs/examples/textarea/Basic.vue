<script setup lang="ts">
import { ref } from 'vue'
import { OTextarea } from '@puzzle-fuzzy/ui'

const fixedMessage = ref('第一行\n第二行\n第三行\n第四行')
const growingMessage = ref('输入更多内容时，输入框会随内容增长。')
const invalidMessage = ref('这段内容需要修改。')
const lightMessage = ref('浅色容器中的 soft 外观。')
const darkMessage = ref('深色容器中的 outline 外观。')
</script>

<template>
  <div class="omg-example-stack">
    <div class="textarea-example-grid">
      <div class="textarea-example-field">
        <label for="fixed-message-body">默认 soft · 固定三行</label>
        <OTextarea
          id="fixed-message-body"
          v-model="fixedMessage"
          aria-describedby="fixed-message-help"
          placeholder="输入要传输的文本…"
          :rows="3"
          :maxlength="120"
          show-count
        />
        <small id="fixed-message-help">固定高度，内容超出后在原生编辑区域内滚动。</small>
      </div>

      <div class="textarea-example-field">
        <label for="growing-message-body">Outline · 按内容增长</label>
        <OTextarea
          id="growing-message-body"
          v-model="growingMessage"
          aria-describedby="growing-message-help"
          placeholder="继续输入以观察高度变化…"
          :autosize="{ minRows: 2, maxRows: 6 }"
          variant="outline"
        />
        <small id="growing-message-help">从 2 行增长到 6 行，达到上限后开始滚动。</small>
      </div>
    </div>

    <div class="textarea-example-grid textarea-example-grid-states">
      <div class="textarea-example-field">
        <label for="textarea-invalid">Invalid</label>
        <OTextarea id="textarea-invalid" v-model="invalidMessage" invalid :rows="2" />
      </div>
      <div class="textarea-example-field">
        <label for="textarea-readonly">Readonly</label>
        <OTextarea id="textarea-readonly" model-value="只读内容" readonly :rows="2" />
      </div>
      <div class="textarea-example-field">
        <label for="textarea-disabled">Disabled</label>
        <OTextarea id="textarea-disabled" disabled model-value="不可编辑" :rows="2" />
      </div>
    </div>

    <div class="textarea-example-themes">
      <div class="omg-example-theme" data-omg-theme="light">
        <div class="textarea-example-field">
          <label for="textarea-light">Light</label>
          <OTextarea id="textarea-light" v-model="lightMessage" :rows="2" />
        </div>
      </div>
      <div class="omg-example-theme" data-omg-theme="dark">
        <div class="textarea-example-field">
          <label for="textarea-dark">Dark soft</label>
          <OTextarea id="textarea-dark" v-model="darkMessage" :rows="2" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.textarea-example-grid,
.textarea-example-themes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
  gap: var(--omg-space-4);
}

.textarea-example-grid-states {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
}

.textarea-example-field {
  display: grid;
  min-inline-size: 0;
  gap: var(--omg-space-1);
}

.textarea-example-field small {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
}

.omg-example-theme .textarea-example-field {
  inline-size: 100%;
}
</style>
