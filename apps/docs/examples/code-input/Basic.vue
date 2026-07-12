<script setup lang="ts">
import { ref } from 'vue'
import { OCodeInput } from '@puzzle-fuzzy/ui'

const code = ref('')
const completedCode = ref('')
</script>

<template>
  <div class="omg-example-stack">
    <OCodeInput v-model="code" aria-label="六位验证码" @complete="completedCode = $event" />
    <span>当前值：{{ code || '未输入' }}</span>
    <span v-if="completedCode">已完成：{{ completedCode }}</span>
  </div>
</template>
