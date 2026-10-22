import { inject, type InjectionKey, type Ref } from 'vue'
import type { Language } from './languageConstants.ts'

/** What components get from {@link useLanguage}. `language` is read-only: change it only through `setLanguage`. */
export interface LanguageControl {
    language: Readonly<Ref<Language>>
    setLanguage: (language: Language) => Promise<void>
}

/** Injection key under which `createTranslations()` provides the {@link LanguageControl}. */
export const LANGUAGE_CONTROL: InjectionKey<LanguageControl> = Symbol('language-control')

/** The current language and the way to change it. Needs the `createTranslations()` plugin installed on the app. */
export function useLanguage(): LanguageControl {
    const languageControl = inject(LANGUAGE_CONTROL)
    if (!languageControl) throw new Error('useLanguage() needs the translations plugin: app.use(await createTranslations(...))')
    return languageControl
}
