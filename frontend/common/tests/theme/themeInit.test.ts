import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTheme } from '../../src/theme/useTheme'
import { mockSystemTheme } from '../utils/systemTheme.ts'
import { themeInit, themeInitPlugin, inlineScript } from '../../src/theme/themeInit'
import { nextTick } from 'vue'
import type { HtmlTagDescriptor } from 'vite'
import { THEME_STORAGE_KEY, themes } from '../../src/theme/themeConstants'

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
const tags = () => (themeInitPlugin().transformIndexHtml as () => HtmlTagDescriptor[])()

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

describe('inlineScript', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.className = ''
    })

    it('produces code that behaves like the original function', () => {
        localStorage.setItem(THEME_STORAGE_KEY, themes.dark)
        mockSystemTheme(false)
        new Function(inlineScript(themeInit, THEME_STORAGE_KEY))()
        expect(document.documentElement.classList.contains(themes.dark)).toBe(true)
    })

    it('never emits a closing script tag, even if an argument contains one', () => {
        const code = inlineScript((value: string) => void value, '</script><b>')
        expect(code).not.toContain('</script>')
    })
})

describe('themeInitPlugin', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.className = ''
    })

    it('injects one inline classic script in <head>', () => {
        expect(tags()).toHaveLength(1)
        expect(tags()[0]).toMatchObject({ tag: 'script', injectTo: 'head' })
        expect(tags()[0].attrs).toBeUndefined()
    })

    it('injects code that applies the stored theme', () => {
        localStorage.setItem(THEME_STORAGE_KEY, themes.dark)
        new Function(String(tags()[0].children))()
        expect(document.documentElement.classList.contains(themes.dark)).toBe(true)
    })
})
