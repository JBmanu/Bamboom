import { LANGUAGE_STORAGE_KEY, languages } from '@bamboom/common'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LOGIN_PATH } from '../../../src/player-identity/routePaths'
import { mountPlayer } from '../../utils/mountPlayer'
import { createFakeAuthService } from '../../../src/player-identity'

const titleOf = (container: HTMLElement) => container.querySelector('[data-layer="content"] h1')?.textContent
const subtitleOf = (container: HTMLElement) => container.querySelector('[data-layer="content"] header p')?.textContent

/** Finds an input the way a person does: by the text of its label, through the label's `for`. */
function findFieldByLabel(container: HTMLElement, labelText: string) {
    const label = [...container.querySelectorAll('label')].find((element) => element.textContent?.trim() === labelText)
    return container.querySelector<HTMLInputElement>(`#${CSS.escape(label!.htmlFor)}`)!
}

/** The error a screen reader announces for the field: the element its `aria-describedby` points to. */
function readFieldError(input: HTMLInputElement) {
    const errorId = input.getAttribute('aria-describedby')
    return errorId ? document.getElementById(errorId)?.textContent : undefined
}

// flushPromises: TanStack validates asynchronously, so the test waits for every pending promise before looking.
async function typeInto(input: HTMLInputElement, text: string) {
    input.value = text
    input.dispatchEvent(new Event('input'))
    await flushPromises()
}

async function submitForm(container: HTMLElement) {
    container.querySelector('form')!.dispatchEvent(new Event('submit'))
    await flushPromises()
}

beforeEach(() => localStorage.removeItem(LANGUAGE_STORAGE_KEY))
afterEach(() => vi.restoreAllMocks())

describe('LoginView', () => {
    it('shows its title and subtitle inside the layout of the access pages', async () => {
        const { container } = await mountPlayer(LOGIN_PATH)

        expect(titleOf(container)).toBe('Welcome back!')
        expect(subtitleOf(container)).toBe('Ready to make the match explode?')
    })

    it('speaks Italian when Italian is the stored language', async () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, languages.it)
        const { container } = await mountPlayer(LOGIN_PATH)

        expect(titleOf(container)).toBe('Bentornato!')
        expect(subtitleOf(container)).toBe('Pronto a far esplodere la partita?')
    })

    it('lets the browser fill in the saved credentials', async () => {
        const { container } = await mountPlayer(LOGIN_PATH)
        const email = findFieldByLabel(container, 'Email')
        const password = findFieldByLabel(container, 'Password')

        expect(email.autocomplete).toBe('email')
        expect(password.autocomplete).toBe('current-password')
    })

    it('shows no message while the person types, before the first submit', async () => {
        const { container } = await mountPlayer(LOGIN_PATH)
        const email = findFieldByLabel(container, 'Email')
        await typeInto(email, 'ada')

        expect(readFieldError(email)).toBe(undefined)
    })

    it('asks for both fields on an empty submit, without calling the server', async () => {
        const authService = createFakeAuthService()
        const logIn = vi.spyOn(authService, 'logIn')
        const { container } = await mountPlayer(LOGIN_PATH, { authService })

        await submitForm(container)

        expect(readFieldError(findFieldByLabel(container, 'Email'))).toBe('This field is required.')
        expect(readFieldError(findFieldByLabel(container, 'Password'))).toBe('This field is required.')
        expect(logIn).not.toHaveBeenCalled()
    })

    it('rejects an invalid email, and clears the message as soon as it is fixed', async () => {
        const { container } = await mountPlayer(LOGIN_PATH)
        const email = findFieldByLabel(container, 'Email')

        await typeInto(email, 'ada')
        await submitForm(container)
        expect(readFieldError(email)).toBe('Enter a valid email address.')

        await typeInto(email, 'ada@example.com')
        expect(readFieldError(email)).toBeUndefined() // read again: the page changed, an old variable would not
    })
})
