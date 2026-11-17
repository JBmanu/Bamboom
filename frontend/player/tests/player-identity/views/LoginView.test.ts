import { LANGUAGE_STORAGE_KEY, languages } from '@bamboom/common'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LOGIN_PATH } from '../../../src/player-identity/routePaths'
import { mountPlayer } from '../../utils/mountPlayer'
import { createFakeAuthService, useSessionStore } from '../../../src/player-identity'
import { HOME_PATH } from '../../../src/app/router/appRoutes'
import { failures } from '../../../src/player-identity/errors/failures.ts'

const account = { username: 'ada', email: 'ada@example.com', password: 'correct-horse-9' }
const ada = { username: account.username, email: account.email }
const wrongPassword = 'not-the-password'

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

/** Fills the form as a person would and sends it. */
async function logInThroughTheForm(container: HTMLElement, email: string, password: string) {
    const emailField = findFieldByLabel(container, 'Email')
    const passwordField = findFieldByLabel(container, 'Password')
    await typeInto(emailField, email)
    await typeInto(passwordField, password)
    await submitForm(container)
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

describe('LoginView: a successful log-in', () => {
    it('opens the home', async () => {
        const authService = createFakeAuthService({ accounts: [account] })
        const { container, router } = await mountPlayer(LOGIN_PATH, { authService })
        await logInThroughTheForm(container, account.email, account.password)

        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(HOME_PATH))
    })

    it('starts the session with the player the server answered', async () => {
        const authService = createFakeAuthService({ accounts: [account] })
        const { container, app } = await mountPlayer(LOGIN_PATH, { authService })
        await logInThroughTheForm(container, account.email, account.password)
        const session = useSessionStore(app.config.globalProperties.$pinia)

        expect(session.player).toEqual(ada)
        expect(session.isSignedIn).toBe(true)
    })

    it('sends the email without the spaces around it', async () => {
        const authService = createFakeAuthService({ accounts: [account] })
        const logIn = vi.spyOn(authService, 'logIn')
        const { container } = await mountPlayer(LOGIN_PATH, { authService })
        await logInThroughTheForm(container, '  ada@example.com ', account.password)

        expect(logIn).toHaveBeenCalledWith({ email: account.email, password: account.password })
    })
})

describe('LoginView: a refused log-in', () => {
    /** The text of the error banner: `role="alert"` is what a screen reader announces. */
    const readErrorBanner = (container: HTMLElement) => container.querySelector('[role="alert"]')?.textContent?.trim()

    it.each([
        ['a wrong password', account.email, wrongPassword],
        ['an unknown email', 'nobody@example.com', account.password]
    ])('gives the same answer for %s', async (_case, email, password) => {
        const authService = createFakeAuthService({ accounts: [account] })
        const { container } = await mountPlayer(LOGIN_PATH, { authService })
        await logInThroughTheForm(container, email, password)

        expect(readErrorBanner(container)).toBe('Email or password is incorrect.')
    })

    it('keeps the email, empties the password and moves the focus there', async () => {
        const authService = createFakeAuthService({ accounts: [account] })
        const { container } = await mountPlayer(LOGIN_PATH, { authService })
        await logInThroughTheForm(container, account.email, wrongPassword)
        const emailField = findFieldByLabel(container, 'Email')
        const passwordField = findFieldByLabel(container, 'Password')

        expect(emailField.value).toBe(account.email)
        expect(passwordField.value).toBe('')
        expect(document.activeElement).toBe(passwordField)
        expect(readFieldError(passwordField)).toBeUndefined()
    })

    it('says when there were too many attempts', async () => {
        const authService = createFakeAuthService({ accounts: [account], maxFailedLogIns: 1 })
        const { container } = await mountPlayer(LOGIN_PATH, { authService })
        await logInThroughTheForm(container, account.email, wrongPassword)
        await logInThroughTheForm(container, account.email, account.password)

        expect(readErrorBanner(container)).toBe('Too many attempts. Try again in a few minutes.')
    })

    it('says when the server cannot be reached, keeps what was typed, and lets the person try again', async () => {
        const authService = createFakeAuthService({ accounts: [account] })
        const { container, router } = await mountPlayer(LOGIN_PATH, { authService })
        authService.failNextCall(failures.networkUnreachable)
        await logInThroughTheForm(container, account.email, account.password)

        expect(readErrorBanner(container)).toBe('No connection. Check your network and try again.')
        expect(findFieldByLabel(container, 'Password').value).toBe(account.password)

        await logInThroughTheForm(container, account.email, account.password)
        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(HOME_PATH))
    })

    it('shows only the answer to the last attempt', async () => {
        const authService = createFakeAuthService({ accounts: [account] })
        const { container } = await mountPlayer(LOGIN_PATH, { authService })
        authService.failNextCall(failures.networkUnreachable)
        await logInThroughTheForm(container, account.email, account.password)
        await logInThroughTheForm(container, account.email, wrongPassword)

        expect(readErrorBanner(container)).toBe('Email or password is incorrect.')
        expect(container.querySelectorAll('[role="alert"]').length).toBe(1)
    })
})

describe('LoginView: while waiting for the server', () => {
    /** Long enough to look at the page while the answer is on its way, short enough not to slow the tests. */
    const SLOW_ANSWER_MS = 50
    const findSubmitButton = (container: HTMLElement) => container.querySelector('button[type="submit"]')!

    it('shows the button busy until the answer arrives', async () => {
        const authService = createFakeAuthService({ accounts: [account], latencyMs: SLOW_ANSWER_MS })
        const { container } = await mountPlayer(LOGIN_PATH, { authService })
        const submitButton = findSubmitButton(container)
        await logInThroughTheForm(container, account.email, wrongPassword)

        expect(submitButton.getAttribute('aria-busy')).toBe('true')
        await vi.waitFor(() => expect(submitButton.getAttribute('aria-busy')).toBeNull())
    })

    it('sends one request however many times the form is submitted while waiting', async () => {
        const authService = createFakeAuthService({ accounts: [account], latencyMs: SLOW_ANSWER_MS })
        const logIn = vi.spyOn(authService, 'logIn')
        const { container, router } = await mountPlayer(LOGIN_PATH, { authService })
        await logInThroughTheForm(container, account.email, account.password)
        await submitForm(container)
        await submitForm(container)

        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(HOME_PATH))
        expect(logIn).toHaveBeenCalledTimes(1)
    })
})
