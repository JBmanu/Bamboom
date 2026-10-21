import { useStorage } from '@vueuse/core'
import { type App, readonly, ref } from 'vue'
import { createI18n } from 'vue-i18n'
import { datetimeFormats, numberFormats } from './formats'
import { FALLBACK_LANGUAGE, isSupportedLanguage, LANGUAGE_STORAGE_KEY, type Language } from './languageConstants'
import { LANGUAGE_CONTROL } from './useLanguage'
import { groupVocabularyFilesByLanguage, type VocabularyFile, type VocabularyLoaders } from './vocabularies'

/** "it-IT" and "IT-it" both mean Italian: only the part before the first dash picks the language. */
const baseLanguageOf = (tag: string) => tag.toLowerCase().split('-')[0]

/** Stored choice first, then the browser's preferences in order, then English. */
export function chooseStartingLanguage(storedLanguage: string | null | undefined, browserLanguageTags: readonly string[]): Language {
    if (isSupportedLanguage(storedLanguage)) return storedLanguage
    return browserLanguageTags.map(baseLanguageOf).find(isSupportedLanguage) ?? FALLBACK_LANGUAGE
}

/** Runs `action` once per key: callers asking at once or later share its result, and a failure can be retried. */
function oncePerKey<Key>(action: (key: Key) => Promise<void>) {
    const attempts = new Map<Key, Promise<void>>()
    return (key: Key) => {
        const runningAttempt = attempts.get(key)
        if (runningAttempt) return runningAttempt
        const newAttempt = action(key).catch((error: unknown) => {
            attempts.delete(key)
            throw error
        })
        attempts.set(key, newAttempt)
        return newAttempt
    }
}

/** Reads every file of one language and puts each one's messages under its namespace. */
async function loadMessagesByNamespace(filesByNamespace: Map<string, VocabularyFile> = new Map()) {
    const messagesByNamespace: Record<string, unknown> = {}
    for (const [namespace, file] of filesByNamespace) {
        messagesByNamespace[namespace] = ((await file.loadFile()) as { default: unknown }).default
    }
    return messagesByNamespace
}

/**
 * Picks the starting language, loads its vocabulary files (and English as fallback) and returns a Vue plugin.
 * Await it before mounting the app, or the first screen would show raw keys.
 *
 * @param moduleLoaders - the app's `import.meta.glob('./<module>/vocabulary/*.ts')`; `common`'s own files are added for you.
 * @throws if two folders would get the same namespace in the same language.
 */
export async function createTranslations(moduleLoaders: VocabularyLoaders = {}) {
    const vocabularyFilesByLanguage = groupVocabularyFilesByLanguage(moduleLoaders)
    const storedLanguage = useStorage<string | null>(LANGUAGE_STORAGE_KEY, null, undefined, { listenToStorageChanges: false })
    const currentLanguage = ref(chooseStartingLanguage(storedLanguage.value, navigator.languages))

    const i18n = createI18n({
        legacy: false,
        locale: currentLanguage.value,
        fallbackLocale: FALLBACK_LANGUAGE,
        missingWarn: false,
        fallbackWarn: false,
        datetimeFormats,
        numberFormats
    })

    const loadLanguage = oncePerKey(async (language: Language) => {
        i18n.global.setLocaleMessage(language, await loadMessagesByNamespace(vocabularyFilesByLanguage.get(language)))
    })

    /** The language must be loaded first, or the screen would show raw keys. */
    function applyLanguage(language: Language) {
        i18n.global.locale.value = language
        currentLanguage.value = language
        document.documentElement.lang = language
    }

    async function setLanguage(language: Language) {
        await loadLanguage(language)
        applyLanguage(language)
        storedLanguage.value = language
    }

    await Promise.all([loadLanguage(FALLBACK_LANGUAGE), loadLanguage(currentLanguage.value)])
    applyLanguage(currentLanguage.value)

    const languageControl = { language: readonly(currentLanguage), setLanguage }
    return {
        ...languageControl,
        install(app: App) {
            app.use(i18n)
            app.provide(LANGUAGE_CONTROL, languageControl)
        }
    }
}
