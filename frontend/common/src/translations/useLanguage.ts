import { inject, type InjectionKey, type Ref } from 'vue'
import type { Language } from './languageConstants'

export interface LanguageControl {
    language: Readonly<Ref<Language>>
    setLanguage: (language: Language) => Promise<void>
}

/** The current language and the way to change it. Needs the `createTranslations()` plugin installed on the app. */
export const LANGUAGE_CONTROL: InjectionKey<LanguageControl> = Symbol('language-control')

/** What components get from {@link useLanguage}. `language` is read-only: change it only through `setLanguage`. */
export function useLanguage(): LanguageControl {
    const languageControl = inject(LANGUAGE_CONTROL)
    if (!languageControl) throw new Error('useLanguage() needs the translations plugin: app.use(await createTranslations(...))')
    return languageControl
}
