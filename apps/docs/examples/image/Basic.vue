<script setup lang="ts">
import { OImage } from '@puzzle-fuzzy/ui'

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
</script>

<template>
  <div class="omg-example-stack">
    <OImage
      :src="previewImage"
      alt="山谷与蓝绿色坡地插画"
      width="360px"
      height="225px"
      fit="cover"
    />
  </div>
</template>
