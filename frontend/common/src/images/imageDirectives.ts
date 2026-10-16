const DEFAULT_DIRECTIVES = {
    w: '480;960;1440',
    format: 'avif;webp'
} as const

export function createImageDirectives(resourceRoot: URL) {
    const root = decodeURIComponent(resourceRoot.pathname)

    return (url: URL): URLSearchParams => (decodeURIComponent(url.pathname).startsWith(root) ? new URLSearchParams(DEFAULT_DIRECTIVES) : new URLSearchParams())
}
