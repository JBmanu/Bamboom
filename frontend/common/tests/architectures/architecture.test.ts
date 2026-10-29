// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { cruise, type IConfiguration } from 'dependency-cruiser'
import { afterAll, describe, expect, it } from 'vitest'
import { ACCEPTED, FLAGGED, type Graph, sourceOf } from './architectureCases.ts'

const FRONTEND_ROOT = resolve(import.meta.dirname, '../../..')
const { forbidden, options } = createRequire(import.meta.url)('../../../.dependency-cruiser.cjs') as IConfiguration
const SOURCE_FOLDERS = ['common/src', 'player/src', 'admin/src']

/** Runs the shared rules on the source folders that exist under `baseDir`. */
async function analyze(baseDir: string) {
    const folders = SOURCE_FOLDERS.filter((folder) => existsSync(join(baseDir, folder)))
    const { output } = await cruise(folders, { ...options, ruleSet: { forbidden }, validate: true, baseDir })
    if (typeof output === 'string') throw new Error('Expected the object output of dependency-cruiser')
    return output
}

const brokenRules = (output: Awaited<ReturnType<typeof analyze>>) =>
    [...new Set(output.summary.violations.map((violation) => violation.rule.name))].sort()

describe('the real frontend', () => {
    it('respects every architecture rule', async () => {
        expect((await analyze(FRONTEND_ROOT)).summary.violations).toEqual([])
    })

    // A tool that silently misses files would pass everything: prove it reads TypeScript and Vue.
    it('is really read, TypeScript and Vue files included', async () => {
        const { modules } = await analyze(FRONTEND_ROOT)
        const picture = modules.find((module) => module.source === 'common/src/components/VPicture.vue')

        expect(picture?.dependencies.map((dependency) => dependency.resolved)).toContain('common/src/images/picture.ts')
    })
})

/** Without this, a typo in a fixture path would make every "accept" case pass without checking anything. */
function assertFixtureIsResolvable(output: Awaited<ReturnType<typeof analyze>>) {
    const unresolved = output.modules.flatMap((module) =>
        module.dependencies.filter((dependency) => dependency.couldNotResolve && dependency.module.startsWith('.'))
    )
    if (unresolved.length > 0) throw new Error(`Fixture imports do not resolve: ${unresolved.map((d) => d.module).join(', ')}`)
}

describe('the rules', () => {
    const roots: string[] = []
    afterAll(() => roots.forEach((root) => rmSync(root, { recursive: true, force: true })))

    /** Writes the throwaway project and returns the rules it breaks: paths are relative to its root, like the real one. */
    async function rulesBrokenBy(graph: Graph) {
        const root = realpathSync(mkdtempSync(join(tmpdir(), 'arch-')))
        roots.push(root)
        for (const [file, imports] of Object.entries(graph)) {
            mkdirSync(dirname(join(root, file)), { recursive: true })
            writeFileSync(join(root, file), sourceOf(file, imports))
        }
        const output = await analyze(root)
        assertFixtureIsResolvable(output)
        return brokenRules(output)
    }

    it.each(ACCEPTED)('accept $name', async ({ graph }) => {
        expect(await rulesBrokenBy(graph)).toEqual([])
    })

    it.each(FLAGGED)('flag $name', async ({ graph, broken }) => {
        expect(await rulesBrokenBy(graph)).toEqual([...broken].sort())
    })
})
