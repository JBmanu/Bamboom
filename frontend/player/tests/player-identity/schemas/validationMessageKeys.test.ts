import { describe, expect, it } from 'vitest'
import { validationMessageKeys } from '../../../src/player-identity/schemas/validationMessageKeys.ts'
import { identityTranslators } from '../../utils/identityTranslators'

describe('validationMessageKeys', () => {
    it.each(Object.entries(validationMessageKeys))('%s has a message in every language', (_name, messageKey) => {
        identityTranslators.forEach(({ language, translator }) => {
            expect(translator.te(messageKey), `${language} has no message for ${messageKey}`).toBe(true)
            expect(translator.t(messageKey), `${language} has an empty message for ${messageKey}`).toMatch(/\S/)
        })
    })
})
