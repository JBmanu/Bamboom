import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useResendCountdown } from '../../../src/player-identity/forms/useResendCountdown'

const SEC_60 = 60
const WAIT_MS = SEC_60 * 1000

/** Runs the composable in its own scope, as a component would, and gives a way to dispose it. */
function startCountdown(allowedAt: number) {
    const resendAllowedAt = ref(allowedAt)
    const scope = effectScope()
    const countdown = scope.run(() => useResendCountdown(resendAllowedAt))!
    return { resendAllowedAt, countdown, stop: () => scope.stop() }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('useResendCountdown', () => {
    it('given a wait that has just started, when it is read, then it shows the whole wait and no resend', () => {
        const { countdown, stop } = startCountdown(Date.now() + WAIT_MS)

        expect(countdown.secondsLeft.value).toBe(SEC_60)
        expect(countdown.canResend.value).toBe(false)
        stop()
    })

    it('given a running wait, when time passes, then the seconds go down', () => {
        const { countdown, stop } = startCountdown(Date.now() + WAIT_MS)

        vi.advanceTimersByTime(10 * 1000)

        expect(countdown.secondsLeft.value).toBe(50)
        stop()
    })

    it('given a running wait, when it ends, then the resend is allowed and the seconds stay at zero', () => {
        const { countdown, stop } = startCountdown(Date.now() + WAIT_MS)

        vi.advanceTimersByTime(WAIT_MS)
        expect(countdown.canResend.value).toBe(true)

        vi.advanceTimersByTime(5 * 1000)
        expect(countdown.secondsLeft.value).toBe(0)
        stop()
    })

    it('given a deadline already passed, when it is read, then the resend is allowed from the start', () => {
        const { countdown, stop } = startCountdown(Date.now() - 1)

        expect(countdown.canResend.value).toBe(true)
        stop()
    })

    it('given a finished wait, when a new deadline is set, then it counts the whole new wait from now', async () => {
        const { resendAllowedAt, countdown, stop } = startCountdown(Date.now() + WAIT_MS)
        vi.advanceTimersByTime(WAIT_MS + 400) // between two ticks: the last tick is older than the new request

        resendAllowedAt.value = Date.now() + WAIT_MS
        await nextTick()

        expect(countdown.secondsLeft.value).toBe(SEC_60)
        expect(countdown.canResend.value).toBe(false)
        stop()
    })

    it('given a stopped scope, when time passes, then it no longer ticks', () => {
        const { countdown, stop } = startCountdown(Date.now() + WAIT_MS)
        stop()

        vi.advanceTimersByTime(30 * 1000)

        expect(countdown.secondsLeft.value).toBe(SEC_60)
    })
})
