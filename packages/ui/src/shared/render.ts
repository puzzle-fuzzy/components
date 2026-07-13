import type { Component } from 'vue'

export type ORenderAs = string | Component

export interface ORenderProps {
  as?: ORenderAs
  asChild?: boolean
}
