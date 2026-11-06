import { describe, expect, it } from 'vitest'
import { createFailure, failureCatalog, type FailureCode } from '../../../src/player-identity/errors/failures'
import { createI18n } from 'vue-i18n'
import { SUPPORTED_LANGUAGES } from '@bamboom/common'

const failureCodes = Object.keys(failureCatalog) as FailureCode[]

/** Follows "playerIdentity.failures.x" inside a vocabulary: the folder name (first segment) is not part of the object. */
const vocabularyFiles = import.meta.glob<{ default: object }>('../../../src/player-identity/vocabulary/*.ts', { eager: true })

const translators = Object.entries(vocabularyFiles).map(([path, { default: vocabulary }]) => {
    const language = /([^/]+)\.ts$/.exec(path)![1]
    // The vocabularies are precompiled by the translations plugin: they are read through vue-i18n, not as plain strings.
    const translator = createI18n({ legacy: false, locale: language, messages: { [language]: { playerIdentity: vocabulary } } }).global
    return { language, translator }
})

describe('failure catalog', () => {
    it('has a vocabulary for every supported language', () => {
        expect(translators.map(({ language }) => language).sort()).toEqual([...SUPPORTED_LANGUAGES].sort())
    })

    it.each(failureCodes)('%s has a message in every language', (code) => {
        const { messageKey } = createFailure(code)

        translators.forEach(({ language, translator }) => {
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
