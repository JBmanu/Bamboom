import { describe, expect, expectTypeOf, it } from 'vitest'
import { fail, type Result, succeed } from '../../../src/player-identity/errors/result.ts'

describe('Result', () => {
    it('carries the value of a success', () => {
        expect(succeed('Ada')).toEqual({ ok: true, value: 'Ada' })
    })

    it('carries the failure of a failure', () => {
        expect(fail('no network')).toEqual({ ok: false, failure: 'no network' })
    })

    it('narrows to the value or to the failure after checking ok', () => {
        const result: Result<number, string> = succeed(1)

        if (result.ok) expectTypeOf(result.value).toBeNumber()
        else expectTypeOf(result.failure).toBeString()
    })
})
