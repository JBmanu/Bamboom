import { createI18n } from 'vue-i18n'

// Every vocabulary file of the module, whatever the languages are: a new language needs no change here.
const vocabularyFiles = import.meta.glob<{ default: object }>('../../src/player-identity/vocabulary/*.ts', { eager: true })

/**
 * One vue-i18n translator per language of player-identity.
 * The vocabularies are precompiled by the translations plugin, so they are read through vue-i18n, not as plain strings.
 */
export const identityTranslators = Object.entries(vocabularyFiles).map(([path, { default: vocabulary }]) => {
    const language = /([^/]+)\.ts$/.exec(path)![1]
    const translator = createI18n({ legacy: false, locale: language, messages: { [language]: { playerIdentity: vocabulary } } }).global
    return { language, translator }
})
