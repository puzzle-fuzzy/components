<script setup lang="ts">
import { OImage } from '@puzzle-fuzzy/ui'
import type { OImageFit } from '@puzzle-fuzzy/ui'

const previewImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#dbeafe"/>
      <stop offset="1" stop-color="#f8fafc"/>
    </linearGradient>
    <linearGradient id="field" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#1d4ed8"/>
      <stop offset="1" stop-color="#17b26a"/>
    </linearGradient>
  </defs>
  <rect width="960" height="600" fill="url(#sky)"/>
  <circle cx="760" cy="130" r="58" fill="#fec84b"/>
  <path d="M0 430 180 270 320 390 490 210 690 410 850 290 960 390v210H0Z" fill="#273040"/>
  <path d="M0 470c170-60 320-70 480-28s310 24 480-38v196H0Z" fill="url(#field)"/>
  <path d="M110 500c160-56 300-56 430-10s230 34 330-18" fill="none" stroke="#fff" stroke-opacity=".65" stroke-width="14" stroke-linecap="round"/>
</svg>
`)

const photoImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#f0f4f8"/>
  <rect x="100" y="60" width="600" height="400" rx="20" fill="#a8b5c8"/>
  <circle cx="400" cy="200" r="70" fill="#e2e8f0"/>
  <rect x="150" y="340" width="500" height="120" rx="10" fill="#94a3b8"/>
  <circle cx="200" cy="200" r="40" fill="#cbd5e1"/>
  <circle cx="560" cy="300" r="30" fill="#94a3b8"/>
  <rect x="200" y="360" width="200" height="60" rx="6" fill="#b0bec5"/>
  <rect x="440" y="370" width="160" height="40" rx="6" fill="#b0bec5"/>
</svg>
`)

interface FitDemo {
  fit: OImageFit
  label: string
}

const fitDemos: FitDemo[] = [
  { fit: 'contain', label: 'contain' },
  { fit: 'cover', label: 'cover' },
  { fit: 'fill', label: 'fill' },
  { fit: 'none', label: 'none' },
  { fit: 'scale-down', label: 'scale-down' },
]
</script>

<template>
  <div class="omg-example-stack">
    <!-- Basic preview -->
    <div class="omg-example-theme">
      <div style="width: 100%">
        <div class="omg-example-label">点击预览（默认 contain）</div>
        <OImage
          :src="previewImage"
          alt="山谷与蓝绿色坡地插画"
          preview-aria-label="预览山谷与蓝绿色坡地插画"
          width="360px"
          height="225px"
          fit="contain"
        />
      </div>
    </div>

    <!-- Fit modes grid -->
    <div class="omg-example-theme">
      <div style="width: 100%">
        <div class="omg-example-label">object-fit 对比（统一 180×120 容器）</div>
        <div class="omg-example-fit-grid">
          <div v-for="demo in fitDemos" :key="demo.fit" class="omg-example-fit-cell">
            <OImage
              :src="photoImage"
              :alt="`${demo.fit} fit`"
              :fit="demo.fit"
              width="180px"
              height="120px"
              preview-aria-label="预览"
            />
            <span class="omg-example-fit-label">{{ demo.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview disabled -->
    <div class="omg-example-theme">
      <div style="width: 100%">
        <div class="omg-example-label">禁用预览（:preview="false"）</div>
        <OImage
          :src="previewImage"
          alt="无预览的图片"
          :preview="false"
          width="360px"
          height="225px"
          fit="contain"
        />
      </div>
    </div>

    <!-- Disabled state -->
    <div class="omg-example-theme">
      <div style="width: 100%">
        <div class="omg-example-label">禁用状态</div>
        <OImage
          :src="previewImage"
          alt="禁用的图片预览"
          :disabled="true"
          width="360px"
          height="225px"
          fit="contain"
        />
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
.omg-example-fit-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.omg-example-fit-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.omg-example-fit-label {
  font-size: var(--omg-font-size-xs);
  color: var(--omg-color-text-muted);
}
</style>
