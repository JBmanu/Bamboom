import { FALLBACK_LANGUAGE, LANGUAGES, type Language } from './languageConstants'

function isLanguage(value: unknown): value is Language {
    return (LANGUAGES as readonly unknown[]).includes(value)
}

/** "it-IT" and "IT-it" both mean Italian: only the part before the first dash picks the language. */
const primarySubtag = (tag: string) => tag.toLowerCase().split('-')[0]

/** Stored choice first, then the browser's preferences in order, then English. */
export function resolveLanguage(stored: string | null | undefined, browserLanguages: readonly string[]): Language {
    if (isLanguage(stored)) return stored
    return browserLanguages.map(primarySubtag).find(isLanguage) ?? FALLBACK_LANGUAGE
}
