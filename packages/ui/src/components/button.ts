export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonTone = 'brand' | 'neutral' | 'danger'
export type ButtonTheme = 'light' | 'dark'
export type NativeButtonType = 'button' | 'submit' | 'reset'

export interface OButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  tone?: ButtonTone
  theme?: ButtonTheme
  type?: NativeButtonType
  loading?: boolean
  disabled?: boolean
}
