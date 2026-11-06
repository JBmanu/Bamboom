import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ThemeToggle from '../../src/components/ThemeToggle.vue'
import { LANGUAGE_STORAGE_KEY, languages } from '../../src/translations/language/languageConstants.ts'
import { preferences, THEME_STORAGE_KEY, themes } from '../../src/theme/themeConstants.ts'
import { mockSystemTheme } from '../utils/systemTheme.ts'
import { mountWithTranslations } from '../utils/mountWithTranslations.ts'

enableAutoUnmount(afterEach)

const isDark = () => document.documentElement.classList.contains(themes.dark)
const mountToggle = () => mountWithTranslations(ThemeToggle)

beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    mockSystemTheme(false)
})

describe('ThemeToggle', () => {
    it('is one button that says the current theme and the next one', async () => {
        const { wrapper } = await mountToggle()

        expect(wrapper.findAll('button')).toHaveLength(1)
        expect(wrapper.get('button').attributes('aria-label')).toBe('Theme: System. Switch to Light')
        expect(wrapper.get('button').attributes('title')).toBe('Theme: System. Switch to Light')
    })

    it('shows an icon and no visible text', async () => {
        const { wrapper } = await mountToggle()

        expect(wrapper.find('button svg').exists()).toBe(true)
        expect(wrapper.get('button').element.textContent?.trim()).toBe('System') // only the status for screen readers
    })

    it('starts from the stored preference', async () => {
        localStorage.setItem(THEME_STORAGE_KEY, themes.dark)

        const { wrapper } = await mountToggle()

        expect(wrapper.get('button').attributes('aria-label')).toBe('Theme: Dark. Switch to System')
    })

    it('goes light, dark, system, light on every click, applying and storing each', async () => {
        const { wrapper } = await mountToggle()

        await wrapper.get('button').trigger('click')
        expect([isDark(), localStorage.getItem(THEME_STORAGE_KEY)]).toEqual([false, themes.light])

        await wrapper.get('button').trigger('click')
        expect([isDark(), localStorage.getItem(THEME_STORAGE_KEY)]).toEqual([true, themes.dark])

        await wrapper.get('button').trigger('click')
        expect([isDark(), localStorage.getItem(THEME_STORAGE_KEY)]).toEqual([false, preferences.auto])

        await wrapper.get('button').trigger('click')
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(themes.light)
    })

    it('says the new theme to screen readers after a click', async () => {
        const { wrapper } = await mountToggle()

        await wrapper.get('button').trigger('click')

        expect(wrapper.get('[role="status"]').text()).toBe('Light')
    })

    it('keeps two toggles in sync', async () => {
        const { wrapper: first } = await mountToggle()
        const { wrapper: second } = await mountToggle()

        await first.get('button').trigger('click')

        expect(second.get('button').attributes('aria-label')).toBe('Theme: Light. Switch to Dark')
    })

    it('speaks Italian when Italian is the stored language', async () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, languages.it)

        const { wrapper } = await mountToggle()

        expect(wrapper.get('button').attributes('aria-label')).toBe('Tema: Sistema. Passa a Chiaro')
    })

    it('changes its words when the language changes, without being mounted again', async () => {
        const { wrapper, translations } = await mountToggle()

        await translations.setLanguage(languages.it)
        await nextTick()

        expect(wrapper.get('button').attributes('aria-label')).toBe('Tema: Sistema. Passa a Chiaro')
    })
})
