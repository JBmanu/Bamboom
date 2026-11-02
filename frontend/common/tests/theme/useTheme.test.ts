import { nextTick } from 'vue'
import { beforeEach, describe, expect, expectTypeOf, it } from 'vitest'
import type { Preference, Theme } from '../../src/theme/themeConstants.ts'
import { preferences, THEME_STORAGE_KEY, themes, useTheme } from '../../src'
import { mockSystemTheme } from '../utils/systemTheme.ts'

describe('useTheme', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.className = ''
    })

    it('defaults to auto when nothing is stored', () => {
        mockSystemTheme(false)
        const { preference } = useTheme()
        expect(preference.value).toBe(preferences.auto)
    })

    it('adds the dark class to <html> and persists the choice', async () => {
        mockSystemTheme(false)
        const { preference } = useTheme()

        preference.value = themes.dark
        await nextTick()

        expect(document.documentElement.classList.contains(themes.dark)).toBe(true)
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(themes.dark)
    })

    it('restores a stored dark preference on creation', async () => {
        localStorage.setItem(THEME_STORAGE_KEY, themes.dark)
        mockSystemTheme(false)

        const { preference, resolved } = useTheme()
        await nextTick()

        expect(preference.value).toBe(themes.dark)
        expect(resolved.value).toBe(themes.dark)
        expect(document.documentElement.classList.contains(themes.dark)).toBe(true)
    })

    it('follows the system theme while on auto', async () => {
        const system = mockSystemTheme(false)
        const { resolved } = useTheme()
        await nextTick()
        expect(resolved.value).toBe(themes.light)
        expect(document.documentElement.classList.contains(themes.dark)).toBe(false)

        system.setDark(true)
        await nextTick()

        expect(resolved.value).toBe(themes.dark)
        expect(document.documentElement.classList.contains(themes.dark)).toBe(true)
    })

    it('falls back to auto when the stored value is unknown', async () => {
        localStorage.setItem(THEME_STORAGE_KEY, 'banana')
        mockSystemTheme(false)

        const { preference, resolved } = useTheme()
        await nextTick()

        expect(preference.value).toBe(preferences.auto)
        expect(resolved.value).toBe(themes.light)
    })

    it('types the preference and the resolved theme with the known values', () => {
        const { preference, resolved } = useTheme()

        expectTypeOf(preference.value).toEqualTypeOf<Preference>()
        expectTypeOf(resolved.value).toEqualTypeOf<Theme>()
    })
})
