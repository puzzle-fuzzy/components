export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarShape = 'circle' | 'rounded' | 'square'
export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline'
export type AvatarTheme = 'light' | 'dark'

export interface OAvatarProps {
  src?: string
  alt?: string
  name?: string
  initials?: string
  size?: AvatarSize
  shape?: AvatarShape
  status?: AvatarStatus
  theme?: AvatarTheme
}
