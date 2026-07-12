import type { ComputedRef, InjectionKey } from 'vue'

import type { ORadioValue } from './radio'

export interface ORadioGroupContext {
  readonly modelValue: ComputedRef<ORadioValue | undefined>
  readonly name: ComputedRef<string>
  readonly disabled: ComputedRef<boolean>
  readonly invalid: ComputedRef<boolean>
  select: (value: ORadioValue, event: Event) => void
  registerRestore: (restore: () => void) => () => void
}

export const oRadioGroupKey: InjectionKey<ORadioGroupContext> = Symbol('o-radio-group')
