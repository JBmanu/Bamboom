// `satisfies`, not a typed constant: the Vite i18n plugin only accepts an object literal as default export.
import type en from './en'

export default {
    theme: {
        label: 'Tema',
        system: 'Sistema',
        light: 'Chiaro',
        dark: 'Scuro'
    },
    language: {
        label: 'Lingua',
        names: { en: 'English', it: 'Italiano' }
    },
    spinner: { loading: 'Caricamento…' }
} satisfies typeof en
