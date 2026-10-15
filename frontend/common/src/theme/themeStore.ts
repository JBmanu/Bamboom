import { defineStore } from 'pinia'
import { Effect } from 'effect'
import { computed, ComputedRef, ref, Ref } from 'vue'

const THEME_PINIA_KEY = 'pinia-theme'
export const THEME_STORAGE_KEY = 'bamboom-theme'

export type ThemePreference = (typeof themes)[keyof typeof themes]
export type ThemeResolved = Exclude<ThemePreference, 'system'>
export const themes = { system: 'system', light: 'light', dark: 'dark' } as const
export const themeValues: readonly ThemePreference[] = Object.values(themes)

function isTheme(value: string | null): value is ThemePreference {
    return value !== null && (themeValues as readonly string[]).includes(value)
}

function isDarkSystem() {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useThemeStore = defineStore(THEME_PINIA_KEY, () => {
    const storageValue: string | null = readSavedValue()
    const preference: Ref<ThemePreference> = ref(isTheme(storageValue) ? (storageValue as ThemePreference) : themes.system)
    const resolved: ComputedRef<ThemeResolved> = computed((): ThemeResolved =>
        preference.value === themes.system ? (isDarkSystem() ? themes.dark : themes.light) : preference.value
    )

    function readSavedValue(): string | null {
        return Effect.runSync(Effect.try(() => localStorage.getItem(THEME_STORAGE_KEY)).pipe(Effect.orElseSucceed(() => themes.system)))
    }

    function saveValue(newTheme: ThemePreference): void {
        Effect.runSync(Effect.try(() => localStorage.setItem(THEME_STORAGE_KEY, newTheme)).pipe(Effect.orElseSucceed(() => undefined)))
    }

    function setPreference(newTheme: ThemePreference) {
        preference.value = newTheme
        saveValue(newTheme)
    }

    return { preference, setPreference, resolved }
})
