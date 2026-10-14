import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { themes, useThemeStore } from '../../theme/themeStore'

describe('theme store', () => {
    beforeEach(() => setActivePinia(createPinia()))

    it('defaults the preference to "system" when nothing is saved', () => {
        const store = useThemeStore()
        expect(store.preference).toBe(themes.system)
    })
})
