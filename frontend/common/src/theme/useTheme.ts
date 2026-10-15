import { type BasicColorSchema, useColorMode, useStorage } from '@vueuse/core'
import { Preference, preferences, PREFERENCES, THEME_STORAGE_KEY, themes } from './themeConstants'

function isPreference(value: string): value is Preference {
    return (PREFERENCES as readonly string[]).includes(value)
}

export function useTheme() {
    const storageRef = useStorage<BasicColorSchema>(THEME_STORAGE_KEY, preferences.auto, undefined, {
        serializer: {
            read: (raw) => (isPreference(raw) ? raw : preferences.auto),
            write: (value) => value
        }
    })

    const { store, state } = useColorMode({ storageRef, modes: themes })
    return { preference: store, resolved: state }
}
