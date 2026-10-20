// @vitest-environment node
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { type IConfiguration, cruise } from 'dependency-cruiser'
import { afterAll, describe, expect, it } from 'vitest'

const FRONTEND_ROOT = resolve(import.meta.dirname, '../../../..')
const { forbidden, options } = createRequire(import.meta.url)('../../../../.dependency-cruiser.cjs') as IConfiguration

async function analyze(baseDir: string, folders: string[]) {
    const { output } = await cruise(folders, { ...options, ruleSet: { forbidden }, validate: true, baseDir })
    if (typeof output === 'string') throw new Error('Expected the object output of dependency-cruiser')
    return output
}

const brokenRules = (output: Awaited<ReturnType<typeof analyze>>) => [...new Set(output.summary.violations.map((violation) => violation.rule.name))]

describe('architecture of the real frontend', () => {
    it('has no violations', async () => {
        const output = await analyze(FRONTEND_ROOT, ['common/src', 'player/src', 'admin/src'])

        expect(output.summary.violations).toEqual([])
    })

    it('really reads TypeScript and Vue files', async () => {
        const { modules } = await analyze(FRONTEND_ROOT, ['common/src'])
        const picture = modules.find((module) => module.source === 'common/src/images/VPicture.vue')

        expect(picture?.dependencies.map((dependency) => dependency.resolved)).toContain('common/src/images/picture.ts')
    })
})

describe('architecture rules catch violations', () => {
    const roots: string[] = []
    afterAll(() => roots.forEach((root) => rmSync(root, { recursive: true, force: true })))

    async function rulesBrokenBy(files: Record<string, string>) {
        const root = realpathSync(mkdtempSync(join(tmpdir(), 'arch-')))
        roots.push(root)
        for (const [path, content] of Object.entries(files)) {
            mkdirSync(dirname(join(root, path)), { recursive: true })
            writeFileSync(join(root, path), content)
        }
        return brokenRules(await analyze(root, ['common/src']))
    }

    it('accepts a browser-safe barrel', async () => {
        expect(
            await rulesBrokenBy({
                'common/src/index.ts': "export * from './safe.ts'",
                'common/src/safe.ts': 'export const safe = 1'
            })
        ).toEqual([])
    })

    it('flags build tooling reached through an intermediate file', async () => {
        const broken = await rulesBrokenBy({
            'common/src/index.ts': "export * from './helper.ts'",
            'common/src/helper.ts': "export * from './images/imagePipeline.ts'",
            'common/src/images/imagePipeline.ts': "import { realpathSync } from 'node:fs'\nexport const pipeline = realpathSync"
        })

        expect(broken).toContain('browser-entry-reaches-build-tooling')
        expect(broken).toContain('browser-entry-reaches-node-or-build-deps')
    })

    it('flags a circular dependency', async () => {
        const broken = await rulesBrokenBy({
            'common/src/index.ts': "export * from './a.ts'",
            'common/src/a.ts': "import { b } from './b.ts'\nexport const a = b",
            'common/src/b.ts': "import { a } from './a.ts'\nexport const b = a"
        })

        expect(broken).toContain('no-circular')
    })
})
