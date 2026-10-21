// @vitest-environment node
import { resolve } from 'node:path'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'
import { RASTER_EXTENSIONS } from '../../images/rasterFormats.ts'

const PACKAGES = ['common', 'player', 'admin'] as const
type Pkg = (typeof PACKAGES)[number]

const eslint = new ESLint({ cwd: resolve(process.cwd(), '..') })

/** Lints `import '<specifier>'` as if written in `pkg`; the probe file never exists, ESLint only needs its path. */
async function violations(pkg: Pkg, specifier: string) {
    const [result] = await eslint.lintText(`import '${specifier}'`, { filePath: `${pkg}/src/boundary-probe.ts` })
    return result.messages.filter((m) => m.ruleId === 'no-restricted-imports')
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
