export const THEME_STORAGE_KEY = 'bamboom-theme'

export const themes = { light: 'light', dark: 'dark' } as const
export const preferences = { auto: 'auto', ...themes } as const

export type Theme = (typeof themes)[keyof typeof themes]
export type Preference = (typeof preferences)[keyof typeof preferences]

export const PREFERENCES = Object.values(preferences)
