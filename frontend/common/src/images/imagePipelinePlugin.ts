import { realpathSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

import type { Plugin } from 'vite'
import { imagetools } from 'vite-imagetools'

const DEFAULT_DIRECTIVES = {
    w: '480;960;1440',
    format: 'avif;webp'
} as const

export function createImageDirectives(resourceRoot: URL) {
    const root = decodeURIComponent(resourceRoot.pathname)

    return (url: URL): URLSearchParams => (decodeURIComponent(url.pathname).startsWith(root) ? new URLSearchParams(DEFAULT_DIRECTIVES) : new URLSearchParams())
}

export function imagePipelinePlugin(resourceRoot: URL): Plugin {
    const realRoot = pathToFileURL(`${realpathSync(fileURLToPath(resourceRoot))}/`)
    return imagetools({ defaultDirectives: createImageDirectives(realRoot) })
}
