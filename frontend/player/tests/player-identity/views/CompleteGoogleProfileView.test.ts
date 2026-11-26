import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LANGUAGE_STORAGE_KEY, languages } from '@bamboom/common'
import { HOME_PATH } from '../../../src/app/router/appRoutes.ts'
import { createFakeAuthService, useSessionStore } from '../../../src/player-identity'
import { failures } from '../../../src/player-identity/errors/failures.ts'
import { succeed } from '../../../src/player-identity/errors/result.ts'
import { COMPLETE_GOOGLE_PROFILE_PATH, LOGIN_PATH, REGISTER_PATH } from '../../../src/player-identity/routePaths.ts'
import {
    findButtonByText,
    findFieldByLabel,
    findSubmitButton,
    readFieldError,
    submitForm,
    subtitleOf,
    titleOf,
    typeInto
} from '../../utils/accessPageQueries.ts'
import { mountPlayer } from '../../utils/mountPlayer.ts'
import { waitForPageSwap } from '../../utils/waitForPageSwap.ts'

const account = { username: 'ada', email: 'ada@example.com', password: 'correct-horse-9' }
const googleEmail = 'ada.google@example.com'
const freeNickname = 'ada_g'

/** A fake where the trip to Google is already made: the person arrives with a profile waiting. */
async function createServiceWithPendingProfile() {
    const authService = createFakeAuthService({ accounts: [account], googleEmail })
    await authService.continueWithGoogle()
    return authService
}

/** Opens the page and waits for the question "who is waiting?" to be answered, so the form is there. */
async function openProfilePage() {
    const authService = await createServiceWithPendingProfile()
    const opened = await mountPlayer(COMPLETE_GOOGLE_PROFILE_PATH, { authService })
    await flushPromises()
    return { ...opened, authService }
}

beforeEach(() => localStorage.removeItem(LANGUAGE_STORAGE_KEY))

describe('CompleteGoogleProfileView: what the page shows', () => {
    it.each([
        ['English', languages.en, 'Welcome to the explosion!', 'Choose your nickname and start playing!'],
        ['Italian', languages.it, 'Benvenuto esplosivo!', 'Scegli il tuo nickname e inizia a giocare!']
    ])('given %s, when the page opens, then it shows its title and subtitle', async (_languageName, language, title, subtitle) => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
        const { container } = await openProfilePage()

        expect(titleOf(container)).toBe(title)
        expect(subtitleOf(container)).toBe(subtitle)
    })

    it('given a profile waiting, when the page opens, then the Google logo is shown and hidden from screen readers', async () => {
        const { container } = await openProfilePage()

        expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull()
    })

    it('given a profile waiting, when the page opens, then the nickname is asked first, with the focus', async () => {
        const { container } = await openProfilePage()
        const nicknameField = findFieldByLabel(container, 'Nickname')

        expect(document.activeElement).toBe(nicknameField)
        expect(nicknameField.name).toBe('username')
        expect(nicknameField.autocomplete).toBe('nickname')
    })

    it('given a profile waiting, when the page opens, then the email of Google is shown read-only with its note', async () => {
        const { container } = await openProfilePage()
        const emailField = findFieldByLabel(container, 'Email')

        expect(emailField.value).toBe(googleEmail)
        expect(emailField.readOnly).toBe(true)
        expect(container.textContent).toContain('This email is already linked to your Google account.')
    })

    it('given a profile waiting, when the page opens, then the info box, the submit button and the other ways out are shown', async () => {
        const { container } = await openProfilePage()

        expect(container.textContent).toContain('Safe, fast, explosive!')
        expect(findSubmitButton(container).textContent?.trim()).toBe('Complete and play')
        expect(container.querySelector('[role="separator"]')?.textContent?.trim()).toBe('or')
        expect(findButtonByText(container, 'Use another email')).toBeDefined()
        expect(findButtonByText(container, 'Log in now')).toBeDefined()
    })
})

describe('CompleteGoogleProfileView: completing the profile', () => {
    it('given a free nickname, when the form is sent, then the session starts with the Google email', async () => {
        const { container, app } = await openProfilePage()
        const session = useSessionStore(app.config.globalProperties.$pinia)

        await typeInto(findFieldByLabel(container, 'Nickname'), freeNickname)
        await submitForm(container)

        expect(session.player).toEqual({ username: freeNickname, email: googleEmail })
    })

    it('given a free nickname, when the form is sent, then the home opens', async () => {
        const { container, router } = await openProfilePage()

        await typeInto(findFieldByLabel(container, 'Nickname'), freeNickname)
        await submitForm(container)

        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(HOME_PATH))
    })

    it('given a taken nickname, when the form is sent, then the message shows under the field and another one can be tried', async () => {
        const { container, router } = await openProfilePage()
        const nicknameField = findFieldByLabel(container, 'Nickname')

        await typeInto(nicknameField, account.username)
        await submitForm(container)
        expect(readFieldError(nicknameField)).toBe('This nickname is already taken.')
        expect(router.currentRoute.value.path).toBe(COMPLETE_GOOGLE_PROFILE_PATH)

        await typeInto(nicknameField, freeNickname)
        await submitForm(container)
        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(HOME_PATH))
    })

    it('given a nickname with spaces, when the form is sent, then the message shows under the field', async () => {
        const { container } = await openProfilePage()
        const nicknameField = findFieldByLabel(container, 'Nickname')

        await typeInto(nicknameField, 'two words')
        await submitForm(container)

        expect(readFieldError(nicknameField)).toBe('Use only letters, numbers and underscores.')
    })
})

describe('CompleteGoogleProfileView: leaving the page', () => {
    it('given nobody is waiting, when the page opens, then the login opens instead', async () => {
        const authService = createFakeAuthService({ accounts: [account], googleEmail })
        const { router } = await mountPlayer(COMPLETE_GOOGLE_PROFILE_PATH, { authService })

        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(LOGIN_PATH))
    })

    it.each([
        ['Use another email', REGISTER_PATH],
        ['Log in now', LOGIN_PATH]
    ])('given a profile waiting, when "%s" is clicked, then nothing is left waiting and %s opens', async (buttonText, expectedPath) => {
        const { container, router, authService } = await openProfilePage()

        findButtonByText(container, buttonText).click()
        await flushPromises()

        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(expectedPath))
        expect(await authService.fetchPendingGoogleProfile()).toEqual(succeed(undefined))
    })

    it('given the server does not answer, when "Use another email" is clicked, then the banner shows and the page stays', async () => {
        const { container, router, authService } = await openProfilePage()
        authService.failNextCall(failures.networkUnreachable)

        findButtonByText(container, 'Use another email').click()
        await flushPromises()

        expect(container.querySelector('[role="alert"]')?.textContent).toContain('No connection. Check your network and try again.')
        expect(router.currentRoute.value.path).toBe(COMPLETE_GOOGLE_PROFILE_PATH)
    })

    it('given the server does not answer, when the page opens, then the banner shows and the form does not', async () => {
        const authService = await createServiceWithPendingProfile()
        const { container, router } = await mountPlayer(LOGIN_PATH, { authService })
        authService.failNextCall(failures.networkUnreachable)

        await router.push(COMPLETE_GOOGLE_PROFILE_PATH)
        await waitForPageSwap()

        expect(container.querySelector('[role="alert"]')?.textContent).toContain('No connection. Check your network and try again.')
        expect(container.querySelector('form')).toBeNull()
    })
})
