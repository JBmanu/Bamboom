import { describe, expect, it } from 'vitest'
import { fail } from '../../../src/player-identity/errors/result'
import { type AuthService } from '../../../src/player-identity'
import { failures } from '../../../src/player-identity/errors/failures.ts'
import { createUnavailableAuthService } from '../../../src/player-identity/api/unavailableAuthService.ts'

const portMethods = {
    fetchCurrentPlayer: true,
    logIn: true,
    register: true,
    logOut: true,
    requestResetCode: true,
    confirmResetCode: true,
    setNewPassword: true,
    completeGoogleProfile: true
} satisfies Record<keyof AuthService, true>
const portMethodNames = Object.keys(portMethods) as (keyof AuthService)[]

describe('createUnavailableAuthService', () => {
    it.each(portMethodNames)('answers %s with a server failure', async (methodName) => {
        const service = createUnavailableAuthService()
        const callMethod = service[methodName] as (input: never) => Promise<unknown>

        expect(await callMethod({} as never)).toEqual(fail(failures.serverFailure))
    })
})
