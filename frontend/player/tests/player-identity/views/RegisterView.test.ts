import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LANGUAGE_STORAGE_KEY, languages } from '@bamboom/common'
import { mountPlayer } from '../../utils/mountPlayer.ts'
import { findFieldByLabel, findLinkByText, subtitleOf, titleOf } from '../../utils/accessPageQueries.ts'
import { LOGIN_PATH, REGISTER_PATH } from '../../../src/player-identity/routePaths.ts'

beforeEach(() => localStorage.removeItem(LANGUAGE_STORAGE_KEY))
afterEach(() => vi.restoreAllMocks())

describe('RegisterView', () => {
    it('shows its title and subtitle inside the layout of the access pages', async () => {
        const { container } = await mountPlayer(REGISTER_PATH)

        expect(titleOf(container)).toBe('Join the explosion!')
        expect(subtitleOf(container)).toBe('Create your account and start playing!')
    })

    it('speaks Italian when Italian is the stored language', async () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, languages.it)
        const { container } = await mountPlayer(REGISTER_PATH)

        expect(titleOf(container)).toBe('Unisciti all’esplosione!')
        expect(subtitleOf(container)).toBe('Crea il tuo account e inizia a giocare!')
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
})
