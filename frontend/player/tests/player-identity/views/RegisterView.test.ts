import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LANGUAGE_STORAGE_KEY, languages } from '@bamboom/common'
import { mountPlayer } from '../../utils/mountPlayer.ts'
import { findFieldByLabel, findLinkByText, readFieldError, submitForm, subtitleOf, titleOf, typeInto } from '../../utils/accessPageQueries.ts'
import { LOGIN_PATH, REGISTER_PATH } from '../../../src/player-identity/routePaths.ts'
import { flushPromises } from '@vue/test-utils'

beforeEach(() => localStorage.removeItem(LANGUAGE_STORAGE_KEY))
afterEach(() => vi.restoreAllMocks())

describe('RegisterView', () => {
    it.each([
        ['English', languages.en, 'Join the explosion!', 'Create your account and start playing!'],
        ['Italian', languages.it, 'Unisciti all’esplosione!', 'Crea il tuo account e inizia a giocare!']
    ])('shows its title and subtitle in %s, inside the layout of the access pages', async (_languageName, language, title, subtitle) => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
        const { container } = await mountPlayer(REGISTER_PATH)

        expect(titleOf(container)).toBe(title)
        expect(subtitleOf(container)).toBe(subtitle)
    })

    it.each([
        ['Nickname', 'username', 'nickname'],
        ['Email', 'email', 'email'],
        ['Password', 'password', 'new-password']
    ])('asks for %s with the name "%s" and the autocomplete "%s"', async (fieldText, name, autocomplete) => {
        const { container } = await mountPlayer(REGISTER_PATH)
        const field = findFieldByLabel(container, fieldText)

        expect(field.name).toBe(name)
        expect(field.autocomplete).toBe(autocomplete)
    })

    it('has a submit button with its label', async () => {
        const { container } = await mountPlayer(REGISTER_PATH)
        const submitButton = container.querySelector('button[type="submit"]')

        expect(submitButton?.textContent?.trim()).toBe('Create my account')
    })

    it('offers a way to the login page', async () => {
        const { container } = await mountPlayer(REGISTER_PATH)
        const link = findLinkByText(container, 'Log in now')

        expect(link?.getAttribute('href')).toBe(LOGIN_PATH)
        expect(container.textContent).toContain('Already have an account?')
    })

    it.each([
        ['Nickname', 'two words'],
        ['Email', 'not-an-email'],
        ['Password', 'short']
    ])('shows a message under %s when it holds "%s" and the form is submitted', async (fieldText, value) => {
        const { container } = await mountPlayer(REGISTER_PATH)
        const field = findFieldByLabel(container, fieldText)
        await typeInto(field, value)
        await submitForm(container)

        expect(readFieldError(field)).toBeDefined()
    })
})

describe('RegisterView: the validation', () => {
    it.each([
        ['Nickname', 'ada_9', true, 'valid'],
        ['Email', 'ada@example.com', true, 'valid'],
        ['Password', 'long-enough-1', true, 'valid'], // one row per field: proves each is wired
        ['Email', 'not-an-email', true, undefined], // the trap: no validation has run yet, but it must not turn green
        ['Email', 'ada@example.com', false, undefined] // valid but not left yet
    ])('%s with "%s", left: %s, is shown as %s', async (fieldText, value, left, state) => {
        const { container } = await mountPlayer(REGISTER_PATH)
        const field = findFieldByLabel(container, fieldText)
        await typeInto(field, value)
        if (left) {
            field.dispatchEvent(new Event('blur'))
            await flushPromises()
        }

        expect(field.closest('[data-state]')?.getAttribute('data-state') ?? undefined).toBe(state)
    })
})
