import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { type Composer, useI18n } from 'vue-i18n'
import { chooseStartingLanguage, createTranslations } from '../../src/translations/createTranslations.ts'
import { LANGUAGE_STORAGE_KEY, languages } from '../../src/translations/language/languageConstants.ts'
import { useLanguage } from '../../src/translations/language/useLanguage.ts'
import { browserTags } from './browserTags.ts'

type TranslationsPlugin = Awaited<ReturnType<typeof createTranslations>>

const IDENTITY_FOLDER = './player-identity/vocabulary'
const LOBBY_FOLDER = './lobby-match/vocabulary'

/** A vocabulary file as `import.meta.glob` hands it over: a loader that resolves to the module. */
const fakeVocabularyFile = (messages: object) => vi.fn(async () => ({ default: messages }))

const fakeBrowserLanguages = (...tags: string[]) => vi.spyOn(navigator, 'languages', 'get').mockReturnValue(tags)

/** Renders what `read` returns inside a component that has the plugin, as a real screen would. */
const renderTextFrom = (plugin: TranslationsPlugin, read: (i18n: Composer) => string) => mountProbe(() => useI18n(), plugin, read).wrapper.text()

function createFakeVocabularyFiles() {
    const files = {
        identityEn: fakeVocabularyFile({ login: { title: 'Sign in' }, onlyEnglish: 'Only in English' }),
        identityIt: fakeVocabularyFile({ login: { title: 'Accedi' } }),
        lobbyEn: fakeVocabularyFile({ join: { title: 'Join' } }),
        lobbyIt: fakeVocabularyFile({ join: { title: 'Entra' } })
    }
    const loaders = {
        [`${IDENTITY_FOLDER}/en.ts`]: files.identityEn,
        [`${IDENTITY_FOLDER}/it.ts`]: files.identityIt,
        [`${LOBBY_FOLDER}/en.ts`]: files.lobbyEn,
        [`${LOBBY_FOLDER}/it.ts`]: files.lobbyIt
    }
    return { files, loaders }
}

/** Mounts a tiny component that calls `useInSetup` while it sets up, like any real component would. */
function mountProbe<Result>(useInSetup: () => Result, plugin?: TranslationsPlugin, textOf: (result: Result) => string = () => '') {
    let result!: Result
    const Probe = defineComponent({
        setup() {
            result = useInSetup()
            return () => h('p', textOf(result))
        }
    })
    const wrapper = mount(Probe, { global: { plugins: plugin ? [plugin] : [] } })
    return { result, wrapper }
}

describe('chooseStartingLanguage', () => {
    it('prefers a supported stored language over the browser', () => {
        expect(chooseStartingLanguage(languages.it, [browserTags.american])).toBe(languages.it)
    })

    it.each([null, undefined, '', 'fr'])('ignores the stored value %j and asks the browser', (stored) => {
        expect(chooseStartingLanguage(stored, [browserTags.italian])).toBe(languages.it)
    })

    it('compares the stored value exactly, since the app wrote it', () => {
        expect(chooseStartingLanguage('IT', [browserTags.american])).toBe(languages.en)
    })

    // The odd casing and the bare "it" are deliberate: they are the forms the browser may report.
    it.each([
        ['it', languages.it],
        [browserTags.italian, languages.it],
        ['IT-it', languages.it],
        [browserTags.british, languages.en],
        ['EN-us', languages.en]
    ])('maps the browser language %s to %s', (tag, expected) => {
        expect(chooseStartingLanguage(null, [tag])).toBe(expected)
    })

    it('takes the first supported browser language, in order of preference', () => {
        expect(chooseStartingLanguage(null, [browserTags.french, browserTags.italian, browserTags.american])).toBe(languages.it)
    })

    it.each([[[]], [[browserTags.french, browserTags.german]], [['ita']]])('falls back to English when nothing matches (%j)', (browser) => {
        expect(chooseStartingLanguage(null, browser)).toBe(languages.en)
    })
})

