import { describe, expect, it, vi } from 'vitest'
import { createFakeAuthService } from '../../../src/player-identity'
import { FORGOT_PASSWORD_PATH, NEW_PASSWORD_PATH } from '../../../src/player-identity/routePaths'
import { RESET_CODE_RESEND_WAIT_MS, resetFlowSteps, useResetFlowStore } from '../../../src/player-identity/stores/useResetFlowStore.ts'
import { findButtonByText, findFieldByLabel, readFieldError, submitForm, titleOf, typeInto } from '../../utils/accessPageQueries.ts'
import { mountPlayer } from '../../utils/mountPlayer'
import { waitForPageLoad } from '../../utils/waitForPageLoad'
import { flushPromises } from '@vue/test-utils'

const registeredEmail = 'ada@example.com'
const account = { username: 'ada', email: registeredEmail, password: 'correct-horse-9' }
const correctCode = '123456' // the fake's default code
const wrongCode = '654321'

/** Sends the email through the form, so the page moves to the code step. */
async function askForCode(container: HTMLElement) {
    await typeInto(findFieldByLabel(container, 'Email'), account.email)
    await submitForm(container)
}

/** Pretends the code was requested long ago, so the wait is over: the real wait is a minute. */
function makeResendWaitOver(resetFlow: ReturnType<typeof useResetFlowStore>) {
    resetFlow.markCodeRequested(account.email, Date.now() - RESET_CODE_RESEND_WAIT_MS)
}

describe('ForgotPasswordView: the code step', () => {
    it('given the email was sent, when the code step opens, then it names the email the code went to', async () => {
        const authService = createFakeAuthService({ accounts: [account] })
        const { container } = await mountPlayer(FORGOT_PASSWORD_PATH, { authService })

        await askForCode(container)

        expect(titleOf(container)).toBe('Check your email')
        expect(container.textContent).toContain(`If an account exists for ${account.email}`)
    })

    it('given the code step, when it opens, then the code field is focused and lets the phone suggest the code', async () => {
        const authService = createFakeAuthService({ accounts: [account] })
        const { container } = await mountPlayer(FORGOT_PASSWORD_PATH, { authService })

        await askForCode(container)
        const codeField = findFieldByLabel(container, 'Code')

        expect(document.activeElement).toBe(codeField)
        expect(codeField.autocomplete).toBe('one-time-code')
        expect(codeField.getAttribute('inputmode')).toBe('numeric')
    })

    it('given the right code, when it is sent, then the flow is confirmed and the new password page opens', async () => {
        const authService = createFakeAuthService({ accounts: [account], resetCode: correctCode })
        const { container, app, router } = await mountPlayer(FORGOT_PASSWORD_PATH, { authService })
        const resetFlow = useResetFlowStore(app.config.globalProperties.$pinia)
        await askForCode(container)

        await typeInto(findFieldByLabel(container, 'Code'), correctCode)
        await submitForm(container)
        
        await waitForPageLoad(() => expect(router.currentRoute.value.path).toBe(NEW_PASSWORD_PATH))
        expect(resetFlow.step).toBe(resetFlowSteps.codeConfirmed)
    })

    it('given a wrong code, when it is sent, then the message is under the field and the page stays', async () => {
        const authService = createFakeAuthService({ accounts: [account], resetCode: correctCode })
        const { container, router } = await mountPlayer(FORGOT_PASSWORD_PATH, { authService })
        await askForCode(container)
        const codeField = findFieldByLabel(container, 'Code')

        await typeInto(codeField, wrongCode)
        await submitForm(container)

        expect(readFieldError(codeField)).toBe('This code is not correct.')
        expect(router.currentRoute.value.path).toBe(FORGOT_PASSWORD_PATH)
    })

    it('given the wait is over, when the code is asked again, then a new wait starts', async () => {
        const authService = createFakeAuthService({ accounts: [account], resetCodeResendWaitMs: 0 })
        const { container, app } = await mountPlayer(FORGOT_PASSWORD_PATH, { authService })
        const resetFlow = useResetFlowStore(app.config.globalProperties.$pinia)
        await askForCode(container)
        makeResendWaitOver(resetFlow)
        await flushPromises()

        findButtonByText(container, 'Send the code again').click()
        await flushPromises()
        const resendButton = findButtonByText(container, 'Send the code again')

        expect(resendButton.disabled).toBe(true)
        expect(resendButton.textContent?.trim()).toBe('Send the code again in 60 s')
    })

    it('given the server refuses a new code, when it is asked again, then the banner says so and the wait does not restart', async () => {
        const authService = createFakeAuthService({ accounts: [account] })
        const { container, app } = await mountPlayer(FORGOT_PASSWORD_PATH, { authService })
        const resetFlow = useResetFlowStore(app.config.globalProperties.$pinia)
        await askForCode(container)
        makeResendWaitOver(resetFlow)
        const waitEnd = resetFlow.resendAllowedAt
        await flushPromises()

        findButtonByText(container, 'Send the code again').click()
        await flushPromises()

        expect(container.querySelector('[role="alert"]')?.textContent?.trim()).toBe('Too many attempts. Try again in a few minutes.')
        expect(resetFlow.resendAllowedAt).toBe(waitEnd)
    })

    it('given the code step, when the person changes email, then the email step opens again', async () => {
        const authService = createFakeAuthService({ accounts: [account] })
        const { container, app } = await mountPlayer(FORGOT_PASSWORD_PATH, { authService })
        const resetFlow = useResetFlowStore(app.config.globalProperties.$pinia)
        await askForCode(container)

        findButtonByText(container, 'Change email').click()
        await flushPromises()

        expect(resetFlow.step).toBe(resetFlowSteps.idle)
        expect(titleOf(container)).toBe('Boom! Password exploded?')
    })
})
