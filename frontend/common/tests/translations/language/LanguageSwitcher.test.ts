import { enableAutoUnmount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LANGUAGE_STORAGE_KEY, languages } from '../../../src/translations/language/languageConstants'
import LanguageSwitcher from '../../../src/translations/language/LanguageSwitcher.vue'
import type { VocabularyLoaders } from '../../../src/translations/vocabularies'
import { mountTwiceWithTranslations, mountWithTranslations } from '../../utils/mountWithTranslations'

enableAutoUnmount(afterEach)

const labelsOf = (wrapper: VueWrapper) => wrapper.findAll('label').map((label) => label.text())

const legendOf = (wrapper: VueWrapper) => wrapper.get('fieldset legend').text()

const radio = (wrapper: VueWrapper, language: string) => wrapper.get<HTMLInputElement>(`input[value="${language}"]`)

const mountSwitcher = (moduleLoaders?: VocabularyLoaders) => mountWithTranslations(LanguageSwitcher, moduleLoaders)

beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('lang')
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
        const { wrapper } = await mountTwiceWithTranslations(LanguageSwitcher)
        const [firstItalian, secondItalian] = wrapper.findAll<HTMLInputElement>(`input[value="${languages.it}"]`)
        await firstItalian.setValue()

        await vi.waitFor(() => expect(secondItalian.element.checked).toBe(true))
    })

    it('stays on the current language when the chosen one cannot be loaded', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
        const { wrapper } = await mountSwitcher({ 'lobby-match/vocabulary/it.ts': () => Promise.reject(new Error('offline')) })

        await radio(wrapper, languages.it).setValue()

        await vi.waitFor(() => expect(consoleError).toHaveBeenCalled())
        expect(consoleError).toHaveBeenCalledWith(expect.stringContaining(languages.it), expect.any(Error))
        expect(radio(wrapper, languages.en).element.checked).toBe(true)
        expect(legendOf(wrapper)).toBe('Language')
        consoleError.mockRestore()
    })
})
