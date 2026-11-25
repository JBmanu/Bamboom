import { describe, expect, it, vi } from 'vitest'
import { HOME_PATH } from '../../src/app/router/appRoutes'
import { createFakeAuthService, useSessionStore } from '../../src/player-identity'
import { COMPLETE_GOOGLE_PROFILE_PATH, LOGIN_PATH } from '../../src/player-identity/routePaths'
import { findButtonByText, findFieldByLabel, submitForm, titleOf, typeInto } from '../utils/accessPageQueries'
import { mountPlayer } from '../utils/mountPlayer'
import { waitForPageLoad } from '../utils/waitForPageLoad'

const account = { username: 'ada', email: 'ada@example.com', password: 'correct-horse-9' }
const googleEmail = 'new.player@example.com'
const chosenNickname = 'bamboo_fan'

/** What a new person does from the login until the page to complete the profile is open. */
async function reachCompleteProfilePage() {
    const authService = createFakeAuthService({ accounts: [account], googleEmail })
    const opened = await mountPlayer(LOGIN_PATH, { authService })

    findButtonByText(opened.container, 'Continue with Google').click()
    await waitForPageLoad(() => expect(opened.router.currentRoute.value.path).toBe(COMPLETE_GOOGLE_PROFILE_PATH))
    await vi.waitFor(() => expect(titleOf(opened.container)).toBe('Welcome to the explosion!'))
    await vi.waitFor(() => expect(findFieldByLabel(opened.container, 'Nickname')).toBeDefined())

    return opened
}

describe('the sign-in with Google, from the login to the game', () => {
    it('given an email with no account, when the player chooses a nickname, then they are signed in with that nickname and the Google email', async () => {
        const { container, app, router } = await reachCompleteProfilePage()

        await typeInto(findFieldByLabel(container, 'Nickname'), chosenNickname)
        await submitForm(container)

        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(HOME_PATH))
        const session = useSessionStore(app.config.globalProperties.$pinia)
        expect(session.player).toEqual({ username: chosenNickname, email: googleEmail })
    })

    it('given a player who leaves through "Log in now", when the complete profile address is opened again, then the login opens instead', async () => {
        const { container, router } = await reachCompleteProfilePage()

        findButtonByText(container, 'Log in now').click()
        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(LOGIN_PATH))
        await router.push(COMPLETE_GOOGLE_PROFILE_PATH)

        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(LOGIN_PATH))
    })
})
