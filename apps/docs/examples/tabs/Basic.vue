<script setup lang="ts">
import { ref } from 'vue'
import { OTabs, type OTabsItem } from '@puzzle-fuzzy/ui'

const sliderVal = ref('text')
const lineVal = ref('overview')
const fillSliderVal = ref('tab1')
const fillLineVal = ref('tab1')
const disabledVal = ref('photo')

const transferItems: OTabsItem[] = [
  { value: 'text', label: '传输文本' },
  { value: 'file', label: '传输文件' },
]

const lineItems: OTabsItem[] = [
  { value: 'overview', label: '概览' },
  { value: 'activity', label: '动态' },
  { value: 'disabled', label: '禁用', disabled: true },
]

const fillItems: OTabsItem[] = [
  { value: 'tab1', label: '标签一' },
  { value: 'tab2', label: '标签二' },
  { value: 'tab3', label: '标签三' },
  { value: 'tab4', label: '标签四' },
]

const disabledItems: OTabsItem[] = [
  { value: 'photo', label: '照片' },
  { value: 'album', label: '专辑', disabled: true },
  { value: 'video', label: '视频' },
]

const descriptions: Record<string, string> = {
  text: '编辑并传输一段文本内容。',
  file: '选择并传输一个或多个文件。',
  overview: '查看当前任务的概要信息。',
  activity: '查看最近的操作记录。',
  disabled: '此视图当前不可用。',
  tab1: '第一个标签页的内容。',
  tab2: '第二个标签页的内容。',
  tab3: '第三个标签页的内容。',
  tab4: '第四个标签页的内容。',
  photo: '浏览所有照片。',
  album: '专辑视图当前不可用。',
  video: '浏览所有视频。',
}
</script>

<template>
  <div class="omg-example-stack">
    <!-- Slider variant -->
    <div class="omg-example-theme">
      <div style="width: 100%">
        <div class="omg-example-label">slider 变体（默认）</div>
        <OTabs v-model="sliderVal" :items="transferItems" aria-label="传输类型">
          <template #default="{ item }">
            <div class="omg-example-panel">{{ descriptions[item.value] }}</div>
          </template>
        </OTabs>
      </div>
    </div>

    <!-- Line variant -->
    <div class="omg-example-theme">
      <div style="width: 100%">
        <div class="omg-example-label">line 变体</div>
        <OTabs v-model="lineVal" :items="lineItems" variant="line" aria-label="内容视图">
          <template #default="{ item }">
            <div class="omg-example-panel">{{ descriptions[item.value] }}</div>
          </template>
        </OTabs>
      </div>
    </div>

    <!-- Fill mode -->
    <div class="omg-example-theme">
      <div style="width: 100%">
        <div class="omg-example-label">fill 占满模式 + slider</div>
        <OTabs v-model="fillSliderVal" :items="fillItems" :fill="true" aria-label="占满标签">
          <template #default="{ item }">
            <div class="omg-example-panel">{{ descriptions[item.value] }}</div>
          </template>
        </OTabs>
      </div>
    </div>

    <!-- Fill mode + line -->
    <div class="omg-example-theme">
      <div style="width: 100%">
        <div class="omg-example-label">fill 占满模式 + line</div>
        <OTabs v-model="fillLineVal" :items="fillItems" variant="line" :fill="true" aria-label="占满底部标签">
          <template #default="{ item }">
            <div class="omg-example-panel">{{ descriptions[item.value] }}</div>
          </template>
        </OTabs>
      </div>
    </div>

    <!-- Disabled tabs -->
    <div class="omg-example-theme">
      <div style="width: 100%">
        <div class="omg-example-label">含禁用项</div>
        <OTabs v-model="disabledVal" :items="disabledItems" aria-label="媒体类型">
          <template #default="{ item }">
            <div class="omg-example-panel">
              <span v-if="item.disabled" class="omg-example-muted">已禁用</span>
              <span v-else>{{ descriptions[item.value] }}</span>
            </div>
          </template>
        </OTabs>
      </div>
    </div>
  </div>
</template>

<style scoped>
.omg-example-label {
  margin-bottom: 10px;
  font-size: var(--omg-font-size-xs);
  color: var(--omg-color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.omg-example-panel {
  padding: 8px 0;
  font-size: var(--omg-font-size-sm);
  color: var(--omg-color-text-secondary);
  line-height: 1.6;
}
.omg-example-muted {
  color: var(--omg-color-text-muted);
  font-style: italic;
}
</style>
