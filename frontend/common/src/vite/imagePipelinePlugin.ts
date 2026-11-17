import { realpathSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

import type { Plugin } from 'vite'
import { imagetools } from 'vite-imagetools'

const DEFAULT_DIRECTIVES = {
    w: '480;960;1440',
    format: 'avif;webp'
} as const

/**
 * The path of a URL without its Windows drive letter. The drive arrives in two shapes: a file URL keeps it in the path
 * ('/C:/Users/…'), while imagetools reads a module id such as 'C:/Users/…' as a URL whose scheme is 'c:'.
 */
function pathWithoutDrive(url: URL): string {
    return decodeURIComponent(url.pathname).replace(/^\/[A-Za-z]:(?=\/)/, '')
}

export function createImageDirectives(resourceRoot: URL) {
    const root = pathWithoutDrive(resourceRoot)
    return (url: URL): URLSearchParams => (pathWithoutDrive(url).startsWith(root) ? new URLSearchParams(DEFAULT_DIRECTIVES) : new URLSearchParams())
}

export function imagePipelinePlugin(resourceRoot: URL): Plugin {
    const realRoot = pathToFileURL(`${realpathSync(fileURLToPath(resourceRoot))}/`)
    return imagetools({ defaultDirectives: createImageDirectives(realRoot) })
}
