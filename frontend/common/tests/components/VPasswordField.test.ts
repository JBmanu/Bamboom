import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'
import VPasswordField from '../../src/components/VPasswordField.vue'
import { mountWithTranslations } from '../utils/mountWithTranslations.ts'
import { LANGUAGE_STORAGE_KEY, languages } from '../../src/translations/language/languageConstants'
import VIcon from '../../src/icons/VIcon.vue'

enableAutoUnmount(afterEach)

const mountPassword = (props = {}) => mountWithTranslations(VPasswordField, {}, { props: { label: 'Password', ...props } })

describe('VPasswordField', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('hides the password by default', async () => {
        const { wrapper } = await mountPassword()

        expect(wrapper.get('input').attributes('type')).toBe('password')
    })

    it.each([
        [languages.en, 'Show password'],
        [languages.it, 'Mostra password']
    ])('offers a toggle named in the current language', async (language, text) => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
        const { wrapper } = await mountPassword()

        expect(wrapper.get('button').attributes('aria-label')).toBe(text)
    })

    it('starts with the toggle not pressed', async () => {
        const { wrapper } = await mountPassword()

        expect(wrapper.get('button').attributes('aria-pressed')).toBe('false')
    })

    it('shows the password when the toggle is pressed', async () => {
        const { wrapper } = await mountPassword()
        const button = wrapper.get('button')
        await button.trigger('click')

        expect(wrapper.get('input').attributes('type')).toBe('text')
        expect(button.attributes('aria-pressed')).toBe('true')
    })

    it('hides it again with a second press', async () => {
        const { wrapper } = await mountPassword()
        const button = wrapper.get('button')
        await button.trigger('click')
        await button.trigger('click')

        expect(wrapper.get('input').attributes('type')).toBe('password')
    })

    it('keeps what was typed while toggling', async () => {
        const testPassword = 's3cret'
        const { wrapper } = await mountPassword()
        const input = wrapper.get('input')
        await input.setValue(testPassword)
        await wrapper.get('button').trigger('click')

        expect(input.element.value).toBe(testPassword)
    })

    it('never submits a form by pressing the toggle', async () => {
        const { wrapper } = await mountPassword()
        expect(wrapper.get('button').attributes('type')).toBe('button')
    })

    it('turns the toggle off when the field is disabled', async () => {
        const { wrapper } = await mountPassword({ disabled: true })

        expect(wrapper.get('input').attributes('disabled')).toBeDefined()
        expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    })

    it('passes its label, error and autocomplete to the field', async () => {
        const { wrapper } = await mountPassword({ error: 'Too short', autocomplete: 'current-password' })

        expect(wrapper.get('label').text()).toBe('Password')
        expect(wrapper.get('p').text()).toBe('Too short')
        expect(wrapper.get('input').attributes('autocomplete')).toBe('current-password')
    })

    it('changes the icon when the password becomes visible', async () => {
        const { wrapper } = await mountPassword()
        const currentIcon = () => wrapper.findComponent(VIcon).props('icon')
        const startIcon = currentIcon()
        await wrapper.get('button').trigger('click')
        expect(currentIcon()).not.toBe(startIcon)
    })
})
