<script setup lang="ts">
import { oInputGroupAddonProps, type OInputGroupAddonSlots } from './input-group'

defineOptions({
  name: 'OInputGroupAddon',
  inheritAttrs: false,
})

const props = defineProps(oInputGroupAddonProps)

defineSlots<OInputGroupAddonSlots>()

const interactiveSelector = 'button,a,input,textarea,select,[role="button"]'
const fieldSelector = 'input:not(:disabled),textarea:not(:disabled)'

const handleClick = (event: MouseEvent): void => {
  const addon = event.currentTarget
  const target = event.target
  if (!(addon instanceof HTMLElement) || !(target instanceof Element)) return

  const interactiveTarget = target.closest(interactiveSelector)
  if (interactiveTarget && addon.contains(interactiveTarget)) return

  addon.closest('.o-input-group')?.querySelector<HTMLElement>(fieldSelector)?.focus()
}
</script>

<template>
  <div
    v-bind="$attrs"
    class="o-input-group__addon"
    data-slot="input-group-addon"
    :data-align="props.align"
    @click="handleClick"
  >
    <slot />
  </div>
</template>
