export const LANGUAGE_STORAGE_KEY = 'bamboom-language'

export type Language = (typeof languages)[keyof typeof languages]

export const languages = { en: 'en', it: 'it' } as const
export const FALLBACK_LANGUAGE: Language = languages.en
export const LANGUAGES = Object.values(languages)
