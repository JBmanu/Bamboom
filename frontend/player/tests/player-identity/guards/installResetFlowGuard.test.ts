import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { installResetFlowGuard } from '../../../src/player-identity/guards/installResetFlowGuard'
import { FORGOT_PASSWORD_PATH } from '../../../src/player-identity/routePaths'
import { type ResetFlowStep, resetFlowSteps } from '../../../src/player-identity/stores/useResetFlowStore'

const pageWithRequiredStepPath = '/page-with-a-required-step'
const emptyPage = { render: () => null }

/** A router with one page that requires the confirmed code, and the page the guard sends people back to. */
function createGuardedRouter(resetFlow: { step: ResetFlowStep }): Router {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: FORGOT_PASSWORD_PATH, component: emptyPage },
            { path: pageWithRequiredStepPath, component: emptyPage, meta: { requiredResetStep: resetFlowSteps.codeConfirmed } }
        ]
    })
    installResetFlowGuard(router, { resetFlow })
    return router
}

describe('installResetFlowGuard', () => {
    it('when the flow is not at the required step, opening the page lands on forgot-password', async () => {
        const router = createGuardedRouter({ step: resetFlowSteps.idle })
        await router.push(pageWithRequiredStepPath)

        expect(router.currentRoute.value.path).toBe(FORGOT_PASSWORD_PATH)
    })

    it('when the flow is at the required step, the page opens', async () => {
        const router = createGuardedRouter({ step: resetFlowSteps.codeConfirmed })
        await router.push(pageWithRequiredStepPath)

        expect(router.currentRoute.value.path).toBe(pageWithRequiredStepPath)
    })

    it('when the step changes after the guard was installed, the next navigation uses the new step', async () => {
        const resetFlow: { step: ResetFlowStep } = { step: resetFlowSteps.idle }
        const router = createGuardedRouter(resetFlow)
        await router.push(pageWithRequiredStepPath)
        expect(router.currentRoute.value.path).toBe(FORGOT_PASSWORD_PATH)

        resetFlow.step = resetFlowSteps.codeConfirmed
        await router.push(pageWithRequiredStepPath)
        expect(router.currentRoute.value.path).toBe(pageWithRequiredStepPath)
    })
})
