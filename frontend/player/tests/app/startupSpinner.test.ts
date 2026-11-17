import { afterEach, describe, expect, it, vi } from 'vitest'
import { SIGNED_IN_HINT_STORAGE_KEY } from '../../src/player-identity/stores/signedInHint.ts'
import { HOME_PATH } from '../../src/app/router/appRoutes'
import { LOGIN_PATH } from '../../src/player-identity/routePaths'
import { createFakeAuthService } from '../../src/player-identity'
import { contractFixtures } from '../player-identity/api/authServiceContract.ts'
import { mountPlayer } from '../utils/mountPlayer.ts'
import { failures } from '../../src/player-identity/errors/failures.ts'

const { account } = contractFixtures
/** The server answers after this long: the test can look at the page while the session is being restored. */
const SLOW_SERVER_MS = 50

/** The spinner of the startup, found by what it announces: other spinners (buttons) must not count. */
const findRestoringSpinner = (container: HTMLElement) =>
    [...container.querySelectorAll('[role="status"]')].find((element) => element.textContent?.includes('Restoring your session'))

/** A slow server that still has Ada signed in from a previous visit. */
async function createSlowServiceWithPlayerSignedIn() {
    const authService = createFakeAuthService({ accounts: [account], latencyMs: SLOW_SERVER_MS })
    await authService.logIn({ email: account.email, password: account.password })
    return authService
}

afterEach(() => localStorage.removeItem(SIGNED_IN_HINT_STORAGE_KEY))

describe('startup', () => {
    it('shows a spinner while the session is restored, to a person who was signed in last time', async () => {
        localStorage.setItem(SIGNED_IN_HINT_STORAGE_KEY, 'yes')
        const authService = await createSlowServiceWithPlayerSignedIn()
        const { container, router } = await mountPlayer(HOME_PATH, { authService, waitsForFirstPage: false })

        expect(findRestoringSpinner(container)).toBeDefined()
        await vi.waitFor(() => {
            expect(findRestoringSpinner(container)).toBeUndefined()
            expect(router.currentRoute.value.path).toBe(HOME_PATH)
        })
    })

    it('shows no spinner to a person who was not signed in last time', async () => {
        const authService = createFakeAuthService({ latencyMs: SLOW_SERVER_MS })
        const { container, router } = await mountPlayer(HOME_PATH, { authService, waitsForFirstPage: false })
        expect(findRestoringSpinner(container)).toBeUndefined()
        await vi.waitFor(
            () => {
                expect(router.currentRoute.value.path).toBe(LOGIN_PATH)
            },
            { timeout: 20_000 }
        )
    })

    it('stops the spinner and opens the login when the server cannot be reached', async () => {
        localStorage.setItem(SIGNED_IN_HINT_STORAGE_KEY, 'yes')
        const authService = await createSlowServiceWithPlayerSignedIn()
        authService.failNextCall(failures.networkUnreachable)
        const { container, router } = await mountPlayer(HOME_PATH, { authService, waitsForFirstPage: false })

        await vi.waitFor(
            () => {
                expect(router.currentRoute.value.path).toBe(LOGIN_PATH)
                expect(findRestoringSpinner(container)).toBeUndefined()
            },
            { timeout: 20_000 }
        )
    })
})
