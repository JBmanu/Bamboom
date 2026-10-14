import { defineStore } from 'pinia'

export const THEME_PINIA_KEY = 'pinia-theme'
export const THEME_STORAGE_KEY = 'storage-theme'

export const themes = {
    system: 'system',
    light: 'light',
    dark: 'dark'
}

export const useThemeStore = defineStore(THEME_PINIA_KEY, () => {
    const theme = localStorage.getItem(THEME_STORAGE_KEY) ?? themes.system
    return { preference: theme }
})
