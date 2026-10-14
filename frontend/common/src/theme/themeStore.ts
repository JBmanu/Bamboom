import { defineStore } from 'pinia'

export const THEME_STORAGE_KEY = 'bamboom-theme'
const THEME_PINIA_KEY = 'pinia-theme'

export const themes = {
    system: 'system',
    light: 'light',
    dark: 'dark'
}

export const useThemeStore = defineStore(THEME_PINIA_KEY, () => {
    const storageValue = localStorage.getItem(THEME_STORAGE_KEY) ?? themes.system
    const theme = Object.values(themes).includes(storageValue) ? storageValue : themes.system
    return { preference: theme }
})
