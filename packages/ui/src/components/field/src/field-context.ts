import type { ComputedRef, InjectionKey } from 'vue'

export interface OFieldContext {
  readonly disabled: ComputedRef<boolean>
  readonly invalid: ComputedRef<boolean>
  readonly required: ComputedRef<boolean>
}

export const oFieldContextKey: InjectionKey<OFieldContext> = Symbol('OField')
