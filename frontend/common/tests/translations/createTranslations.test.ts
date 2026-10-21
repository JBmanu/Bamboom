import { describe, expect, it } from 'vitest'
import { resolveLanguage } from '../../src/translations/createTranslations.ts'
import { languages } from '../../src/translations/languageConstants.ts'
import { browserTags } from './browserTags.ts'

describe('resolveLanguage', () => {
    it('prefers a supported stored language over the browser', () => {
        expect(resolveLanguage(languages.it, [browserTags.american])).toBe(languages.it)
    })

    it.each([null, undefined, '', 'fr'])('ignores the stored value %j and asks the browser', (stored) => {
        expect(resolveLanguage(stored, [browserTags.italian])).toBe(languages.it)
    })

    it('compares the stored value exactly, since the app wrote it', () => {
        expect(resolveLanguage('IT', [browserTags.american])).toBe(languages.en)
    })

    it.each([
        ['it', languages.it],
        [browserTags.italian, languages.it],
        ['IT-it', languages.it],
        [browserTags.british, languages.en],
        ['EN-us', languages.en]
    ])('maps the browser language %s to %s', (tag, expected) => {
        expect(resolveLanguage(null, [tag])).toBe(expected)
    })

    it('takes the first supported browser language, in order of preference', () => {
        expect(resolveLanguage(null, [browserTags.french, browserTags.italian, browserTags.american])).toBe(languages.it)
    })

    it.each([[[]], [[browserTags.french, browserTags.german]], [['ita']]])('falls back to English when nothing matches (%j)', (browser) => {
        expect(resolveLanguage(null, browser)).toBe(languages.en)
    })
})
