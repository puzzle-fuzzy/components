import { computed, defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { useControllableOpen } from '../use-controllable-open'

const Host = defineComponent({
  props: { open: Boolean, controlled: Boolean },
  emits: ['update:open'],
  setup(props, { emit, expose }) {
    const api = useControllableOpen({
      open: computed(() => (props.controlled ? props.open : undefined)),
      emit: (event, value) => emit(event, value),
    })
    expose(api)
    return () => h('span', { 'data-open': String(api.isOpen.value) })
  },
})

describe('useControllableOpen', () => {
  it('updates internal state and emits in uncontrolled mode', async () => {
    const wrapper = mount(Host)
    ;(wrapper.vm as unknown as { toggle: () => void }).toggle()
    await wrapper.vm.$nextTick()

    expect(wrapper.attributes('data-open')).toBe('true')
    expect(wrapper.emitted('update:open')).toEqual([[true]])
  })

  it('emits without mutating a controlled value', () => {
    const wrapper = mount(Host, { props: { controlled: true, open: false } })
    ;(wrapper.vm as unknown as { setOpen: (value: boolean) => void }).setOpen(true)

    expect(wrapper.attributes('data-open')).toBe('false')
    expect(wrapper.emitted('update:open')).toEqual([[true]])
  })
})
