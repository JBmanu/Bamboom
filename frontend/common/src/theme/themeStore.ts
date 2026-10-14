import { defineStore } from 'pinia'
import { Effect } from 'effect'
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
    const storageValue = Effect.runSync(Effect.try(() => localStorage.getItem(THEME_STORAGE_KEY)).pipe(Effect.orElseSucceed(() => themes.system)))

    const preference = ref<Theme>(isTheme(storageValue) ? storageValue : themes.system)

    function setPreference(newTheme: Theme) {
        preference.value = newTheme
        Effect.runSync(Effect.try(() => localStorage.setItem(THEME_STORAGE_KEY, newTheme)).pipe(Effect.orElseSucceed(() => undefined)))
    }

    return { preference, setPreference }
})
