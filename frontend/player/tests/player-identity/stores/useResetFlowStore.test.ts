import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RESET_CODE_RESEND_WAIT_MS, resetFlowSteps, useResetFlowStore } from '../../../src/player-identity/stores/useResetFlowStore.ts'

describe('useResetFlowStore', () => {
    const ADA_EMAIL = 'ada@example.com'
    const GRACE_EMAIL = 'grace@example.com'
    const REQUESTED_AT = 1_000_000

    beforeEach(() => {
        setActivePinia(createPinia()) // a fresh store for every test
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('when nothing was requested, the flow is idle with no email and no wait', () => {
        const resetFlow = useResetFlowStore()

        expect(resetFlow.step).toBe(resetFlowSteps.idle)
        expect(resetFlow.email).toBe('')
        expect(resetFlow.resendAllowedAt).toBe(0)
    })

    it('when a code is requested, the flow waits for the code and remembers the email', () => {
        const resetFlow = useResetFlowStore()

        resetFlow.markCodeRequested(ADA_EMAIL, REQUESTED_AT)

        expect(resetFlow.step).toBe(resetFlowSteps.codeRequested)
        expect(resetFlow.email).toBe(ADA_EMAIL)
    })

    it('when a code is requested, another one can be asked for only after the resend wait', () => {
        const resetFlow = useResetFlowStore()

        resetFlow.markCodeRequested(ADA_EMAIL, REQUESTED_AT)

        expect(resetFlow.resendAllowedAt).toBe(REQUESTED_AT + RESET_CODE_RESEND_WAIT_MS)
    })

    it('when the request time is not given, the wait counts from now', () => {
        vi.useFakeTimers()
        vi.setSystemTime(REQUESTED_AT)
        const resetFlow = useResetFlowStore()

        resetFlow.markCodeRequested(ADA_EMAIL)

        expect(resetFlow.resendAllowedAt).toBe(REQUESTED_AT + RESET_CODE_RESEND_WAIT_MS)
    })

    it('when a code is requested again, the wait starts over and the latest email is the one kept', () => {
        const resetFlow = useResetFlowStore()
        resetFlow.markCodeRequested(ADA_EMAIL, REQUESTED_AT)

        resetFlow.markCodeRequested(GRACE_EMAIL, REQUESTED_AT + 5_000)

        expect(resetFlow.step).toBe(resetFlowSteps.codeRequested)
        expect(resetFlow.email).toBe(GRACE_EMAIL)
        expect(resetFlow.resendAllowedAt).toBe(REQUESTED_AT + 5_000 + RESET_CODE_RESEND_WAIT_MS)
    })

    it('when the requested code is confirmed, the flow moves on to the new password', () => {
        const resetFlow = useResetFlowStore()
        resetFlow.markCodeRequested(ADA_EMAIL, REQUESTED_AT)

        resetFlow.markCodeConfirmed()

        expect(resetFlow.step).toBe(resetFlowSteps.codeConfirmed)
    })

    it('when no code was requested, confirming a code does not move the flow', () => {
        const resetFlow = useResetFlowStore()

        resetFlow.markCodeConfirmed()

        expect(resetFlow.step).toBe(resetFlowSteps.idle)
    })

    it('when a code is requested again after the confirmation, the flow starts over from the code step', () => {
        const resetFlow = useResetFlowStore()
        resetFlow.markCodeRequested(ADA_EMAIL, REQUESTED_AT)
        resetFlow.markCodeConfirmed()

        resetFlow.markCodeRequested(ADA_EMAIL, REQUESTED_AT + 5_000)

        expect(resetFlow.step).toBe(resetFlowSteps.codeRequested)
    })

    it.each([resetFlowSteps.codeRequested, resetFlowSteps.codeConfirmed])('when the flow is cleared at the %s step, it goes back to idle', (step) => {
        const resetFlow = useResetFlowStore()
        resetFlow.markCodeRequested(ADA_EMAIL, REQUESTED_AT)
        if (step === resetFlowSteps.codeConfirmed) resetFlow.markCodeConfirmed()

        resetFlow.clearFlow()

        expect(resetFlow.step).toBe(resetFlowSteps.idle)
        expect(resetFlow.email).toBe('')
        expect(resetFlow.resendAllowedAt).toBe(0)
    })
})
