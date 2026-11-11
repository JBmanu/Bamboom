import { describe, expect, it } from 'vitest'
import { failures, type FailureName } from '../../../src/player-identity/errors/failures'
import { identityTranslators } from '../../utils/identityTranslators.ts'

const failureNames = Object.keys(failures) as FailureName[]

describe('failures', () => {
    it.each(failureNames)('%s has a message in every language', (name) => {
        const { messageKey } = failures[name]

        identityTranslators.forEach(({ language, translator }) => {
            expect(translator.te(messageKey), `${language} has no message for ${messageKey}`).toBe(true)
            expect(translator.t(messageKey), `${language} has an empty message for ${messageKey}`).toMatch(/\S/)
        })
    })

    it('gives every failure its own code, written in kebab-case', () => {
        const codes = failureNames.map((name) => failures[name].code)

        expect(new Set(codes).size).toBe(codes.length)
        codes.forEach((code) => expect(code).toMatch(/^[a-z]+(-[a-z]+)*$/))
    })

    it('sends the person to the login only when the session expired', () => {
        const redirecting = failureNames.filter((name) => failures[name].treatment === 'redirectToLogin')

        expect(redirecting).toEqual(['sessionExpired'])
    })

    it('describes invalid credentials as a domain failure shown in a banner', () => {
        expect(failures.invalidCredentials).toEqual({
            code: 'invalid-credentials',
            kind: 'domain',
            messageKey: 'playerIdentity.failures.invalidCredentials',
            treatment: 'banner'
        })
    })
})