describe('createTranslations', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.lang = ''
        fakeBrowserLanguages(browserTags.american)
    })
    afterEach(() => vi.restoreAllMocks())

    describe('at startup', () => {
        it('starts in the stored language', async () => {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, languages.it)
            const translations = await createTranslations(createFakeVocabularyFiles().loaders)

            expect(translations.language.value).toBe(languages.it)
            expect(renderTextFrom(translations, ({ t }) => t('playerIdentity.login.title'))).toBe('Accedi')
        })

        it('follows the browser when nothing is stored', async () => {
            fakeBrowserLanguages(browserTags.italian)

            expect((await createTranslations(createFakeVocabularyFiles().loaders)).language.value).toBe(languages.it)
        })

        it('ignores a stored language the app does not support', async () => {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr')
            fakeBrowserLanguages(browserTags.italian)

            expect((await createTranslations(createFakeVocabularyFiles().loaders)).language.value).toBe(languages.it)
        })

        it('tells the page which language it is in', async () => {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, languages.it)
            await createTranslations(createFakeVocabularyFiles().loaders)

            expect(document.documentElement.lang).toBe(languages.it)
        })

        it('does not store a language the user has not chosen', async () => {
            await createTranslations(createFakeVocabularyFiles().loaders)

            expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull()
        })

        it.each([
            ['has no default export', {}],
            ['exports a text instead of an object', { default: 'hello' }],
            ['exports nothing as default', { default: null }]
        ])('names the vocabulary file that %s', async (_problem, wrongModule) => {
            const wrongFile = `${IDENTITY_FOLDER}/en.ts`

            await expect(createTranslations({ [wrongFile]: async () => wrongModule })).rejects.toThrow(wrongFile)
        })
    })

    describe('loading', () => {
        it('loads only English when English is chosen', async () => {
            const { files, loaders } = createFakeVocabularyFiles()
            await createTranslations(loaders)

            expect(files.identityEn).toHaveBeenCalledOnce()
            expect(files.identityIt).not.toHaveBeenCalled()
        })

        it('loads the chosen language and the English fallback', async () => {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, languages.it)
            const { files, loaders } = createFakeVocabularyFiles()
            await createTranslations(loaders)

            expect(files.identityIt).toHaveBeenCalledOnce()
            expect(files.identityEn).toHaveBeenCalledOnce()
        })

        it('falls back to English for a key the chosen language lacks', async () => {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, languages.it)
            const translations = await createTranslations(createFakeVocabularyFiles().loaders)

            expect(renderTextFrom(translations, ({ t }) => t('playerIdentity.onlyEnglish'))).toBe('Only in English')
        })

        it('names each vocabulary after its folder, in camelCase', async () => {
            const translations = await createTranslations(createFakeVocabularyFiles().loaders)

            expect(renderTextFrom(translations, ({ t }) => `${t('playerIdentity.login.title')} / ${t('lobbyMatch.join.title')}`)).toBe(
                'Sign in / Join'
            )
        })

        it('ignores files not named after a supported language', async () => {
            const french = fakeVocabularyFile({ join: { title: 'Rejoindre' } })

            await expect(
                createTranslations({
                    ...createFakeVocabularyFiles().loaders,
                    [`${LOBBY_FOLDER}/fr.ts`]: french
                })
            ).resolves.toBeDefined()
            expect(french).not.toHaveBeenCalled()
        })

        it('refuses two folders that would share a name, naming both files', async () => {
            const first = `${IDENTITY_FOLDER}/en.ts`
            const second = `../other/${IDENTITY_FOLDER.slice(2)}/en.ts`
            const error = await createTranslations({
                [first]: fakeVocabularyFile({}),
                [second]: fakeVocabularyFile({})
            }).catch((failure: Error) => failure)

            expect(error).toBeInstanceOf(Error)
            expect((error as Error).message).toContain(first)
            expect((error as Error).message).toContain(second)
        })
    })

    describe('changing language', () => {
        it('loads the new language and translates with it', async () => {
            const translations = await createTranslations(createFakeVocabularyFiles().loaders)
            await translations.setLanguage(languages.it)

            expect(translations.language.value).toBe(languages.it)
            expect(renderTextFrom(translations, ({ t }) => t('playerIdentity.login.title'))).toBe('Accedi')
        })

        it('remembers the choice and tells the page', async () => {
            await (await createTranslations(createFakeVocabularyFiles().loaders)).setLanguage(languages.it)

            expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(languages.it)
            expect(document.documentElement.lang).toBe(languages.it)
        })

        it('loads each language only once', async () => {
            const { files, loaders } = createFakeVocabularyFiles()
            const translations = await createTranslations(loaders)
            await translations.setLanguage(languages.it)
            await translations.setLanguage(languages.en)
            await translations.setLanguage(languages.it)

            expect(files.identityIt).toHaveBeenCalledOnce()
            expect(files.identityEn).toHaveBeenCalledOnce()
        })

        it('formats dates and numbers in the new language', async () => {
            const translations = await createTranslations(createFakeVocabularyFiles().loaders)
            await translations.setLanguage(languages.it)
            const date = new Date(Date.UTC(2026, 0, 15, 14, 30))

            expect(
                renderTextFrom(
                    translations,
                    ({ d, n }) =>
                        `${d(date, {
                            key: 'short',
                            timeZone: 'UTC'
                        })} | ${n(1234567.891, 'decimal')}`
                )
            ).toBe('15 gen 2026 | 1.234.567,89')
        })
    })

    it('gives components the language and its setter through useLanguage', async () => {
        const translations = await createTranslations(createFakeVocabularyFiles().loaders)

        const { result: languageControl } = mountProbe(useLanguage, translations)

        expect(languageControl.language.value).toBe(languages.en)
        expect(languageControl.setLanguage).toBe(translations.setLanguage)
    })

    it('explains how to fix a component that asks for the language without the plugin', () => {
        expect(() => mountProbe(useLanguage)).toThrow(/createTranslations/)
    })

    it('keeps the current language when loading fails and lets the user try again', async () => {
        const { files, loaders } = createFakeVocabularyFiles()
        const translations = await createTranslations(loaders)
        files.identityIt.mockRejectedValueOnce(new Error('offline'))

        await expect(translations.setLanguage(languages.it)).rejects.toThrow('offline')
        expect(translations.language.value).toBe(languages.en)

        await translations.setLanguage(languages.it)
        expect(translations.language.value).toBe(languages.it)
    })
})
