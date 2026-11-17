import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDemoAuthService, DEMO_ACCOUNT, DEMO_LATENCY_MS } from '../../../src/player-identity/api/demoAuthService.ts'
import { succeed } from '../../../src/player-identity/errors/result.ts'

describe('createDemoAuthService', () => {
    afterEach(() => vi.useRealTimers())

    it('lets the demo account log in', async () => {
        vi.useFakeTimers()
        const service = createDemoAuthService()
        const answer = service.logIn({ email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password })
        await vi.advanceTimersByTimeAsync(DEMO_LATENCY_MS)

        expect(await answer).toEqual(succeed({ username: DEMO_ACCOUNT.username, email: DEMO_ACCOUNT.email }))
    })

    it('answers only after a delay, so the loading states can be seen', async () => {
        vi.useFakeTimers()
        const service = createDemoAuthService()
        let hasAnswered = false

        // `then` raises the flag the moment the answer arrives: the test can look at it while the clock is stopped.
        const answer = service.fetchCurrentPlayer().then((result) => {
            hasAnswered = true
            return result
        })
        await vi.advanceTimersByTimeAsync(DEMO_LATENCY_MS - 1)
        expect(hasAnswered).toBe(false)
        await vi.advanceTimersByTimeAsync(1)

        expect(hasAnswered).toBe(true)
        expect(await answer).toEqual(succeed(undefined))
    })
})
