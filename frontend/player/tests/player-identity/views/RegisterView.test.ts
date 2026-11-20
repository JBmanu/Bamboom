import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LANGUAGE_STORAGE_KEY, languages } from '@bamboom/common'
import { mountPlayer } from '../../utils/mountPlayer.ts'
import { findFieldByLabel, findLinkByText, readFieldError, submitForm, subtitleOf, titleOf, typeInto } from '../../utils/accessPageQueries.ts'
import { LOGIN_PATH, REGISTER_PATH } from '../../../src/player-identity/routePaths.ts'
import { flushPromises } from '@vue/test-utils'
import { assessPasswordStrength, type PasswordStrengthLevel } from '../../../src/player-identity/schemas/assessPasswordStrength.ts'

vi.mock('../../../src/player-identity/schemas/assessPasswordStrength.ts')

beforeEach(() => {
    vi.mocked(assessPasswordStrength).mockReset()
    vi.mocked(assessPasswordStrength).mockResolvedValue(0)
    localStorage.removeItem(LANGUAGE_STORAGE_KEY)
})

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
        expect(container.textContent?.trim()).toContain('Already have an account?')
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
        ['Password', 'long-enough-1', true, 'valid'],
        ['Email', 'not-an-email', true, undefined],
        ['Email', 'ada@example.com', false, undefined]
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

describe('RegisterView: the password strength', () => {
    const findMeter = (container: HTMLElement) => container.querySelector('[data-level]')

    it('given an empty password, when the screen opens, then the meter is empty and has no label', async () => {
        const { container } = await mountPlayer(REGISTER_PATH)
        const meter = findMeter(container)

        expect(meter).not.toBeNull()
        expect(meter?.textContent?.trim()).toBe('')
        expect(meter?.getAttribute('data-level')).toBe('0')
    })

    it('given a typed password, when it is emptied again, then the meter goes back to empty', async () => {
        vi.mocked(assessPasswordStrength).mockResolvedValue(4)
        const { container } = await mountPlayer(REGISTER_PATH)
        const passwordField = findFieldByLabel(container, 'Password')

        await typeInto(passwordField, 'tryPasswordFull!!')
        expect(findMeter(container)?.getAttribute('data-level')).toBe('4')

        await typeInto(passwordField, '')
        expect(findMeter(container)?.textContent?.trim()).toBe('')
        expect(findMeter(container)?.getAttribute('data-level')).toBe('0')
    })

    it.each([
        [0, 'Very weak'],
        [1, 'Weak'],
        [2, 'Fair'],
        [3, 'Good'],
        [4, 'Strong']
    ] as const)('given the assessed level %s, when a password is typed, then the meter says "%s"', async (level, label) => {
        vi.mocked(assessPasswordStrength).mockResolvedValue(level)
        const { container } = await mountPlayer(REGISTER_PATH)
        await typeInto(findFieldByLabel(container, 'Password'), 'Password')
        const meter = findMeter(container)

        expect(meter?.textContent?.trim()).toBe(label)
        expect(meter?.getAttribute('data-level')).toBe(String(level))
    })

    it('given a nickname and an email, when the password is typed, then both are used as personal inputs', async () => {
        const { container } = await mountPlayer(REGISTER_PATH)
        await typeInto(findFieldByLabel(container, 'Nickname'), 'ada_9')
        await typeInto(findFieldByLabel(container, 'Email'), 'ada@example.com')
        await typeInto(findFieldByLabel(container, 'Password'), 'some-password')

        expect(assessPasswordStrength).toHaveBeenLastCalledWith('some-password', ['ada_9', 'ada@example.com'])
    })

    it('given two edits, when the older answer arrives last, then the meter shows the newer level', async () => {
        const older = Promise.withResolvers<PasswordStrengthLevel>()
        const newer = Promise.withResolvers<PasswordStrengthLevel>()
        vi.mocked(assessPasswordStrength).mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise)
        const { container } = await mountPlayer(REGISTER_PATH)

        const passwordField = findFieldByLabel(container, 'Password')
        await typeInto(passwordField, 'first-try')
        await typeInto(passwordField, 'second-try-longer')
        newer.resolve(4)
        older.resolve(0)
        await flushPromises()

        expect(findMeter(container)?.getAttribute('data-level')).toBe('4')
    })
})
