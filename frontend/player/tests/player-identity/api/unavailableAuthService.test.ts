import { describe, expect, it } from 'vitest'
import { fail } from '../../../src/player-identity/errors/result'
import { failures } from '../../../src/player-identity/errors/failures.ts'
import { createUnavailableAuthService } from '../../../src/player-identity/api/unavailableAuthService.ts'
import { portMethodNames } from './authServiceContract.ts'

describe('createUnavailableAuthService', () => {
    it.each(portMethodNames)('answers %s with a server failure', async (methodName) => {
        const service = createUnavailableAuthService()
        const callMethod = service[methodName] as (input: never) => Promise<unknown>

        expect(await callMethod({} as never)).toEqual(fail(failures.serverFailure))
    })
})
