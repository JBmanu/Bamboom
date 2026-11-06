import { describe, expect, it } from 'vitest'
import { createFailure, failureCatalog, type FailureCode } from '../../../src/player-identity/errors/failures'
import { identityTranslators } from '../../utils/identityTranslators.ts'

const failureCodes = Object.keys(failureCatalog) as FailureCode[]

describe('failure catalog', () => {
    it.each(failureCodes)('%s has a message in every language', (code) => {
        const { messageKey } = createFailure(code)

        identityTranslators.forEach(({ language, translator }) => {
            expect(translator.te(messageKey), `${language} has no message for ${messageKey}`).toBe(true)
            expect(translator.t(messageKey), `${language} has an empty message for ${messageKey}`).toMatch(/\S/)
        })
    })

    it('gives every failure the code it is stored under', () => {
        failureCodes.forEach((code) => expect(createFailure(code).code).toBe(code))
    })

    it('never shares a message key between two failures', () => {
        const messageKeys = failureCodes.map((code) => createFailure(code).messageKey)

        expect(new Set(messageKeys).size).toBe(messageKeys.length)
    })

    it('sends the person to the login only when the session expired', () => {
        const redirecting = failureCodes.filter((code) => createFailure(code).treatment === 'redirectToLogin')

        expect(redirecting).toEqual(['session-expired'])
    })

    it('describes invalid credentials as a domain failure shown in a banner', () => {
        expect(createFailure('invalid-credentials')).toEqual({
            code: 'invalid-credentials',
            kind: 'domain',
            messageKey: 'playerIdentity.failures.invalidCredentials',
            treatment: 'banner'
        })
    })
})
