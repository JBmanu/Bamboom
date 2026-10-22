type Listener = (event: { matches: boolean }) => void

export function mockSystemTheme(initialDark: boolean) {
    let dark = initialDark
    const listeners = new Set<Listener>()

    window.matchMedia = (() => ({
        get matches() {
            return dark
        },
        addEventListener: (_type: string, l: Listener) => listeners.add(l),
        removeEventListener: (_type: string, l: Listener) => listeners.delete(l)
    })) as unknown as typeof window.matchMedia

    return {
        setDark(value: boolean) {
            dark = value
            listeners.forEach((l) => l({ matches: value }))
        }
    }
}
