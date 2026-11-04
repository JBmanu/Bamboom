import { enableAutoUnmount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { LANGUAGE_STORAGE_KEY, languages } from '../../src/translations/language/languageConstants.ts'
import LanguageSwitcher from '../../src/components/LanguageSwitcher.vue'
import type { VocabularyLoaders } from '../../src/translations/vocabularies.ts'
import { installPopoverStub } from '../utils/installPopoverStub.ts'
import { mountTwiceWithTranslations, mountWithTranslations } from '../utils/mountWithTranslations.ts'

enableAutoUnmount(afterEach)

const trigger = (wrapper: VueWrapper) => wrapper.get('button[aria-controls]')
const choices = (wrapper: VueWrapper) => wrapper.findAll('[popover] button')
const choice = (wrapper: VueWrapper, language: string) => wrapper.get(`[popover] button[lang="${language}"]`)
const mountSwitcher = (moduleLoaders?: VocabularyLoaders) => mountWithTranslations(LanguageSwitcher, moduleLoaders)

beforeAll(installPopoverStub)

beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('lang')
})

describe('LanguageSwitcher', () => {
    it('shows the flag and short code of the current language on the button, named after it', async () => {
        const { wrapper } = await mountSwitcher()

        expect(trigger(wrapper).text()).toBe('EN')
        expect(trigger(wrapper).findAll('svg')).toHaveLength(2) // the flag and the arrow
        expect(trigger(wrapper).attributes('aria-label')).toBe('Language: English')
    })

    it('starts closed and opens when the button is pressed', async () => {
        const { wrapper } = await mountSwitcher()
        expect(trigger(wrapper).attributes('aria-expanded')).toBe('false')

        await trigger(wrapper).trigger('click')

        expect(trigger(wrapper).attributes('aria-expanded')).toBe('true')
    })

    it('lists every language by its own name, marking the current one', async () => {
        const { wrapper } = await mountSwitcher()

        expect(choices(wrapper).map((button) => button.text())).toEqual(['English', 'Italiano'])
        expect(choices(wrapper).map((button) => button.attributes('lang'))).toEqual(['en', 'it'])
        expect(choices(wrapper).map((button) => button.attributes('aria-current'))).toEqual(['true', undefined])
    })

    it('switches, stores and announces the language chosen, then closes', async () => {
        const { wrapper } = await mountSwitcher()
        await trigger(wrapper).trigger('click')

        await choice(wrapper, languages.it).trigger('click')

        await vi.waitFor(() => expect(trigger(wrapper).attributes('aria-label')).toBe('Lingua: Italiano'))
        expect(trigger(wrapper).attributes('aria-expanded')).toBe('false')
        expect(trigger(wrapper).text()).toBe('IT')
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(languages.it)
        expect(document.documentElement.lang).toBe(languages.it)
    })

    it('starts in the stored language and speaks it, panel included', async () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, languages.it)

        const { wrapper } = await mountSwitcher()

        expect(trigger(wrapper).attributes('aria-label')).toBe('Lingua: Italiano')
        expect(wrapper.get('[popover]').attributes('aria-label')).toBe('Lingua')
    })

    it('keeps two switchers in sync, each with its own panel', async () => {
        const { wrapper } = await mountTwiceWithTranslations(LanguageSwitcher)
        const [firstTrigger, secondTrigger] = wrapper.findAll('button[aria-controls]')
        expect(firstTrigger.attributes('aria-controls')).not.toBe(secondTrigger.attributes('aria-controls'))

        await firstTrigger.trigger('click')
        await wrapper.findAll(`[popover] button[lang="${languages.it}"]`)[0].trigger('click')

        await vi.waitFor(() => expect(secondTrigger.attributes('aria-label')).toBe('Lingua: Italiano'))
    })

    it('stays on the current language when the chosen one cannot be loaded', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
        const { wrapper } = await mountSwitcher({ 'lobby-match/vocabulary/it.ts': () => Promise.reject(new Error('offline')) })

        await choice(wrapper, languages.it).trigger('click')

        await vi.waitFor(() => expect(consoleError).toHaveBeenCalledWith(expect.stringContaining(languages.it), expect.any(Error)))
        expect(trigger(wrapper).attributes('aria-label')).toBe('Language: English')
        consoleError.mockRestore()
    })
})
