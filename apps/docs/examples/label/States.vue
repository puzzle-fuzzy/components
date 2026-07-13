<script setup lang="ts">
import { OInput } from '@puzzle-fuzzy/ui/input'
import { OLabel } from '@puzzle-fuzzy/ui/label'
import { ref } from 'vue'

const email = ref('')
</script>

<template>
  <div class="label-states">
    <div class="label-states-field">
      <OLabel for="label-email" required>通知邮箱</OLabel>
      <OInput
        id="label-email"
        v-model="email"
        required
        type="email"
        placeholder="name@example.com"
      />
    </div>

    <div class="label-states-field">
      <OLabel for="label-disabled" disabled>只读来源</OLabel>
      <OInput id="label-disabled" disabled model-value="系统同步" />
    </div>
  </div>
</template>

<style scoped lang="less">
.label-states {
  display: grid;
  width: min(100%, 480px);
  gap: var(--omg-space-5);
}

.label-states-field {
  display: grid;
  gap: var(--omg-space-2);
}
</style>
