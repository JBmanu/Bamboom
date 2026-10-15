export function themeInit(storageKey: string): void {
    try {
        const stored = localStorage.getItem(storageKey)
        const dark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        document.documentElement.classList.toggle('dark', dark)
    } catch {}
}
