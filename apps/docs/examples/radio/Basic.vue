<script setup lang="ts">
import { ORadio, ORadioGroup, type ORadioValue } from '@puzzle-fuzzy/ui'
import { ref } from 'vue'

const channel = ref<ORadioValue>('email')
const density = ref<ORadioValue>(2)
const invalidMode = ref<ORadioValue>('manual')
const darkMode = ref<ORadioValue>('system')
</script>

<template>
  <div class="radio-example">
    <section class="radio-example-section" aria-labelledby="radio-basic-title">
      <strong id="radio-basic-title" class="radio-example-title">基础与禁用</strong>

      <span id="channel-label">通知方式</span>
      <ORadioGroup v-model="channel" aria-labelledby="channel-label" orientation="horizontal">
        <ORadio label="邮件" value="email" />
        <ORadio label="短信" value="sms" />
        <ORadio disabled label="电话（不可用）" value="phone" />
      </ORadioGroup>
      <small class="radio-example-meta" aria-live="polite"> 当前通知方式：{{ channel }} </small>

      <span id="density-label">界面密度</span>
      <ORadioGroup v-model="density" aria-labelledby="density-label">
        <ORadio label="紧凑" :value="1" />
        <ORadio label="舒适" :value="2" />
      </ORadioGroup>
    </section>

    <section class="radio-example-section" aria-labelledby="radio-invalid-title">
      <strong id="radio-invalid-title" class="radio-example-title">错误与长文本</strong>
      <span id="invalid-mode-label">发布策略</span>
      <ORadioGroup
        v-model="invalidMode"
        aria-describedby="invalid-mode-help"
        aria-labelledby="invalid-mode-label"
        invalid
      >
        <ORadio label="手动发布" value="manual" />
        <ORadio label="通过全部质量检查后自动发布到当前项目所配置的环境" value="automatic" />
      </ORadioGroup>
      <small id="invalid-mode-help" class="radio-example-meta">
        invalid 由使用方控制，整组使用一致的错误色。
      </small>
    </section>

    <section
      class="radio-example-section radio-example-section-dark"
      data-omg-theme="dark"
      aria-labelledby="radio-dark-title"
    >
      <strong id="radio-dark-title" class="radio-example-title">深色主题</strong>
      <span id="dark-mode-label">颜色模式</span>
      <ORadioGroup v-model="darkMode" aria-labelledby="dark-mode-label">
        <ORadio label="跟随系统" value="system" />
        <ORadio label="始终使用深色" value="dark" />
      </ORadioGroup>
    </section>
  </div>
</template>

<style scoped lang="less">
.radio-example {
  display: grid;
  inline-size: 100%;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: var(--omg-space-5);
}

.radio-example-section {
  display: flex;
  min-inline-size: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--omg-space-2);
  color: var(--omg-color-text);
}

.radio-example-section-dark {
  padding: var(--omg-space-4);
  border-radius: var(--omg-radius-lg);
  background: var(--omg-color-surface-muted);
}

.radio-example-title {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
  line-height: 1.2;
}

.radio-example-meta {
  color: var(--omg-color-text-muted);
  font-size: var(--omg-font-size-sm);
  line-height: 1.5;
}
</style>
