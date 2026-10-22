import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import ThemeToggle from '../../src/theme/ThemeToggle.vue'
import { mockSystemTheme } from './systemTheme.ts'
import { defineComponent, h, nextTick } from 'vue'
import { createTranslations } from '../../src/translations/createTranslations.ts'
import { LANGUAGE_STORAGE_KEY, languages } from '../../src/translations/language/languageConstants.ts'
import { preferences, THEME_STORAGE_KEY, themes } from '../../src/theme/themeConstants.ts'

const labelsOf = (wrapper: VueWrapper) => wrapper.findAll('label').map((label) => label.text())
const isDark = () => document.documentElement.classList.contains(themes.dark)
const radio = (wrapper: VueWrapper, value: string) => wrapper.get<HTMLInputElement>(`input[value="${value}"]`)

let mounted: VueWrapper[] = []

const mountToggle = async () => {
    const translations = await createTranslations()
    const wrapper = mount(ThemeToggle, { attachTo: document.body, global: { plugins: [translations] } })
    mounted.push(wrapper)
    return { wrapper, translations }
}

beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    mockSystemTheme(false)
})

afterEach(() => {
    mounted.forEach((wrapper) => wrapper.unmount())
    mounted = []
})

describe('ThemeToggle', () => {
    it('offers System, Light and Dark in a group labelled Theme', async () => {
        const { wrapper } = await mountToggle()

        expect(wrapper.get('fieldset legend').text()).toBe('Theme')
        expect(wrapper.findAll('input[type="radio"]')).toHaveLength(3)
        expect(labelsOf(wrapper)).toEqual(['System', 'Light', 'Dark'])
    })

    it('selects System when nothing is stored', async () => {
        const { wrapper } = await mountToggle()

        expect(radio(wrapper, preferences.auto).element.checked).toBe(true)
        expect(radio(wrapper, themes.dark).element.checked).toBe(false)
    })

    it('selects the stored preference', async () => {
        localStorage.setItem(THEME_STORAGE_KEY, themes.dark)
        const { wrapper } = await mountToggle()

        expect(radio(wrapper, themes.dark).element.checked).toBe(true)
        expect(radio(wrapper, preferences.auto).element.checked).toBe(false)
    })

    it('applies and persists the chosen theme', async () => {
        const { wrapper } = await mountToggle()

        await radio(wrapper, themes.dark).setValue()

        expect(isDark()).toBe(true)
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(themes.dark)
    })

    it('goes back to following the system', async () => {
        const { wrapper } = await mountToggle()
        await radio(wrapper, themes.dark).setValue()

        await radio(wrapper, preferences.auto).setValue()

        expect(isDark()).toBe(false)
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(preferences.auto)
    })

    it('keeps two toggles in sync', async () => {
        const { wrapper: first } = await mountToggle()
        const { wrapper: second } = await mountToggle()
        await radio(first, themes.dark).setValue()

        expect(radio(second, themes.dark).element.checked).toBe(true)
    })

    it('puts the three options in one radio group', async () => {
        const { wrapper } = await mountToggle()

        const names = wrapper.findAll('input').map((input) => input.attributes('name'))

        expect(names[0]).toBeTruthy()
        expect(new Set(names).size).toBe(1)
    })

    it('gives every toggle its own radio group', async () => {
        const translations = await createTranslations()
        const Host = defineComponent({ render: () => h('div', [h(ThemeToggle), h(ThemeToggle)]) })
        const wrapper = mount(Host, { attachTo: document.body, global: { plugins: [translations] } })
        mounted.push(wrapper)
        const [first, second] = wrapper.findAll('input[value="dark"]')

        expect(first.attributes('name')).not.toBe(second.attributes('name'))
    })

    it('shows Italian labels when Italian is the stored language', async () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, languages.it)

        const { wrapper } = await mountToggle()

        expect(wrapper.get('fieldset legend').text()).toBe('Tema')
        expect(labelsOf(wrapper)).toEqual(['Sistema', 'Chiaro', 'Scuro'])
    })

    it('changes its labels when the language changes, without being mounted again', async () => {
        const { wrapper, translations } = await mountToggle()

        await translations.setLanguage(languages.it)
        await nextTick()

        expect(labelsOf(wrapper)).toEqual(['Sistema', 'Chiaro', 'Scuro'])
    })
})
