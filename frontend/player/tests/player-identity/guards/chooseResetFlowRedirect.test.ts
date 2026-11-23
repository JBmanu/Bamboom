import { describe, expect, it } from 'vitest'
import { type ResetFlowStep, resetFlowSteps } from '../../../src/player-identity/stores/useResetFlowStore.ts'
import { FORGOT_PASSWORD_PATH } from '../../../src/player-identity/routePaths.ts'
import { chooseResetFlowRedirect } from '../../../src/player-identity/guards/chooseResetFlowRedirect.ts'

describe('chooseResetFlowRedirect', () => {
    it.each<[ResetFlowStep | undefined, ResetFlowStep, string | undefined]>([
        [undefined, resetFlowSteps.idle, undefined],
        [undefined, resetFlowSteps.codeRequested, undefined],
        [undefined, resetFlowSteps.codeConfirmed, undefined],
        [resetFlowSteps.codeConfirmed, resetFlowSteps.idle, FORGOT_PASSWORD_PATH],
        [resetFlowSteps.codeConfirmed, resetFlowSteps.codeRequested, FORGOT_PASSWORD_PATH],
        [resetFlowSteps.codeConfirmed, resetFlowSteps.codeConfirmed, undefined]
    ])('when the page requires %s and the flow is at %s, the redirect is %s', (requiredStep, currentStep, expectedRedirect) => {
        expect(chooseResetFlowRedirect({ requiredStep, currentStep })).toBe(expectedRedirect)
    })
})
