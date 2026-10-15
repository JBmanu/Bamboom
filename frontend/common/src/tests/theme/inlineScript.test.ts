import { beforeEach, describe, expect, it } from 'vitest'
import { inlineScript } from '../../theme/inlineScript'
import { themeInit } from '../../theme/themeInit'
import { mockSystemTheme } from './support/systemTheme'
import { THEME_STORAGE_KEY, themes } from '../../theme/themeConstants'

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
