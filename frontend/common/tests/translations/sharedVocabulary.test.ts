import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from 'vue'
import { createTranslations } from '../../src/translations/createTranslations.ts'
import { type Language, LANGUAGE_STORAGE_KEY, languages, SUPPORTED_LANGUAGES } from '../../src/translations/languageConstants.ts'
import english from '../../src/translations/vocabulary/en.ts'
import italian from '../../src/translations/vocabulary/it.ts'

type Messages = { [key: string]: string | Messages }

// Each language is named in its own language, so a visitor can find theirs whatever language the page is in.
const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', it: 'Italiano' }

// Record<Language, …> turns a missing file into a compile error as soon as a language is added.
const messagesByLanguage: Record<Language, Messages> = { en: english, it: italian }

function keyPathsOf(messages: Messages, parentPath = ''): string[] {
    return Object.entries(messages).flatMap(([key, value]) => {
        const path = parentPath ? `${parentPath}.${key}` : key
        return typeof value === 'string' ? [path] : keyPathsOf(value, path)
    })
}

function textsOf(messages: Messages): string[] {
    return Object.values(messages).flatMap((value) => (typeof value === 'string' ? [value] : textsOf(value)))
}

describe('the shared vocabulary', () => {
    it.each(SUPPORTED_LANGUAGES)('has the same keys in %s as in English', (language) => {
        expect(keyPathsOf(messagesByLanguage[language]).sort()).toEqual(keyPathsOf(messagesByLanguage[languages.en]).sort())
    })

    it.each(SUPPORTED_LANGUAGES)('has no empty message in %s', (language) => {
        expect(textsOf(messagesByLanguage[language]).filter((text) => text.trim() === '')).toEqual([])
    })

    it.each(SUPPORTED_LANGUAGES)('names every language in its own language in %s', (language) => {
        expect(messagesByLanguage[language].language).toMatchObject({ names: LANGUAGE_NAMES })
    })
})

describe('the common namespace', () => {
    beforeEach(() => localStorage.clear())

    it.each([
        [languages.en, 'Theme', 'Language'],
        [languages.it, 'Tema', 'Lingua']
    ])('is translated in %s by createTranslations alone', async (language, themeLabel, languageLabel) => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
        const app = createApp({})
        app.use(await createTranslations())

        expect(app.config.globalProperties.$t('common.theme.label')).toBe(themeLabel)
        expect(app.config.globalProperties.$t('common.language.label')).toBe(languageLabel)
    })
})
