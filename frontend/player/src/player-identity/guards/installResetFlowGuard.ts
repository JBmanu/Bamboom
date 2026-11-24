import type { Router } from 'vue-router'
import type { ResetFlowStep } from '../stores/useResetFlowStore'
import { chooseResetFlowRedirect } from './chooseResetFlowRedirect'

type ResetFlowGuardOptions = {
    resetFlow: { readonly step: ResetFlowStep }
}

/**
 * Applies `chooseResetFlowRedirect` to every navigation. The step is read at each navigation,
 * not once here: it changes as the person moves through the reset.
 */
export function installResetFlowGuard(router: Router, { resetFlow }: ResetFlowGuardOptions): void {
    router.beforeEach((destination) => chooseResetFlowRedirect({ requiredStep: destination.meta.requiredResetStep, currentStep: resetFlow.step }))
}
