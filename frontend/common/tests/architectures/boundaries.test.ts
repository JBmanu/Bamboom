// @vitest-environment node
import { posix, resolve } from 'node:path'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'
import { RASTER_EXTENSIONS } from '../../src/images/rasterFormats.ts'

const PACKAGES = ['common', 'player', 'admin'] as const
type Pkg = (typeof PACKAGES)[number]

const eslint = new ESLint({ cwd: resolve(process.cwd(), '..') })

/** Lints `import '<specifier>'` as if written in `<pkg>/src/<folder>`; the probe file never exists, ESLint only needs its path. */
async function violations(pkg: Pkg, specifier: string, folder = '') {
    const filePath = posix.join(pkg, 'src', folder, 'boundary-probe.ts')
    const [result] = await eslint.lintText(`import '${specifier}'`, { filePath })
    return result.messages.filter((m) => m.ruleId === 'no-restricted-imports')
}

/** Lints `code` as if written in `<pkg>/src/<folder>`; keeps only the `no-restricted-syntax` findings. */
async function forbiddenSyntax(pkg: Pkg, code: string, folder = '') {
    const filePath = posix.join(pkg, 'src', folder, 'syntax-probe.ts')
    const [result] = await eslint.lintText(code, { filePath })
    return result.messages.filter((m) => m.ruleId === 'no-restricted-syntax')
}

describe('frontend import boundaries', () => {
    it.each([
        ['common -> player (relative)', 'common', '../../player/src/main'],
        ['common -> player (package name)', 'common', 'player'],
        ['common -> player (package subpath)', 'common', 'player/src/main'],
        ['player -> admin', 'player', '../../admin/src/main'],
        ['admin -> player', 'admin', '../../player/src/main'],
        ['player -> common internals', 'player', '../../common/src/components/VButton.vue']
    ] as const)('forbids %s', async (_label, pkg, specifier) => {
        expect(await violations(pkg, specifier)).toHaveLength(1)
    })

    it.each([
        ['player -> @bamboom/common', 'player', '@bamboom/common'],
        ['admin -> @bamboom/common', 'admin', '@bamboom/common'],
        ['player -> its own module', 'player', './main'],
        ['admin -> its own module', 'admin', './main'],
        ['common -> vue', 'common', 'vue'],
        ['common -> its own module', 'common', './components']
    ] as const)('allows %s', async (_label, pkg, specifier) => {
        expect(await violations(pkg, specifier)).toHaveLength(0)
    })
})

describe('image imports', () => {
    it.each(PACKAGES)('%s: forbids a raster import without a query', async (pkg) => {
        expect(await violations(pkg, './hero.png')).toHaveLength(1)
    })

    it.each(RASTER_EXTENSIONS.flatMap((ext) => [ext, ext.toUpperCase()]))('forbids .%s without a query', async (ext) => {
        expect(await violations('player', `./hero.${ext}`)).toHaveLength(1)
    })

    it.each(['?as=picture', '?w=100&format=webp'])('allows a raster import with %s', async (query) => {
        expect(await violations('player', `./hero.png${query}`)).toHaveLength(0)
    })
})

describe('module boundaries inside the player', () => {
    it.each([
        ['the app -> internals of a module', '../player-identity/routes', 'app'],
        ['the app -> nested internals of a module', '../player-identity/views/LoginView.vue', 'app'],
        ['the entry point -> internals of a module', './player-identity/routes', '']
    ] as const)('forbids %s', async (_label, specifier, folder) => {
        expect(await violations('player', specifier, folder)).toHaveLength(1)
    })

    it.each([
        ['the app -> a module through its index', '../player-identity', 'app'],
        ['a module -> its own files', './routes', 'player-identity']
    ] as const)('allows %s', async (_label, specifier, folder) => {
        expect(await violations('player', specifier, folder)).toHaveLength(0)
    })
})

describe('no thrown errors in player-identity', () => {
    it.each([
        ['a throw', "throw new Error('boom')", 'player-identity'],
        ['a throw inside a function', "function stop() { throw new Error('boom') }", 'player-identity'],
        ['a throw in a nested folder', "throw new Error('boom')", 'player-identity/api'],
        ['Promise.reject', "Promise.reject(new Error('boom'))", 'player-identity']
    ] as const)('forbids %s', async (_label, code, folder) => {
        expect(await forbiddenSyntax('player', code, folder)).toHaveLength(1)
    })

    it.each([
        ['a throw in the app shell', 'player', "throw new Error('boom')", 'app'],
        ['a throw in common', 'common', "throw new Error('boom')", ''],
        ['a throw in admin', 'admin', "throw new Error('boom')", ''],
        ['try and catch inside the module', 'player', 'try { run() } catch { /* ignored */ }', 'player-identity'],
        ['Promise.resolve inside the module', 'player', 'Promise.resolve(1)', 'player-identity']
    ] as const)('allows %s', async (_label, pkg, code, folder) => {
        expect(await forbiddenSyntax(pkg, code, folder)).toHaveLength(0)
    })
})
