import { defineStore } from 'pinia'
import { ref } from 'vue'

export const THEME_STORAGE_KEY = 'bamboom-theme'
const THEME_PINIA_KEY = 'pinia-theme'

export type Theme = 'light' | 'dark' | 'system'

export const themes: Record<Theme, Theme> = {
    system: 'system',
    light: 'light',
    dark: 'dark'
}

export const themeValues: readonly Theme[] = Object.values(themes)

function isTheme(value: string | null): value is Theme {
    return themeValues.includes(value as Theme)
}

export const useThemeStore = defineStore(THEME_PINIA_KEY, () => {
    let storageValue: string | null = themes.system
    try {
        storageValue = localStorage.getItem(THEME_STORAGE_KEY)
    } catch (e) {
        console.log(e)
    }

    const preference = ref<Theme>(isTheme(storageValue) ? storageValue : themes.system)

    function setPreference(newTheme: Theme) {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, newTheme)
        } catch (e) {
            console.log(e)
        }

        preference.value = newTheme
    }

    return { preference, setPreference }
})
