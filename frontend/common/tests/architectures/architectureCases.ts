import { posix } from 'node:path'

const RULE = {
    CIRCULAR: 'no-circular',
    BUILD_TOOLING: 'browser-entry-reaches-build-tooling',
    NODE_DEPS: 'browser-entry-reaches-node-or-build-deps',
    COMMON_ON_APPS: 'common-must-not-depend-on-apps',
    APPS_INDEPENDENT: 'apps-must-be-independent',
    COMMON_PRIVATE: 'apps-use-common-public-api-only',
    PRODUCTION_ON_DEV: 'production-code-must-not-import-dev'
} as const

const BARREL = 'common/src/index.ts'
const SAFE = 'common/src/safe.ts'
const HELPER = 'common/src/helper.ts'
const PIPELINE = 'common/src/vite/imagePipeline.ts'
const COMMON_BUTTON = 'common/src/button.ts'
const PLAYER = 'player/src/main.ts'
const PLAYER_OTHER = 'player/src/other.ts'
const PLAYER_DEV = 'player/src/dev/main.ts'
const ADMIN = 'admin/src/main.ts'

/** A fixture project: each file lists what it imports (a project file, a package name, or a lazy import of one). */
type Import = string | { lazy: string }
export type Graph = Record<string, Import[]>
type Accepted = { name: string; graph: Graph }
type Flagged = Accepted & { broken: string[] }

const lazy = (target: string): Import => ({ lazy: target })

const isProjectFile = (target: string) => /^(common|player|admin)\/src\/.+\.ts$/.test(target)

/** Writes `target` the way `file` would: relative for project files, as is for packages. */
function specifierFrom(file: string, target: string) {
    if (!isProjectFile(target)) return target
    const path = posix.relative(posix.dirname(file), target)
    return path.startsWith('.') ? path : `./${path}`
}

/** The TypeScript source of one fixture file, written from the list of things it imports. */
export function sourceOf(file: string, imports: Import[]) {
    if (imports.length === 0) return 'export const value = 1'
    return imports
        .map((dependency) =>
            typeof dependency === 'string'
                ? `import '${specifierFrom(file, dependency)}'`
                : `export const load = () => import('${specifierFrom(file, dependency.lazy)}')`
        )
        .join('\n')
}

export const ACCEPTED: Accepted[] = [
    { name: 'a browser-safe barrel', graph: { [BARREL]: [SAFE], [SAFE]: [] } },
    { name: 'common using a third-party package', graph: { [BARREL]: ['vue'] } },
    { name: 'an app using its own modules', graph: { [PLAYER]: [PLAYER_OTHER], [PLAYER_OTHER]: [] } },
    { name: 'an app using the common public API', graph: { [PLAYER]: ['@bamboom/common'] } },
    { name: 'the dev gallery importing the player', graph: { [PLAYER_DEV]: [PLAYER_OTHER], [PLAYER_OTHER]: [] } }
]

export const FLAGGED: Flagged[] = [
    {
        name: 'build tooling reached through a helper',
        graph: { [BARREL]: [HELPER], [HELPER]: [PIPELINE], [PIPELINE]: ['node:fs'] },
        broken: [RULE.BUILD_TOOLING, RULE.NODE_DEPS]
    },
    {
        name: 'a circular dependency',
        graph: { 'common/src/a.ts': ['common/src/b.ts'], 'common/src/b.ts': ['common/src/a.ts'] },
        broken: [RULE.CIRCULAR]
    },
    { name: 'common importing an app', graph: { [BARREL]: [PLAYER], [PLAYER]: [] }, broken: [RULE.COMMON_ON_APPS] },
    { name: 'player importing admin', graph: { [PLAYER]: [ADMIN], [ADMIN]: [] }, broken: [RULE.APPS_INDEPENDENT] },
    { name: 'admin importing player', graph: { [ADMIN]: [PLAYER], [PLAYER]: [] }, broken: [RULE.APPS_INDEPENDENT] },
    {
        // ESLint's no-restricted-imports does not look at import(): lazy routes would slip through.
        name: 'player lazily importing admin',
        graph: { [PLAYER]: [lazy(ADMIN)], [ADMIN]: [] },
        broken: [RULE.APPS_INDEPENDENT]
    },
    {
        name: 'an app reaching common internals',
        graph: { [PLAYER]: [COMMON_BUTTON], [COMMON_BUTTON]: [] },
        broken: [RULE.COMMON_PRIVATE]
    },
    {
        name: 'an app importing a common subpath',
        graph: { [PLAYER]: ['@bamboom/common/vite'] },
        broken: [RULE.COMMON_PRIVATE]
    },
    {
        name: 'the icons plugin reached through a helper',
        graph: { [BARREL]: [HELPER], [HELPER]: ['unplugin-icons/vite'] },
        broken: [RULE.NODE_DEPS]
    },
    {
        name: 'the player importing the dev gallery',
        graph: { [PLAYER]: [PLAYER_DEV], [PLAYER_DEV]: [] },
        broken: [RULE.PRODUCTION_ON_DEV]
    }
]
