import * as ThemeStore from '../../theme/themeStore'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

describe('theme store', () => {
    beforeEach(() => setActivePinia(createPinia()))
    afterEach(() => {
        vi.restoreAllMocks()
        localStorage.clear()
        Reflect.deleteProperty(window, 'matchMedia')
    })

    it.each(ThemeStore.themeValues)('restores the saved preference "%s" on startup', (saved) => {
        localStorage.setItem(ThemeStore.THEME_STORAGE_KEY, saved)
        const store = ThemeStore.useThemeStore()
        expect(store.preference).toBe(saved)
    })

    it('defaults the preference to "system" when nothing is saved', () => {
        const store = ThemeStore.useThemeStore()
        expect(store.preference).toBe(ThemeStore.SYSTEM)
    })

    it.each(['', 'noTheme', '{}'])('falls back to "system" when the saved value is "%s"', (invalid) => {
        localStorage.setItem(ThemeStore.THEME_STORAGE_KEY, invalid)
        const store = ThemeStore.useThemeStore()
        expect(store.preference).toBe(ThemeStore.SYSTEM)
    })

    it.each([ThemeStore.LIGHT, ThemeStore.DARK])('adopts the preference "%s" chosen by the user', (chosen) => {
        const store = ThemeStore.useThemeStore()
        store.setPreference(chosen)
        expect(store.preference).toBe(chosen)
    })

    it.each(ThemeStore.themeValues)('saves the chosen preference "%s" for the next visit', (chosen) => {
        const store = ThemeStore.useThemeStore()
        store.setPreference(chosen)
        expect(localStorage.getItem(ThemeStore.THEME_STORAGE_KEY)).toBe(chosen)
    })

    it('falls back to "system" when reading the storage throws', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('Storage unavailable')
        })
        const storage = ThemeStore.useThemeStore()
        expect(storage.preference).toBe(ThemeStore.themes.system)
    })

    it('still adopts the chosen preference when saving throws', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('quota exceeded')
        })

        const store = ThemeStore.useThemeStore()
        const chosen = ThemeStore.DARK
        expect(() => store.setPreference(chosen)).not.toThrow()
        expect(store.preference).toBe(chosen)
    })

    // it.each([[true, themes.dark], [false, themes.light]])('follows the system when the preference is "system" (system dark: %s)',
    //     (isSystemDark, expected) => {
    //         mockSystemTheme(isSystemDark)
    //         const store = ThemeStore.useThemeStore()
    //         expect(store.resolved).toBe(expected)
    //     })
    //
    // it.each([themes.light, themes.dark])('ignores the system when the user picked "%s"',
    //     (picked) => {
    //         mockSystemTheme(picked === themes.light)
    //         const store = ThemeStore.useThemeStore()
    //         store.setPreference(picked)
    //         expect(store.resolved).toBe(picked)
    //     })
    //
    // it('resolves to "light" when matchMedia is not available', () => {
    //     const store = ThemeStore.useThemeStore()
    //     expect(store.resolved).toBe(themes.light)
    // })
})
