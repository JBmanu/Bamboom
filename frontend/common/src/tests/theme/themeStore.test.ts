import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { Theme, THEME_STORAGE_KEY, themes, themeValues, useThemeStore } from '../../theme/themeStore'

describe('theme store', () => {
    beforeEach(() => setActivePinia(createPinia()))
    afterEach(() => {
        vi.restoreAllMocks()
        localStorage.clear()
    })

    it.each(themeValues)('restores the saved preference "%s" on startup', (saved) => {
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

    it.each(themeValues)('saves the chosen preference "%s" for the next visit', (chosen) => {
        const store = useThemeStore()
        store.setPreference(chosen)
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(chosen)
    })

    it('falls back to "system" when reading the storage throws', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('Storage unavailable')
        })
        const storage = useThemeStore()
        expect(storage.preference).toBe(themes.system)
    })

    it('still adopts the chosen preference when saving throws', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('quota exceeded')
        })

        const store = useThemeStore()
        const mockTheme = themes.dark
        expect(() => store.setPreference(mockTheme)).not.toThrow()
        expect(store.preference).toBe(mockTheme)
    })
})
