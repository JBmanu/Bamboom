import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTheme } from '../../theme/useTheme'
import { mockSystemTheme } from './support/systemTheme'
import { themeInit } from '../../theme/themeInit'
import { nextTick } from 'vue'
import { THEME_STORAGE_KEY, themes } from '../../theme/themeConstants'

const CASES = [
    [null, false, false],
    [null, true, true],
    ['auto', false, false],
    ['auto', true, true],
    ['light', true, false],
    ['dark', false, true],
    ['banana', false, false],
    ['banana', true, true]
] as const

const isDark = () => document.documentElement.classList.contains(themes.dark)

beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
})
afterEach(() => vi.restoreAllMocks())

describe('theme init script', () => {
    it('does not throw when storage is unavailable', () => {
        mockSystemTheme(false)
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('blocked')
        })
        expect(() => themeInit(THEME_STORAGE_KEY)).not.toThrow()
        expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it.each(CASES)('stored=%s, system dark=%s -> dark class %s', (stored, systemDark, expected) => {
        if (stored !== null) localStorage.setItem(THEME_STORAGE_KEY, stored)
        mockSystemTheme(systemDark)
        themeInit(THEME_STORAGE_KEY)

        expect(document.documentElement.classList.contains(themes.dark)).toBe(expected)
    })
})

describe('consistency with useTheme', () => {
    it.each(CASES)('same result as useTheme: stored=%s, system dark=%s', async (stored, systemDark) => {
        if (stored !== null) localStorage.setItem(THEME_STORAGE_KEY, stored)
        mockSystemTheme(systemDark)

        themeInit(THEME_STORAGE_KEY)
        const scriptSaysDark = isDark()

        document.documentElement.className = ''
        useTheme()
        await nextTick()

        expect(isDark()).toBe(scriptSaysDark)
    })
})
