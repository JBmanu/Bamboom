import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { HOME_PATH } from '../../../src/app/router/appRoutes.ts'
import { createFakeAuthService, useSessionStore } from '../../../src/player-identity'
import { failures } from '../../../src/player-identity/errors/failures.ts'
import { COMPLETE_GOOGLE_PROFILE_PATH, FORGOT_PASSWORD_PATH, LOGIN_PATH, REGISTER_PATH } from '../../../src/player-identity/routePaths.ts'
import { findButtonByText } from '../../utils/accessPageQueries.ts'
import { mountPlayer } from '../../utils/mountPlayer.ts'

const account = { username: 'ada', email: 'ada@example.com', password: 'correct-horse-9' }

const findGoogleButton = (container: HTMLElement) => findButtonByText(container, 'Continue with Google')

/** Opens the login with a fake whose Google trip brings `googleEmail`. */
async function openLogin(googleEmail: string, options: { latencyMs?: number } = {}) {
    const authService = createFakeAuthService({ accounts: [account], googleEmail, ...options })
    return { ...(await mountPlayer(LOGIN_PATH, { authService })), authService }
}

describe('GoogleSignInSection: where it appears', () => {
    it.each([
        ['login', LOGIN_PATH],
        ['registration', REGISTER_PATH]
    ])('given the %s page, when it opens, then the Google button follows an "or" and carries the logo', async (_pageName, path) => {
        const { container } = await mountPlayer(path)
        const button = findGoogleButton(container)

        expect(button.type).toBe('button')
        expect(button.querySelector('svg')).not.toBeNull()
        expect(container.querySelector('[role="separator"]')?.textContent?.trim()).toBe('or')
    })

    it('given the password recovery page, when it opens, then there is no Google button', async () => {
        const { container } = await mountPlayer(FORGOT_PASSWORD_PATH)

        expect(findGoogleButton(container)).toBeUndefined()
    })
})

describe('GoogleSignInSection: the trip to Google', () => {
    it('given an email with no account, when the button is clicked, then the complete profile page opens', async () => {
        const { container, router } = await openLogin('new.player@example.com')

        findGoogleButton(container).click()

        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(COMPLETE_GOOGLE_PROFILE_PATH))
    })

    it('given the email of an account, when the button is clicked, then the session starts with that account', async () => {
        const { container, app } = await openLogin(account.email)
        const session = useSessionStore(app.config.globalProperties.$pinia)

        findGoogleButton(container).click()
        await flushPromises()

        await vi.waitFor(() => expect(session.player).toEqual({ username: account.username, email: account.email }))
    })

    it('given the email of an account, when the button is clicked, then the home opens', async () => {
        const { container, router } = await openLogin(account.email)

        findGoogleButton(container).click()

        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(HOME_PATH))
    })

    it('given the Google window is closed, when the button is clicked, then the banner shows, the page stays and the next try works', async () => {
        const { container, router, authService } = await openLogin('new.player@example.com')
        authService.closeNextGoogleWindow()

        findGoogleButton(container).click()
        await flushPromises()
        expect(container.querySelector('[role="alert"]')?.textContent).toContain('Google sign-in was cancelled.')
        expect(router.currentRoute.value.path).toBe(LOGIN_PATH)

        findGoogleButton(container).click()
        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(COMPLETE_GOOGLE_PROFILE_PATH))
    })

    it('given the server does not answer, when the button is clicked, then the banner shows and the page stays', async () => {
        const { container, router, authService } = await openLogin('new.player@example.com')
        authService.failNextCall(failures.networkUnreachable) // after the page opened: the next call is the trip

        findGoogleButton(container).click()
        await flushPromises()

        expect(container.querySelector('[role="alert"]')?.textContent).toContain('No connection. Check your network and try again.')
        expect(router.currentRoute.value.path).toBe(LOGIN_PATH)
    })
})

describe('GoogleSignInSection: while waiting for Google', () => {
    const SLOW_ANSWER_MS = 50

    it('given a slow answer, when the button is clicked twice, then it is busy and only one trip starts', async () => {
        const authService = createFakeAuthService({ accounts: [account], googleEmail: 'new.player@example.com', latencyMs: SLOW_ANSWER_MS })
        const continueWithGoogle = vi.spyOn(authService, 'continueWithGoogle')
        const { container, router } = await mountPlayer(LOGIN_PATH, { authService })
        const button = findGoogleButton(container)

        button.click()
        await flushPromises()
        expect(button.getAttribute('aria-busy')).toBe('true')
        button.click()

        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(COMPLETE_GOOGLE_PROFILE_PATH))
        expect(continueWithGoogle).toHaveBeenCalledTimes(1)
    })
})
