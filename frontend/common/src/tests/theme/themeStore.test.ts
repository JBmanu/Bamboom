import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { Theme, THEME_STORAGE_KEY, themes, useThemeStore } from '../../theme/themeStore'

describe('theme store', () => {
    beforeEach(() => setActivePinia(createPinia()))
    afterEach(() => localStorage.clear())

    it.each(Object.values(themes))('restores the saved preference "%s" on startup', (saved) => {
        localStorage.setItem(THEME_STORAGE_KEY, saved)
        const store = useThemeStore()
        expect(store.preference).toBe(saved)
    })

    it('defaults the preference to "system" when nothing is saved', () => {
        const store = useThemeStore()
        expect(store.preference).toBe(themes.system)
    })

    it.each(['', 'noTheme', '{}'])('falls back to "system" when the saved value is "%s"', (invalid) => {
        localStorage.setItem(THEME_STORAGE_KEY, invalid)
        const store = useThemeStore()
        expect(store.preference).toBe(themes.system)
    })

    it.each(['light', 'dark'] as Theme[])('adopts the preference "%s" chosen by the user', (chosen) => {
        const store = useThemeStore()
        store.setPreference(chosen)
        expect(store.preference).toBe(chosen)
    })

    it.each(Object.values(themes))('saves the chosen preference "%s" for the next visit', (chosen) => {
        const store = useThemeStore()
        store.setPreference(chosen)
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(chosen)
    })
})
