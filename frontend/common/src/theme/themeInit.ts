import type { Plugin } from 'vite'
import { THEME_STORAGE_KEY } from './themeConstants.ts'

export function inlineScript(fn: (...args: never[]) => void, ...args: unknown[]): string {
    const serializedArgs = args.map((arg) => JSON.stringify(arg).replace(/</g, '\\u003c')).join(',')
    return `(${fn.toString()})(${serializedArgs})`
}

export function themeInit(storageKey: string): void {
    try {
        const stored = localStorage.getItem(storageKey)
        const dark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        document.documentElement.classList.toggle('dark', dark)
    } catch {}
}

export function themeInitPlugin(): Plugin {
    return {
        name: 'bamboom-theme-init',
        transformIndexHtml: () => [
            {
                tag: 'script',
                children: inlineScript(themeInit, THEME_STORAGE_KEY),
                injectTo: 'head'
            }
        ]
    }
}
