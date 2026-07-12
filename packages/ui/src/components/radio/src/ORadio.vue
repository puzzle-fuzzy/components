<script setup lang="ts">
import {
  computed,
  inject,
  mergeProps,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useId,
  watch,
} from 'vue'

import { oRadioGroupKey } from './radio-context'
import { oRadioProps, type ORadioEmits, type ORadioSlots } from './radio'

defineOptions({
  name: 'ORadio',
  inheritAttrs: false,
})

const props = defineProps(oRadioProps)
const emit = defineEmits<ORadioEmits>()
const attrs = useAttrs()

defineSlots<ORadioSlots>()

const group = inject(oRadioGroupKey, undefined)
const inputElement = ref<HTMLInputElement>()
const generatedId = `o-radio-${useId()}`
const fieldId = computed(() =>
  typeof attrs.id === 'string' && attrs.id.trim().length > 0 ? attrs.id : generatedId,
)
const currentValue = computed(() => (group ? group.modelValue.value : props.modelValue))
const isChecked = computed(() => Object.is(currentValue.value, props.value))
const isDisabled = computed(() => props.disabled || Boolean(group?.disabled.value))
const isInvalid = computed(() => props.invalid || Boolean(group?.invalid.value))
const resolvedName = computed(() => group?.name.value ?? props.name)

const restoreControlledState = (): void => {
  if (inputElement.value) inputElement.value.checked = isChecked.value
}

const handleChange = async (event: Event): Promise<void> => {
  const element = event.target as HTMLInputElement
  if (isDisabled.value || !element.checked) {
    restoreControlledState()
    return
  }

  if (group) {
    group.select(props.value, event)
    return
  }

  emit('update:modelValue', props.value)
  emit('change', props.value, event)
  await nextTick()
  restoreControlledState()
}

const getInputAttrs = () =>
  mergeProps(
    {
      class: 'o-radio__input',
      onChange: handleChange,
    },
    attrs,
    {
      id: fieldId.value,
      'aria-invalid': isInvalid.value ? 'true' : attrs['aria-invalid'],
    },
  )

let unregisterRestore: (() => void) | undefined

onMounted(() => {
  restoreControlledState()
  unregisterRestore = group?.registerRestore(restoreControlledState)
})
onBeforeUnmount(() => unregisterRestore?.())
watch(isChecked, restoreControlledState, { flush: 'post' })
</script>

<template>
  <span
    class="o-radio"
    :class="{
      'is-checked': isChecked,
      'is-disabled': isDisabled,
      'is-invalid': isInvalid,
    }"
  >
    <input
      v-bind="getInputAttrs()"
      ref="inputElement"
      type="radio"
      :name="resolvedName"
      :value="props.value"
      :checked="isChecked"
      :disabled="isDisabled"
    />
    <label class="o-radio__label" :for="fieldId">
      <span class="o-radio__indicator" aria-hidden="true">
        <span class="o-radio__dot" />
      </span>
      <span v-if="$slots.default || props.label" class="o-radio__text">
        <slot>{{ props.label }}</slot>
      </span>
    </label>
  </span>
</template>
