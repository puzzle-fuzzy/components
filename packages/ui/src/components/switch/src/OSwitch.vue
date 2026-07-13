<script setup lang="ts">
import { LuLoader2 as LuLoaderCircle } from 'vue-icons-plus/lu'
import { computed, mergeProps, nextTick, onMounted, ref, useAttrs, useId, watch } from 'vue'

import { oSwitchProps, type OSwitchEmits, type OSwitchSlots } from './switch'

defineOptions({
  name: 'OSwitch',
  inheritAttrs: false,
})

const props = defineProps(oSwitchProps)
const emit = defineEmits<OSwitchEmits>()
const attrs = useAttrs()
const slots = defineSlots<OSwitchSlots>()

const inputElement = ref<HTMLInputElement>()
const generatedId = `o-switch-${useId()}`
const fieldId = computed(() =>
  typeof attrs.id === 'string' && attrs.id.trim().length > 0 ? attrs.id : generatedId,
)
const hasDescription = computed(() => Boolean(slots.description || props.description))
const descriptionId = computed(() => `${fieldId.value}-description`)
const describedBy = computed(() => {
  const ids: string[] = []
  if (typeof attrs['aria-describedby'] === 'string' && attrs['aria-describedby'].trim()) {
    ids.push(attrs['aria-describedby'].trim())
  }
  if (hasDescription.value) ids.push(descriptionId.value)
  return ids.length > 0 ? [...new Set(ids)].join(' ') : undefined
})

const syncNativeState = (): void => {
  if (inputElement.value) inputElement.value.checked = props.modelValue
}

const isInteractionBlocked = computed(() => props.disabled || props.readonly || props.loading)

const handleClick = (event: MouseEvent): void => {
  if (!props.readonly && !props.loading) return

  event.preventDefault()
  void nextTick(syncNativeState)
}

const handleChange = async (event: Event): Promise<void> => {
  if (isInteractionBlocked.value) {
    syncNativeState()
    return
  }

  const value = (event.target as HTMLInputElement).checked
  emit('update:modelValue', value)
  emit('change', value, event)
  await nextTick()
  syncNativeState()
}

const getInputAttrs = () =>
  mergeProps(
    {
      class: 'o-switch__input',
      onClick: handleClick,
      onChange: handleChange,
    },
    attrs,
    {
      id: fieldId.value,
      'aria-checked': String(props.modelValue),
      'aria-describedby': describedBy.value,
      'aria-disabled': props.loading ? 'true' : attrs['aria-disabled'],
      'aria-readonly': props.readonly ? 'true' : attrs['aria-readonly'],
      'aria-invalid': props.invalid ? 'true' : attrs['aria-invalid'],
    },
  )

onMounted(syncNativeState)
watch(() => props.modelValue, syncNativeState, { flush: 'post' })
</script>

<template>
  <span
    class="o-switch"
    :class="[
      `o-switch--${props.size}`,
      {
        'is-checked': props.modelValue,
        'is-disabled': props.disabled,
        'is-readonly': props.readonly,
        'is-loading': props.loading,
        'is-invalid': props.invalid,
      },
    ]"
  >
    <input
      v-bind="getInputAttrs()"
      ref="inputElement"
      type="checkbox"
      role="switch"
      :checked="props.modelValue"
      :disabled="props.disabled"
    />
    <label class="o-switch__label" :for="fieldId">
      <span class="o-switch__track" aria-hidden="true">
        <span class="o-switch__thumb">
          <LuLoaderCircle v-if="props.loading" class="o-switch__spinner" aria-hidden="true" />
        </span>
      </span>
      <span v-if="$slots.default || props.label || hasDescription" class="o-switch__copy">
        <span v-if="$slots.default || props.label" class="o-switch__text">
          <slot>{{ props.label }}</slot>
        </span>
        <span v-if="hasDescription" :id="descriptionId" class="o-switch__description">
          <slot name="description">{{ props.description }}</slot>
        </span>
      </span>
    </label>
  </span>
</template>
