import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTranslations } from '../../../src/translations/createTranslations.ts'
import { LANGUAGE_STORAGE_KEY, languages } from '../../../src/translations/language/languageConstants.ts'
import LanguageSwitcher from '../../../src/translations/language/LanguageSwitcher.vue'
import type { VocabularyLoaders } from '../../../src/translations/vocabularies.ts'
import { defineComponent, h } from 'vue'

const labelsOf = (wrapper: VueWrapper) => wrapper.findAll('label').map((label) => label.text())
const legendOf = (wrapper: VueWrapper) => wrapper.get('fieldset legend').text()
const radio = (wrapper: VueWrapper, language: string) => wrapper.get<HTMLInputElement>(`input[value="${language}"]`)

let mounted: VueWrapper[] = []

const mountSwitcher = async (moduleLoaders: VocabularyLoaders = {}) => {
    const translations = await createTranslations(moduleLoaders)
    const wrapper = mount(LanguageSwitcher, { attachTo: document.body, global: { plugins: [translations] } })
    mounted.push(wrapper)
    return { wrapper, translations }
}

beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('lang')
})

afterEach(() => {
    mounted.forEach((wrapper) => wrapper.unmount())
    mounted = []
})

describe('LanguageSwitcher', () => {
    it('offers every supported language by its own name, in a group labelled Language', async () => {
        const { wrapper } = await mountSwitcher()

        expect(legendOf(wrapper)).toBe('Language')
        expect(wrapper.findAll('input[type="radio"]')).toHaveLength(2)
        expect(labelsOf(wrapper)).toEqual(['English', 'Italiano'])
    })

    it('selects English when nothing is stored', async () => {
        const { wrapper } = await mountSwitcher()

        expect(radio(wrapper, languages.en).element.checked).toBe(true)
        expect(radio(wrapper, languages.it).element.checked).toBe(false)
    })

    it('selects the stored language and speaks it', async () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, languages.it)

        const { wrapper } = await mountSwitcher()

        expect(radio(wrapper, languages.it).element.checked).toBe(true)
        expect(legendOf(wrapper)).toBe('Lingua')
    })

    it('switches, stores and announces the language chosen', async () => {
        const { wrapper } = await mountSwitcher()

        await radio(wrapper, languages.it).setValue()

        await vi.waitFor(() => expect(legendOf(wrapper)).toBe('Lingua'))
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(languages.it)
        expect(document.documentElement.lang).toBe(languages.it)
    })

    it('keeps two switchers in sync', async () => {
        const translations = await createTranslations()
        const Host = defineComponent({ render: () => h('div', [h(LanguageSwitcher), h(LanguageSwitcher)]) })
        const wrapper = mount(Host, { attachTo: document.body, global: { plugins: [translations] } })
        mounted.push(wrapper)
        const [firstItalian, secondItalian] = wrapper.findAll<HTMLInputElement>(`input[value="${languages.it}"]`)

        await firstItalian.setValue()

        await vi.waitFor(() => expect(secondItalian.element.checked).toBe(true))
    })

    it('stays on the current language when the chosen one cannot be loaded', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
        const { wrapper } = await mountSwitcher({ 'lobby-match/vocabulary/it.ts': () => Promise.reject(new Error('offline')) })

        await radio(wrapper, languages.it).setValue()

        await vi.waitFor(() => expect(consoleError).toHaveBeenCalled())
        expect(radio(wrapper, languages.en).element.checked).toBe(true)
        expect(legendOf(wrapper)).toBe('Language')
        consoleError.mockRestore()
    })
})
