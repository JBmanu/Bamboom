import type { ResetFlowStep } from '../stores/useResetFlowStore.ts'
import { FORGOT_PASSWORD_PATH } from '../routePaths.ts'

declare module 'vue-router' {
    interface RouteMeta {
        /** The step the reset flow must be at for the route to open. A route without it has no requirement. */
        requiredResetStep?: ResetFlowStep
    }
}

type ResetFlowRedirectInput = {
    requiredStep: ResetFlowStep | undefined
    currentStep: ResetFlowStep
}

/**
 * Chooses where a navigation must go, or `undefined` to let it through.
 * A page that requires a step opens only when the flow is exactly at that step.
 */
export function chooseResetFlowRedirect({ requiredStep, currentStep }: ResetFlowRedirectInput): string | undefined {
    if (requiredStep !== undefined && requiredStep !== currentStep) return FORGOT_PASSWORD_PATH
    return undefined
}
