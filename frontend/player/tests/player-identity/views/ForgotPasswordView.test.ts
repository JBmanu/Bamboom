import { describe, expect, it, vi } from 'vitest'
import { createFakeAuthService } from '../../../src/player-identity'
import { failures } from '../../../src/player-identity/errors/failures.ts'
import { FORGOT_PASSWORD_PATH } from '../../../src/player-identity/routePaths'
import { resetFlowSteps, useResetFlowStore } from '../../../src/player-identity/stores/useResetFlowStore.ts'
import { findFieldByLabel, submitForm, typeInto } from '../../utils/accessPageQueries.ts'
import { mountPlayer } from '../../utils/mountPlayer'

const registeredEmail = 'ada@example.com'

describe('ForgotPasswordView: the email step', () => {
    it('given a valid email, when it is sent, then the flow waits for the code of that email', async () => {
        const authService = createFakeAuthService({ accounts: [{ username: 'ada', email: registeredEmail, password: 'correct-horse-9' }] })
        const { container, app } = await mountPlayer(FORGOT_PASSWORD_PATH, { authService })
        const resetFlow = useResetFlowStore(app.config.globalProperties.$pinia)

        await typeInto(findFieldByLabel(container, 'Email'), registeredEmail)
        await submitForm(container)

        expect(resetFlow.step).toBe(resetFlowSteps.codeRequested)
        expect(resetFlow.email).toBe(registeredEmail)
    })

    it('given an email nobody registered, when it is sent, then the answer is the same', async () => {
        const authService = createFakeAuthService()
        const { container, app } = await mountPlayer(FORGOT_PASSWORD_PATH, { authService })
        const resetFlow = useResetFlowStore(app.config.globalProperties.$pinia)

        await typeInto(findFieldByLabel(container, 'Email'), 'nobody@example.com')
        await submitForm(container)

        expect(resetFlow.step).toBe(resetFlowSteps.codeRequested)
    })

    it('given a refused request, when it is sent, then the banner explains it and the flow does not move', async () => {
        const authService = createFakeAuthService()
        vi.spyOn(authService, 'requestResetCode').mockResolvedValue({ ok: false, failure: failures.tooManyAttempts })
        const { container, app } = await mountPlayer(FORGOT_PASSWORD_PATH, { authService })
        const resetFlow = useResetFlowStore(app.config.globalProperties.$pinia)

        await typeInto(findFieldByLabel(container, 'Email'), registeredEmail)
        await submitForm(container)

        expect(container.querySelector('[role="alert"]')).not.toBeNull()
        expect(resetFlow.step).toBe(resetFlowSteps.idle)
    })
})
