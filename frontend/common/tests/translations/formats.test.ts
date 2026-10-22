import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { datetimeFormats, numberFormats } from '../../src/translations/formats.ts'
import { type Language, languages } from '../../src/translations/language/languageConstants.ts'

type DateFormat = keyof typeof datetimeFormats.en

const translator = (language: Language) =>
    createI18n({
        legacy: false,
        locale: language,
        datetimeFormats,
        numberFormats
    }).global

// A Thursday. The time zone is fixed in every call so the result does not depend on the machine.
const date = new Date(Date.UTC(2026, 0, 15, 14, 30))

const formatDate = (language: Language, key: DateFormat) => translator(language).d(date, { key, timeZone: 'UTC' })

describe('date formats', () => {
    it.each([
        [languages.it, 'short', '15 gen 2026'],
        [languages.it, 'long', 'giovedì 15 gennaio 2026'],
        [languages.it, 'time', '14:30'],
        [languages.en, 'short', 'Jan 15, 2026'],
        [languages.en, 'long', 'Thursday, January 15, 2026']
    ] as const)('formats %s %s as "%s"', (language, key, expected) => {
        expect(formatDate(language, key)).toBe(expected)
    })

    // Newer ICU versions put a narrow no-break space before PM, so match any space.
    it('shows English time on a 12-hour clock', () => {
        expect(formatDate(languages.en, 'time')).toMatch(/^02:30\sPM$/)
    })
})

describe('number formats', () => {
    it.each([
        [languages.it, '1.234.567,89'],
        [languages.en, '1,234,567.89']
    ])('groups and rounds decimals in %s', (language, expected) => {
        expect(translator(language).n(1234567.891, 'decimal')).toBe(expected)
    })

    // Italian groups thousands only from five digits (a CLDR rule), so 1234.5 is "1234,5", not a bug.
    it('does not group four-digit numbers in Italian, unlike English', () => {
        expect(translator(languages.it).n(1234.5, 'decimal')).toBe('1234,5')
        expect(translator(languages.en).n(1234.5, 'decimal')).toBe('1,234.5')
    })

    it.each([languages.it, languages.en])('formats a ratio as a percentage in %s', (language) => {
        expect(translator(language).n(0.5, 'percent')).toBe('50%')
    })
})
