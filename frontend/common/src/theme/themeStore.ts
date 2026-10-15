import { defineStore } from 'pinia'
import { Effect } from 'effect'
import { ref } from 'vue'

export const THEME_STORAGE_KEY = 'bamboom-theme'
const THEME_PINIA_KEY = 'pinia-theme'

const THEMES = ['system', 'light', 'dark'] as const
export type Theme = (typeof THEMES)[number]
export const themes: Record<Theme, Theme> = Object.fromEntries(THEMES.map((theme) => [theme, theme])) as Record<Theme, Theme>
export const themeValues: readonly Theme[] = Object.values(themes)
export const SYSTEM: Theme = themes.system
export const LIGHT: Theme = themes.light
export const DARK: Theme = themes.dark

function isTheme(value: string | null): value is Theme {
    return value !== null && themeValues.includes(value as Theme)
}

export const useThemeStore = defineStore(THEME_PINIA_KEY, () => {
    const storageValue = Effect.runSync(Effect.try(() => localStorage.getItem(THEME_STORAGE_KEY)).pipe(Effect.orElseSucceed(() => themes.system)))

    const preference = ref<Theme>(isTheme(storageValue) ? storageValue : themes.system)

    function setPreference(newTheme: Theme) {
        Effect.runSync(Effect.try(() => localStorage.setItem(THEME_STORAGE_KEY, newTheme)).pipe(Effect.orElseSucceed(() => undefined)))
        preference.value = newTheme
    }

    return { preference, setPreference }
})
