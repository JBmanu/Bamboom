import { LANGUAGE_STORAGE_KEY, languages } from '../../src/translations/language/languageConstants'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import VSpinner from '../../src/components/VSpinner.vue'
import { mountWithTranslations } from '../utils/mountWithTranslations.ts'
import { enableAutoUnmount } from '@vue/test-utils'

enableAutoUnmount(afterEach)

const mountSpinner = (props = {}) => mountWithTranslations(VSpinner, {}, props)

describe('VSpinner', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('announces a loading status to assistive technology by default', async () => {
        const { wrapper } = await mountSpinner()
        expect(wrapper.attributes('role')).toBe('status')
    })

    it.each([
        [languages.en, 'Loading…'],
        [languages.it, 'Caricamento…']
    ])('says it in %s: %s', async (language, text) => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
        const { wrapper } = await mountSpinner()
        expect(wrapper.text()).toBe(text)
    })

    it('shows a custom label instead of the default one', async () => {
        const customLabel = 'custom text'
        const { wrapper } = await mountSpinner({ label: customLabel })
        expect(wrapper.text()).toBe(customLabel)
    })

    it('hides itself from assistive technology when it is only decorative', async () => {
        const { wrapper } = await mountSpinner({ decorative: true })
        expect(wrapper.attributes('role')).toBeUndefined()
        expect(wrapper.attributes('aria-hidden')).toBe('true')
        expect(wrapper.text()).toBe('')
    })

    it('draws an icon inside', async () => {
        const { wrapper } = await mountSpinner()
        expect(wrapper.find('svg').exists()).toBe(true)
    })
})
