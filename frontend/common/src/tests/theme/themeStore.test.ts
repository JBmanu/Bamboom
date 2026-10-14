import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { THEME_STORAGE_KEY, themes, useThemeStore } from '../../theme/themeStore'

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
})
