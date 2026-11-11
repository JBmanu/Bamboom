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

/** Most cases only say who imports whom: a project file that is imported but not described becomes an empty file. */
function withEmptyFilesForImportedOnes(graph: Graph): Graph {
    const imported = Object.values(graph)
        .flat()
        .map((dependency) => (typeof dependency === 'string' ? dependency : dependency.lazy))
        .filter(isProjectFile)
    return { ...Object.fromEntries(imported.map((file) => [file, []])), ...graph }
}

const accept = (name: string, graph: Graph): Accepted => ({ name, graph: withEmptyFilesForImportedOnes(graph) })
const flag = (name: string, broken: string[], graph: Graph): Flagged => ({ name, graph: withEmptyFilesForImportedOnes(graph), broken })

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
    accept('a browser-safe barrel', { [BARREL]: [SAFE] }),
    accept('common using a third-party package', { [BARREL]: ['vue'] }),
    accept('an app using its own modules', { [PLAYER]: [PLAYER_OTHER] }),
    accept('an app using the common public API', { [PLAYER]: ['@bamboom/common'] }),
    accept('the dev gallery importing the player', { [PLAYER_DEV]: [PLAYER_OTHER] }),
    accept('a module using another through its index', { [APP_ROUTER]: [IDENTITY_INDEX], [IDENTITY_INDEX]: [IDENTITY_ROUTES] }),
    accept('a module using the shared code', { [IDENTITY_ROUTES]: [SHARED_ERRORS] }),
    accept('a schema using zod', { [IDENTITY_SCHEMAS]: ['zod'] }),
    accept('the session store using pinia and vue', { [IDENTITY_STORE]: ['pinia', 'vue'] })
]

// A dynamic import() is still a dependency: the cases with `lazy` prove it is caught like a static one.
export const FLAGGED: Flagged[] = [
    flag('build tooling reached through a helper', [RULE.BUILD_TOOLING, RULE.NODE_DEPS], {
        [BARREL]: [HELPER],
        [HELPER]: [PIPELINE],
        [PIPELINE]: ['node:fs']
    }),
    flag('the icons plugin reached through a helper', [RULE.NODE_DEPS], { [BARREL]: [HELPER], [HELPER]: ['unplugin-icons/vite'] }),
    flag('a circular dependency', [RULE.CIRCULAR], { 'common/src/a.ts': ['common/src/b.ts'], 'common/src/b.ts': ['common/src/a.ts'] }),
    flag('common importing an app', [RULE.COMMON_ON_APPS], { [BARREL]: [PLAYER] }),
    flag('player importing admin', [RULE.APPS_INDEPENDENT], { [PLAYER]: [ADMIN] }),
    flag('admin importing player', [RULE.APPS_INDEPENDENT], { [ADMIN]: [PLAYER] }),
    flag('player lazily importing admin', [RULE.APPS_INDEPENDENT], { [PLAYER]: [lazy(ADMIN)] }),
    flag('an app reaching common internals', [RULE.COMMON_PRIVATE], { [PLAYER]: [COMMON_BUTTON] }),
    flag('an app importing a common subpath', [RULE.COMMON_PRIVATE], { [PLAYER]: ['@bamboom/common/vite'] }),
    flag('the player importing the dev gallery', [RULE.PRODUCTION_ON_DEV], { [PLAYER]: [PLAYER_DEV] }),
    flag('a module reaching into the internals of another', [RULE.MODULES_VIA_INDEX], { [APP_ROUTER]: [IDENTITY_ROUTES] }),
    flag('a module lazily reaching into the internals of another', [RULE.MODULES_VIA_INDEX], { [APP_ROUTER]: [lazy(IDENTITY_ROUTES)] }),
    flag('a nested index file used as if it were the door of a module', [RULE.MODULES_VIA_INDEX], { [APP_ROUTER]: [IDENTITY_NESTED_INDEX] }),
    flag('a schema using vue', [RULE.FRAMEWORK_FREE_LAYERS], { [IDENTITY_SCHEMAS]: ['vue'] }),
    flag('the failures using pinia', [RULE.FRAMEWORK_FREE_LAYERS], { [IDENTITY_ERRORS]: ['pinia'] }),
    flag('the AuthService port using vue-router', [RULE.FRAMEWORK_FREE_LAYERS], { [IDENTITY_API]: ['vue-router'] }),
    flag('an adapter lazily importing vue', [RULE.FRAMEWORK_FREE_LAYERS], { [IDENTITY_API]: [lazy('vue')] })
]
