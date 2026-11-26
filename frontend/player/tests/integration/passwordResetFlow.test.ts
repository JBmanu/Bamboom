import { beforeAll, describe, expect, it, vi } from 'vitest'
import { HOME_PATH } from '../../src/app/router/appRoutes'
import { createFakeAuthService } from '../../src/player-identity'
import { FORGOT_PASSWORD_PATH, LOGIN_PATH, NEW_PASSWORD_PATH } from '../../src/player-identity/routePaths'
import { resetFlowSteps, useResetFlowStore } from '../../src/player-identity/stores/useResetFlowStore'
import { findButtonByText, findFieldByLabel, findLinkByText, submitForm, titleOf, typeInto } from '../utils/accessPageQueries'
import { installDialogStub } from '../utils/installDialogStub'
import { mountPlayer } from '../utils/mountPlayer'
import { waitForPageLoad } from '../utils/waitForPageLoad'

// The strength of the password is covered by the view's own tests: here the real analyser would only slow the run down.
vi.mock('../../src/player-identity/schemas/assessPasswordStrength.ts', () => ({
    assessPasswordStrength: vi.fn().mockResolvedValue(0),
    preloadPasswordStrength: vi.fn()
}))

const account = { username: 'ada', email: 'ada@example.com', password: 'correct-horse-9' }
const resetCode = '123456'
const newPassword = 'new-password!'

beforeAll(installDialogStub)

/** What the player does from the login until the code is confirmed: the same steps for every test of the flow. */
async function reachNewPasswordPage() {
    const authService = createFakeAuthService({ accounts: [account], resetCode })
    const { container, app, router } = await mountPlayer(LOGIN_PATH, { authService })

    findLinkByText(container, 'Forgot your password?')!.click()
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(FORGOT_PASSWORD_PATH))
    await vi.waitFor(() => expect(titleOf(container)).toBe('Boom! Password exploded?'))

    await typeInto(findFieldByLabel(container, 'Email'), account.email)
    await submitForm(container)
    await vi.waitFor(() => expect(titleOf(container)).toBe('Check your email'))
    expect(router.currentRoute.value.path).toBe(FORGOT_PASSWORD_PATH) // same page: only the phase changes

    await typeInto(findFieldByLabel(container, 'Code'), resetCode)
    await submitForm(container)
    await waitForPageLoad(() => expect(router.currentRoute.value.path).toBe(NEW_PASSWORD_PATH))
    await vi.waitFor(() => expect(titleOf(container)).toBe('New password?'))

    return { container, app, router }
}

async function logIn(container: HTMLElement, password: string) {
    await typeInto(findFieldByLabel(container, 'Email'), account.email)
    await typeInto(findFieldByLabel(container, 'Password'), password)
    await submitForm(container)
}

describe('the password reset, from the login to the new login', () => {
    it('given a registered player, when they ask for a code and confirm it, then they reach the page to choose a new password', async () => {
        const { app } = await reachNewPasswordPage()

        expect(useResetFlowStore(app.config.globalProperties.$pinia).step).toBe(resetFlowSteps.codeConfirmed)
    })

    it('given a confirmed code, when the player saves a new password, then the old one stops working and the new one logs them in', async () => {
        const { container, router } = await reachNewPasswordPage()

        await typeInto(findFieldByLabel(container, 'New password'), newPassword)
        await submitForm(container)
        await vi.waitFor(() => expect(findButtonByText(container, 'Go to login')).toBeDefined())
        findButtonByText(container, 'Go to login').click()
        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(LOGIN_PATH))
        await vi.waitFor(() => expect(titleOf(container)).toBe('Welcome back!'))

        await logIn(container, account.password)
        expect(container.querySelector('[role="alert"]')?.textContent).toContain('Email or password is incorrect.')

        await logIn(container, newPassword)
        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(HOME_PATH))
    })
})
