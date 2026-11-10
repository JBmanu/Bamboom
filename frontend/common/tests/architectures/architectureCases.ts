import { posix } from 'node:path'

const RULE = {
    CIRCULAR: 'no-circular',
    BUILD_TOOLING: 'browser-entry-reaches-build-tooling',
    NODE_DEPS: 'browser-entry-reaches-node-or-build-deps',
    COMMON_ON_APPS: 'common-must-not-depend-on-apps',
    APPS_INDEPENDENT: 'apps-must-be-independent',
    COMMON_PRIVATE: 'apps-use-common-public-api-only',
    PRODUCTION_ON_DEV: 'production-code-must-not-import-dev',
    MODULES_VIA_INDEX: 'modules-use-each-other-through-index-only',
    FRAMEWORK_FREE_LAYERS: 'identity-layers-must-not-use-frameworks'
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

// with the other fixture files
const APP_ROUTER = 'player/src/app/router.ts'
const IDENTITY_INDEX = 'player/src/player-identity/index.ts'
const IDENTITY_ROUTES = 'player/src/player-identity/routes.ts'
const IDENTITY_NESTED_INDEX = 'player/src/player-identity/views/index.ts'
const IDENTITY_SCHEMAS = 'player/src/player-identity/schemas/formSchemas.ts'
const IDENTITY_ERRORS = 'player/src/player-identity/errors/result.ts'
const IDENTITY_API = 'player/src/player-identity/api/authService.ts'
const IDENTITY_STORE = 'player/src/player-identity/stores/useSessionStore.ts'
const SHARED_ERRORS = 'player/src/shared/errors.ts'

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
    { name: 'the dev gallery importing the player', graph: { [PLAYER_DEV]: [PLAYER_OTHER], [PLAYER_OTHER]: [] } },
    {
        name: 'a module using another through its index',
        graph: { [APP_ROUTER]: [IDENTITY_INDEX], [IDENTITY_INDEX]: [IDENTITY_ROUTES], [IDENTITY_ROUTES]: [] }
    },
    { name: 'a module using the shared code', graph: { [IDENTITY_ROUTES]: [SHARED_ERRORS], [SHARED_ERRORS]: [] } },
    { name: 'a schema using zod', graph: { [IDENTITY_SCHEMAS]: ['zod'] } },
    { name: 'the session store using pinia and vue', graph: { [IDENTITY_STORE]: ['pinia', 'vue'] } }
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
    },
    {
        name: 'a module reaching into the internals of another',
        graph: { [APP_ROUTER]: [IDENTITY_ROUTES], [IDENTITY_ROUTES]: [] },
        broken: [RULE.MODULES_VIA_INDEX]
    },
    {
        // ESLint's no-restricted-imports does not look at import(): lazy routes would slip through.
        name: 'a module lazily reaching into the internals of another',
        graph: { [APP_ROUTER]: [lazy(IDENTITY_ROUTES)], [IDENTITY_ROUTES]: [] },
        broken: [RULE.MODULES_VIA_INDEX]
    },
    {
        name: 'a nested index file used as if it were the door of a module',
        graph: { [APP_ROUTER]: [IDENTITY_NESTED_INDEX], [IDENTITY_NESTED_INDEX]: [] },
        broken: [RULE.MODULES_VIA_INDEX]
    },
    {
        name: 'a schema using vue',
        graph: { [IDENTITY_SCHEMAS]: ['vue'] },
        broken: [RULE.FRAMEWORK_FREE_LAYERS]
    },
    {
        name: 'the failures using pinia',
        graph: { [IDENTITY_ERRORS]: ['pinia'] },
        broken: [RULE.FRAMEWORK_FREE_LAYERS]
    },
    {
        name: 'the AuthService port using vue-router',
        graph: { [IDENTITY_API]: ['vue-router'] },
        broken: [RULE.FRAMEWORK_FREE_LAYERS]
    },
    {
        // ESLint's no-restricted-imports does not look at import(): the dependency would slip through.
        name: 'an adapter lazily importing vue',
        graph: { [IDENTITY_API]: [lazy('vue')] },
        broken: [RULE.FRAMEWORK_FREE_LAYERS]
    }
]
