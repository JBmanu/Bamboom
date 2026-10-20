// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { type IConfiguration, cruise } from 'dependency-cruiser'
import { afterAll, describe, expect, it } from 'vitest'

const FRONTEND_ROOT = resolve(import.meta.dirname, '../../../..')
const { forbidden, options } = createRequire(import.meta.url)('../../../../.dependency-cruiser.cjs') as IConfiguration
const SOURCE_FOLDERS = ['common/src', 'player/src', 'admin/src']

/** Runs the shared rules on the source folders that exist under `baseDir`. */
async function analyze(baseDir: string) {
    const folders = SOURCE_FOLDERS.filter((folder) => existsSync(join(baseDir, folder)))
    const { output } = await cruise(folders, { ...options, ruleSet: { forbidden }, validate: true, baseDir })
    if (typeof output === 'string') throw new Error('Expected the object output of dependency-cruiser')
    return output
}

const brokenRules = (output: Awaited<ReturnType<typeof analyze>>) => [...new Set(output.summary.violations.map((violation) => violation.rule.name))].sort()

describe('the real frontend', () => {
    it('respects every architecture rule', async () => {
        expect((await analyze(FRONTEND_ROOT)).summary.violations).toEqual([])
    })

    // A tool that silently misses files would pass everything: prove it reads TypeScript and Vue.
    it('is really read, TypeScript and Vue files included', async () => {
        const { modules } = await analyze(FRONTEND_ROOT)
        const picture = modules.find((module) => module.source === 'common/src/images/VPicture.vue')

        expect(picture?.dependencies.map((dependency) => dependency.resolved)).toContain('common/src/images/picture.ts')
    })
})

describe('the rules', () => {
    const roots: string[] = []
    afterAll(() => roots.forEach((root) => rmSync(root, { recursive: true, force: true })))

    /** Writes a throwaway project: the rules use paths relative to its root, like in the real one. */
    async function rulesBrokenBy(files: Project) {
        const root = realpathSync(mkdtempSync(join(tmpdir(), 'arch-')))
        roots.push(root)
        for (const [path, content] of Object.entries(files)) {
            mkdirSync(dirname(join(root, path)), { recursive: true })
            writeFileSync(join(root, path), content)
        }
        return brokenRules(await analyze(root))
    }

    type Project = Record<string, string>
    type Accepted = { name: string; files: Project }
    type Flagged = Accepted & { broken: string[] }

    const MODULE = 'export const value = 1'
    const imports = (specifier: string) => `import '${specifier}'`

    const ACCEPTED: Accepted[] = [
        { name: 'a browser-safe barrel', files: { 'common/src/index.ts': imports('./safe.ts'), 'common/src/safe.ts': MODULE } },
        { name: 'common using a third-party package', files: { 'common/src/index.ts': imports('vue') } },
        { name: 'an app using its own modules', files: { 'player/src/main.ts': imports('./other.ts'), 'player/src/other.ts': MODULE } },
        { name: 'an app using the common public API', files: { 'player/src/main.ts': imports('@bamboom/common') } }
    ]

    it.each(ACCEPTED)('accept $name', async ({ files }) => {
        expect(await rulesBrokenBy(files)).toEqual([])
    })

    const FLAGGED: Flagged[] = [
        {
            name: 'build tooling reached through a helper',
            files: {
                'common/src/index.ts': imports('./helper.ts'),
                'common/src/helper.ts': imports('./images/imagePipeline.ts'),
                'common/src/images/imagePipeline.ts': imports('node:fs')
            },
            broken: ['browser-entry-reaches-build-tooling', 'browser-entry-reaches-node-or-build-deps']
        },
        {
            name: 'a circular dependency',
            files: { 'common/src/a.ts': imports('./b.ts'), 'common/src/b.ts': imports('./a.ts') },
            broken: ['no-circular']
        },
        {
            name: 'common importing an app',
            files: { 'common/src/index.ts': imports('../../player/src/main.ts'), 'player/src/main.ts': MODULE },
            broken: ['common-must-not-depend-on-apps']
        },
        {
            name: 'player importing admin',
            files: { 'player/src/main.ts': imports('../../admin/src/main.ts'), 'admin/src/main.ts': MODULE },
            broken: ['apps-must-be-independent']
        },
        {
            // ESLint's no-restricted-imports does not look at import(): lazy routes would slip through.
            name: 'player lazily importing admin',
            files: { 'player/src/main.ts': "export const load = () => import('../../admin/src/main.ts')", 'admin/src/main.ts': MODULE },
            broken: ['apps-must-be-independent']
        },
        {
            name: 'an app reaching common internals',
            files: { 'player/src/main.ts': imports('../../common/src/button.ts'), 'common/src/button.ts': MODULE },
            broken: ['apps-use-common-public-api-only']
        },
        {
            name: 'an app importing a common subpath',
            files: { 'player/src/main.ts': imports('@bamboom/common/vite') },
            broken: ['apps-use-common-public-api-only']
        }
    ]

    it.each(FLAGGED)('flag $name', async ({ files, broken }) => {
        expect(await rulesBrokenBy(files)).toEqual(broken.sort())
    })
})
