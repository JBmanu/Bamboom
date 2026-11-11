import { SUPPORTED_LANGUAGES } from '@bamboom/common'
import { describe, expect, it } from 'vitest'
import { identityTranslators } from './identityTranslators'

describe('identityTranslators', () => {
    it('has a vocabulary for every supported language', () => {
        // Also keeps the tests that loop over the translators honest: with none found, they would pass without checking anything.
        expect(identityTranslators.map(({ language }) => language).sort()).toEqual([...SUPPORTED_LANGUAGES].sort())
    })
})
