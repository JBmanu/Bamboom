import { type BasicColorSchema, useColorMode, useStorage } from '@vueuse/core'

export const THEME_STORAGE_KEY = 'bamboom-theme'

export const themes = { light: 'light', dark: 'dark' } as const
export const preferences = { auto: 'auto', ...themes } as const
export type Theme = (typeof themes)[keyof typeof themes]
export type Preference = (typeof preferences)[keyof typeof preferences]

const PREFERENCES = Object.values(preferences)

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
