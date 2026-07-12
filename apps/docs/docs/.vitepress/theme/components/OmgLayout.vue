<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { watchEffect } from 'vue'

const DefaultLayout = DefaultTheme.Layout
const { isDark } = useData()

watchEffect(() => {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.omgTheme = isDark.value ? 'dark' : 'light'
  }
})
</script>

<template>
  <DefaultLayout />
</template>
