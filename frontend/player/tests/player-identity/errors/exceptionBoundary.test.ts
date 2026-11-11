import { describe, expect, it, vi } from 'vitest'
import { awaitAsResult, runAsResult } from '../../../src/player-identity/errors/exceptionBoundary'
import { fail, succeed } from '../../../src/player-identity/errors/result'

const describeAsText = (cause: unknown) => (cause instanceof Error ? cause.message : 'unknown cause')

describe('runAsResult', () => {
    it('turns what the operation returns into a success', () => {
        expect(runAsResult(() => 42, describeAsText)).toEqual(succeed(42))
    })

    it('turns an exception into the failure that the caller describes', () => {
        const result = runAsResult(() => {
            throw new Error('storage is blocked')
        }, describeAsText)

        expect(result).toEqual(fail('storage is blocked'))
    })

    it('hands the original cause to the describer', () => {
        const cause = new Error('boom')
        const describeFailure = vi.fn((thrown: unknown) => String(thrown))

        runAsResult(() => {
            throw cause
        }, describeFailure)

        expect(describeFailure).toHaveBeenCalledWith(cause)
    })

    it('does not call the describer when the operation succeeds', () => {
        const describeFailure = vi.fn((thrown: unknown) => String(thrown))

        runAsResult(() => 'fine', describeFailure)

        expect(describeFailure).not.toHaveBeenCalled()
    })
})

describe('awaitAsResult', () => {
    it('turns the resolved value into a success', async () => {
        await expect(awaitAsResult(() => Promise.resolve(42), describeAsText)).resolves.toEqual(succeed(42))
    })

    it('turns a rejection into a failure, without rejecting itself', async () => {
        await expect(awaitAsResult(() => Promise.reject(new Error('offline')), describeAsText)).resolves.toEqual(fail('offline'))
    })

    it('also catches an exception thrown before the promise exists', async () => {
        const operation = (): Promise<number> => {
            throw new Error('thrown too early')
        }

        await expect(awaitAsResult(operation, describeAsText)).resolves.toEqual(fail('thrown too early'))
    })
})
