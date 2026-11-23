import { describe, expect, it, vi } from 'vitest'
import { createFakeAuthService } from '../../src/player-identity'
import { FORGOT_PASSWORD_PATH, LOGIN_PATH, NEW_PASSWORD_PATH } from '../../src/player-identity/routePaths'
import { resetFlowSteps, useResetFlowStore } from '../../src/player-identity/stores/useResetFlowStore'
import { findFieldByLabel, findLinkByText, submitForm, titleOf, typeInto } from '../utils/accessPageQueries'
import { mountPlayer } from '../utils/mountPlayer'

const account = { username: 'ada', email: 'ada@example.com', password: 'correct-horse-9' }
const resetCode = '123456'

describe('the password reset, from the login to the new password page', () => {
    it('given a registered player, when they ask for a code and confirm it, then they reach the page to choose a new password', async () => {
        const authService = createFakeAuthService({ accounts: [account], resetCode })
        const { container, app, router } = await mountPlayer(LOGIN_PATH, { authService })
        const resetFlow = useResetFlowStore(app.config.globalProperties.$pinia)

        findLinkByText(container, 'Forgot your password?')!.click()
        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(FORGOT_PASSWORD_PATH))
        await vi.waitFor(() => expect(titleOf(container)).toBe('Boom! Password exploded?'))

        await typeInto(findFieldByLabel(container, 'Email'), account.email)
        await submitForm(container)
        await vi.waitFor(() => expect(titleOf(container)).toBe('Check your email'))
        expect(router.currentRoute.value.path).toBe(FORGOT_PASSWORD_PATH) // same page: only the phase changes

        await typeInto(findFieldByLabel(container, 'Code'), resetCode)
        await submitForm(container)

        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(NEW_PASSWORD_PATH))
        expect(resetFlow.step).toBe(resetFlowSteps.codeConfirmed)
    })
})
