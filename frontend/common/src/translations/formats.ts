import type { Language } from './languageConstants'

// Intl localises the output, so every language shares the same option sets.
const dateTime = {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' }
} as const

const number = {
    decimal: { style: 'decimal', maximumFractionDigits: 2 },
    percent: { style: 'percent' }
} as const

// Record<Language, …> makes adding a language a compile error until its formats exist.
export const datetimeFormats: Record<Language, typeof dateTime> = { en: dateTime, it: dateTime }
export const numberFormats: Record<Language, typeof number> = { en: number, it: number }
