import type { Language } from './language/languageConstants.ts'

// Intl localises the output, so every language shares the same option sets.
const sharedDateTimeFormats = {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' }
} as const

const sharedNumberFormats = {
    decimal: { style: 'decimal', maximumFractionDigits: 2 },
    percent: { style: 'percent' }
} as const

// Record<Language, …> makes adding a language a compile error until its formats exist.
export const datetimeFormats: Record<Language, typeof sharedDateTimeFormats> = {
    en: sharedDateTimeFormats,
    it: sharedDateTimeFormats
}
export const numberFormats: Record<Language, typeof sharedNumberFormats> = {
    en: sharedNumberFormats,
    it: sharedNumberFormats
}
