import { isSupportedLanguage, type Language } from './language/languageConstants.ts'

/** What `import.meta.glob('./<module>/vocabulary/*.ts')` returns: a lazy loader per file. */
export type VocabularyLoaders = Record<string, () => Promise<unknown>>

export type VocabularyFile = { path: string; loadFile: () => Promise<unknown> }

const COMMON_NAMESPACE = 'common'
const COMMON_VOCABULARY_PATH = /^\.\/vocabulary\/([^/.]+)\.[jt]s$/ // ./vocabulary/<language>.ts, next to this file
const MODULE_VOCABULARY_PATH = /([^/]+)\/vocabulary\/([^/.]+)\.[jt]s$/ // <module>/vocabulary/<language>.ts
const kebabToCamelCase = (kebab: string) => kebab.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase())

const commonVocabularyLoaders: VocabularyLoaders = import.meta.glob('./vocabulary/*.ts')

/** Groups the files by language and names each one after its folder, so two modules cannot overwrite each other. */
export function groupVocabularyFilesByLanguage(moduleLoaders: VocabularyLoaders) {
    const filesByLanguage = new Map<Language, Map<string, VocabularyFile>>()

    function addFile(namespace: string, language: string | undefined, file: VocabularyFile) {
        if (!isSupportedLanguage(language)) return
        const filesByNamespace = filesByLanguage.get(language) ?? new Map<string, VocabularyFile>()
        const existingFile = filesByNamespace.get(namespace)
        if (existingFile) throw new Error(`Both "${existingFile.path}" and "${file.path}" would be "${namespace}" in ${language}`)
        filesByLanguage.set(language, filesByNamespace.set(namespace, file))
    }

    for (const [path, loadFile] of Object.entries(commonVocabularyLoaders)) {
        addFile(COMMON_NAMESPACE, COMMON_VOCABULARY_PATH.exec(path)?.[1], { path, loadFile })
    }
    for (const [path, loadFile] of Object.entries(moduleLoaders)) {
        const [, folder, language] = MODULE_VOCABULARY_PATH.exec(path) ?? []
        if (folder) addFile(kebabToCamelCase(folder), language, { path, loadFile })
    }
    return filesByLanguage
}
