import { defineStore } from 'pinia'

export const themes = {
    system: 'system',
    light: 'light',
    dark: 'dark'
}

export const useThemeStore = defineStore('theme', () => {
    return { preference: themes.system }
})
