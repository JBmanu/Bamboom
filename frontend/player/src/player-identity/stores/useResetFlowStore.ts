import { defineStore } from 'pinia'
import { ref } from 'vue'

export const resetFlowSteps = { idle: 'idle', codeRequested: 'codeRequested', codeConfirmed: 'codeConfirmed' } as const
export type ResetFlowStep = (typeof resetFlowSteps)[keyof typeof resetFlowSteps]

export const RESET_FLOW_STORE_ID = 'resetFlow'

/**
 * How long the screen makes the person wait before asking for another code. The server enforces its own wait
 * (in the fake adapter: `resetCodeResendWaitMs`); this one only decides what the screen shows, and the two must agree.
 */
export const RESET_CODE_RESEND_WAIT_MS = 60 * 1000

/**
 * Where the person is in the password reset, as the screen needs to know it. Only in memory: a reload starts the flow again,
 * and the server, which remembers the real reset, stays the only authority on whether a code or a password is accepted.
 */
export const useResetFlowStore = defineStore(RESET_FLOW_STORE_ID, () => {
    const step = ref<ResetFlowStep>(resetFlowSteps.idle)
    /** The email the code was asked for, as the person typed it. */
    const email = ref('')
    /** When another code may be asked for, in milliseconds since 1970; 0 when no code is waiting. */
    const resendAllowedAt = ref(0)

    /** The server accepted a request for a code, the first one or a new one: a new request replaces the previous one. */
    function markCodeRequested(requestedEmail: string, requestedAt = Date.now()) {
        step.value = resetFlowSteps.codeRequested
        email.value = requestedEmail
        resendAllowedAt.value = requestedAt + RESET_CODE_RESEND_WAIT_MS
    }

    function markCodeConfirmed() {
        // Only a code that was requested can be confirmed: any other call is a screen out of order, and it must not unlock the next step.
        if (step.value !== resetFlowSteps.codeRequested) return
        step.value = resetFlowSteps.codeConfirmed
    }

    /** Back to the start: the person leaves the flow, changes the email, or has finished. */
    function clearFlow() {
        step.value = resetFlowSteps.idle
        email.value = ''
        resendAllowedAt.value = 0
    }

    return { step, email, resendAllowedAt, markCodeRequested, markCodeConfirmed, clearFlow }
})
